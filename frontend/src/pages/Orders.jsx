import { useEffect, useState } from 'react'
import { ordersAPI } from '../api'
import CustomSelect from '../components/CustomSelect'

const STATUS_STYLES = {
  Completed:    'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'In progress':'bg-blue-100 text-blue-700 border border-blue-200',
  Pending:      'bg-amber-100 text-amber-700 border border-amber-200',
  Processing:   'bg-blue-100 text-blue-700 border border-blue-200',
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
      setMessage({ text: 'Refill requested!', type: 'success' })
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
    <div className="space-y-4 sm:space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">My Orders</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      {/* Alert banner */}
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
          <button onClick={() => setMessage({ text: '', type: '' })} className="ml-auto text-current opacity-50 hover:opacity-100 touch-manipulation">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID or link…"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
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

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-24 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-48" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 py-14 sm:py-16 text-center">
          <svg className="w-12 h-12 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          <p className="text-slate-500 font-medium text-sm">No orders found</p>
          <p className="text-slate-400 text-xs mt-1">{search || filterStatus ? 'Try adjusting your filters' : 'Place your first order to get started'}</p>
        </div>
      ) : (
        <>
          {/* ── Mobile / Tablet: Card list ──────────────────────────── */}
          <div className="md:hidden space-y-3">
            {filtered.map(o => (
              <div key={o.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">#{o.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[o.status] || 'bg-slate-100 text-slate-600'}`}>
                        {o.status}
                      </span>
                    </div>
                    <a href={o.link} target="_blank" rel="noreferrer" className="block text-xs text-blue-600 hover:underline truncate mt-1.5 max-w-[240px]">
                      {o.link}
                    </a>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-800">₹{o.charge}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>

                {/* Detail row */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Qty: <strong className="text-slate-700">{o.quantity.toLocaleString()}</strong></span>
                  {o.remains != null && <span>Remains: <strong className="text-slate-700">{o.remains}</strong></span>}
                </div>

                {/* Actions */}
                {(o.status === 'Partial' || ['Pending', 'In progress'].includes(o.status)) && (
                  <div className="flex gap-2 pt-1">
                    {o.status === 'Partial' && (
                      <button
                        onClick={() => handleRefill(o.id)}
                        disabled={actionLoading === o.id + '-refill'}
                        className="flex-1 text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 disabled:opacity-50 font-medium transition-colors min-h-[36px] touch-manipulation"
                      >
                        {actionLoading === o.id + '-refill' ? '…' : 'Refill'}
                      </button>
                    )}
                    {['Pending', 'In progress'].includes(o.status) && (
                      <button
                        onClick={() => handleCancel(o.id)}
                        disabled={actionLoading === o.id + '-cancel'}
                        className="flex-1 text-xs bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 disabled:opacity-50 font-medium transition-colors min-h-[36px] touch-manipulation"
                      >
                        {actionLoading === o.id + '-cancel' ? '…' : 'Cancel'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Desktop: Table ──────────────────────────────────────── */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Order ID', 'Link', 'Qty', 'Charge', 'Status', 'Remains', 'Date', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">#{o.id}</span>
                      </td>
                      <td className="px-4 py-3.5 max-w-[180px] lg:max-w-[240px]">
                        <a href={o.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate block text-xs">{o.link}</a>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-700 whitespace-nowrap">{o.quantity.toLocaleString()}</td>
                      <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">₹{o.charge}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${STATUS_STYLES[o.status] || 'bg-slate-100 text-slate-600'}`}>
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
                            <button onClick={() => handleRefill(o.id)} disabled={actionLoading === o.id + '-refill'} className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-200 disabled:opacity-50 font-medium transition-colors">Refill</button>
                          )}
                          {['Pending', 'In progress'].includes(o.status) && (
                            <button onClick={() => handleCancel(o.id)} disabled={actionLoading === o.id + '-cancel'} className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-200 disabled:opacity-50 font-medium transition-colors">Cancel</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
