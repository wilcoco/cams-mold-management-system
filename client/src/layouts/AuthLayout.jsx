import { Outlet, Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

function AuthLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // 이미 로그인된 경우 대시보드로 리다이렉트
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
