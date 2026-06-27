import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from './Layout'

const footerLinks = [
  { to: '/', label: 'Home' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
  { to: '/refund', label: 'Refund Policy' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact Us' },
]

/* ── Shell shown to logged-out visitors ───────────────────────────────────
   Mirrors the Home page's nav styling so the legal pages feel like part of
   the same site instead of a disconnected static page. */
function PublicShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2 px-4 sm:px-6 py-3.5 sm:py-4">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <img src="/logo-icon.png" alt="SocialHypeCrowd" className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0" />
            <span className="text-sm sm:text-base font-bold text-slate-800 truncate">SocialHypeCrowd</span>
          </Link>
          <Link to="/" className="text-xs sm:text-sm font-medium text-brand-600 hover:text-brand-700 shrink-0 whitespace-nowrap">
            ← Back to home
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 lg:py-12">
        {children}
      </main>

      <footer className="border-t border-slate-200 px-4 sm:px-6 py-5 sm:py-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 order-2 sm:order-1">© {new Date().getFullYear()} SocialHypeCrowd. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 order-1 sm:order-2">
            {footerLinks.map(l => (
              <Link key={l.to} to={l.to} className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

/**
 * LegalLayout — used by Terms / Privacy / Refund / Contact / FAQ pages.
 * Logged-in users see the page inside the normal app Layout (sidebar +
 * mobile topbar), so support is always one click away from the dashboard.
 * Logged-out visitors see a lightweight public shell with the same branding
 * as the landing page. Either way it's a real in-app route, not a bare
 * static HTML file with no navigation.
 */
export default function LegalLayout({ children }) {
  const { user } = useAuth()

  if (user) {
    return <Layout>{children}</Layout>
  }
  return <PublicShell>{children}</PublicShell>
}

/* ── Shared content primitives — keep prose consistent across pages ────── */
export function LegalHeader({ title, meta }) {
  return (
    <div className="mb-5 sm:mb-6">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
      {meta && <p className="text-slate-500 text-xs sm:text-sm mt-1.5">{meta}</p>}
    </div>
  )
}

export function LegalCard({ children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
      {children}
    </div>
  )
}

export function LegalSection({ title, children }) {
  return (
    <section>
      {title && <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-2">{title}</h2>}
      <div className="text-sm sm:text-[15px] text-slate-600 leading-relaxed space-y-2.5
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5
        [&_a]:text-brand-600 [&_a]:font-medium [&_a:hover]:underline">
        {children}
      </div>
    </section>
  )
}

export function LegalCallout({ tone = 'amber', children }) {
  const tones = {
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    red:   'bg-red-50 border-red-200 text-red-800',
    blue:  'bg-brand-50 border-brand-200 text-brand-800',
  }
  return (
    <div className={`border rounded-xl px-4 py-3 text-sm font-medium ${tones[tone]}`}>
      {children}
    </div>
  )
}
