import { NavLink, useNavigate } from 'react-router-dom';
import {
  BellRing,
  BarChart3,
  BriefcaseBusiness,
  CalendarCheck2,
  CircleDollarSign,
  FileBarChart2,
  RefreshCcw,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

const navigation = [
  { to: '/', label: 'Bảng điều khiển', icon: BarChart3, end: true },
  { to: '/employees', label: 'Nhân viên', icon: BriefcaseBusiness },
  { to: '/payroll', label: 'Lương', icon: CircleDollarSign },
  { to: '/attendance', label: 'Chấm công', icon: CalendarCheck2 },
  { to: '/reports', label: 'Báo cáo', icon: FileBarChart2 },
  { to: '/alerts', label: 'Cảnh báo', icon: BellRing },
  { to: '/sync', label: 'Đồng bộ', icon: RefreshCcw },
];

export default function Sidebar({ mobileOpen, onToggle }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('hr_token');
    localStorage.removeItem('hr_user');
    navigate('/login');
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={onToggle}
        style={{ background: 'var(--sidebar-bg)' }}
        className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg lg:hidden"
        aria-label="Mở menu điều hướng"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onToggle}
          aria-label="Đóng menu điều hướng"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)', width: 'var(--sidebar-width)' }}
        className={[
          'fixed inset-y-0 left-0 z-40 flex flex-col py-6 transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 pb-6" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: 'var(--color-primary)' }}
          >
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>
              Hệ thống
            </p>
            <p className="text-sm font-bold text-white leading-tight">Dự án tích hợp</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={mobileOpen ? onToggle : undefined}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'text-white'
                    : 'hover:text-white',
                ].join(' ')
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                border: isActive ? '1px solid var(--sidebar-active-border)' : '1px solid transparent',
              })}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pt-4" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:text-white"
            style={{ color: 'var(--sidebar-text)', background: 'transparent' }}
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
