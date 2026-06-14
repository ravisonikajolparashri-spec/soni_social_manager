import { useEffect, useState } from 'react'
import { ordersAPI } from '../api'

const STATUS_STYLES = {
  Completed:    'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'In progress':'bg-blue-100 text-blue-700 border border-blue-200',
  Pending:      'bg-amber-100 text-amber-700 border border-amber-200',
  Processing:   'bg-blue-100 text-blue-700 border border-blue-200',
  Partial:      'bg-orange-100 text-orange-700 border border-orange-200',
  Canceled:     'bg-red-100 text-red-700 border border-red-200',
}

const ALL_STATUSES = ['', 'Pending', 'In progress', 'Processing', 'Completed', 'Partial', 'Canceled']

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    ordersAPI.list().then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  const handleRefill = async (id) => {
    setActionLoading(id + '-refill')
    try {
      await ordersAPI.refill(id)
      setMessage({ text: 'Refill requested successfully!', type: 'success' })
    } catch (err) {
      setMessage({ text: err.response?.data?.detail || 'Refill failed', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return
    setActionLoading(id + '-cancel')
    try {
      await ordersAPI.cancel(id)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Canceled' } : o))
      setMessage({ text: 'Order canceled.', type: 'success' })
    } catch (err) {
      setMessage({ text: err.response?.data?.detail || 'Cancel failed', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = orders.filter(o => {
    const matchStatus = !filterStatus || o.status === filterStatus
    const matchSearch = !search || o.link.toLowerCase().includes(search.toLowerCase()) || String(o.id).includes(search)
    return matchStatus && matchSearch
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Orders</h1>
          <p className="text-slate-500 text-sm mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
          message.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success'
            ? <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            : <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          }
          {message.text}
          <button onClick={() => setMessage({ text: '', type: '' })} className="ml-auto text-current opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID or link..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 py-16 text-center">
          <svg className="w-12 h-12 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          <p className="text-slate-500 font-medium">No orders found</p>
          <p className="text-slate-400 text-sm mt-1">{search || filterStatus ? 'Try adjusting your filters' : 'Place your first order to get started'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Order ID', 'Link', 'Qty', 'Charge', 'Status', 'Remains', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">#{o.id}</span>
                    </td>
                    <td className="px-4 py-3.5 max-w-[200px]">
                      <a href={o.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate block text-xs">
                        {o.link}
                      </a>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">{o.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">${o.charge}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_STYLES[o.status] || 'bg-slate-100 text-slate-600'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{o.remains ?? '—'}</td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1.5">
                        {o.status === 'Partial' && (
                          <button
                            onClick={() => handleRefill(o.id)}
                            disabled={actionLoading === o.id + '-refill'}
                            className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-200 disabled:opacity-50 font-medium transition-colors"
                          >
                            Refill
                          </button>
                        )}
                        {['Pending', 'In progress'].includes(o.status) && (
                          <button
                            onClick={() => handleCancel(o.id)}
                            disabled={actionLoading === o.id + '-cancel'}
                            className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-200 disabled:opacity-50 font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
