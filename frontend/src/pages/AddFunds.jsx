import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { transactionsAPI } from '../api/index'

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const MAX_SCREENSHOT_DIMENSION = 1280 // px, longest side
const SCREENSHOT_JPEG_QUALITY = 0.72

// Resize + re-encode a payment screenshot client-side before it's base64'd
// into the request body. Payment screenshots are usually full-resolution
// phone photos (3-5MB) — at 10k users that's a lot of unnecessary network
// transfer and Postgres row growth for an image that's only ever viewed as
// a small proof thumbnail. This keeps uploads small and fast without losing
// legibility of the UPI app's confirmation text/UTR ID.
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let { width, height } = img
      if (width > height && width > MAX_SCREENSHOT_DIMENSION) {
        height = Math.round((height * MAX_SCREENSHOT_DIMENSION) / width)
        width = MAX_SCREENSHOT_DIMENSION
      } else if (height > MAX_SCREENSHOT_DIMENSION) {
        width = Math.round((width * MAX_SCREENSHOT_DIMENSION) / height)
        height = MAX_SCREENSHOT_DIMENSION
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', SCREENSHOT_JPEG_QUALITY))
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not read image'))
    }
    img.src = objectUrl
  })
}

export default function AddFunds() {
  const { user } = useAuth()
  const [qrImage, setQrImage] = useState(null)
  const [qrLoading, setQrLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [screenshot, setScreenshot] = useState(null)
  const [screenshotName, setScreenshotName] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [requests, setRequests] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const amountNum = parseFloat(amount) || 0

  useEffect(() => {
    transactionsAPI.getPaymentQR().then(r => setQrImage(r.data?.image || null)).finally(() => setQrLoading(false))
    loadHistory()
  }, [])

  function loadHistory() {
    setHistoryLoading(true)
    transactionsAPI.myPaymentRequests().then(r => setRequests(r.data)).finally(() => setHistoryLoading(false))
  }

  async function handleScreenshotChange(e) {
    const file = e.target.files?.[0]
    if (!file) { setScreenshot(null); setScreenshotName(''); return }
    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'Screenshot must be under 5MB' })
      e.target.value = ''
      return
    }
    try {
      const dataUrl = await compressImage(file)
      setScreenshot(dataUrl)
      setScreenshotName(file.name)
    } catch {
      // Fallback: if compression fails for any reason (e.g. unsupported format), use the raw file
      const dataUrl = await fileToDataUrl(file)
      setScreenshot(dataUrl)
      setScreenshotName(file.name)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (amountNum < 1) { setStatus({ type: 'error', message: 'Minimum deposit is ₹1' }); return }
    if (!transactionId.trim()) { setStatus({ type: 'error', message: 'Enter the transaction / UTR ID from your payment app' }); return }

    setLoading(true); setStatus(null)
    try {
      await transactionsAPI.submitPaymentRequest({
        amount: amountNum,
        transaction_id: transactionId.trim(),
        screenshot,
      })
      setStatus({ type: 'success', message: 'Submitted! Your deposit is pending admin approval — it will reflect in your wallet once reviewed.' })
      setAmount(''); setTransactionId(''); setScreenshot(null); setScreenshotName('')
      loadHistory()
    } catch (err) {
      setStatus({ type: 'error', message: err?.response?.data?.detail || 'Failed to submit. Try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6 max-w-lg mx-auto sm:mx-0">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Add Funds</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">Scan the QR code, pay, then submit your transaction details for approval</p>
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl px-5 sm:px-6 py-4 sm:py-5 text-white shadow-lg shadow-blue-200">
        <p className="text-blue-200 text-xs sm:text-sm font-medium mb-1">Current Balance</p>
        <p className="text-3xl sm:text-4xl font-bold">₹{user?.balance?.toFixed(2) ?? '0.00'}</p>
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

      {/* QR code card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 space-y-4">
        <p className="text-sm font-semibold text-slate-700">Step 1 — Scan & Pay</p>
        <div className="flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 p-4 min-h-[200px]">
          {qrLoading ? (
            <div className="w-44 h-44 rounded-lg bg-slate-200 animate-pulse" />
          ) : qrImage ? (
            <img src={qrImage} alt="Payment QR code" className="w-44 h-44 object-contain rounded-lg" />
          ) : (
            <p className="text-sm text-slate-400 text-center px-4">Payment QR code hasn't been set up yet. Please contact support.</p>
          )}
        </div>
        <p className="text-xs text-slate-400 text-center">Scan with any UPI app and pay the amount you'd like to add to your wallet.</p>
      </div>

      {/* Submit form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 space-y-5">
        <p className="text-sm font-semibold text-slate-700">Step 2 — Submit Payment Details</p>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount Paid (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm select-none">₹</span>
            <input
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Transaction / UTR ID</label>
          <input
            type="text"
            placeholder="e.g. 123456789012"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px]"
          />
          <p className="text-xs text-slate-400 mt-1.5">Found in your UPI app's payment confirmation / history</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Payment Screenshot (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleScreenshotChange}
            className="w-full text-sm text-slate-600 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {screenshotName && <p className="text-xs text-emerald-600 mt-1.5">Attached: {screenshotName}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || amountNum < 1 || !transactionId.trim()}
          className="w-full py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm min-h-[48px] touch-manipulation shadow-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Submitting…
            </>
          ) : 'Submit for Approval'}
        </button>
      </form>

      {/* Request history */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 space-y-3">
        <p className="text-sm font-semibold text-slate-700">Your Deposit Requests</p>
        {historyLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : requests.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No deposit requests yet</p>
        ) : (
          <div className="space-y-2">
            {requests.map(r => (
              <div key={r.id} className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">₹{r.amount.toFixed(2)}</p>
                  <p className="text-xs text-slate-400 truncate">Txn: {r.transaction_id}</p>
                  <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleString('en-IN')}</p>
                  {r.admin_note && <p className="text-xs text-slate-500 mt-1">Note: {r.admin_note}</p>}
                </div>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold border capitalize ${STATUS_STYLES[r.status] || ''}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
