import { useEffect, useState } from 'react'
import { adminAPI } from '../../api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.stats().then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { label: 'Total Users', value: stats.total_users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Orders', value: stats.total_orders, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Revenue', value: `$${stats.total_revenue.toFixed(2)}`, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Services', value: stats.active_services, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Pending Orders', value: stats.pending_orders, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'API Balance', value: `$${stats.api_balance}`, color: 'text-teal-600', bg: 'bg-teal-50' },
  ] : []

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Admin Overview</h2>
      <p className="text-gray-500 text-sm mb-6">Panel statistics and EasySMM API balance</p>

      {loading ? (
        <p className="text-gray-400">Loading stats...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map(c => (
            <div key={c.label} className={`${c.bg} rounded-xl p-5 border border-white`}>
              <p className="text-gray-500 text-sm">{c.label}</p>
              <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
