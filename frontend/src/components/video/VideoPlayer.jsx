import React, { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { playbackApi, progressApi } from '../../api/index.js'
import { AlertCircle, Loader2 } from 'lucide-react'

export default function VideoPlayer({ videoId, poster }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sessionActive, setSessionActive] = useState(false)

  // Track progress throttling
  const lastProgressRef = useRef(0)

  useEffect(() => {
    let mounted = true
    
    const initPlayback = async () => {
      try {
        setLoading(true)
        const res = await playbackApi.requestPlayback({ videoId })
        const { streamUrl, resumeAt } = res.data.data
        
        if (!mounted) return
        
        const video = videoRef.current
        if (!video) return

        // Set resume point (wait for loadedmetadata to actually seek)
        if (resumeAt > 0) {
          const onLoadedMetadata = () => {
             video.currentTime = resumeAt
             video.removeEventListener('loadedmetadata', onLoadedMetadata)
          }
          video.addEventListener('loadedmetadata', onLoadedMetadata)
        }

        if (Hls.isSupported()) {
          const hls = new Hls({
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
          })
          hlsRef.current = hls
          hls.loadSource(streamUrl)
          hls.attachMedia(video)
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
             if (mounted) {
               setLoading(false)
               setSessionActive(true)
             }
          })
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  hls.startLoad()
                  break
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError()
                  break
                default:
                  hls.destroy()
                  if (mounted) setError('A fatal error occurred while playing the video.')
                  break
              }
            }
          })
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari native HLS
          video.src = streamUrl
          video.addEventListener('loadedmetadata', () => {
            if (mounted) {
              setLoading(false)
              setSessionActive(true)
            }
          })
        } else {
           if (mounted) setError('Your browser does not support playing this video.')
        }

      } catch (err) {
        if (!mounted) return
        setLoading(false)
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError(err.response.data.message || 'Session invalidated. Are you watching on another device?')
        } else {
          setError(err.response?.data?.message || 'Failed to load video stream. Please try again.')
        }
      }
    }

    initPlayback()

    return () => {
      mounted = false
      if (hlsRef.current) {
        hlsRef.current.destroy()
      }
    }
  }, [videoId])

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return
    
    const now = Date.now()
    if (now - lastProgressRef.current > 10000) {
      lastProgressRef.current = now
      
      const isCompleted = video.duration > 0 && (video.duration - video.currentTime < 10)
      
      progressApi.update({
        videoId,
        currentTimestamp: Math.floor(video.currentTime),
        totalDuration: Math.floor(video.duration || 0),
        isCompleted
      }).catch(err => {
         console.warn('Progress update failed', err)
      })
      
      if (isCompleted) {
         progressApi.complete({ videoId }).catch(() => {})
      }
    }
  }

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border" style={{ borderColor: 'rgba(77,208,225,0.25)' }}>
      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-white font-semibold text-lg">{error}</p>
        </div>
      )}
      
      {loading && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 animate-spin mb-3" style={{ color: '#4DD0E1' }} />
          <p className="font-medium animate-pulse" style={{ color: '#4DD0E1' }}>Initializing Secure Stream...</p>
        </div>
      )}

      <video
        ref={videoRef}
        controls={sessionActive && !error}
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        poster={poster}
        onTimeUpdate={handleTimeUpdate}
        className="w-full h-full object-contain"
        autoPlay
      />
    </div>
  )
}
