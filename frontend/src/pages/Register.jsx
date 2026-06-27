import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../api'

const fields = [
  { label: 'Email',            key: 'email',    type: 'email',    placeholder: 'you@example.com', autoComplete: 'email' },
  { label: 'Username',         key: 'username', type: 'text',     placeholder: 'yourname',         autoComplete: 'username' },
  { label: 'Password',         key: 'password', type: 'password', placeholder: '••••••••',         autoComplete: 'new-password' },
  { label: 'Confirm Password', key: 'confirm',  type: 'password', placeholder: '••••••••',         autoComplete: 'new-password' },
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', username: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register({ email: form.email, username: form.username, password: form.password })
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed'))
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
          <p className="text-slate-400 text-sm">Create your free account</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-700/60">

          {error && (
            <div className="flex items-center gap-2.5 bg-red-900/40 border border-red-700/60 text-red-300 px-4 py-3 rounded-xl mb-5 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-slate-300 mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  required
                  autoComplete={f.autoComplete}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full bg-slate-700/60 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-colors min-h-[44px]"
                  placeholder={f.placeholder}
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-sm shadow-brand-900/50 mt-2 flex items-center justify-center gap-2 min-h-[48px] touch-manipulation"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                  Creating account…
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-slate-600 text-xs mt-5 flex flex-wrap justify-center gap-x-3 gap-y-1">
          <Link to="/" className="hover:text-slate-400 transition-colors">← Back to home</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
          <span>·</span>
          <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
          <span>·</span>
          <Link to="/refund" className="hover:text-slate-400 transition-colors">Refund</Link>
          <span>·</span>
          <Link to="/faq" className="hover:text-slate-400 transition-colors">FAQ</Link>
          <span>·</span>
          <Link to="/contact" className="hover:text-slate-400 transition-colors">Contact</Link>
        </p>
      </div>
    </div>
  )
}
