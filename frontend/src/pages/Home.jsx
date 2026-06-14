import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    ),
    title: 'Instant Delivery',
    desc: 'Orders start processing within seconds of placement — no waiting around.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/30 border-yellow-800/40',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    title: 'Lowest Prices',
    desc: 'Competitive rates powered by BluesSMM Panel — India\'s cheapest SMM provider.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/30 border-emerald-800/40',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
    ),
    title: 'Safe & Secure',
    desc: 'Real-looking engagement using account-safe methods. No password required.',
    color: 'text-blue-400',
    bg: 'bg-blue-900/30 border-blue-800/40',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
    ),
    title: 'Refill Guarantee',
    desc: 'Drop in numbers? Request a free refill on eligible orders anytime.',
    color: 'text-violet-400',
    bg: 'bg-violet-900/30 border-violet-800/40',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
    ),
    title: 'Easy Payments',
    desc: 'Pay via UPI, cards, net banking or wallets through secure Razorpay checkout.',
    color: 'text-pink-400',
    bg: 'bg-pink-900/30 border-pink-800/40',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    ),
    title: '24/7 Support',
    desc: 'Round-the-clock support for all your orders and account queries.',
    color: 'text-orange-400',
    bg: 'bg-orange-900/30 border-orange-800/40',
  },
]

const platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Facebook', 'Telegram', 'Snapchat', 'LinkedIn']

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5 sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">S</div>
          <span className="text-lg font-bold tracking-tight">SMM Panel</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white px-4 py-2 text-sm font-medium transition-colors">
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-900/50"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-700/50 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Powered by BluesSMM Panel — India's #1 SMM Provider
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
          Grow Your Social Media<br />
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Fast & Affordable
          </span>
        </h1>
        <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Buy followers, likes, views and more for all major platforms.
          Instant delivery, real engagement, guaranteed results.
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3.5 rounded-xl text-base font-bold transition-colors shadow-lg shadow-blue-900/50"
          >
            Start Now — It's Free
          </Link>
          <Link
            to="/login"
            className="bg-white/8 hover:bg-white/15 px-8 py-3.5 rounded-xl text-base font-semibold transition-colors border border-white/10"
          >
            Sign In
          </Link>
        </div>

        {/* Platform pills */}
        <div className="mt-12 flex flex-wrap justify-center gap-2">
          {platforms.map(p => (
            <span key={p} className="bg-white/5 border border-white/10 text-slate-300 text-xs font-medium px-3 py-1.5 rounded-full">
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-white/5 bg-white/3 py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Orders Completed', value: '1M+' },
            { label: 'Active Users', value: '50K+' },
            { label: 'Services Available', value: '5000+' },
            { label: 'Uptime', value: '99.9%' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-white">{s.value}</p>
              <p className="text-slate-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-3">Why Choose Us?</h2>
        <p className="text-slate-400 text-center mb-12">Everything you need to grow your social presence</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <div key={f.title} className={`${f.bg} border rounded-2xl p-6`}>
              <div className={`${f.color} mb-4`}>{f.icon}</div>
              <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-24 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-10 shadow-2xl shadow-blue-900/50">
          <h2 className="text-3xl font-extrabold mb-3">Ready to grow?</h2>
          <p className="text-blue-200 mb-6">Join thousands of creators and businesses boosting their social presence.</p>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-sm"
          >
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-6 text-center text-slate-600 text-xs">
        © {new Date().getFullYear()} SMM Panel · Powered by BluesSMM Panel
      </footer>
    </div>
  )
}
