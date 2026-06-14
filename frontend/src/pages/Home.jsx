import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
  { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Instant Delivery', desc: 'Orders start processing within seconds of placement.', color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-800/40' },
  { icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'Lowest Prices', desc: 'Competitive rates — the most affordable SMM services in India.', color: 'text-emerald-400', bg: 'bg-emerald-900/30 border-emerald-800/40' },
  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Safe & Secure', desc: 'Account-safe methods. No password ever required.', color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-800/40' },
  { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', title: 'Refill Guarantee', desc: 'Drop in numbers? Request a free refill on eligible orders.', color: 'text-violet-400', bg: 'bg-violet-900/30 border-violet-800/40' },
  { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', title: 'Easy Payments', desc: 'Pay via UPI, cards, net banking or wallets through Razorpay.', color: 'text-pink-400', bg: 'bg-pink-900/30 border-pink-800/40' },
  { icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', title: '24/7 Support', desc: 'Round-the-clock support for all your orders and queries.', color: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-800/40' },
]

const platforms = ['Instagram', 'YouTube', 'TikTok', 'Twitter', 'Facebook', 'Telegram', 'Snapchat', 'LinkedIn']

const steps = [
  { n: '1', title: 'Create Account', desc: 'Sign up free in under 30 seconds.' },
  { n: '2', title: 'Add Funds',      desc: 'Top up your wallet via UPI or card.' },
  { n: '3', title: 'Place Order',    desc: 'Pick a service and paste your link.' },
  { n: '4', title: 'Watch It Grow',  desc: 'Results start arriving instantly.' },
]

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0">V</div>
            <span className="text-base sm:text-lg font-bold tracking-tight">Viral SMM Panel</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors touch-manipulation min-h-[40px]"
              >
                Dashboard
                <svg className="w-3.5 h-3.5 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors touch-manipulation min-h-[40px] flex items-center">
                  Sign In
                </Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors touch-manipulation min-h-[40px] flex items-center">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-700/50 text-blue-300 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 sm:mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          India's Most Affordable SMM Panel
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4 sm:mb-6 tracking-tight px-2">
          Grow Your Social Media<br />
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Faster Than Ever
          </span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto px-2">
          Real followers, likes, views and engagement for every platform.
          Instant delivery, lowest prices, zero risk.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
          <Link
            to={user ? '/new-order' : '/register'}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-base font-bold transition-colors shadow-lg shadow-blue-900/40 touch-manipulation min-h-[52px]"
          >
            {user ? 'Place an Order' : 'Start Growing Free'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 active:bg-white/15 text-white border border-white/10 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl text-base font-semibold transition-colors touch-manipulation min-h-[52px]"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* ── Platform pills ──────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        <p className="text-center text-slate-500 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-4 sm:mb-5">Supported Platforms</p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {platforms.map(p => (
            <span key={p} className="bg-white/5 border border-white/10 text-slate-300 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl">
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">Why Choose Us?</h2>
        <p className="text-slate-400 text-sm sm:text-base text-center mb-8 sm:mb-10">Everything you need to grow your presence online</p>
        {/* 1 col mobile → 2 col sm → 3 col lg */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {features.map(f => (
            <div key={f.title} className={`${f.bg} border rounded-2xl p-4 sm:p-5`}>
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${f.bg} ${f.color}`}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={f.icon} />
                </svg>
              </div>
              <h3 className={`font-bold text-base sm:text-lg mb-1.5 ${f.color}`}>{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">How It Works</h2>
        <p className="text-slate-400 text-sm sm:text-base text-center mb-8 sm:mb-10">Get started in four simple steps</p>
        {/* 2 cols mobile → 4 cols desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {steps.map(s => (
            <div key={s.n} className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 text-center">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-base sm:text-lg mx-auto mb-3">
                {s.n}
              </div>
              <h3 className="font-bold text-sm sm:text-base mb-1">{s.title}</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl sm:rounded-3xl px-6 sm:px-10 py-8 sm:py-12 text-center shadow-2xl shadow-blue-900/40">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 sm:mb-3">Ready to go viral?</h2>
          <p className="text-blue-200 text-sm sm:text-base mb-6 sm:mb-8">Join thousands of creators already growing with Viral SMM Panel.</p>
          <Link
            to={user ? '/new-order' : '/register'}
            className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 active:bg-blue-100 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold transition-colors shadow-lg touch-manipulation min-h-[48px]"
          >
            {user ? 'Place an Order' : 'Get Started Free'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-4 sm:px-6 py-5 sm:py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-600 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-[10px]">V</div>
            <span>Viral SMM Panel</span>
          </div>
          <p>© {new Date().getFullYear()} Viral SMM Panel. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-slate-400 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-slate-400 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
