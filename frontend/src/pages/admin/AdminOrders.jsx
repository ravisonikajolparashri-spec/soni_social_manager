import { useEffect, useState } from 'react'
import { adminAPI } from '../../api'
import CustomSelect from '../../components/CustomSelect'

const STATUS_STYLES = {
  Completed:    'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'In progress':'bg-brand-100 text-brand-700 border border-brand-200',
  Pending:      'bg-amber-100 text-amber-700 border border-amber-200',
  Processing:   'bg-brand-100 text-brand-700 border border-brand-200',
  Partial:      'bg-orange-100 text-orange-700 border border-orange-200',
  Canceled:     'bg-red-100 text-red-700 border border-red-200',
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Pending',      label: 'Pending' },
  { value: 'In progress',  label: 'In Progress' },
  { value: 'Processing',   label: 'Processing' },
  { value: 'Completed',    label: 'Completed' },
  { value: 'Partial',      label: 'Partial' },
  { value: 'Canceled',     label: 'Canceled' },
]

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
    <div className="space-y-4 sm:space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">All Orders</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
          {orders.length} orders{filterStatus ? ` · ${filterStatus}` : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order ID, user ID or link…"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
          />
        </div>
        <CustomSelect
          options={STATUS_OPTIONS}
          value={filterStatus}
          onChange={val => setFilterStatus(val)}
          searchable={false}
          className="sm:w-44"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* ── Mobile: Card list ──────────────────────────────────── */}
          <div className="md:hidden space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 py-12 text-center">
                <p className="text-slate-400 text-sm">No orders found</p>
              </div>
            ) : filtered.map(o => (
              <div key={o.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">#{o.id}</span>
                      <span className="text-xs text-slate-400">User #{o.user_id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[o.status] || 'bg-slate-100 text-slate-600'}`}>
                        {o.status}
                      </span>
                    </div>
                    <a href={o.link} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline truncate block max-w-[240px]">{o.link}</a>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-800">₹{o.charge}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Qty: <strong className="text-slate-700">{o.quantity.toLocaleString()}</strong></span>
                  {o.external_order_id && <span>Ext: <span className="font-mono text-slate-600">{o.external_order_id}</span></span>}
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
                    {['Order ID', 'User', 'Ext. ID', 'Link', 'Qty', 'Charge', 'Status', 'Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5"><span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">#{o.id}</span></td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs">#{o.user_id}</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-400">{o.external_order_id || '—'}</td>
                      <td className="px-4 py-3.5 max-w-[160px] lg:max-w-[220px]">
                        <a href={o.link} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline truncate block text-xs">{o.link}</a>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-700 whitespace-nowrap">{o.quantity.toLocaleString()}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">₹{o.charge}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${STATUS_STYLES[o.status] || 'bg-slate-100 text-slate-600'}`}>{o.status}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-12 text-slate-400 text-sm">No orders found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
