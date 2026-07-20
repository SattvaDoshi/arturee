import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User, Mail, Lock, Bell, Camera, Star, Clock, Play,
  LogOut, CreditCard, CheckCircle, Eye, EyeOff,
} from 'lucide-react'
import UserLayout from '../../components/layout/UserLayout'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../api/index.js'
import { useRef } from 'react'

/* ── tiny toggle ── */
const Toggle = ({ on, onToggle }) => (
  <button
    onClick={onToggle}
    className="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0"
    style={{ background: on ? 'linear-gradient(135deg,#4DD0E1,#C0E863)' : 'rgba(5,29,46,0.12)' }}
  >
    <span
      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"
      style={{ transform: on ? 'translateX(20px)' : 'translateX(0)' }}
    />
  </button>
)

/* ── field ── */
const Field = ({ label, icon: Icon, type = 'text', defaultValue, placeholder, value, onChange, disabled }) => {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div>
      <label className="block text-xs font-bold text-[#051d2e]/55 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4DD0E1]" />
        <input
          type={isPassword && !show ? 'password' : type}
          defaultValue={defaultValue}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full max-w-sm bg-white/80 border border-[#4DD0E1]/30 rounded-xl py-2.5 pl-10 pr-10 text-sm text-[#051d2e] focus:outline-none focus:ring-2 focus:ring-[#4DD0E1]/50 focus:border-[#4DD0E1] transition placeholder:text-[#051d2e]/30 disabled:opacity-50"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#051d2e]/40 hover:text-[#051d2e] transition"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  )
}


const GradBtn = ({ children, className = '', ...props }) => (
  <button
    {...props}
    className={`px-6 py-2.5 rounded-xl font-bold text-[#051d2e] text-sm hover:opacity-90 active:scale-95 transition cursor-pointer ${className}`}
    style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
  >
    {children}
  </button>
)

const OutlineBtn = ({ children, className = '', danger, ...props }) => (
  <button
    {...props}
    className={`px-5 py-2.5 rounded-xl cursor-pointer border font-semibold text-sm transition ${danger ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-[#4DD0E1]/30 text-[#051d2e]/60 hover:border-[#4DD0E1] hover:text-[#051d2e]'} ${className}`}
  >
    {children}
  </button>
)

const Card = ({ children, className = '' }) => (
  <div
    className={`rounded-2xl p-6 border border-[#4DD0E1]/20 shadow-sm space-y-5 ${className}`}
    style={{ background: 'rgba(255,255,255,0.75)' }}
  >
    {children}
  </div>
)

const CardTitle = ({ children }) => (
  <h3 className="text-xs font-black text-[#051d2e] uppercase tracking-widest border-b border-[#4DD0E1]/15 pb-3">
    {children}
  </h3>
)

const TABS = ['Profile', 'Security']

const NOTIF_PREFS = [
  { label: 'New releases from followed creators', desc: 'Notified when your favourite artists drop new content', defaultOn: true },
  { label: 'Live stream reminders', desc: '15-minute alerts before a live event begins', defaultOn: true },
  { label: 'Purchase confirmations', desc: 'Email receipts for every transaction', defaultOn: true },
  { label: 'Weekly newsletter', desc: 'Curated picks and platform highlights', defaultOn: false },
  { label: 'Promotions & offers', desc: 'Special deals and limited-time discounts', defaultOn: false },
]

export default function Account() {
  const { user, logout, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('Profile')
  const [notifs, setNotifs] = useState(NOTIF_PREFS.map(n => n.defaultOn))
  
  // Profile Update State
  const [name, setName] = useState(user?.name || '')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const fileInputRef = useRef(null)

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
      setAvatarPreview(URL.createObjectURL(e.target.files[0]))
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const formData = new FormData()
      formData.append('name', name)
      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }
      const res = await authApi.updateProfile(formData)
      if (res.data.success) {
        updateUser(res.data.user)
        setAvatarFile(null)
      }
    } catch (error) {
      console.error('Failed to update profile', error)
      alert('Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  // Delete Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [otherMessage, setOtherMessage] = useState('')

  return (
    <UserLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#051d2e] tracking-tight">My Account</h1>
            <p className="text-sm text-[#051d2e]/55 mt-1">Manage your profile and preferences</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* ── Profile hero card ── */}
        <div
          className="rounded-2xl p-6 border border-[#4DD0E1]/20 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6"
          style={{ background: 'linear-gradient(135deg,rgba(224,247,250,0.9),rgba(232,245,233,0.9))' }}
        >
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full ring-4 ring-[#4DD0E1]/40 ring-offset-2 ring-offset-transparent overflow-hidden bg-gray-200">
              <img
                src={avatarPreview || user?.avatarUrl || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
            >
              <Camera className="w-3 h-3 text-[#051d2e]" />
            </button>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
              className="hidden" 
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-black text-[#051d2e] tracking-tight">{user?.name || 'User'}</h2>
            <p className="text-sm text-[#051d2e]/55 mb-4">{user?.email || ''}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#4DD0E1]/30 text-[#051d2e]/65 bg-white/50">
                <Play className="w-3 h-3 text-[#4DD0E1]" /> 42 videos watched
              </span>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div
          className="flex gap-0.5 p-1 rounded-xl border border-[#4DD0E1]/20 w-fit"
          style={{ background: 'rgba(224,247,250,0.6)' }}
        >
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab ? 'text-[#051d2e]' : 'text-[#051d2e]/50 hover:text-[#051d2e]'}`}
              style={activeTab === tab ? { background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' } : {}}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ══ Profile tab ══ */}
        {activeTab === 'Profile' && (
          <Card>
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <CardTitle>Personal Information</CardTitle>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field 
                  label="Full Name" 
                  icon={User} 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
                <Field 
                  label="Email Address" 
                  icon={Mail} 
                  value={user?.email || ''} 
                  disabled 
                />
              </div>
              <GradBtn type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </GradBtn>
            </form>
          </Card>
        )}


        {/* ══ Security tab ══ */}
        {activeTab === 'Security' && (
          <div className="space-y-5">
            <Card>
              <CardTitle>Change Password</CardTitle>
              <Field label="Current Password" icon={Lock} type="password" placeholder="••••••••" />
              <Field label="New Password" icon={Lock} type="password" placeholder="Min. 8 characters" />
              <Field label="Confirm New Password" icon={Lock} type="password" placeholder="Repeat new password" />
              <GradBtn>Update Password</GradBtn>
            </Card>

            <Card>
              <CardTitle>Danger Zone</CardTitle>
              <p className="text-sm text-[#051d2e]/60">
                Deleting your account is permanent and cannot be undone. All your data, purchases, and history will be lost.
              </p>
              <OutlineBtn danger onClick={() => setShowDeleteModal(true)}>Delete My Account</OutlineBtn>
            </Card>

            {/* ── Delete Account Modal ── */}
            {showDeleteModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div 
                  className="absolute inset-0 bg-[#051d2e]/40 backdrop-blur-sm"
                  onClick={() => setShowDeleteModal(false)}
                />
                <div 
                  className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#4DD0E1]/20 animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]"
                >
                  {/* Gradient Header - Sticky */}
                  <div 
                    className="p-6 text-center shrink-0 border-b border-[#4DD0E1]/10"
                    style={{ background: 'linear-gradient(135deg, rgba(77,208,225,0.1), rgba(192,232,99,0.1))' }}
                  >
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
                      <LogOut className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-black text-[#051d2e] tracking-tight">Wait! Before you go...</h2>
                    <p className="text-sm text-[#051d2e]/60 mt-2">Could you tell us why you're leaving? We'd love to improve.</p>
                  </div>

                  {/* Scrollable Body */}
                  <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-[#051d2e]/55 uppercase tracking-widest pl-1">Reason for leaving</label>
                      <div className="grid gap-2">
                        {[
                          "Found a better alternative",
                          "Too expensive",
                          "Missing features I need",
                          "Technical issues/Bugs",
                          "No longer need it",
                          "Other"
                        ].map((reason) => (
                          <button
                            key={reason}
                            onClick={() => {
                              setSelectedReason(reason)
                              if (reason !== 'Other') setOtherMessage('')
                            }}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-semibold transition-all ${
                              selectedReason === reason 
                                ? 'border-[#4DD0E1] bg-[#4DD0E1]/5 text-[#051d2e]' 
                                : 'border-[#4DD0E1]/15 hover:border-[#4DD0E1]/40 text-[#051d2e]/60'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                              selectedReason === reason ? 'border-[#4DD0E1] bg-[#4DD0E1]' : 'border-[#4DD0E1]/30'
                            }`}>
                              {selectedReason === reason && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            {reason}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedReason === 'Other' && (
                      <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <label className="text-xs font-bold text-[#051d2e]/55 uppercase tracking-widest pl-1">Tell us more</label>
                        <textarea
                          placeholder="Please share your thoughts..."
                          value={otherMessage}
                          onChange={(e) => setOtherMessage(e.target.value)}
                          rows={3}
                          className="w-full bg-white border border-[#4DD0E1]/30 rounded-xl px-4 py-3 text-sm text-[#051d2e] focus:outline-none focus:ring-2 focus:ring-[#4DD0E1]/50 focus:border-[#4DD0E1] transition resize-none"
                        />
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setShowDeleteModal(false)}
                        className="flex-1 px-6 py-3.5 rounded-xl font-bold text-[#051d2e]/60 text-sm border border-[#4DD0E1]/20 hover:bg-[#051d2e]/5 transition active:scale-95"
                      >
                        Keep Account
                      </button>
                      <button
                        disabled={!selectedReason || (selectedReason === 'Other' && !otherMessage.trim())}
                        className="flex-1 px-6 py-3.5 rounded-xl font-bold text-white text-sm shadow-lg shadow-red-200 hover:opacity-90 active:scale-95 transition disabled:opacity-50 disabled:grayscale disabled:scale-100"
                        style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)' }}
                      >
                        Delete Permanently
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </UserLayout>
  )
}
