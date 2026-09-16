/**
 * YouTubePlayer
 *
 * Renders a YouTube iframe embed with the standard Arturee player chrome:
 *  - Ratio-locked 16:9 container
 *  - Privacy-enhanced embed domain (youtube-nocookie.com)
 *  - Autoplay on load, rel=0 (no related videos), modestbranding
 *
 * Props:
 *   youtubeUrl  {string}  Full YouTube URL (https://www.youtube.com/watch?v=...)
 *               or bare 11-char video ID
 */

const extractYoutubeId = (url) => {
  if (!url) return null
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([-\w]{11})/)
  return m ? m[1] : null
}

export default function YouTubePlayer({ youtubeUrl }) {
  const videoId = extractYoutubeId(youtubeUrl)

  if (!videoId) {
    return (
      <div style={{
        width: '100%', aspectRatio: '16/9',
        background: '#051d2e',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '12px',
        color: 'rgba(255,255,255,0.4)',
        fontSize: '14px',
      }}>
        Invalid YouTube URL
      </div>
    )
  }

  const src = [
    `https://www.youtube-nocookie.com/embed/${videoId}`,
    '?autoplay=1',
    '&rel=0',
    '&modestbranding=1',
    '&playsinline=1',
    '&color=white',
  ].join('')

  return (
    <div style={{
      position:     'relative',
      width:        '100%',
      aspectRatio:  '16 / 9',
      background:   '#000',
      borderRadius: '12px',
      overflow:     'hidden',
    }}>
      <iframe
        src={src}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{
          position: 'absolute',
          inset:    0,
          width:    '100%',
          height:   '100%',
          border:   'none',
        }}
      />
    </div>
  )
}
