import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BriefcaseBusiness,
  CalendarCheck2,
  CircleDollarSign,
  Clock3,
  FileBarChart2,
  ListChecks,
  LogOut,
  Menu,
  ShieldCheck,
  Star,
  UserRoundCheck,
  X,
} from 'lucide-react';

const navigation = [
  { to: '/', label: 'Tổng quan', icon: BarChart3, end: true },
  { to: '/employees', label: 'Nhân viên', icon: BriefcaseBusiness },
  { to: '/employee-lifecycle', label: 'Vòng đời', icon: UserRoundCheck },
  { to: '/onboarding-offboarding', label: 'Tiếp nhận / Nghỉ việc', icon: ListChecks },
  { to: '/work-shifts', label: 'Ca làm việc', icon: Clock3 },
  { to: '/overtime-leave', label: 'Nghỉ phép & Tăng ca', icon: CalendarCheck2 },
  { to: '/payroll', label: 'Tiền lương', icon: CircleDollarSign },
  { to: '/kpi-okr', label: 'KPI / OKR', icon: Star },
  { to: '/performance-evaluation', label: 'Đánh giá', icon: UserRoundCheck },
  { to: '/reports', label: 'Báo cáo', icon: FileBarChart2 },
  { to: '/admin', label: 'Quản trị', icon: ShieldCheck },
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
      <button
        type="button"
        onClick={onToggle}
        style={{ background: 'var(--sidebar-bg)' }}
        className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg lg:hidden"
        aria-label="Open navigation"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onToggle}
          aria-label="Close navigation"
        />
      )}

      <aside
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)', width: 'var(--sidebar-width)' }}
        className={[
          'fixed inset-y-0 left-0 z-40 flex flex-col py-5 transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center gap-3 px-4 pb-5" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: 'var(--color-primary)' }}
          >
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>
              HR Payroll
            </p>
            <p className="text-sm font-bold leading-tight text-white">Bảng điều hành</p>
          </div>
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto px-2.5">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={mobileOpen ? onToggle : undefined}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150',
                  isActive ? 'text-white' : 'hover:text-white',
                ].join(' ')
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                border: isActive ? '1px solid var(--sidebar-active-border)' : '1px solid transparent',
              })}
            >
              <Icon className="h-[17px] w-[17px] flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-2.5 pt-4" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150 hover:text-white"
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
