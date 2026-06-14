import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { servicesAPI, ordersAPI } from '../api'
import { useAuth } from '../context/AuthContext'

export default function NewOrder() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedService, setSelectedService] = useState(null)
  const [form, setForm] = useState({ link: '', quantity: '', comments: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    servicesAPI.categories().then(r => setCategories(r.data))
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      servicesAPI.list(selectedCategory).then(r => setServices(r.data))
      setSelectedService(null)
    }
  }, [selectedCategory])

  const charge = selectedService && form.quantity
    ? ((selectedService.rate / 1000) * Number(form.quantity)).toFixed(4)
    : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      const payload = {
        service_id: selectedService.id,
        link: form.link,
        quantity: Number(form.quantity),
      }
      if (form.comments) payload.comments = form.comments
      await ordersAPI.create(payload)
      await refreshUser()
      setSuccess('Order placed successfully!')
      setTimeout(() => navigate('/orders'), 1500)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">New Order</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
            >
              <option value="">Select a category...</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Service */}
          {selectedCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
              <select
                value={selectedService?.id || ''}
                onChange={e => setSelectedService(services.find(s => s.id === Number(e.target.value)))}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select a service...</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    #{s.id} — {s.name} (${s.rate}/1k)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Service info */}
          {selectedService && (
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800 space-y-1">
              <p><strong>Rate:</strong> ${selectedService.rate} per 1,000</p>
              <p><strong>Min:</strong> {selectedService.min_order} &nbsp; <strong>Max:</strong> {selectedService.max_order.toLocaleString()}</p>
              {selectedService.refill && <p className="text-green-700">✓ Refill available</p>}
            </div>
          )}

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link / URL</label>
            <input
              type="url"
              required
              value={form.link}
              onChange={e => setForm({ ...form, link: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="https://instagram.com/yourprofile"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity {selectedService && `(${selectedService.min_order}–${selectedService.max_order.toLocaleString()})`}
            </label>
            <input
              type="number"
              required
              min={selectedService?.min_order || 1}
              max={selectedService?.max_order || 999999}
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="e.g. 1000"
            />
          </div>

          {/* Charge preview */}
          {charge && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 text-sm">
              <span className="text-gray-600">Total Charge:</span>
              <span className="font-bold text-gray-800">${charge}</span>
            </div>
          )}

          {/* Balance warning */}
          {charge && user && Number(charge) > user.balance && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
              Insufficient balance. Current: ${user.balance.toFixed(4)}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedService}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Placing order...' : `Place Order${charge ? ` — $${charge}` : ''}`}
          </button>
        </form>
      </div>
    </div>
  )
}
