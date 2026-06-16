import { useEffect, useState } from 'react'
import { adminAPI, getErrorMessage } from '../../api'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [fundModal, setFundModal] = useState(null)
  const [fundAmount, setFundAmount] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminAPI.users().then(r => setUsers(r.data)).finally(() => setLoading(false))
  }, [])

  const toggleActive = async (user) => {
    await adminAPI.updateUser(user.id, { is_active: !user.is_active })
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u))
  }

  const handleAddFunds = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.addFundsToUser(fundModal.id, Number(fundAmount))
      setUsers(prev => prev.map(u => u.id === fundModal.id ? { ...u, balance: u.balance + Number(fundAmount) } : u))
      setMessage({ text: `Added ₹${fundAmount} to ${fundModal.username}'s balance`, type: 'success' })
      setFundModal(null); setFundAmount('')
    } catch (err) {
      setMessage({ text: getErrorMessage(err, 'Failed to add funds'), type: 'error' })
    }
  }

  const filtered = users.filter(u =>
    !search ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    String(u.id).includes(search)
  )

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Users</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">{users.length} registered users</p>
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

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by username, email or ID…"
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* ── Mobile: Card list ──────────────────────────────────── */}
          <div className="md:hidden space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 py-12 text-center">
                <p className="text-slate-400 text-sm">No users found</p>
              </div>
            ) : filtered.map(u => (
              <div key={u.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-sm font-bold shrink-0">
                      {u.username.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-800 truncate">{u.username}</p>
                        {u.is_admin && (
                          <span className="bg-violet-100 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">Admin</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-600">₹{u.balance.toFixed(2)}</p>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      u.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                    }`}>{u.is_active ? 'Active' : 'Disabled'}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">Joined {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setFundModal(u); setFundAmount('') }}
                    className="flex-1 text-xs bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-200 font-medium transition-colors min-h-[36px] touch-manipulation"
                  >
                    Add Funds
                  </button>
                  {!u.is_admin && (
                    <button
                      onClick={() => toggleActive(u)}
                      className={`flex-1 text-xs px-3 py-2 rounded-lg font-medium transition-colors min-h-[36px] touch-manipulation ${
                        u.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      }`}
                    >
                      {u.is_active ? 'Disable' : 'Enable'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop: Table ──────────────────────────────────────── */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['ID', 'User', 'Balance', 'Status', 'Role', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5"><span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">#{u.id}</span></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {u.username.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{u.username}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-emerald-600 whitespace-nowrap">₹{u.balance.toFixed(2)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          u.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>{u.is_active ? 'Active' : 'Disabled'}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        {u.is_admin && <span className="bg-violet-100 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full text-[11px] font-semibold">Admin</span>}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1.5">
                          <button onClick={() => { setFundModal(u); setFundAmount('') }} className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg hover:bg-emerald-200 font-medium transition-colors">Add Funds</button>
                          {!u.is_admin && (
                            <button onClick={() => toggleActive(u)} className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                              u.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            }`}>{u.is_active ? 'Disable' : 'Enable'}</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Funds Modal — bottom sheet on mobile, centered on desktop */}
      {fundModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-0 sm:px-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-sm shadow-2xl safe-area-bottom">
            <h3 className="font-bold text-lg text-slate-800 mb-1">Add Funds</h3>
            <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5 mb-5">
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold shrink-0">
                {fundModal.username.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">{fundModal.username}</p>
                <p className="text-xs text-slate-400">Current balance: <strong className="text-slate-600">₹{fundModal.balance.toFixed(2)}</strong></p>
              </div>
            </div>
            <form onSubmit={handleAddFunds} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  required
                  value={fundAmount}
                  onChange={e => setFundAmount(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm min-h-[44px]"
                  placeholder="e.g. 100.00"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] touch-manipulation">Add Funds</button>
                <button type="button" onClick={() => setFundModal(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] touch-manipulation">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
