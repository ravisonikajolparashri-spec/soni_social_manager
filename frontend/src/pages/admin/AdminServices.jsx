import { useEffect, useState } from 'react'
import { adminAPI } from '../../api'

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [editModal, setEditModal] = useState(null)
  const [editRate, setEditRate] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminAPI.services().then(r => setServices(r.data)).finally(() => setLoading(false))
  }, [])

  const handleSync = async () => {
    setSyncing(true); setMessage({ text: '', type: '' })
    try {
      const r = await adminAPI.syncServices()
      setMessage({ text: `Sync complete: ${r.data.added} added, ${r.data.updated} updated`, type: 'success' })
      adminAPI.services().then(r2 => setServices(r2.data))
    } catch (err) {
      setMessage({ text: err.response?.data?.detail || 'Sync failed', type: 'error' })
    } finally {
      setSyncing(false)
    }
  }

  const toggleActive = async (svc) => {
    await adminAPI.updateService(svc.id, { is_active: !svc.is_active })
    setServices(prev => prev.map(s => s.id === svc.id ? { ...s, is_active: !s.is_active } : s))
  }

  const handleEditRate = async (e) => {
    e.preventDefault()
    await adminAPI.updateService(editModal.id, { rate: Number(editRate) })
    setServices(prev => prev.map(s => s.id === editModal.id ? { ...s, rate: Number(editRate) } : s))
    setEditModal(null)
  }

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase()) ||
    String(s.external_id).includes(search)
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Services</h1>
          <p className="text-slate-500 text-sm mt-0.5">{services.length} total services available</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <svg className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          {syncing ? 'Syncing...' : 'Sync Services'}
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
          message.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
          <button onClick={() => setMessage({ text: '', type: '' })} className="ml-auto opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, category or ID..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['ID', 'Name', 'Category', 'Cost', 'Our Rate', 'Min / Max', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">#{s.external_id}</span>
                    </td>
                    <td className="px-4 py-3.5 max-w-[220px]">
                      <p className="font-medium text-slate-800 truncate">{s.name}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{s.category}</td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">₹{s.original_rate}/1k</td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-emerald-700">₹{s.rate}/1k</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      {s.min_order.toLocaleString()} – {s.max_order.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        s.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {s.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => { setEditModal(s); setEditRate(String(s.rate)) }}
                          className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-200 font-medium transition-colors"
                        >
                          Edit Rate
                        </button>
                        <button
                          onClick={() => toggleActive(s)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                            s.is_active
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          }`}
                        >
                          {s.is_active ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                      {search ? 'No services match your search' : 'No services yet — sync from BluesSMM to import'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Rate Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-lg text-slate-800 mb-1">Edit Selling Rate</h3>
            <p className="text-slate-400 text-sm mb-1 truncate">{editModal.name}</p>
            <p className="text-xs text-slate-400 mb-5 bg-slate-50 px-3 py-2 rounded-lg inline-block">
              API cost: <strong className="text-slate-600">₹{editModal.original_rate}/1k</strong>
            </p>
            <form onSubmit={handleEditRate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Selling Rate (per 1000)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  required
                  value={editRate}
                  onChange={e => setEditRate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Selling rate per 1000"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">Save</button>
                <button type="button" onClick={() => setEditModal(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-medium transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
