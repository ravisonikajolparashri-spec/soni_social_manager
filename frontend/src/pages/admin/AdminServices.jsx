import { useEffect, useState } from 'react'
import { adminAPI } from '../../api'

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState('')
  const [editModal, setEditModal] = useState(null)
  const [editRate, setEditRate] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminAPI.services().then(r => setServices(r.data)).finally(() => setLoading(false))
  }, [])

  const handleSync = async () => {
    setSyncing(true); setMessage('')
    try {
      const r = await adminAPI.syncServices()
      setMessage(`Sync complete: ${r.data.added} added, ${r.data.updated} updated`)
      adminAPI.services().then(r2 => setServices(r2.data))
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Sync failed')
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
    s.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Services</h2>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {syncing ? 'Syncing...' : '🔄 Sync from EasySMM'}
        </button>
      </div>

      {message && <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4 text-sm">{message}</div>}

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search services..."
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-blue-500"
      />

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  {['ID', 'Name', 'Category', 'Cost', 'Rate (sell)', 'Min/Max', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">#{s.external_id}</td>
                    <td className="px-4 py-3 font-medium max-w-[200px]">
                      <p className="truncate">{s.name}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{s.category}</td>
                    <td className="px-4 py-3 text-gray-400">${s.original_rate}/1k</td>
                    <td className="px-4 py-3 font-semibold text-green-700">${s.rate}/1k</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{s.min_order}–{s.max_order.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditModal(s); setEditRate(String(s.rate)) }}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          Edit Rate
                        </button>
                        <button
                          onClick={() => toggleActive(s)}
                          className={`text-xs px-2 py-1 rounded ${s.is_active ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        >
                          {s.is_active ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Rate Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl">
            <h3 className="font-bold text-lg mb-1">Edit Rate</h3>
            <p className="text-gray-400 text-sm mb-4 truncate">{editModal.name}</p>
            <p className="text-xs text-gray-500 mb-4">Cost price: ${editModal.original_rate}/1k</p>
            <form onSubmit={handleEditRate} className="space-y-4">
              <input
                type="number"
                step="0.001"
                min="0.001"
                required
                value={editRate}
                onChange={e => setEditRate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                placeholder="Selling rate per 1000"
              />
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">Save</button>
                <button type="button" onClick={() => setEditModal(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
