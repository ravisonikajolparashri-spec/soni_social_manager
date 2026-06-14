import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <h1 className="text-2xl font-bold text-blue-400">⚡ SMM Panel</h1>
        <div className="flex gap-4">
          {user ? (
            <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white px-4 py-2 text-sm transition-colors">Sign In</Link>
              <Link to="/register" className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-8 py-24 text-center">
        <span className="inline-block bg-blue-900/50 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-6 border border-blue-700">
          #1 SMM Reseller Panel
        </span>
        <h2 className="text-5xl font-extrabold leading-tight mb-6">
          Grow Your Social Media<br />
          <span className="text-blue-400">Fast & Affordable</span>
        </h2>
        <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
          Buy followers, likes, views and more for Instagram, TikTok, YouTube, Twitter and Facebook.
          Instant delivery, 24/7 support.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/register" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl text-base font-semibold transition-colors">
            Start Now — It's Free
          </Link>
          <Link to="/login" className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-xl text-base font-semibold transition-colors border border-white/20">
            Sign In
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-8 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: '⚡', title: 'Instant Delivery', desc: 'Orders start within seconds of placement.' },
          { icon: '💰', title: 'Lowest Prices', desc: 'Competitive rates with volume discounts.' },
          { icon: '🔒', title: 'Safe & Secure', desc: 'Real-looking engagement, account-safe.' },
        ].map(f => (
          <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
