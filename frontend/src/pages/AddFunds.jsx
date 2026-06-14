import { useState, useEffect, useRef } from 'react'
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

    // 1. Load Razorpay SDK
    const loaded = await loadRazorpayScript()
    if (!loaded) {
      setStatus({ type: 'error', message: 'Could not load payment gateway. Check your internet connection.' })
      setLoading(false)
      return
    }

    // 2. Create order on backend
    let order
    try {
      const res = await transactionsAPI.createRazorpayOrder(amountNum)
      order = res.data
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to initiate payment. Try again.'
      setStatus({ type: 'error', message: msg })
      setLoading(false)
      return
    }

    // 3. Open Razorpay checkout modal
    const options = {
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: 'SMM Panel',
      description: `Add ₹${amountNum.toFixed(2)} to wallet`,
      order_id: order.order_id,
      prefill: {
        email: user?.email || '',
        name: user?.username || '',
      },
      theme: { color: '#2563eb' },
      modal: {
        ondismiss: () => {
          setStatus({ type: 'error', message: 'Payment cancelled.' })
          setLoading(false)
        },
      },
      handler: async (response) => {
        // 4. Verify payment on backend
        try {
          await transactionsAPI.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            amount: amountNum,
          })
          setStatus({ type: 'success', message: `₹${amountNum.toFixed(2)} added to your wallet successfully!` })
          setAmount('')
          if (refreshUser) refreshUser()
        } catch (err) {
          const msg = err?.response?.data?.detail || 'Payment received but verification failed. Contact support.'
          setStatus({ type: 'error', message: msg })
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
    <div className="max-w-lg">
      <h2 className="text-2xl font-bold mb-6">Add Funds</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {/* Balance card */}
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Current Balance</p>
          <p className="text-3xl font-bold text-blue-600">₹{user?.balance?.toFixed(2) ?? '0.00'}</p>
        </div>

        {/* Status banner */}
        {status && (
          <div className={`rounded-lg p-4 text-sm font-medium ${
            status.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {status.type === 'success' ? '✅ ' : '❌ '}{status.message}
          </div>
        )}

        {/* Preset amounts */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Quick Select</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className={`py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  amountNum === p
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                ₹{p.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
          {amountNum >= 1 && (
            <p className="text-xs text-gray-500 mt-1">
              You will be charged ₹{amountNum.toFixed(2)} via Razorpay
            </p>
          )}
        </div>

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={loading || amountNum < 1}
          className="w-full py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Processing…
            </>
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              Pay ₹{amountNum >= 1 ? amountNum.toFixed(2) : '0.00'} with Razorpay
            </>
          )}
        </button>

        {/* Payment methods note */}
        <div className="flex items-center gap-3 justify-center text-xs text-gray-400">
          <span>UPI</span><span>·</span>
          <span>Cards</span><span>·</span>
          <span>Net Banking</span><span>·</span>
          <span>Wallets</span>
        </div>
      </div>
    </div>
  )
}
