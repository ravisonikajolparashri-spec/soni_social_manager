import { useEffect, useState } from 'react'
import { adminAPI } from '../../api'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [fundModal, setFundModal] = useState(null)
  const [fundAmount, setFundAmount] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    adminAPI.users().then(r => setUsers(r.data)).finally(() => setLoading(false))
  }, [])

  const toggleActive = async (user) => {
    await adminAPI.updateUser(user.id, { is_active: !user.is_active })
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u))
  }

  const handleAddFunds = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.addFundsToUser(fundModal.id, Number(fundAmount))
      setUsers(prev => prev.map(u => u.id === fundModal.id ? { ...u, balance: u.balance + Number(fundAmount) } : u))
      setMessage(`Added $${fundAmount} to ${fundModal.username}`)
      setFundModal(null); setFundAmount('')
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed')
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Users</h2>
      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{message}</div>}

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                {['ID', 'User', 'Balance', 'Status', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">#{u.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.username}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-green-600">${u.balance.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.is_admin && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">Admin</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setFundModal(u); setFundAmount('') }}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                      >
                        Add Funds
                      </button>
                      {!u.is_admin && (
                        <button
                          onClick={() => toggleActive(u)}
                          className={`text-xs px-2 py-1 rounded ${u.is_active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                        >
                          {u.is_active ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Funds Modal */}
      {fundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl">
            <h3 className="font-bold text-lg mb-1">Add Funds</h3>
            <p className="text-gray-400 text-sm mb-4">To: {fundModal.username} (${fundModal.balance.toFixed(2)} current)</p>
            <form onSubmit={handleAddFunds} className="space-y-4">
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={fundAmount}
                onChange={e => setFundAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                placeholder="Amount in USD"
              />
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium">Add</button>
                <button type="button" onClick={() => setFundModal(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
