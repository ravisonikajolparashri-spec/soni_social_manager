import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ordersAPI, transactionsAPI } from '../api'

const STATUS_COLORS = {
  Completed: 'bg-green-100 text-green-700',
  'In progress': 'bg-blue-100 text-blue-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Partial: 'bg-orange-100 text-orange-700',
  Canceled: 'bg-red-100 text-red-700',
}

export default function Dashboard() {
  const { user, refreshUser } = useAuth()
  const [orders, setOrders] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([ordersAPI.list(), transactionsAPI.list(), refreshUser()])
      .then(([o, t]) => { setOrders(o.data.slice(0, 5)); setTransactions(t.data.slice(0, 5)) })
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Balance', value: `$${user?.balance?.toFixed(2) ?? '0.00'}`, color: 'text-green-600' },
    { label: 'Total Orders', value: orders.length, color: 'text-blue-600' },
    { label: 'Active Orders', value: orders.filter(o => ['Pending','In progress','Processing'].includes(o.status)).length, color: 'text-yellow-600' },
    { label: 'Completed', value: orders.filter(o => o.status === 'Completed').length, color: 'text-green-600' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-8">
        <Link to="/new-order" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
          ➕ New Order
        </Link>
        <Link to="/add-funds" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
          💰 Add Funds
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Orders</h3>
            <Link to="/orders" className="text-blue-600 text-sm hover:underline">View all</Link>
          </div>
          {loading ? <p className="text-gray-400 text-sm">Loading...</p> : orders.length === 0 ? (
            <p className="text-gray-400 text-sm">No orders yet. <Link to="/new-order" className="text-blue-600">Place your first order</Link></p>
          ) : (
            <div className="space-y-3">
              {orders.map(o => (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Order #{o.id}</p>
                    <p className="text-gray-400 text-xs truncate max-w-[160px]">{o.link}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Transactions</h3>
          {loading ? <p className="text-gray-400 text-sm">Loading...</p> : transactions.length === 0 ? (
            <p className="text-gray-400 text-sm">No transactions yet.</p>
          ) : (
            <div className="space-y-3">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-700 capitalize">{t.type.replace('_', ' ')}</p>
                    <p className="text-gray-400 text-xs">{new Date(t.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`font-semibold ${t.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {t.amount >= 0 ? '+' : ''}${Math.abs(t.amount).toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
