import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { servicesAPI, ordersAPI, getErrorMessage } from '../api'
import { useAuth } from '../context/AuthContext'
import CustomSelect from '../components/CustomSelect'
import PlatformIcon from '../components/PlatformIcon'

export default function NewOrder() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [allServices, setAllServices] = useState([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(null) // string
  const [selectedService, setSelectedService] = useState(null)   // full service object
  const [form, setForm] = useState({ link: '', quantity: '', comments: '' })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // ── Fetch ALL services once ───────────────────────────────────────────────
  useEffect(() => {
    servicesAPI.list()
      .then(r => setAllServices(r.data))
      .finally(() => setLoadingServices(false))
  }, [])

  // ── Categories ("Service" picker) ─────────────────────────────────────────
  const categoryOptions = useMemo(() => {
    const map = {}
    allServices.forEach(s => {
      if (!map[s.category]) map[s.category] = []
      map[s.category].push(s)
    })
    return Object.keys(map)
      .sort((a, b) => a.localeCompare(b))
      .map(cat => ({ value: cat, label: cat, meta: { count: map[cat].length } }))
  }, [allServices])

  // ── Packages within the chosen category ───────────────────────────────────
  const packageOptions = useMemo(() => {
    if (!selectedCategory) return []
    return allServices
      .filter(s => s.category === selectedCategory)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(s => ({ value: s.id, label: s.name, meta: s }))
  }, [allServices, selectedCategory])

  // ── Flat quick-search across every service ────────────────────────────────
  const quickSearchOptions = useMemo(() => {
    return allServices.map(s => ({ value: s.id, label: s.name, meta: s }))
  }, [allServices])

  const applyService = (svc) => {
    setSelectedCategory(svc.category)
    setSelectedService(svc)
    setForm(f => ({ ...f, quantity: '' }))
  }

  const charge = selectedService && form.quantity
    ? ((selectedService.rate / 1000) * Number(form.quantity)).toFixed(4)
    : null

  const insufficientBalance = charge && user && Number(charge) > user.balance

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
      setSuccess('Order placed! Redirecting…')
      setTimeout(() => navigate('/orders'), 1500)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to place order'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">New Order</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Pick a platform, choose a package, and place your order
        </p>
      </div>

      {/* Balance pill — mobile only */}
      <div className="flex items-center gap-2 sm:hidden">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
          <span className="text-xs text-emerald-600 font-medium">Balance</span>
          <span className="text-base font-bold text-emerald-700">
            ₹{user?.balance?.toFixed(2) ?? '0.00'}
          </span>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">

        {/* ── Form ────────────────────────────────────────────────────────── */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">

          {/* Alerts */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-5 text-sm">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

            {/* ── Quick search across all services ─────────────────────── */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Search Service
                {loadingServices && (
                  <span className="ml-2 text-xs font-normal text-slate-400">Loading…</span>
                )}
              </label>
              <CustomSelect
                options={quickSearchOptions}
                value={selectedService?.id ?? ''}
                onChange={(val, opt) => applyService(opt.meta)}
                placeholder={loadingServices ? 'Loading services…' : 'Type to search any service…'}
                disabled={loadingServices}
                renderTrigger={(selected, placeholder) =>
                  selected ? (
                    <span className="flex items-center gap-2 min-w-0">
                      <PlatformIcon category={selected.meta.category} size="sm" />
                      <span className="truncate text-slate-800 text-sm">{selected.label}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-slate-400 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {placeholder}
                    </span>
                  )
                }
                renderOption={(opt) => (
                  <span className="flex items-center gap-2 min-w-0">
                    <PlatformIcon category={opt.meta.category} size="sm" />
                    <span className="truncate text-sm text-slate-700">{opt.label}</span>
                    <span className="shrink-0 text-xs font-semibold text-emerald-600 ml-auto">
                      ₹{opt.meta.rate}/1k
                    </span>
                  </span>
                )}
              />
            </div>

            {/* ── Service (platform/category) ──────────────────────────── */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Service</label>
              <CustomSelect
                options={categoryOptions}
                value={selectedCategory ?? ''}
                onChange={(val) => {
                  setSelectedCategory(val)
                  setSelectedService(null)
                  setForm(f => ({ ...f, quantity: '' }))
                }}
                placeholder={loadingServices ? 'Loading…' : 'Choose a platform / category…'}
                disabled={loadingServices}
                renderTrigger={(selected, placeholder) =>
                  selected ? (
                    <span className="flex items-center gap-2 min-w-0">
                      <PlatformIcon category={selected.value} size="sm" />
                      <span className="truncate text-slate-800 text-sm font-medium">{selected.label}</span>
                      <span className="shrink-0 text-[11px] text-slate-400 ml-auto">
                        {selected.meta.count} package{selected.meta.count === 1 ? '' : 's'}
                      </span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-sm">{placeholder}</span>
                  )
                }
                renderOption={(opt, isSelected) => (
                  <span className="flex items-center gap-2 min-w-0">
                    <PlatformIcon category={opt.value} size="sm" />
                    <span className={`truncate text-sm ${isSelected ? 'text-brand-700 font-medium' : 'text-slate-700'}`}>
                      {opt.label}
                    </span>
                    <span className="shrink-0 text-[11px] text-slate-400 ml-auto">
                      {opt.meta.count}
                    </span>
                  </span>
                )}
              />
            </div>

            {/* ── Package (specific service within category) ─────────────── */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Package
                {!selectedCategory && (
                  <span className="text-slate-400 font-normal ml-2 text-xs">Pick a service first</span>
                )}
              </label>
              <CustomSelect
                options={packageOptions}
                value={selectedService?.id ?? ''}
                onChange={(val, opt) => applyService(opt.meta)}
                placeholder={selectedCategory ? 'Choose a package…' : 'Select a service above first'}
                disabled={!selectedCategory}
                renderTrigger={(selected, placeholder) =>
                  selected ? (
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0 text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wide">
                        ID:{selected.meta.external_id}
                      </span>
                      <span className="truncate text-slate-800 text-sm">{selected.label}</span>
                      <span className="shrink-0 text-xs font-semibold text-emerald-600 ml-auto">
                        ₹{selected.meta.rate}/1k
                      </span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-sm">{placeholder}</span>
                  )
                }
                renderOption={(opt, isSelected) => (
                  <span className="flex flex-col gap-1 w-full">
                    <span className="flex items-start justify-between gap-2">
                      <span className={`text-sm leading-snug ${isSelected ? 'text-brand-700 font-medium' : 'text-slate-700'}`}>
                        {opt.label}
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-emerald-600 mt-0.5">
                        ₹{opt.meta.rate}/1k
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5 flex-wrap">
                      {opt.meta.refill && (
                        <span className="text-[10px] font-medium bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">Refill</span>
                      )}
                      {opt.meta.cancel && (
                        <span className="text-[10px] font-medium bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded">Cancel</span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {opt.meta.min_order.toLocaleString()}–{opt.meta.max_order.toLocaleString()}
                      </span>
                    </span>
                  </span>
                )}
              />
            </div>

            {/* ── Price (read-only, auto-filled) ───────────────────────────── */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price</label>
              <div className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm min-h-[44px] flex items-center justify-between">
                <span className={selectedService ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                  {selectedService ? `₹${selectedService.rate} per 1000` : 'Select a package to see price'}
                </span>
                {selectedService && (
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{selectedService.type}</span>
                )}
              </div>
            </div>

            {/* ── Description — rich detail card ───────────────────────────── */}
            {selectedService && (
              <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <PlatformIcon category={selectedService.category} size="sm" />
                  <p className="text-sm font-semibold text-slate-800 leading-snug">{selectedService.name}</p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white text-slate-600 px-2 py-1 rounded-lg border border-slate-200">
                    {selectedService.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white text-slate-600 px-2 py-1 rounded-lg border border-slate-200">
                    {selectedService.country}
                  </span>
                  {selectedService.refill && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-200">
                      ✓ Lifetime Refill
                    </span>
                  )}
                  {selectedService.cancel && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-brand-50 text-brand-700 px-2 py-1 rounded-lg border border-brand-200">
                      ✓ Cancel Supported
                    </span>
                  )}
                </div>

                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex justify-between">
                    <span>Order type</span>
                    <span className="font-semibold text-slate-800">{selectedService.type}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Min order</span>
                    <span className="font-semibold text-slate-800">{selectedService.min_order.toLocaleString()}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Max order</span>
                    <span className="font-semibold text-slate-800">{selectedService.max_order.toLocaleString()}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Start time</span>
                    <span className="font-semibold text-slate-800">Instantly – Normally</span>
                  </li>
                </ul>
              </div>
            )}

            {/* ── Link ──────────────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Link / URL
              </label>
              <input
                type="url"
                required
                value={form.link}
                onChange={e => setForm({ ...form, link: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm min-h-[44px]"
                placeholder="https://instagram.com/yourprofile"
              />
            </div>

            {/* ── Quantity ──────────────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Quantity
                {selectedService && (
                  <span className="text-slate-400 font-normal ml-2 text-xs">
                    ({selectedService.min_order.toLocaleString()} – {selectedService.max_order.toLocaleString()})
                  </span>
                )}
              </label>
              <input
                type="number"
                required
                inputMode="numeric"
                min={selectedService?.min_order || 1}
                max={selectedService?.max_order || 999999}
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm min-h-[44px]"
                placeholder="e.g. 1000"
              />
            </div>

            {/* ── Comments ──────────────────────────────────────────────── */}
            {selectedService?.type === 'Custom Comments' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Comments <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.comments}
                  onChange={e => setForm({ ...form, comments: e.target.value })}
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm resize-none"
                  placeholder="One comment per line"
                />
              </div>
            )}

            {/* ── Insufficient balance warning ───────────────────────────── */}
            {insufficientBalance && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Insufficient balance. You have{' '}
                  <strong>₹{user.balance.toFixed(4)}</strong> but need{' '}
                  <strong>₹{charge}</strong>.
                </span>
              </div>
            )}

            {/* ── Charge preview — mobile only ───────────────────────────── */}
            {charge && (
              <div className="lg:hidden bg-brand-50 border border-brand-200 rounded-xl px-4 py-3">
                <p className="text-xs text-brand-600 font-medium mb-0.5">Total Charge</p>
                <p className="text-xl font-bold text-brand-700">₹{charge}</p>
              </div>
            )}

            {/* ── Submit ────────────────────────────────────────────────── */}
            <button
              type="submit"
              disabled={loading || !selectedService || insufficientBalance}
              className="w-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 min-h-[48px] touch-manipulation"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Placing order…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {charge ? `Place Order — ₹${charge}` : 'Place Order'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Balance & charge panel — desktop only ───────────────────────── */}
        <div className="hidden lg:flex lg:flex-col gap-4 w-72 xl:w-80 shrink-0">

          {/* Balance */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Your Balance</p>
            <p className="text-2xl font-bold text-emerald-600">₹{user?.balance?.toFixed(2) ?? '0.00'}</p>
          </div>

          {/* Charge / placeholder */}
          {selectedService ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Order Summary</p>

              <div className="flex items-center gap-2">
                <PlatformIcon category={selectedService.category} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 leading-snug truncate">{selectedService.name}</p>
                  <p className="text-xs text-slate-400">{selectedService.category}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>Rate</span>
                  <span className="font-semibold text-slate-800">₹{selectedService.rate}/1k</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Quantity</span>
                  <span className="font-semibold text-slate-800">{form.quantity ? Number(form.quantity).toLocaleString() : '—'}</span>
                </div>
              </div>

              {charge && (
                <div className="bg-brand-50 border border-brand-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-brand-600 font-medium mb-0.5">Total Charge</p>
                  <p className="text-xl font-bold text-brand-700">₹{charge}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 text-center">
              <svg className="w-10 h-10 text-slate-200 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <p className="text-sm text-slate-400">Select a service to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
