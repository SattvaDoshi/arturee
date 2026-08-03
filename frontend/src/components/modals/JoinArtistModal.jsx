import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from '../../context/ToastContext'
import { useArtistModal } from '../../context/ArtistModalContext'
import { artistApi } from '../../api/index.js'

const JoinArtistModal = () => {
  const { isModalOpen, closeModal } = useArtistModal()
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    videoLink: '',
    agreeTerms: false,
  })
  
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isModalOpen) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.agreeTerms) return
    setIsSubmitting(true)
    try {
      await artistApi.apply(formData)
      setIsSubmitted(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    closeModal()
    // Reset form after a short delay to allow closing animation if any, 
    // or just reset immediately
    setTimeout(() => {
      setIsSubmitted(false)
      setIsSubmitting(false)
      setFormData({
        name: '',
        phone: '',
        whatsapp: '',
        email: '',
        videoLink: '',
        agreeTerms: false,
      })
    }, 300)
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-primary overflow-hidden">
        
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-lime/10 rounded-full blur-2xl pointer-events-none transform -translate-x-1/2 translate-y-1/2" />

        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-lightgray text-navy hover:bg-primary hover:text-white transition-colors"
        >
          <span className="font-bold text-sm leading-none">X</span>
        </button>

        {isSubmitted ? (
          <div className="text-center py-10 relative z-10">
            <div className="w-20 h-20 mx-auto mb-6 bg-lime/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">🎉</span>
            </div>
            <h3 className="text-2xl font-black text-navy mb-4">Submission Received!</h3>
            <p className="text-navy/70 text-base leading-relaxed mb-8">
              Thank you for trusting us with your art.<br/>
              Our team will review your submission and get in touch with you within 2 weeks.
            </p>
            <button 
              onClick={handleClose}
              className="w-full py-3 bg-linear-to-r from-primary to-lime text-white font-black uppercase text-sm tracking-wide rounded hover:shadow-lg transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="relative z-10">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-black text-navy mb-2">Join as an <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-lime">Artist</span></h2>
              <p className="text-sm text-navy/60">Share your art with the world.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Full Name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-lightgray/50 border border-primary/20 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all text-sm text-navy placeholder:text-navy/40"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="tel" 
                  name="phone" 
                  placeholder="Phone Number"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-lightgray/50 border border-primary/20 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all text-sm text-navy placeholder:text-navy/40"
                />
                <input 
                  type="tel" 
                  name="whatsapp" 
                  placeholder="WhatsApp Number"
                  required
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-lightgray/50 border border-primary/20 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all text-sm text-navy placeholder:text-navy/40"
                />
              </div>
              
              <div>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email ID"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-lightgray/50 border border-primary/20 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all text-sm text-navy placeholder:text-navy/40"
                />
              </div>
              
              <div>
                <input 
                  type="url" 
                  name="videoLink" 
                  placeholder="Upload Video Drive Link"
                  required
                  value={formData.videoLink}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-lightgray/50 border border-primary/20 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all text-sm text-navy placeholder:text-navy/40"
                />
              </div>
              
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input 
                      type="checkbox" 
                      name="agreeTerms"
                      required
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="w-5 h-5 appearance-none border-2 border-primary/40 rounded bg-white checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                    />
                    {formData.agreeTerms && (
                      <span className="absolute text-white pointer-events-none text-xs font-bold">✓</span>
                    )}
                  </div>
                  <span className="text-xs text-navy/70 leading-relaxed select-none group-hover:text-navy transition-colors">
                    <strong>I Agree</strong> to the terms and conditions. By submitting this form, I confirm that the content provided is my original work and I grant Arturee permission to review it.
                  </span>
                </label>
              </div>
              
              <button 
                type="submit" 
                disabled={!formData.agreeTerms || isSubmitting}
                className="w-full mt-6 flex justify-center py-3.5 bg-linear-to-r from-primary to-lime text-white font-black uppercase tracking-wider text-sm rounded shadow-[4px_4px_0px_rgba(77,208,225,0.4)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0px_rgba(77,208,225,0.4)] disabled:hover:translate-y-0 disabled:hover:translate-x-0"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Application'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default JoinArtistModal
