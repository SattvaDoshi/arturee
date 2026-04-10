import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle2, Lock } from 'lucide-react'
import UserLayout from '../components/layout/UserLayout'

const C = {
  navy: '#051d2e',
  primary: '#4DD0E1',
  teal: '#00BCD4',
  lime: '#C0E863',
  muted: '#4a7080',
}

const Checkout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Example state passed from navigate: { state: { type: 'subscription', plan: 'Pro', price: 14.99 } }
  // or { state: { type: 'video', title: 'Jazz Night', price: 4.99, thumbnail: '...' } }
  const checkoutData = location.state || {
    type: 'video',
    title: 'Unknown Item',
    price: 0.00
  }

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handlePayment = (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      
      // Redirect after success
      setTimeout(() => {
        if (checkoutData.type === 'subscription') {
          navigate('/dashboard')
        } else {
          navigate('/dashboard/purchased')
        }
      }, 3000)
    }, 2000)
  }

  if (success) {
    return (
      <UserLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-bounce"
            style={{ background: 'linear-gradient(135deg,rgba(77,208,225,0.2),rgba(192,232,99,0.3))' }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: C.teal }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: C.navy }}>Payment Successful!</h2>
          <p className="text-lg mb-8" style={{ color: C.muted }}>
            You now have access to {checkoutData.title || checkoutData.plan}.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 rounded-full font-bold text-lg shadow-lg"
            style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: C.navy }}
          >
            Go to Dashboard
          </button>
        </div>
      </UserLayout>
    )
  }

  return (
    <UserLayout>
      <div className="min-h-screen px-4 py-8 md:py-12" style={{ background: '#f8fafc' }}>
        <div className="max-w-4xl mx-auto">
          
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition hover:bg-gray-200 mb-6"
            style={{ color: C.navy }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-3xl p-6 bg-white border shadow-sm" style={{ borderColor: 'rgba(77,208,225,0.2)' }}>
                <h3 className="text-xl font-black mb-6 uppercase tracking-tight" style={{ color: C.navy }}>Order Summary</h3>
                
                {checkoutData.type === 'video' ? (
                  <div className="flex gap-4 items-start mb-6">
                    <img 
                      src={checkoutData.thumbnail || 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=225&fit=crop'} 
                      alt="Thumbnail" 
                      className="w-24 h-16 object-cover rounded-lg shadow-sm"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 mb-1 inline-block">
                        Lifetime Access
                      </span>
                      <h4 className="font-bold text-gray-900 line-clamp-2 leading-tight">{checkoutData.title}</h4>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 items-center mb-6 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm">
                      <ShieldCheck className="w-6 h-6" style={{ color: C.teal }} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-50 text-green-600 mb-1 inline-block">
                        Subscription
                      </span>
                      <h4 className="font-bold text-gray-900">{checkoutData.plan || checkoutData.title} Plan</h4>
                      <p className="text-xs text-gray-500">Billed monthly</p>
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-5 border-t border-gray-100 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${checkoutData.price?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-black text-lg pt-3 border-t border-gray-100" style={{ color: C.navy }}>
                    <span>Total</span>
                    <span>${checkoutData.price?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-medium">
                <Lock className="w-3 h-3" /> Secure AES-256 Encrypted Payment
              </div>
            </div>

            {/* Payment Form */}
            <div className="lg:col-span-3">
              <div className="rounded-3xl p-6 md:p-8 bg-white border shadow-sm" style={{ borderColor: 'rgba(77,208,225,0.2)' }}>
                <h3 className="text-2xl font-black mb-8" style={{ color: C.navy }}>Payment Details</h3>
                
                <form onSubmit={handlePayment} className="space-y-6">
                  
                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-3 gap-3">
                    <label className="cursor-pointer">
                      <input type="radio" name="payment_method" className="peer sr-only" defaultChecked />
                      <div className="rounded-xl border-2 p-3 text-center transition-all peer-checked:border-[#4DD0E1] peer-checked:bg-[#eafcff]">
                        <CreditCard className="w-6 h-6 mx-auto mb-2 text-gray-700" />
                        <span className="text-xs font-bold text-gray-800">Card</span>
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input type="radio" name="payment_method" className="peer sr-only" />
                      <div className="rounded-xl border-2 p-3 flex flex-col items-center justify-center transition-all peer-checked:border-[#4DD0E1] peer-checked:bg-[#eafcff]">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 object-contain mb-2 opacity-80" />
                        <span className="text-xs font-bold text-gray-800">PayPal</span>
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <input type="radio" name="payment_method" className="peer sr-only" />
                      <div className="rounded-xl border-2 p-3 text-center transition-all peer-checked:border-[#4DD0E1] peer-checked:bg-[#eafcff]">
                        <span className="text-lg font-black block mb-1">GPay</span>
                        <span className="text-xs font-bold text-gray-800">Google Pay</span>
                      </div>
                    </label>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Cardholder Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="John Doe" 
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#4DD0E1] transition"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Card Number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="text" 
                          required
                          placeholder="0000 0000 0000 0000" 
                          maxLength="19"
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#4DD0E1] transition font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Expiry Date</label>
                        <input 
                          type="text" 
                          required
                          placeholder="MM/YY" 
                          maxLength="5"
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#4DD0E1] transition font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">CVC</label>
                        <input 
                          type="password" 
                          required
                          placeholder="•••" 
                          maxLength="4"
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#4DD0E1] transition font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 mt-8 rounded-xl font-black text-lg shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition"
                    style={{ background: 'linear-gradient(135deg,#4DD0E1,#C0E863)', color: C.navy, opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? (
                      <span className="animate-pulse">Processing...</span>
                    ) : (
                      <>Pay ${checkoutData.price?.toFixed(2) || '0.00'}</>
                    )}
                  </button>
                  
                </form>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </UserLayout>
  )
}

export default Checkout
