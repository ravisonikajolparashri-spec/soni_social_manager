import { Link } from 'react-router-dom'
import LegalLayout, { LegalHeader, LegalCard, LegalSection } from '../components/LegalLayout'

export default function Privacy() {
  return (
    <LegalLayout>
      <LegalHeader title="Privacy Policy" meta="Last updated: June 2026 · Effective immediately" />
      <LegalCard>
        <LegalSection title="1. Who We Are">
          <p>Viral SMM Panel ("we", "us", "our") operates the website <a href="https://viral-smm.vercel.app">https://viral-smm.vercel.app</a> — a social media marketing services platform. For any privacy enquiries <Link to="/contact">contact us</Link> via Instagram or WhatsApp.</p>
        </LegalSection>

        <LegalSection title="2. Information We Collect">
          <ul>
            <li><strong>Account data:</strong> email address, username, and hashed password when you register.</li>
            <li><strong>Transaction data:</strong> wallet top-up amounts, order history, and the UPI transaction/UTR ID and optional payment screenshot you submit for manual deposit review.</li>
            <li><strong>Usage data:</strong> IP address and request timestamps for security and rate-limiting purposes.</li>
          </ul>
          <p>We do <strong>not</strong> collect card numbers, CVV, UPI PINs, or any sensitive payment credentials. Deposits are made by scanning our UPI QR code directly with your own banking/UPI app — we never process or touch your payment instrument.</p>
        </LegalSection>

        <LegalSection title="3. How We Use Your Information">
          <ul>
            <li>To create and manage your account</li>
            <li>To process payments and credit your wallet</li>
            <li>To deliver the SMM services you order</li>
            <li>To detect and prevent fraud or abuse</li>
            <li>To send transactional emails (order updates, payment receipts)</li>
          </ul>
          <p>We never sell, rent, or share your personal data with advertisers or unrelated third parties.</p>
        </LegalSection>

        <LegalSection title="4. Payment Processing">
          <p>Deposits are made by scanning a UPI QR code with your own banking or UPI app and paying directly to our account. You then submit the transaction/UTR ID (and optionally a screenshot) for our team to verify before crediting your wallet. We never receive or store your card, bank, or UPI PIN details — only the transaction reference you provide.</p>
        </LegalSection>

        <LegalSection title="5. Cookies & Local Storage">
          <p>We store a single JWT authentication token in your browser's local storage to keep you logged in. We do <strong>not</strong> use advertising cookies, tracking pixels, or analytics SDKs.</p>
        </LegalSection>

        <LegalSection title="6. Data Retention">
          <p>Your account data is retained while your account is active. Order and transaction records are kept for 3 years for accounting purposes. You may request full deletion at any time by <Link to="/contact">contacting us</Link>.</p>
        </LegalSection>

        <LegalSection title="7. Your Rights">
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your account and data</li>
          </ul>
          <p>To exercise any of these rights, <Link to="/contact">contact us</Link> via Instagram or WhatsApp.</p>
        </LegalSection>

        <LegalSection title="8. Security">
          <p>We protect your data using HTTPS (TLS 1.2+), bcrypt password hashing, JWT authentication, and server-side payment verification. We apply strict HTTP security headers (HSTS, CSP, X-Frame-Options) on all pages.</p>
        </LegalSection>

        <LegalSection title="9. Changes to This Policy">
          <p>We may update this policy occasionally. The "Last updated" date at the top will reflect any changes. Continued use of the platform constitutes acceptance of the updated policy.</p>
        </LegalSection>
      </LegalCard>
    </LegalLayout>
  )
}
