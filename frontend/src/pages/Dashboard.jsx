import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ordersAPI, transactionsAPI } from '../api'

const STATUS_STYLES = {
  Completed:    'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'In progress':'bg-blue-100 text-blue-700 border border-blue-200',
  Pending:      'bg-amber-100 text-amber-700 border border-amber-200',
  Processing:   'bg-blue-100 text-blue-700 border border-blue-200',
  Partial:      'bg-orange-100 text-orange-700 border border-orange-200',
  Canceled:     'bg-red-100 text-red-700 border border-red-200',
}

function StatCard({ label, value, sub, color, bg, icon }) {
  return (
    <div className={`${bg} rounded-2xl p-5 border border-white/60 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-white/60`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, refreshUser } = useAuth()
  const [orders, setOrders] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([ordersAPI.list(), transactionsAPI.list(), refreshUser()])
      .then(([o, t]) => {
        setOrders(o.data.slice(0, 5))
        setTransactions(t.data.slice(0, 5))
      })
      .finally(() => setLoading(false))
  }, [])

  const activeCount = orders.filter(o => ['Pending', 'In progress', 'Processing'].includes(o.status)).length
  const completedCount = orders.filter(o => o.status === 'Completed').length

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl px-6 py-5 text-white shadow-lg shadow-blue-200">
        <p className="text-blue-200 text-sm font-medium mb-1">Welcome back</p>
        <h1 className="text-2xl font-bold">{user?.username} 👋</h1>
        <p className="text-blue-200 text-sm mt-1">Here's what's happening with your account today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Balance"
          value={`$${user?.balance?.toFixed(2) ?? '0.00'}`}
          sub="Available funds"
          color="text-emerald-600"
          bg="bg-emerald-50"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Total Orders"
          value={orders.length}
          sub="All time"
          color="text-blue-600"
          bg="bg-blue-50"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard
          label="Active"
          value={activeCount}
          sub="In progress"
          color="text-amber-600"
          bg="bg-amber-50"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Completed"
          value={completedCount}
          sub="Successfully done"
          color="text-violet-600"
          bg="bg-violet-50"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        <Link
          to="/new-order"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Order
        </Link>
        <Link
          to="/add-funds"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Add Funds
        </Link>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          View All Orders
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
            <h3 className="font-semibold text-slate-800">Recent Orders</h3>
            <Link to="/orders" className="text-blue-600 text-xs font-medium hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="p-5 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center animate-pulse">
                    <div className="space-y-1.5">
                      <div className="h-3 bg-slate-100 rounded w-24" />
                      <div className="h-2 bg-slate-100 rounded w-36" />
                    </div>
                    <div className="h-5 bg-slate-100 rounded-full w-16" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <svg className="w-10 h-10 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                <p className="text-sm text-slate-400">No orders yet.</p>
                <Link to="/new-order" className="text-blue-600 text-sm font-medium mt-1 inline-block hover:underline">Place your first order →</Link>
              </div>
            ) : (
              orders.map(o => (
                <div key={o.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700">Order <span className="font-mono text-slate-500">#{o.id}</span></p>
                    <p className="text-xs text-slate-400 truncate max-w-[200px]">{o.link}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${STATUS_STYLES[o.status] || 'bg-slate-100 text-slate-500'}`}>
                    {o.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-50">
            <h3 className="font-semibold text-slate-800">Recent Transactions</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="p-5 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center animate-pulse">
                    <div className="space-y-1.5">
                      <div className="h-3 bg-slate-100 rounded w-28" />
                      <div className="h-2 bg-slate-100 rounded w-20" />
                    </div>
                    <div className="h-3 bg-slate-100 rounded w-16" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm text-slate-400">No transactions yet.</p>
              </div>
            ) : (
              transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 capitalize">{t.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-slate-400">{new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className={`text-sm font-bold ${t.amount >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {t.amount >= 0 ? '+' : ''}${Math.abs(t.amount).toFixed(4)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
