import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const userLinks = [
  { to: '/dashboard', label: '📊 Dashboard' },
  { to: '/new-order', label: '➕ New Order' },
  { to: '/orders', label: '📋 My Orders' },
  { to: '/add-funds', label: '💰 Add Funds' },
]

const adminLinks = [
  { to: '/admin', label: '📊 Overview' },
  { to: '/admin/users', label: '👥 Users' },
  { to: '/admin/services', label: '🛠 Services' },
  { to: '/admin/orders', label: '📋 Orders' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  const links = user?.is_admin ? [...userLinks, ...adminLinks] : userLinks

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-blue-400">SMM Panel</h1>
        <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
        <p className="text-sm font-semibold text-green-400 mt-1">
          Balance: ${user?.balance?.toFixed(2) ?? '0.00'}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin'}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}
