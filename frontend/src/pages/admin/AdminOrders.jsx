import { useEffect, useState } from 'react'
import { adminAPI } from '../../api'

const STATUS_STYLES = {
  Completed:    'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'In progress':'bg-blue-100 text-blue-700 border border-blue-200',
  Pending:      'bg-amber-100 text-amber-700 border border-amber-200',
  Processing:   'bg-blue-100 text-blue-700 border border-blue-200',
  Partial:      'bg-orange-100 text-orange-700 border border-orange-200',
  Canceled:     'bg-red-100 text-red-700 border border-red-200',
}

const STATUSES = ['', 'Pending', 'In progress', 'Processing', 'Completed', 'Partial', 'Canceled']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    adminAPI.orders(filterStatus || undefined)
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false))
  }, [filterStatus])

  const filtered = orders.filter(o =>
    !search ||
    String(o.id).includes(search) ||
    String(o.user_id).includes(search) ||
    o.link.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All Orders</h1>
          <p className="text-slate-500 text-sm mt-0.5">{orders.length} orders{filterStatus ? ` with status "${filterStatus}"` : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order ID, user ID, or link..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

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
                  {['Order ID', 'User ID', 'Ext. ID', 'Link', 'Qty', 'Charge', 'Status', 'Date'].map(h => (
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
                    <td className="px-4 py-3.5 text-slate-500 text-xs">#{o.user_id}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400">{o.external_order_id || '—'}</td>
                    <td className="px-4 py-3.5 max-w-[160px]">
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
                    <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
