import { Link } from 'react-router-dom'
import LegalLayout, { LegalHeader, LegalCard, LegalSection, LegalCallout } from '../components/LegalLayout'

export default function Terms() {
  return (
    <LegalLayout>
      <LegalHeader title="Terms of Service" meta="Last updated: June 2026 · Please read these terms carefully before using our platform." />
      <LegalCard>
        <LegalCallout tone="amber">
          ⚠️ By registering or using Viral SMM Panel, you agree to be bound by these Terms of Service.
        </LegalCallout>

        <LegalSection title="1. Acceptance of Terms">
          <p>These Terms of Service ("Terms") govern your use of Viral SMM Panel ("Platform", "Service"). By accessing or using the Platform, you confirm you are at least 18 years old and agree to these Terms.</p>
        </LegalSection>

        <LegalSection title="2. Service Description">
          <p>Viral SMM Panel is a social media marketing reseller panel that provides followers, likes, views, and engagement services for various social media platforms. All services are delivered through third-party providers.</p>
        </LegalSection>

        <LegalSection title="3. Account Responsibilities">
          <ul>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>You must provide accurate information during registration.</li>
            <li>One account per person. Multiple accounts may be suspended.</li>
            <li>You must not share your account with others.</li>
          </ul>
        </LegalSection>

        <LegalSection title="4. Acceptable Use">
          <p>You agree NOT to:</p>
          <ul>
            <li>Use the Platform for illegal purposes or to violate any applicable laws</li>
            <li>Attempt to hack, reverse-engineer, or disrupt the Platform</li>
            <li>Use bots or automated tools to interact with the Platform beyond intended use</li>
            <li>Resell services in a way that violates third-party platform Terms of Service</li>
            <li>Submit links to content that is illegal, harmful, or violates third-party rights</li>
          </ul>
        </LegalSection>

        <LegalSection title="5. Orders & Delivery">
          <ul>
            <li>Orders are non-cancellable once submitted to the provider and processing has begun.</li>
            <li>Delivery speed varies by service — estimated times are not guaranteed.</li>
            <li>We are not responsible for delays caused by the third-party provider or social media platforms.</li>
            <li>Orders for private or restricted accounts cannot be fulfilled and are non-refundable.</li>
          </ul>
        </LegalSection>

        <LegalSection title="6. Wallet & Payments">
          <ul>
            <li>Wallet funds are non-transferable and non-withdrawable.</li>
            <li>All deposits are final. Funds can only be used for orders on this Platform.</li>
            <li>Prices are in Indian Rupees (₹) and include applicable taxes.</li>
          </ul>
        </LegalSection>

        <LegalSection title="7. Refunds">
          <p>Please refer to our <Link to="/refund">Refund Policy</Link> for full details.</p>
        </LegalSection>

        <LegalSection title="8. Limitation of Liability">
          <p>Viral SMM Panel shall not be liable for any indirect, incidental, or consequential damages including loss of followers, account suspension by social media platforms, or business losses. Our total liability shall not exceed the amount you paid for the specific order in question.</p>
        </LegalSection>

        <LegalSection title="9. Termination">
          <p>We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or abuse the Platform, without prior notice or refund.</p>
        </LegalSection>

        <LegalSection title="10. Changes to Terms">
          <p>We may modify these Terms at any time. Continued use after changes constitutes acceptance. We will update the "Last updated" date at the top.</p>
        </LegalSection>

        <LegalSection title="11. Governing Law">
          <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.</p>
        </LegalSection>

        <LegalSection title="12. Contact">
          <p>For any queries regarding these Terms, <Link to="/contact">contact us</Link> via Instagram or WhatsApp.</p>
        </LegalSection>
      </LegalCard>
    </LegalLayout>
  )
}
