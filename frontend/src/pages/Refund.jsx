import { Link } from 'react-router-dom'
import LegalLayout, { LegalHeader, LegalCard, LegalSection, LegalCallout } from '../components/LegalLayout'

export default function Refund() {
  return (
    <LegalLayout>
      <LegalHeader title="Refund Policy" meta="Last updated: June 2026" />
      <LegalCard>
        <LegalCallout tone="green">
          ✅ We are committed to fair resolutions. If an order fails to deliver, we always make it right.
        </LegalCallout>

        <LegalSection title="1. Wallet Deposits">
          <p>All wallet top-ups are <strong>non-refundable to your original payment method</strong> once credited. However, any unused wallet balance remains in your account and can be used for future orders with no expiry.</p>
        </LegalSection>

        <LegalSection title="2. Order Refunds — When You Are Eligible">
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full text-xs sm:text-sm border-collapse min-w-[420px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left font-semibold text-slate-600 px-3 py-2 rounded-l-lg">Situation</th>
                  <th className="text-left font-semibold text-slate-600 px-3 py-2 rounded-r-lg">Resolution</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Order never started after 24 hours', 'Full refund to wallet'],
                  ['Order partially delivered and stopped', 'Refund for undelivered portion'],
                  ['Service was unavailable at time of order', 'Full refund to wallet'],
                  ['Duplicate order placed by mistake (not started)', 'Full refund to wallet'],
                ].map(([situation, resolution]) => (
                  <tr key={situation} className="border-t border-slate-100">
                    <td className="px-3 py-2.5 text-slate-700">{situation}</td>
                    <td className="px-3 py-2.5 text-slate-500">{resolution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </LegalSection>

        <LegalSection title="3. When Refunds Are NOT Applicable">
          <LegalCallout tone="red">❌ The following situations are not eligible for refunds:</LegalCallout>
          <ul className="mt-2">
            <li>Order has already started or is "In Progress" / "Completed"</li>
            <li>Wrong link was submitted by the user</li>
            <li>Account was private at the time of order</li>
            <li>Account was deleted or changed username after ordering</li>
            <li>Drop in followers/likes after delivery (natural social media fluctuation)</li>
            <li>Violation of social media platform terms causing removal</li>
            <li>Change of mind after order is placed</li>
          </ul>
        </LegalSection>

        <LegalSection title="4. Refill Policy">
          <p>Services marked with <strong>✓ Refill</strong> are eligible for a free refill if the count drops within the refill guarantee period. To request a refill, go to <strong>My Orders</strong> and click the <strong>Refill</strong> button on the eligible order.</p>
        </LegalSection>

        <LegalSection title="5. How to Request a Refund">
          <p><Link to="/contact">Contact us</Link> on Instagram or WhatsApp with:</p>
          <ul>
            <li>Your registered email address</li>
            <li>Order ID</li>
            <li>Description of the issue</li>
          </ul>
          <p>We typically respond within <strong>24–48 hours</strong>. Approved refunds are credited to your wallet immediately.</p>
        </LegalSection>

        <LegalSection title="6. Disputes">
          <p>If you believe a refund was incorrectly denied, you may escalate by messaging us again on Instagram or WhatsApp. All decisions are final after 7 days of the order date.</p>
        </LegalSection>
      </LegalCard>
    </LegalLayout>
  )
}
