import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LegalLayout, { LegalHeader, LegalCard } from '../components/LegalLayout'

/* Single source of truth for both contact channels — reused by the cards
   grid below and the bottom CTA buttons. */
const INSTAGRAM_URL = 'https://www.instagram.com/viralsmmpanel_?igsh=MWhhNHF0eGpmOTd6cg=='
const WHATSAPP_URL = 'https://wa.me/919410275555'

/* wa.me and instagram.com profile links are universal links — on a phone
   with the app installed, the OS opens the native app directly; otherwise
   they fall back to the mobile/desktop website. No extra JS needed. */

function InstagramIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" />
    </svg>
  )
}

function WhatsAppIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.87.5 3.62 1.45 5.13L2 22l5.13-1.55a9.83 9.83 0 004.9 1.31h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.39 17.5 2 12.04 2zm5.78 14.01c-.25.7-1.45 1.34-2 1.43-.51.08-1.15.11-1.86-.12-.43-.13-.98-.31-1.69-.6-2.98-1.29-4.93-4.3-5.08-4.5-.15-.2-1.22-1.62-1.22-3.09 0-1.47.77-2.19 1.05-2.49.27-.3.6-.37.8-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.08.92 2.23.07.15.12.33.02.53-.1.2-.15.32-.3.49-.15.17-.32.38-.45.51-.15.15-.31.31-.13.61.18.3.8 1.32 1.72 2.14 1.18 1.05 2.18 1.38 2.49 1.53.31.15.49.13.67-.07.18-.2.78-.91.99-1.22.2-.31.41-.26.69-.16.28.1 1.77.83 2.07.98.3.15.5.23.57.36.07.13.07.74-.18 1.44z"/>
    </svg>
  )
}

const contactCards = [
  {
    title: 'Instagram',
    desc: 'DM us for quick replies and the latest updates.',
    Icon: InstagramIcon,
    iconBg: 'bg-gradient-to-br from-fuchsia-500 via-pink-500 to-amber-400 text-white',
    href: INSTAGRAM_URL,
    label: '@viralsmmpanel_',
  },
  {
    title: 'WhatsApp',
    desc: 'Chat with us directly — available 24/7.',
    Icon: WhatsAppIcon,
    iconBg: 'bg-emerald-100 text-emerald-600',
    href: WHATSAPP_URL,
    label: '+91 94102 75555',
  },
]

export default function Contact() {
  const { user } = useAuth()

  return (
    <LegalLayout>
      <LegalHeader
        title="Contact Us"
        meta="Have a question about an order, payment, or your account? Reach out — we typically respond within 24 hours."
      />

      <LegalCard>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 sm:mb-4">Get in Touch</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {contactCards.map(c => (
              <a
                key={c.title}
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-blue-300 hover:bg-blue-50/40 transition-colors touch-manipulation"
              >
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 ${c.iconBg}`}>
                  <c.Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{c.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-2">{c.desc}</p>
                <span className="text-sm font-semibold text-blue-600 break-all">{c.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Before You Reach Out</p>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-sm text-slate-600 leading-relaxed">
            If your question is about an order, payment, refund, or account, please include your{' '}
            <strong className="text-slate-800">Order ID</strong> or <strong className="text-slate-800">registered email</strong>{' '}
            — this helps us resolve things faster. Many common questions are already answered in our{' '}
            <Link to="/faq" className="text-blue-600 font-medium hover:underline">FAQ</Link>.
            {user && (
              <>
                {' '}You're signed in as <strong className="text-slate-800">{user.username}</strong> ({user.email}) — feel free to mention this when you write in.
              </>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl px-5 sm:px-8 py-6 sm:py-8 text-center text-white">
          <h2 className="text-lg sm:text-xl font-bold mb-1.5">Still need help?</h2>
          <p className="text-blue-200 text-sm mb-5">Our support team is here for you 24/7.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors min-h-[44px] w-full sm:w-auto"
            >
              <WhatsAppIcon className="w-4 h-4" />
              Message on WhatsApp
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white hover:bg-white/20 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors min-h-[44px] w-full sm:w-auto"
            >
              <InstagramIcon className="w-4 h-4" />
              Follow on Instagram
            </a>
          </div>
        </div>
      </LegalCard>
    </LegalLayout>
  )
}
