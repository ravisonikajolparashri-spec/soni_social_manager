import { Link } from 'react-router-dom'
import LegalLayout, { LegalHeader } from '../components/LegalLayout'

const faqGroups = [
  {
    section: 'General',
    items: [
      { q: 'What is SocialHypeCrowd?', a: "SocialHypeCrowd is India's most affordable social media marketing (SMM) reseller panel. We provide followers, likes, views, comments and engagement services for Instagram, YouTube, TikTok, Twitter, Facebook, Telegram and more — at the lowest prices in the market." },
      { q: 'Is it safe to use SocialHypeCrowd?', a: 'Yes. All services use account-safe methods — we never ask for your social media passwords. Your account credentials are never required at any point. We only need the public link to your profile, post, or video.' },
      { q: 'Is this legal?', a: 'Buying social media engagement is not illegal. However, it may be against the Terms of Service of individual platforms (Instagram, YouTube, etc.). We recommend using our services responsibly and in moderation. We are not responsible for any action taken by social media platforms on your accounts.' },
      { q: 'Which platforms do you support?', list: [
        'Instagram — followers, likes, views, story views, comments',
        'YouTube — views, likes, subscribers, watch hours',
        'TikTok — followers, likes, views',
        'Twitter/X — followers, likes, retweets',
        'Facebook — page likes, followers, post likes',
        'Telegram — channel members, post views',
        'And many more — browse the full list after signing in',
      ] },
    ],
  },
  {
    section: 'Orders & Delivery',
    items: [
      { q: 'How fast will my order be delivered?', a: 'Most orders start within a few minutes of being placed. Delivery speed depends on the specific service — some deliver instantly, others gradually over hours or days to appear more natural. The estimated delivery time is shown on each service description.' },
      { q: 'My order is stuck on "Pending". What should I do?', a: <>Orders usually start within 0–30 minutes. If your order is still Pending after 1 hour, please <Link to="/contact" className="text-brand-600 font-medium hover:underline">contact us</Link> with your Order ID and we'll investigate immediately.</> },
      { q: 'Can I cancel an order after placing it?', a: 'Orders that are still in Pending status may be cancellable — use the Cancel button on the Orders page. Once an order moves to In Progress or Processing, it cannot be cancelled as it has already been submitted to the provider.' },
      { q: "What happens if my order doesn't complete fully?", a: <>If your order shows as <strong>Partial</strong>, it means only part of the quantity was delivered. You can request a free refill using the Refill button on the Orders page. If a refill isn't available, we will refund the undelivered portion to your wallet. See our <Link to="/refund" className="text-brand-600 font-medium hover:underline">Refund Policy</Link> for details.</> },
      { q: 'My followers/likes dropped after delivery. Why?', a: 'Social media platforms occasionally run purges of inactive or bot accounts, which can cause a small drop after delivery. Services marked with ✓ Refill cover this — you can request a refill at no extra charge. We recommend choosing refill-eligible services for better long-term results.' },
      { q: 'Do I need to make my account public?', a: 'Yes. Your account or post must be public at the time of ordering and throughout the delivery period. Orders placed for private accounts cannot be delivered and are non-refundable.' },
    ],
  },
  {
    section: 'Payments & Wallet',
    items: [
      { q: 'How do I add funds to my wallet?', a: 'Go to Add Funds in your dashboard, scan the UPI QR code shown there with any UPI app, and complete the payment. Then submit the transaction/UTR ID (and optionally a screenshot) — our team reviews and credits your wallet shortly after.' },
      { q: 'What payment methods are accepted?', list: ['UPI (GPay, PhonePe, Paytm, BHIM, etc.) via QR code scan'] },
      { q: 'Is my payment information secure?', a: 'Yes. Payments go directly from your UPI app to our account — we never see or store your card number, CVV, or UPI PIN. We only collect the transaction/UTR ID you submit for verification. Our site also uses HTTPS encryption and strict security headers on all pages.' },
      { q: 'Can I get a refund on my wallet deposit?', a: <>Wallet deposits cannot be refunded to your original payment method. However, your wallet balance never expires and can be used for any order at any time. If an order fails to deliver, the charge is refunded back to your wallet. See our full <Link to="/refund" className="text-brand-600 font-medium hover:underline">Refund Policy</Link>.</> },
      { q: 'What is the minimum deposit amount?', a: 'The minimum deposit is ₹1, and single transactions are capped at ₹5,00,000.' },
      { q: 'How long does deposit approval take?', a: 'Most deposits are reviewed and credited to your wallet within a few hours. Make sure the transaction/UTR ID you submit exactly matches your payment confirmation to avoid delays.' },
    ],
  },
  {
    section: 'Account',
    items: [
      { q: 'Is registration free?', a: 'Yes, creating an account is completely free. You only pay when you add funds to your wallet and place orders.' },
      { q: 'I forgot my password. How do I reset it?', a: <>Password reset is currently handled manually. <Link to="/contact" className="text-brand-600 font-medium hover:underline">Contact us</Link> from your registered email address and we'll reset it for you within a few hours.</> },
      { q: 'How do I contact support?', a: <><Link to="/contact" className="text-brand-600 font-medium hover:underline">Reach out here</Link>. We typically respond within 24 hours. Please include your Order ID or registered email in your message for faster resolution.</> },
    ],
  },
]

function FaqItem({ q, a, list }) {
  return (
    <details className="group bg-slate-50 border border-slate-200 rounded-xl overflow-hidden open:shadow-sm open:bg-white">
      <summary className="px-4 sm:px-5 py-3.5 sm:py-4 text-sm font-semibold text-slate-800 cursor-pointer list-none flex items-center justify-between gap-3 select-none">
        <span>{q}</span>
        <span className="text-slate-400 text-lg shrink-0 transition-transform duration-200 group-open:rotate-45">＋</span>
      </summary>
      <div className="px-4 sm:px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
        {a}
        {list && (
          <ul className="list-disc pl-5 space-y-1.5 mt-2">
            {list.map(li => <li key={li}>{li}</li>)}
          </ul>
        )}
      </div>
    </details>
  )
}

export default function Faq() {
  return (
    <LegalLayout>
      <LegalHeader title="Frequently Asked Questions" meta="Everything you need to know about SocialHypeCrowd." />

      <div className="space-y-6 sm:space-y-8">
        {faqGroups.map(g => (
          <div key={g.section}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 sm:mb-3">{g.section}</p>
            <div className="space-y-2">
              {g.items.map(item => <FaqItem key={item.q} {...item} />)}
            </div>
          </div>
        ))}

        <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl px-5 sm:px-8 py-6 sm:py-8 text-center text-white">
          <h2 className="text-lg sm:text-xl font-bold mb-1.5">Still have questions?</h2>
          <p className="text-brand-200 text-sm mb-5">Our support team is here to help you 24/7.</p>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center bg-white text-brand-700 hover:bg-brand-50 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors min-h-[44px]"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </LegalLayout>
  )
}
