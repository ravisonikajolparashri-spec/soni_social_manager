import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI, getErrorMessage } from '../api'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await authAPI.resetPassword(token, form.password)
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(getErrorMessage(err, 'This reset link is invalid or has expired'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm sm:max-w-md">

        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
            <img src="/logo-icon.png" alt="SocialHypeCrowd" className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
            <span className="text-xl sm:text-2xl font-bold text-white">SocialHypeCrowd</span>
          </Link>
          <p className="text-slate-400 text-sm">Choose a new password</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700/60">

          {!token && (
            <div className="flex items-center gap-2.5 bg-red-900/40 border border-red-700/60 text-red-300 px-4 py-3 rounded-xl mb-5 text-sm">
              This link is missing its reset token. Please use the link from your email.
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2.5 bg-red-900/40 border border-red-700/60 text-red-300 px-4 py-3 rounded-xl mb-5 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          {done ? (
            <div className="flex items-start gap-3 bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 px-4 py-3.5 rounded-xl text-sm">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Password updated. Redirecting you to sign in…</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-slate-700/60 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-colors min-h-[44px]"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  className="w-full bg-slate-700/60 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-colors min-h-[44px]"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-sm shadow-brand-900/50 flex items-center justify-center gap-2 min-h-[48px] touch-manipulation mt-1"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                    Updating…
                  </>
                ) : 'Update Password'}
              </button>
            </form>
          )}

          <p className="text-center text-slate-500 text-sm mt-6">
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
