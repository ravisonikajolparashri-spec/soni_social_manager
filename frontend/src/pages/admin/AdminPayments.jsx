import { useEffect, useState } from 'react'
import { adminAPI, getErrorMessage } from '../../api'
import CustomSelect from '../../components/CustomSelect'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: '', label: 'All' },
]

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  rejected: 'bg-red-100 text-red-700 border border-red-200',
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function AdminPayments() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('pending')
  const [message, setMessage] = useState({ text: '', type: '' })
  const [reviewModal, setReviewModal] = useState(null) // { request, action }
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  const [qrImage, setQrImage] = useState(null)
  const [qrLoading, setQrLoading] = useState(true)
  const [qrUploading, setQrUploading] = useState(false)
  const [screenshots, setScreenshots] = useState({}) // id -> data-url, loaded on demand
  const [loadingScreenshotId, setLoadingScreenshotId] = useState(null)

  useEffect(() => {
    loadRequests()
  }, [filterStatus])

  useEffect(() => {
    adminAPI.getPaymentQR().then(r => setQrImage(r.data?.image || null)).finally(() => setQrLoading(false))
  }, [])

  function loadRequests() {
    setLoading(true)
    adminAPI.paymentRequests(filterStatus || undefined).then(r => setRequests(r.data)).finally(() => setLoading(false))
  }

  async function handleQrUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: 'QR image must be under 2MB', type: 'error' })
      e.target.value = ''
      return
    }
    setQrUploading(true)
    try {
      const dataUrl = await fileToDataUrl(file)
      await adminAPI.setPaymentQR(dataUrl)
      setQrImage(dataUrl)
      setMessage({ text: 'Payment QR code updated', type: 'success' })
    } catch (err) {
      setMessage({ text: getErrorMessage(err, 'Failed to update QR code'), type: 'error' })
    } finally {
      setQrUploading(false)
      e.target.value = ''
    }
  }

  async function loadScreenshot(id) {
    if (screenshots[id] || loadingScreenshotId === id) return
    setLoadingScreenshotId(id)
    try {
      const r = await adminAPI.getPaymentRequestScreenshot(id)
      setScreenshots(prev => ({ ...prev, [id]: r.data?.screenshot }))
    } catch {
      setMessage({ text: 'Failed to load screenshot', type: 'error' })
    } finally {
      setLoadingScreenshotId(null)
    }
  }

  async function handleReview(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const { request, action } = reviewModal
      if (action === 'approve') {
        await adminAPI.approvePaymentRequest(request.id, note || undefined)
        setMessage({ text: `Approved ₹${request.amount.toFixed(2)} for ${request.username}`, type: 'success' })
      } else {
        await adminAPI.rejectPaymentRequest(request.id, note || undefined)
        setMessage({ text: `Rejected request from ${request.username}`, type: 'success' })
      }
      setReviewModal(null); setNote('')
      loadRequests()
    } catch (err) {
      setMessage({ text: getErrorMessage(err, 'Action failed'), type: 'error' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Payments</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Review manual QR deposits and manage the payment QR code</p>
      </div>

      {/* Alert */}
      {message.text && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
          message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
          <button onClick={() => setMessage({ text: '', type: '' })} className="ml-auto opacity-50 hover:opacity-100 touch-manipulation">✕</button>
        </div>
      )}

      {/* QR settings card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
        <p className="text-sm font-semibold text-slate-700 mb-3">Payment QR Code</p>
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100 p-3 w-36 h-36 shrink-0">
            {qrLoading ? (
              <div className="w-full h-full rounded-lg bg-slate-200 animate-pulse" />
            ) : qrImage ? (
              <img src={qrImage} alt="Payment QR" className="w-full h-full object-contain rounded-lg" />
            ) : (
              <p className="text-xs text-slate-400 text-center">Not set</p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-xs text-slate-500 max-w-sm">Upload the UPI/bank QR code image. This is shown to users on the Add Funds page so they can scan and pay.</p>
            <label className="inline-flex items-center gap-2 text-xs font-semibold bg-brand-100 text-brand-700 px-3.5 py-2 rounded-lg hover:bg-brand-200 cursor-pointer transition-colors touch-manipulation">
              {qrUploading ? 'Uploading…' : 'Upload New QR'}
              <input type="file" accept="image/*" className="hidden" disabled={qrUploading} onChange={handleQrUpload} />
            </label>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <CustomSelect
          options={STATUS_OPTIONS}
          value={filterStatus}
          onChange={val => setFilterStatus(val)}
          searchable={false}
          className="w-44"
        />
        <p className="text-xs text-slate-400">{requests.length} request{requests.length === 1 ? '' : 's'}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-12 text-center">
          <p className="text-slate-400 text-sm">No payment requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4">
              {r.has_screenshot && (
                screenshots[r.id] ? (
                  <a href={screenshots[r.id]} target="_blank" rel="noreferrer" className="shrink-0">
                    <img src={screenshots[r.id]} alt="Payment proof" className="w-20 h-20 object-cover rounded-xl border border-slate-100" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => loadScreenshot(r.id)}
                    disabled={loadingScreenshotId === r.id}
                    className="shrink-0 w-20 h-20 rounded-xl border border-slate-200 bg-slate-50 text-[11px] text-slate-500 font-medium hover:bg-slate-100 transition-colors flex items-center justify-center text-center px-1"
                  >
                    {loadingScreenshotId === r.id ? 'Loading…' : 'View proof'}
                  </button>
                )
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{r.username} <span className="text-xs text-slate-400">({r.email})</span></p>
                    <p className="text-xs text-slate-400">{new Date(r.created_at).toLocaleString('en-IN')}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="font-bold text-emerald-600">₹{r.amount.toFixed(2)}</span>
                  <span className="text-xs text-slate-500 font-mono">Txn: {r.transaction_id}</span>
                </div>
                {r.admin_note && <p className="text-xs text-slate-500 mt-1">Note: {r.admin_note}</p>}
                {r.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => { setReviewModal({ request: r, action: 'approve' }); setNote('') }}
                      className="text-xs bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-200 font-medium transition-colors min-h-[36px] touch-manipulation"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => { setReviewModal({ request: r, action: 'reject' }); setNote('') }}
                      className="text-xs bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 font-medium transition-colors min-h-[36px] touch-manipulation"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-0 sm:px-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-sm shadow-2xl safe-area-bottom">
            <h3 className="font-bold text-lg text-slate-800 mb-1">
              {reviewModal.action === 'approve' ? 'Approve' : 'Reject'} Deposit
            </h3>
            <p className="text-sm text-slate-500 mb-5">
              ₹{reviewModal.request.amount.toFixed(2)} from {reviewModal.request.username} · Txn {reviewModal.request.transaction_id}
              {reviewModal.action === 'approve' && ' will be credited to their wallet.'}
            </p>
            <form onSubmit={handleReview} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Note (optional)</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                  placeholder="Visible to the user"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={busy}
                  className={`flex-1 text-white py-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] touch-manipulation disabled:opacity-50 ${
                    reviewModal.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {busy ? 'Submitting…' : reviewModal.action === 'approve' ? 'Approve' : 'Reject'}
                </button>
                <button type="button" onClick={() => setReviewModal(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] touch-manipulation">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
