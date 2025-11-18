import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  QrCode, 
  ClipboardCheck,
  Building2,
  Users,
  Settings
} from 'lucide-react'
import useAuthStore from '../store/authStore'

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: LayoutDashboard, roles: ['all'] },
  { name: '금형 관리', href: '/molds', icon: Package, roles: ['all'] },
  { name: 'QR 스캔', href: '/qr-scan', icon: QrCode, roles: ['all'] },
  { name: '점검 관리', href: '/inspections', icon: ClipboardCheck, roles: ['all'] },
  { name: '공장 관리', href: '/plants', icon: Building2, roles: ['hq_admin', 'hq_manager'] },
  { name: '사용자 관리', href: '/users', icon: Users, roles: ['hq_admin', 'hq_manager'] },
  { name: '설정', href: '/settings', icon: Settings, roles: ['all'] },
]

function Sidebar() {
  const user = useAuthStore((state) => state.user)

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes('all') || item.roles.includes(user?.role)
  )

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600">
          CAMS
        </h1>
        <span className="ml-2 text-sm text-gray-500">금형관리</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-700 font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || '사용자'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role === 'hq_admin' && '본사 관리자'}
              {user?.role === 'hq_manager' && '본사 담당자'}
              {user?.role === 'partner_admin' && '협력사 관리자'}
              {user?.role === 'worker' && '작업자'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
