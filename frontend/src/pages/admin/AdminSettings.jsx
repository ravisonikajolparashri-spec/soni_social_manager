import { useEffect, useState } from 'react'
import { adminAPI, getErrorMessage } from '../../api'

const EMPTY_FORM = { instagram_url: '', instagram_label: '', whatsapp_number: '', support_email: '' }

export default function AdminSettings() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    adminAPI.getContactDetails()
      .then(r => setForm({ ...EMPTY_FORM, ...r.data }))
      .catch(() => setMessage({ text: 'Failed to load current settings', type: 'error' }))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage({ text: '', type: '' })
    try {
      const r = await adminAPI.setContactDetails(form)
      setForm({ ...EMPTY_FORM, ...r.data })
      setMessage({ text: 'Contact details updated', type: 'success' })
    } catch (err) {
      setMessage({ text: getErrorMessage(err, 'Failed to save settings'), type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          Update the social links and contact details shown on the public Contact page
        </p>
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
        <p className="text-sm font-semibold text-slate-700 mb-1">Contact &amp; Social Links</p>
        <p className="text-xs text-slate-500 mb-4">These power the Instagram / WhatsApp cards on /contact — changes apply immediately, no redeploy needed.</p>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-11 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Instagram Profile URL</label>
              <input
                type="url"
                required
                value={form.instagram_url}
                onChange={e => setForm(f => ({ ...f, instagram_url: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm min-h-[44px]"
                placeholder="https://www.instagram.com/yourhandle"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Instagram Handle (display label)</label>
              <input
                type="text"
                required
                value={form.instagram_label}
                onChange={e => setForm(f => ({ ...f, instagram_label: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm min-h-[44px]"
                placeholder="@yourhandle"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">WhatsApp Number</label>
              <input
                type="text"
                required
                value={form.whatsapp_number}
                onChange={e => setForm(f => ({ ...f, whatsapp_number: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm min-h-[44px]"
                placeholder="+91 98765 43210"
              />
              <p className="text-[11px] text-slate-400 mt-1">Any format is fine — the wa.me link is built from the digits automatically.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Support Email <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="email"
                value={form.support_email}
                onChange={e => setForm(f => ({ ...f, support_email: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm min-h-[44px]"
                placeholder="support@socialhypecrowd.com"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm min-h-[44px] touch-manipulation"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
