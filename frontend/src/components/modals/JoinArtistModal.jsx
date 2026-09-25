import React, { useState, useEffect } from 'react'
import { Loader2, ChevronDown } from 'lucide-react'
import { toast } from '../../context/ToastContext'
import { useArtistModal } from '../../context/ArtistModalContext'
import { artistApi, genreApi } from '../../api/index.js'

const countryCodes = [
  { code: '+91', label: '+91 (IN)', maxLen: 10 },
  { code: '+1', label: '+1 (US)', maxLen: 10 },
  { code: '+44', label: '+44 (UK)', maxLen: 10 },
  { code: '+61', label: '+61 (AU)', maxLen: 9 },
  { code: '+971', label: '+971 (AE)', maxLen: 9 },
]

const JoinArtistModal = () => {
  const { isModalOpen, closeModal } = useArtistModal()
  
  const [formData, setFormData] = useState({
    name: '',
    phoneCode: '+91',
    phone: '',
    whatsappCode: '+91',
    whatsapp: '',
    email: '',
    videoLink: '',
    specialty: '', // keeping for fallback/compat
    specialties: [],
    agreeTerms: false,
  })
  
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [genres, setGenres] = useState([])

  useEffect(() => {
    genreApi.list().then(res => {
      const genreList = Array.isArray(res.data?.data)
        ? res.data.data
        : res.data?.data?.genres || []
      setGenres(genreList)
    }).catch(err => console.error('Failed to load genres', err))
  }, [])

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
      const payload = {
        ...formData,
        phone: `${formData.phoneCode} ${formData.phone}`,
        whatsapp: `${formData.whatsappCode} ${formData.whatsapp}`,
      }
      await artistApi.apply(payload)
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
      setShowTerms(false)
      setFormData({
        name: '',
        phoneCode: '+91',
        phone: '',
        whatsappCode: '+91',
        whatsapp: '',
        email: '',
        videoLink: '',
        specialty: '',
        specialties: [],
        agreeTerms: false,
      })
    }, 300)
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-primary overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Decorative blobs (fixed to background) */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none transform translate-x-1/2 -translate-y-1/2 z-0" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-lime/10 rounded-full blur-2xl pointer-events-none transform -translate-x-1/2 translate-y-1/2 z-0" />

        {/* Close Button (fixed to top right) */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-lightgray text-navy hover:bg-primary hover:text-white transition-colors z-20"
        >
          <span className="font-bold text-sm leading-none">X</span>
        </button>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar relative z-10 w-full h-full">
          {isSubmitted ? (
            <div className="text-center py-10">
            <div className="w-20 h-20 mx-auto mb-6 bg-lime/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">🎉</span>
            </div>
            <h3 className="text-2xl font-black text-navy mb-4">Submission Received!</h3>
            <p className="text-navy/70 text-base leading-relaxed mb-8">
              Thank you for trusting us with your art.<br/>
              Our team will review your submission and get in touch with you within 14 working days.
            </p>
            <button 
              onClick={handleClose}
              className="w-full py-3 bg-linear-to-r from-primary to-lime text-white font-black uppercase text-sm tracking-wide rounded hover:shadow-lg transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-8 text-center mt-2">
              <h2 className="text-3xl font-black text-navy mb-2">Join as an <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-lime">Artist</span></h2>
              <p className="text-sm md:text-base text-navy/90 font-medium">
                Share your art with the world and keep <span className="font-bold text-transparent bg-clip-text bg-linear-to-r from-primary to-lime">51% of the net profit</span>.
              </p>
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

              <div>
                <label className="block text-xs font-semibold text-navy/70 mb-2">Specialties (Select all that apply) <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-2 bg-lightgray/30 rounded-xl border border-primary/20">
                  {genres.map(g => {
                    const isSelected = formData.specialties.includes(g.name);
                    return (
                      <label key={g._id || g.id} className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold border transition select-none ${isSelected ? 'bg-primary/20 border-primary text-primary' : 'bg-white border-primary/10 text-navy/60 hover:border-primary/40'}`}>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={isSelected}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData(prev => {
                              const newSpecs = checked 
                                ? [...prev.specialties, g.name] 
                                : prev.specialties.filter(name => name !== g.name);
                              return { ...prev, specialties: newSpecs, specialty: newSpecs.join(', ') };
                            });
                          }}
                        />
                        {g.name}
                      </label>
                    )
                  })}
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex bg-lightgray/50 border border-primary/20 rounded-xl overflow-hidden focus-within:border-primary focus-within:bg-white transition-all">
                  <select
                    name="phoneCode"
                    value={formData.phoneCode}
                    onChange={handleChange}
                    className="bg-transparent px-2 py-3 text-sm text-navy outline-none border-r border-primary/20 cursor-pointer focus:bg-white"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="Phone"
                    required
                    maxLength={countryCodes.find(c => c.code === formData.phoneCode)?.maxLen || 15}
                    minLength={countryCodes.find(c => c.code === formData.phoneCode)?.maxLen || 15}
                    value={formData.phone}
                    onChange={(e) => {
                       const val = e.target.value.replace(/\D/g, '');
                       handleChange({ target: { name: 'phone', value: val } });
                    }}
                    className="w-full px-3 py-3 bg-transparent outline-none text-sm text-navy placeholder:text-navy/40"
                  />
                </div>
                
                <div className="flex bg-lightgray/50 border border-primary/20 rounded-xl overflow-hidden focus-within:border-primary focus-within:bg-white transition-all">
                  <select
                    name="whatsappCode"
                    value={formData.whatsappCode}
                    onChange={handleChange}
                    className="bg-transparent px-2 py-3 text-sm text-navy outline-none border-r border-primary/20 cursor-pointer focus:bg-white"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <input 
                    type="tel" 
                    name="whatsapp" 
                    placeholder="WhatsApp"
                    required
                    maxLength={countryCodes.find(c => c.code === formData.whatsappCode)?.maxLen || 15}
                    minLength={countryCodes.find(c => c.code === formData.whatsappCode)?.maxLen || 15}
                    value={formData.whatsapp}
                    onChange={(e) => {
                       const val = e.target.value.replace(/\D/g, '');
                       handleChange({ target: { name: 'whatsapp', value: val } });
                    }}
                    className="w-full px-3 py-3 bg-transparent outline-none text-sm text-navy placeholder:text-navy/40"
                  />
                </div>
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
                  placeholder="Video Link"
                  required
                  value={formData.videoLink}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-lightgray/50 border border-primary/20 rounded-xl focus:outline-none focus:border-primary focus:bg-white transition-all text-sm text-navy placeholder:text-navy/40"
                />
                <p className="text-xs text-navy/40 mt-1">Upload Raw video link (e.g. Google Drive)</p>
              </div>
              
              <div className="pt-2">
                <div className="bg-lightgray/30 rounded-lg border border-primary/10 mb-4 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowTerms(!showTerms)}
                    className="w-full p-3 flex items-center justify-between hover:bg-lightgray/50 transition-colors"
                  >
                    <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Terms & Conditions</h4>
                    <ChevronDown size={16} className={`text-navy transition-transform duration-300 ${showTerms ? 'rotate-180' : ''}`} />
                  </button>
                  {showTerms && (
                    <div className="p-3 pt-0 border-t border-primary/10 bg-white/50 max-h-40 overflow-y-auto custom-scrollbar">
                      <ul className="text-xs text-navy/70 space-y-2 list-disc pl-4 text-left mt-3">
                        <li>An exclusive recorded video (with decent video and audio quality).</li>
                        <li>Artists must not upload, distribute, or make freely available elsewhere any content submitted for paid distribution on ARTUREE. However, there are no restrictions on performing the piece live.</li>
                        <li>All content must be 100% original and plagiarism-free. The Artist will bear full legal and financial responsibility for any copyright or plagiarism claims.</li>
                      </ul>
                    </div>
                  )}
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-0.5 shrink-0">
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
                  <span className="text-xs text-navy/70 leading-relaxed select-none group-hover:text-navy transition-colors text-left">
                    <strong>I Agree</strong> to the terms and conditions. By submitting this form, I confirm that the content provided is my original work and I grant Arturee permission to review it.
                  </span>
                </label>
              </div>
              
              <button 
                type="submit" 
                disabled={!formData.agreeTerms || isSubmitting || formData.specialties.length === 0}
                className="w-full mt-6 flex justify-center py-3.5 bg-linear-to-r from-primary to-lime text-white font-black uppercase tracking-wider text-sm rounded shadow-[4px_4px_0px_rgba(77,208,225,0.4)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0px_rgba(77,208,225,0.4)] disabled:hover:translate-y-0 disabled:hover:translate-x-0"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Application'}
              </button>
            </form>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default JoinArtistModal
