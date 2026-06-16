import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ordersAPI, transactionsAPI } from '../api'

const STATUS_STYLES = {
  Completed:    'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'In progress':'bg-brand-100 text-brand-700 border border-brand-200',
  Pending:      'bg-amber-100 text-amber-700 border border-amber-200',
  Processing:   'bg-brand-100 text-brand-700 border border-brand-200',
  Partial:      'bg-orange-100 text-orange-700 border border-orange-200',
  Canceled:     'bg-red-100 text-red-700 border border-red-200',
}

function StatCard({ label, value, sub, color, bg, icon }) {
  return (
    <div className={`${bg} rounded-2xl p-4 sm:p-5 border border-white/60 shadow-sm`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 truncate">{label}</p>
          <p className={`text-xl sm:text-2xl font-bold ${color} leading-tight`}>{value}</p>
          {sub && <p className="text-[11px] sm:text-xs text-slate-400 mt-1 truncate">{sub}</p>}
        </div>
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${color} bg-white/60`}>
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

  const activeCount    = orders.filter(o => ['Pending', 'In progress', 'Processing'].includes(o.status)).length
  const completedCount = orders.filter(o => o.status === 'Completed').length

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 text-white shadow-lg shadow-brand-200">
        <p className="text-brand-200 text-xs sm:text-sm font-medium mb-0.5">Welcome back</p>
        <h1 className="text-xl sm:text-2xl font-bold truncate">{user?.username} 👋</h1>
        <p className="text-brand-200 text-xs sm:text-sm mt-1 hidden sm:block">Here's what's happening with your account today.</p>
      </div>

      {/* Stats — 2 cols mobile → 4 cols desktop */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Balance"
          value={`₹${user?.balance?.toFixed(2) ?? '0.00'}`}
          sub="Available"
          color="text-emerald-600"
          bg="bg-emerald-50"
          icon={<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Orders"
          value={orders.length}
          sub="All time"
          color="text-brand-600"
          bg="bg-brand-50"
          icon={<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard
          label="Active"
          value={activeCount}
          sub="In progress"
          color="text-amber-600"
          bg="bg-amber-50"
          icon={<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Done"
          value={completedCount}
          sub="Completed"
          color="text-violet-600"
          bg="bg-violet-50"
          icon={<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <Link to="/new-order" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm touch-manipulation min-h-[44px]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Order
        </Link>
        <Link to="/add-funds" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm touch-manipulation min-h-[44px]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Add Funds
        </Link>
        <Link to="/orders" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 transition-colors touch-manipulation min-h-[44px]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          View Orders
        </Link>
      </div>

      {/* Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-50">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Recent Orders</h3>
            <Link to="/orders" className="text-brand-600 text-xs font-medium hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center animate-pulse">
                    <div className="space-y-1.5"><div className="h-3 bg-slate-100 rounded w-24" /><div className="h-2 bg-slate-100 rounded w-36" /></div>
                    <div className="h-5 bg-slate-100 rounded-full w-16" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <svg className="w-10 h-10 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                <p className="text-sm text-slate-400">No orders yet.</p>
                <Link to="/new-order" className="text-brand-600 text-sm font-medium mt-1 inline-block hover:underline">Place your first order →</Link>
              </div>
            ) : orders.map(o => (
              <div key={o.id} className="flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="min-w-0 mr-3">
                  <p className="text-sm font-semibold text-slate-700">Order <span className="font-mono text-slate-500">#{o.id}</span></p>
                  <p className="text-xs text-slate-400 truncate max-w-[150px] sm:max-w-[200px]">{o.link}</p>
                </div>
                <span className={`px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold whitespace-nowrap shrink-0 ${STATUS_STYLES[o.status] || 'bg-slate-100 text-slate-500'}`}>
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-slate-50">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Recent Transactions</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center animate-pulse">
                    <div className="space-y-1.5"><div className="h-3 bg-slate-100 rounded w-28" /><div className="h-2 bg-slate-100 rounded w-20" /></div>
                    <div className="h-3 bg-slate-100 rounded w-16" />
                  </div>
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-slate-400">No transactions yet.</p>
              </div>
            ) : transactions.map(t => (
              <div key={t.id} className="flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="min-w-0 mr-3">
                  <p className="text-sm font-semibold text-slate-700 capitalize truncate">{t.type.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-slate-400">{new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className={`text-sm font-bold shrink-0 ${t.amount >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {t.amount >= 0 ? '+' : ''}₹{Math.abs(t.amount).toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
