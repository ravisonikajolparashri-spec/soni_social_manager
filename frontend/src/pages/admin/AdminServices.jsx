import { useEffect, useState, useMemo } from 'react'
import { adminAPI, getErrorMessage } from '../../api'

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [editModal, setEditModal] = useState(null)
  const [editRate, setEditRate] = useState('')
  const [editCountry, setEditCountry] = useState('')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [bulkModal, setBulkModal] = useState(false)
  const [bulkForm, setBulkForm] = useState({ percentage: '', scope: 'all', category: '' })
  const [bulkLoading, setBulkLoading] = useState(false)

  useEffect(() => {
    adminAPI.services().then(r => setServices(r.data)).finally(() => setLoading(false))
  }, [])

  const categories = useMemo(
    () => [...new Set(services.map(s => s.category))].sort((a, b) => a.localeCompare(b)),
    [services]
  )

  const handleSync = async () => {
    setSyncing(true); setMessage({ text: '', type: '' })
    try {
      const r = await adminAPI.syncServices()
      setMessage({ text: `Sync complete: ${r.data.added} added, ${r.data.updated} updated`, type: 'success' })
      adminAPI.services().then(r2 => setServices(r2.data))
    } catch (err) {
      setMessage({ text: getErrorMessage(err, 'Sync failed'), type: 'error' })
    } finally {
      setSyncing(false)
    }
  }

  const handleDetectCountries = async () => {
    setDetecting(true); setMessage({ text: '', type: '' })
    try {
      const r = await adminAPI.detectCountries()
      setMessage({ text: `Scanned ${r.data.scanned} untagged services, tagged ${r.data.updated} by country`, type: 'success' })
      adminAPI.services().then(r2 => setServices(r2.data))
    } catch (err) {
      setMessage({ text: getErrorMessage(err, 'Detection failed'), type: 'error' })
    } finally {
      setDetecting(false)
    }
  }

  const toggleActive = async (svc) => {
    await adminAPI.updateService(svc.id, { is_active: !svc.is_active })
    setServices(prev => prev.map(s => s.id === svc.id ? { ...s, is_active: !s.is_active } : s))
  }

  const openEdit = (svc) => {
    setEditModal(svc); setEditRate(String(svc.rate)); setEditCountry(svc.country || 'Global')
  }

  const handleEditSave = async (e) => {
    e.preventDefault()
    const data = { rate: Number(editRate), country: editCountry }
    await adminAPI.updateService(editModal.id, data)
    setServices(prev => prev.map(s => s.id === editModal.id ? { ...s, ...data } : s))
    setEditModal(null)
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAllFiltered = () => {
    setSelectedIds(prev => {
      const allSelected = filtered.every(s => prev.has(s.id))
      const next = new Set(prev)
      if (allSelected) filtered.forEach(s => next.delete(s.id))
      else filtered.forEach(s => next.add(s.id))
      return next
    })
  }

  const openBulkModal = (scope) => {
    setBulkForm({ percentage: '', scope, category: categories[0] || '' })
    setBulkModal(true)
  }

  const handleBulkSubmit = async (e) => {
    e.preventDefault()
    setBulkLoading(true); setMessage({ text: '', type: '' })
    try {
      const payload = { percentage: Number(bulkForm.percentage), scope: bulkForm.scope }
      if (bulkForm.scope === 'category') payload.category = bulkForm.category
      if (bulkForm.scope === 'selected') payload.service_ids = [...selectedIds]
      const r = await adminAPI.bulkPriceAdjust(payload)
      setMessage({ text: `Updated ${r.data.updated} service${r.data.updated === 1 ? '' : 's'} by ${r.data.percentage > 0 ? '+' : ''}${r.data.percentage}%`, type: 'success' })
      setBulkModal(false)
      setSelectedIds(new Set())
      adminAPI.services().then(r2 => setServices(r2.data))
    } catch (err) {
      setMessage({ text: getErrorMessage(err, 'Bulk update failed'), type: 'error' })
    } finally {
      setBulkLoading(false)
    }
  }

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase()) ||
    (s.country || '').toLowerCase().includes(search.toLowerCase()) ||
    String(s.external_id).includes(search)
  )

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Services</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">{services.length} total services</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleDetectCountries}
            disabled={detecting}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-60 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm touch-manipulation min-h-[44px]"
          >
            <svg className={`w-4 h-4 ${detecting ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {detecting ? 'Tagging…' : 'Auto-Tag Countries'}
          </button>
          <button
            onClick={() => openBulkModal('all')}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm touch-manipulation min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
            Bulk Price Update
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-60 text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm touch-manipulation min-h-[44px]"
          >
            <svg className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {syncing ? 'Syncing…' : 'Sync Services'}
          </button>
        </div>
      </div>

      {/* Alert */}
      {message.text && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
          message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
          <button onClick={() => setMessage({ text: '', type: '' })} className="ml-auto opacity-50 hover:opacity-100 touch-manipulation">✕</button>
        </div>
      )}

      {/* Search + selection bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, category, country or ID…"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
          />
        </div>
        {selectedIds.size > 0 && (
          <button
            onClick={() => openBulkModal('selected')}
            className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm touch-manipulation min-h-[44px] whitespace-nowrap"
          >
            Adjust {selectedIds.size} Selected
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* ── Mobile: Card list ──────────────────────────────────── */}
          <div className="md:hidden space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 py-12 text-center">
                <p className="text-slate-400 text-sm">{search ? 'No services match your search' : 'No services yet — click Sync Services to import'}</p>
              </div>
            ) : filtered.map(s => (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(s.id)}
                      onChange={() => toggleSelect(s.id)}
                      className="mt-1.5 w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">#{s.external_id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          s.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>{s.is_active ? 'Active' : 'Hidden'}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border bg-sky-50 text-sky-700 border-sky-200">{s.country || 'Global'}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 leading-snug">{s.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.category}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-700">₹{s.rate}/1k</p>
                    <p className="text-xs text-slate-400 mt-0.5">Cost: ₹{s.original_rate}/1k</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Range: {s.min_order.toLocaleString()} – {s.max_order.toLocaleString()}</p>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => openEdit(s)} className="flex-1 text-xs bg-brand-100 text-brand-700 px-3 py-2 rounded-lg hover:bg-brand-200 font-medium transition-colors min-h-[36px] touch-manipulation">Edit</button>
                  <button onClick={() => toggleActive(s)} className={`flex-1 text-xs px-3 py-2 rounded-lg font-medium transition-colors min-h-[36px] touch-manipulation ${
                    s.is_active ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}>{s.is_active ? 'Hide' : 'Show'}</button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop: Table ──────────────────────────────────────── */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && filtered.every(s => selectedIds.has(s.id))}
                        onChange={toggleSelectAllFiltered}
                        className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                    </th>
                    {['ID', 'Name', 'Category', 'Country', 'Provider Cost', 'Our Rate', 'Min / Max', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(s => (
                    <tr key={s.id} className={`hover:bg-slate-50/70 transition-colors ${selectedIds.has(s.id) ? 'bg-brand-50/40' : ''}`}>
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(s.id)}
                          onChange={() => toggleSelect(s.id)}
                          className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        />
                      </td>
                      <td className="px-4 py-3.5"><span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">#{s.external_id}</span></td>
                      <td className="px-4 py-3.5 max-w-[200px] lg:max-w-[260px]"><p className="font-medium text-slate-800 truncate">{s.name}</p></td>
                      <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{s.category}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-sky-50 text-sky-700 border-sky-200">{s.country || 'Global'}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">₹{s.original_rate}/1k</td>
                      <td className="px-4 py-3.5 whitespace-nowrap"><span className="font-semibold text-emerald-700">₹{s.rate}/1k</span></td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">{s.min_order.toLocaleString()} – {s.max_order.toLocaleString()}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          s.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>{s.is_active ? 'Active' : 'Hidden'}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1.5">
                          <button onClick={() => openEdit(s)} className="text-xs bg-brand-100 text-brand-700 px-2.5 py-1 rounded-lg hover:bg-brand-200 font-medium transition-colors">Edit</button>
                          <button onClick={() => toggleActive(s)} className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                            s.is_active ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          }`}>{s.is_active ? 'Hide' : 'Show'}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} className="text-center py-12 text-slate-400 text-sm">{search ? 'No services match your search' : 'No services yet — click Sync Services to import'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Edit Service Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-0 sm:px-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-sm shadow-2xl safe-area-bottom">
            <h3 className="font-bold text-lg text-slate-800 mb-1">Edit Service</h3>
            <p className="text-slate-400 text-sm mb-1 truncate">{editModal.name}</p>
            <p className="text-xs text-slate-500 mb-5 bg-slate-50 px-3 py-2 rounded-lg inline-block">
              Provider cost: <strong className="text-slate-600">₹{editModal.original_rate}/1k</strong>
            </p>
            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Selling Rate (per 1000)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  required
                  value={editRate}
                  onChange={e => setEditRate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm min-h-[44px]"
                  placeholder="Selling rate per 1000"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Country</label>
                <input
                  type="text"
                  value={editCountry}
                  onChange={e => setEditCountry(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm min-h-[44px]"
                  placeholder="e.g. India, USA, Global"
                />
                <p className="text-xs text-slate-400 mt-1.5">Visitors from this country see this service sorted to the top.</p>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] touch-manipulation">Save</button>
                <button type="button" onClick={() => setEditModal(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] touch-manipulation">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Price Adjust Modal */}
      {bulkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-0 sm:px-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full sm:max-w-sm shadow-2xl safe-area-bottom">
            <h3 className="font-bold text-lg text-slate-800 mb-1">Bulk Price Update</h3>
            <p className="text-slate-400 text-sm mb-5">
              Increase or decrease the selling rate across many services at once.
            </p>
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Apply to</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'all', label: 'All Services' },
                    { value: 'category', label: 'A Category' },
                    { value: 'selected', label: `Selected (${selectedIds.size})` },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.value === 'selected' && selectedIds.size === 0}
                      onClick={() => setBulkForm(f => ({ ...f, scope: opt.value }))}
                      className={`text-xs font-semibold py-2.5 rounded-xl border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        bulkForm.scope === opt.value
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {bulkForm.scope === 'category' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                  <select
                    value={bulkForm.category}
                    onChange={e => setBulkForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm min-h-[44px] bg-white"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Percentage change <span className="text-slate-400 font-normal">(e.g. 30 for +30%, -10 for -10%)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={bulkForm.percentage}
                  onChange={e => setBulkForm(f => ({ ...f, percentage: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm min-h-[44px]"
                  placeholder="30"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-2.5 rounded-xl">
                This cannot be undone automatically — double check the scope and percentage before saving.
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={bulkLoading}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition-colors min-h-[44px] touch-manipulation"
                >
                  {bulkLoading ? 'Applying…' : 'Apply'}
                </button>
                <button type="button" onClick={() => setBulkModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] touch-manipulation">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
