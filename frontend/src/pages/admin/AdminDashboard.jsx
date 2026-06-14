import { useEffect, useState } from 'react'
import { adminAPI } from '../../api'

const statCards = (stats) => [
  { label: 'Total Users',     value: stats.total_users,                    color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100',   icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { label: 'Total Orders',    value: stats.total_orders,                   color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Revenue',         value: `₹${stats.total_revenue.toFixed(2)}`, color: 'text-emerald-600',bg: 'bg-emerald-50', border: 'border-emerald-100',icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'Services',        value: stats.active_services,                color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { label: 'Pending Orders',  value: stats.pending_orders,                 color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-100',  icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'API Balance',     value: `₹${stats.api_balance}`,              color: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-100',   icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.stats().then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* Header banner */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-700 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 text-white shadow-lg shadow-violet-200">
        <p className="text-violet-200 text-xs sm:text-sm font-medium mb-0.5">Admin Panel</p>
        <h1 className="text-xl sm:text-2xl font-bold">Overview</h1>
        <p className="text-violet-200 text-xs sm:text-sm mt-1 hidden sm:block">Platform statistics, revenue, and order overview</p>
      </div>

      {/* Stats grid: 2 cols mobile → 3 cols md+ */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-20 mb-3" />
              <div className="h-7 bg-slate-100 rounded w-14" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {statCards(stats).map(c => (
            <div key={c.label} className={`${c.bg} rounded-2xl p-4 sm:p-5 border ${c.border}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 truncate">{c.label}</p>
                  <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${c.color} leading-tight`}>{c.value}</p>
                </div>
                <svg className={`w-5 h-5 shrink-0 ${c.color} opacity-60 mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={c.icon} />
                </svg>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
