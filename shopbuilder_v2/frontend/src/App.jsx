import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import AdminDashboard from './pages/AdminDashboard'
import AdminTenants from './pages/AdminTenants'
import AdminUsers from './pages/AdminUsers'
import MerchantStores from './pages/MerchantStores'
import MerchantProducts from './pages/MerchantProducts'
import MerchantOrders from './pages/MerchantOrders'
import Shop from './pages/Shop'
import CustomerOrders from './pages/CustomerOrders'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="spinner" />
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />
  return children
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/tenants" element={
          <ProtectedRoute roles={['ADMIN']}><AdminTenants /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['ADMIN']}><AdminUsers /></ProtectedRoute>
        } />

        <Route path="/merchant/stores" element={
          <ProtectedRoute roles={['MERCHANT']}><MerchantStores /></ProtectedRoute>
        } />
        <Route path="/merchant/products" element={
          <ProtectedRoute roles={['MERCHANT']}><MerchantProducts /></ProtectedRoute>
        } />
        <Route path="/merchant/orders" element={
          <ProtectedRoute roles={['MERCHANT']}><MerchantOrders /></ProtectedRoute>
        } />

        <Route path="/shop" element={
          <ProtectedRoute roles={['CUSTOMER']}><Shop /></ProtectedRoute>
        } />
        <Route path="/customer/orders" element={
          <ProtectedRoute roles={['CUSTOMER']}><CustomerOrders /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
