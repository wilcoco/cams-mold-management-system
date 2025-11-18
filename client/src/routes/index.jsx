import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'
import ProtectedRoute from '../components/ProtectedRoute'

// Pages
import LoginPage from '../pages/auth/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import MoldsPage from '../pages/molds/MoldsPage'
import MoldDetailPage from '../pages/molds/MoldDetailPage'
import QRScanPage from '../pages/qr/QRScanPage'
import InspectionsPage from '../pages/inspections/InspectionsPage'
import NotFoundPage from '../pages/NotFoundPage'

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* 금형 관리 */}
        <Route path="/molds" element={<MoldsPage />} />
        <Route path="/molds/:id" element={<MoldDetailPage />} />
        
        {/* QR 스캔 */}
        <Route path="/qr-scan" element={<QRScanPage />} />
        
        {/* 점검 관리 */}
        <Route path="/inspections" element={<InspectionsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
