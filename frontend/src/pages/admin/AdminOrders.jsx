import { useEffect, useState } from 'react'
import { adminAPI } from '../../api'

const STATUS_COLORS = {
  Completed: 'bg-green-100 text-green-700',
  'In progress': 'bg-blue-100 text-blue-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Partial: 'bg-orange-100 text-orange-700',
  Canceled: 'bg-red-100 text-red-700',
}

const STATUSES = ['', 'Pending', 'In progress', 'Processing', 'Completed', 'Partial', 'Canceled']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    setLoading(true)
    adminAPI.orders(filterStatus || undefined)
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false))
  }, [filterStatus])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">All Orders</h2>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  {['Order ID', 'User ID', 'Ext. ID', 'Link', 'Qty', 'Charge', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-gray-500">#{o.id}</td>
                    <td className="px-4 py-3 text-gray-500">#{o.user_id}</td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{o.external_order_id || '—'}</td>
                    <td className="px-4 py-3 max-w-[150px]">
                      <a href={o.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate block text-xs">
                        {o.link}
                      </a>
                    </td>
                    <td className="px-4 py-3">{o.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold">${o.charge}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="text-center py-12 text-gray-400">No orders found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
