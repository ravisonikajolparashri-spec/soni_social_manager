import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'

// Public
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

// User
import Dashboard from './pages/Dashboard'
import NewOrder from './pages/NewOrder'
import Orders from './pages/Orders'
import AddFunds from './pages/AddFunds'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminServices from './pages/admin/AdminServices'
import AdminOrders from './pages/admin/AdminOrders'
import AdminPayments from './pages/admin/AdminPayments'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User (protected) */}
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/new-order" element={<ProtectedRoute><Layout><NewOrder /></Layout></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>} />
      <Route path="/add-funds" element={<ProtectedRoute><Layout><AddFunds /></Layout></ProtectedRoute>} />

      {/* Admin (protected + admin only) */}
      <Route path="/admin" element={<AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><Layout><AdminUsers /></Layout></AdminRoute>} />
      <Route path="/admin/services" element={<AdminRoute><Layout><AdminServices /></Layout></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><Layout><AdminOrders /></Layout></AdminRoute>} />
      <Route path="/admin/payments" element={<AdminRoute><Layout><AdminPayments /></Layout></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
