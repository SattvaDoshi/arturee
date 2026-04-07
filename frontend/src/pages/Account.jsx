import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User, Mail, Lock, Bell, Camera, Star, Clock, Play,
  LogOut, CreditCard, CheckCircle, Eye, EyeOff,
} from 'lucide-react'
import UserLayout from '../components/layout/UserLayout'

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
const Field = ({ label, icon: Icon, type = 'text', defaultValue, placeholder }) => {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div>
      <label className="block text-xs font-bold text-[#051d2e]/55 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4DD0E1]" />
        <input
          type={isPassword && !show ? 'password' : 'text'}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full max-w-sm bg-white/80 border border-[#4DD0E1]/30 rounded-xl py-2.5 pl-10 pr-10 text-sm text-[#051d2e] focus:outline-none focus:ring-2 focus:ring-[#4DD0E1]/50 focus:border-[#4DD0E1] transition placeholder:text-[#051d2e]/30"
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

const GradBtn = ({ children, className = '' }) => (
  <button
    className={`px-6 py-2.5 rounded-xl font-bold text-[#051d2e] text-sm hover:opacity-90 active:scale-95 transition ${className}`}
    style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
  >
    {children}
  </button>
)

const OutlineBtn = ({ children, className = '', danger }) => (
  <button
    className={`px-5 py-2.5 rounded-xl border font-semibold text-sm transition ${danger ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-[#4DD0E1]/30 text-[#051d2e]/60 hover:border-[#4DD0E1] hover:text-[#051d2e]'} ${className}`}
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

const TABS = ['Profile', 'Subscription', 'Security']

const NOTIF_PREFS = [
  { label: 'New releases from followed creators', desc: 'Notified when your favourite artists drop new content', defaultOn: true },
  { label: 'Live stream reminders', desc: '15-minute alerts before a live event begins', defaultOn: true },
  { label: 'Purchase confirmations', desc: 'Email receipts for every transaction', defaultOn: true },
  { label: 'Weekly newsletter', desc: 'Curated picks and platform highlights', defaultOn: false },
  { label: 'Promotions & offers', desc: 'Special deals and limited-time discounts', defaultOn: false },
]

export default function Account() {
  const [activeTab, setActiveTab] = useState('Profile')
  const [notifs, setNotifs] = useState(NOTIF_PREFS.map(n => n.defaultOn))

  return (
    <UserLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#051d2e] tracking-tight">My Account</h1>
            <p className="text-sm text-[#051d2e]/55 mt-1">Manage your profile and preferences</p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Link>
        </div>

        {/* ── Profile hero card ── */}
        <div
          className="rounded-2xl p-6 border border-[#4DD0E1]/20 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6"
          style={{ background: 'linear-gradient(135deg,rgba(224,247,250,0.9),rgba(232,245,233,0.9))' }}
        >
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full ring-4 ring-[#4DD0E1]/40 ring-offset-2 ring-offset-transparent overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition"
              style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
            >
              <Camera className="w-3 h-3 text-[#051d2e]" />
            </button>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-black text-[#051d2e] tracking-tight">Alex Johnson</h2>
            <p className="text-sm text-[#051d2e]/55 mb-4">alex.johnson@email.com</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <span
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black text-[#051d2e]"
                style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
              >
                <Star className="w-3 h-3" fill="currentColor" /> Pro Member
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#4DD0E1]/30 text-[#051d2e]/65 bg-white/50">
                <Clock className="w-3 h-3 text-[#4DD0E1]" /> Member since Jan 2025
              </span>
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
            <CardTitle>Personal Information</CardTitle>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Full Name" icon={User} defaultValue="Alex Johnson" />
              <Field label="Email Address" icon={Mail} defaultValue="alex.johnson@email.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#051d2e]/55 mb-1.5 uppercase tracking-wider">Bio</label>
              <textarea
                rows={3}
                defaultValue="Art & music enthusiast. Lover of live performances and independent creators."
                className="w-full bg-white/80 border border-[#4DD0E1]/30 rounded-xl px-4 py-2.5 text-sm text-[#051d2e] focus:outline-none focus:ring-2 focus:ring-[#4DD0E1]/50 focus:border-[#4DD0E1] transition resize-none placeholder:text-[#051d2e]/30"
              />
            </div>
            <GradBtn>Save Changes</GradBtn>
          </Card>
        )}

        {/* ══ Subscription tab ══ */}
        {activeTab === 'Subscription' && (
          <div className="space-y-5">
            <Card>
              <CardTitle>Current Plan</CardTitle>
              <div
                className="rounded-xl p-5 border-2 border-[#4DD0E1]/40"
                style={{ background: 'linear-gradient(135deg,rgba(77,208,225,0.06),rgba(192,232,99,0.06))' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-[#051d2e] text-lg">Pro Plan</span>
                  <span
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black text-[#051d2e]"
                    style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
                  >
                    <CheckCircle className="w-3 h-3" /> Active
                  </span>
                </div>
                <p className="text-sm text-[#051d2e]/60 mb-4">$14.99/month · Renews 18 April 2026</p>
                <ul className="space-y-2">
                  {['Unlimited video access', 'HD & 4K streaming', 'Download for offline viewing', 'Priority customer support'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#051d2e]/75">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#4DD0E1' }} />{f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-3">
                <GradBtn>Upgrade Plan</GradBtn>
                <OutlineBtn>Cancel Subscription</OutlineBtn>
              </div>
            </Card>

            <Card>
              <CardTitle>Payment Method</CardTitle>
              <div className="flex items-center gap-4 p-4 rounded-xl border border-[#4DD0E1]/20 bg-white/60">
                <div
                  className="w-12 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)' }}
                >
                  <CreditCard className="w-5 h-5 text-[#051d2e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#051d2e]">Visa ending in 4242</p>
                  <p className="text-xs text-[#051d2e]/50">Expires 12 / 2027</p>
                </div>
                <OutlineBtn className="!px-3 !py-1.5 !text-xs">Edit</OutlineBtn>
              </div>
              <OutlineBtn className="w-fit">Add Payment Method</OutlineBtn>
            </Card>
          </div>
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
              <OutlineBtn danger>Delete My Account</OutlineBtn>
            </Card>
          </div>
        )}

      </div>
    </UserLayout>
  )
}
