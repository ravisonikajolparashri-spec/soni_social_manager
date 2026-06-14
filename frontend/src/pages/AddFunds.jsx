import { useAuth } from '../context/AuthContext'

export default function AddFunds() {
  const { user } = useAuth()

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold mb-6">Add Funds</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-500">Current Balance</p>
          <p className="text-3xl font-bold text-blue-600">${user?.balance?.toFixed(2) ?? '0.00'}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 text-sm text-amber-800">
          <p className="font-semibold text-base mb-2">💳 Payment Gateway Coming Soon</p>
          <p className="mb-3">
            Automated top-ups via Stripe, PayPal, or crypto are not yet configured.
            To add funds to your account right now, please contact support.
          </p>
          <p className="text-xs text-amber-700">
            If you're the admin, use <strong>Admin → Users → Add Funds</strong> to credit any account directly.
          </p>
        </div>

        <a
          href="mailto:support@yourdomain.com?subject=Add Funds Request"
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          Contact Support to Add Funds
        </a>
      </div>
    </div>
  )
}
