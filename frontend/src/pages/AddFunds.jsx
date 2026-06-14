import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { transactionsAPI } from '../api/index'

const PRESETS = [100, 200, 500, 1000, 2000, 5000]

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function AddFunds() {
  const { user, refreshUser } = useAuth()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'success'|'error', message }
  const amountNum = parseFloat(amount) || 0

  async function handlePay() {
    if (amountNum < 1) {
      setStatus({ type: 'error', message: 'Minimum deposit is ₹1' })
      return
    }
    setLoading(true)
    setStatus(null)

    const loaded = await loadRazorpayScript()
    if (!loaded) {
      setStatus({ type: 'error', message: 'Could not load payment gateway. Check your internet connection.' })
      setLoading(false)
      return
    }

    let order
    try {
      const res = await transactionsAPI.createRazorpayOrder(amountNum)
      order = res.data
    } catch (err) {
      setStatus({ type: 'error', message: err?.response?.data?.detail || 'Failed to initiate payment.' })
      setLoading(false)
      return
    }

    const options = {
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: 'SMM Panel',
      description: `Add ₹${amountNum.toFixed(2)} to wallet`,
      order_id: order.order_id,
      prefill: { email: user?.email || '', name: user?.username || '' },
      theme: { color: '#2563eb' },
      modal: {
        ondismiss: () => { setStatus({ type: 'error', message: 'Payment cancelled.' }); setLoading(false) },
      },
      handler: async (response) => {
        try {
          await transactionsAPI.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            amount: amountNum,
          })
          setStatus({ type: 'success', message: `₹${amountNum.toFixed(2)} added to your wallet!` })
          setAmount('')
          if (refreshUser) refreshUser()
        } catch (err) {
          setStatus({ type: 'error', message: err?.response?.data?.detail || 'Verification failed. Contact support.' })
        } finally {
          setLoading(false)
        }
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (resp) => {
      setStatus({ type: 'error', message: `Payment failed: ${resp.error?.description || 'Unknown error'}` })
      setLoading(false)
    })
    rzp.open()
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Add Funds</h1>
        <p className="text-slate-500 text-sm mt-1">Top up your wallet using Razorpay</p>
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-200">
        <p className="text-blue-200 text-sm font-medium mb-1">Current Balance</p>
        <p className="text-4xl font-bold">₹{user?.balance?.toFixed(2) ?? '0.00'}</p>
      </div>

      {/* Status banner */}
      {status && (
        <div className={`flex items-start gap-3 rounded-xl p-4 text-sm font-medium ${
          status.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {status.type === 'success'
            ? <svg className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            : <svg className="w-5 h-5 shrink-0 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          }
          {status.message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
        {/* Preset amounts */}
        <div>
          <p className="text-sm font-semibold text-slate-700 mb-3">Quick Select</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className={`py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                  amountNum === p
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                ₹{p.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Custom Amount (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">₹</span>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          {amountNum >= 1 && (
            <p className="text-xs text-slate-400 mt-1.5">
              You'll be charged ₹{amountNum.toFixed(2)} via Razorpay
            </p>
          )}
        </div>

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={loading || amountNum < 1}
          className="w-full py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Processing…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              Pay ₹{amountNum >= 1 ? amountNum.toFixed(2) : '0.00'} with Razorpay
            </>
          )}
        </button>

        {/* Payment methods */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          {['UPI', 'Cards', 'Net Banking', 'Wallets'].map((m, i) => (
            <span key={m} className="flex items-center gap-2">
              {i > 0 && <span className="w-1 h-1 rounded-full bg-slate-300" />}
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
