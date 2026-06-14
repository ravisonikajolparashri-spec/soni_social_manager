import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/* ── Icons ──────────────────────────────────────────────────────────────── */
const Icon = ({ d, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
)

const ICONS = {
  grid:      'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
  plus:      'M12 4v16m8-8H4',
  orders:    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  wallet:    'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  users:     'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  services:  'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  logout:    'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  shield:    'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  close:     'M6 18L18 6M6 6l12 12',
}

const userLinks = [
  { to: '/dashboard', label: 'Dashboard',  icon: 'grid'     },
  { to: '/new-order', label: 'New Order',  icon: 'plus'     },
  { to: '/orders',    label: 'My Orders',  icon: 'orders'   },
  { to: '/add-funds', label: 'Add Funds',  icon: 'wallet'   },
]

const adminLinks = [
  { to: '/admin',          label: 'Overview', icon: 'grid',     end: true },
  { to: '/admin/users',    label: 'Users',    icon: 'users'              },
  { to: '/admin/services', label: 'Services', icon: 'services'           },
  { to: '/admin/orders',   label: 'Orders',   icon: 'orders'             },
]

/* ── NavItem ─────────────────────────────────────────────────────────────── */
function NavItem({ to, label, icon, end, activeClass, onClose }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 touch-manipulation ${
          isActive ? activeClass : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      <Icon d={ICONS[icon]} className="w-5 h-5 shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  )
}

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    if (onClose) onClose()
    navigate('/login')
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U'

  return (
    <aside className="w-64 min-h-screen h-full bg-slate-900 text-white flex flex-col shadow-2xl">

      {/* Brand + Close button (close only on mobile) */}
      <div className="px-4 py-4 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">V</div>
          <span className="text-base font-bold text-white tracking-tight leading-tight">Viral SMM Panel</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors touch-manipulation"
          >
            <Icon d={ICONS.close} className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User card */}
      <div className="px-3 py-3 border-b border-slate-700/60">
        <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-3 py-2.5">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate leading-tight">{user?.username}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between bg-emerald-900/40 border border-emerald-700/40 rounded-lg px-3 py-2">
          <span className="text-xs text-emerald-400 font-medium">Balance</span>
          <span className="text-sm font-bold text-emerald-400">₹{user?.balance?.toFixed(2) ?? '0.00'}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Menu</p>
        {userLinks.map(link => (
          <NavItem
            key={link.to}
            {...link}
            onClose={onClose}
            activeClass="bg-blue-600 text-white shadow-sm shadow-blue-900/50"
          />
        ))}

        {user?.is_admin && (
          <>
            <div className="my-3 border-t border-slate-700/60" />
            <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Icon d={ICONS.shield} className="w-3 h-3" /> Admin
            </p>
            {adminLinks.map(link => (
              <NavItem
                key={link.to}
                {...link}
                onClose={onClose}
                activeClass="bg-violet-600 text-white shadow-sm shadow-violet-900/50"
              />
            ))}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-slate-700/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-all duration-150 touch-manipulation"
        >
          <Icon d={ICONS.logout} className="w-5 h-5 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
