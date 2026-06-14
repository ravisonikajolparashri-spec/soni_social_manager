import { useEffect, useState } from 'react'
import { ordersAPI } from '../api'

const STATUS_COLORS = {
  Completed: 'bg-green-100 text-green-700',
  'In progress': 'bg-blue-100 text-blue-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Partial: 'bg-orange-100 text-orange-700',
  Canceled: 'bg-red-100 text-red-700',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    ordersAPI.list().then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  const handleRefill = async (id) => {
    setActionLoading(id + '-refill')
    try {
      await ordersAPI.refill(id)
      setMessage('Refill requested successfully!')
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Refill failed')
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
      setMessage('Order canceled.')
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Cancel failed')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">My Orders</h2>
      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400">No orders yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  {['ID', 'Link', 'Qty', 'Charge', 'Status', 'Remains', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-gray-500">#{o.id}</td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <a href={o.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate block">
                        {o.link}
                      </a>
                    </td>
                    <td className="px-4 py-3">{o.quantity.toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium">${o.charge}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{o.remains ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {o.status === 'Partial' && (
                          <button
                            onClick={() => handleRefill(o.id)}
                            disabled={actionLoading === o.id + '-refill'}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
                          >
                            Refill
                          </button>
                        )}
                        {['Pending', 'In progress'].includes(o.status) && (
                          <button
                            onClick={() => handleCancel(o.id)}
                            disabled={actionLoading === o.id + '-cancel'}
                            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 disabled:opacity-50"
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
