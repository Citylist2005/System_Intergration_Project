import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Settings, Search, ChevronDown, LogOut } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';

const pageTitleMap = {
  '/': 'Bảng điều khiển',
  '/employees': 'Quản lý nhân viên',
  '/attendance': 'Chấm công',
  '/payroll': 'Quản lý lương',
  '/reports': 'Báo cáo và phân tích',
  '/alerts': 'Cảnh báo và thông báo',
  '/sync': 'Đồng bộ dữ liệu',
};

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('hr_user') || '{}'); } catch { return {}; }
  })();
  const displayName = storedUser?.username || storedUser?.name || 'Quản trị viên';
  const academicTitleMap = {
    '/': 'Tổng quan',
    '/employees': 'Nhân viên',
    '/payroll': 'Tiền lương',
    '/reports': 'Báo cáo',
    '/employee-lifecycle': 'Vòng đời nhân viên',
    '/onboarding-offboarding': 'Tiếp nhận / Nghỉ việc',
    '/work-shifts': 'Ca làm việc',
    '/overtime-leave': 'Nghỉ phép & Tăng ca',
    '/kpi-okr': 'KPI / OKR',
    '/performance-evaluation': 'Đánh giá hiệu suất',
    '/admin': 'Trung tâm quản trị',
  };

  function handleLogout() {
    localStorage.removeItem('hr_token');
    localStorage.removeItem('hr_user');
    navigate('/login');
  }

  const pageTitle = academicTitleMap[location.pathname] || pageTitleMap[location.pathname] || 'Bảng điều hành nhân sự và tiền lương';

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Sidebar mobileOpen={mobileOpen} onToggle={() => setMobileOpen((o) => !o)} />

      {/* Main content offset */}
      <div style={{ paddingLeft: 'var(--sidebar-width)' }} className="lg:block hidden-mobile-offset">
        {/* Top Header */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between gap-4 px-6 py-3"
          style={{
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          {/* Left: Search */}
          <div className="flex items-center gap-3 flex-1 max-w-sm">
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm flex-1"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
            >
              <Search className="h-4 w-4 flex-shrink-0" />
              <input
                type="text"
                placeholder="Tìm nhân viên, báo cáo..."
                className="bg-transparent outline-none flex-1 text-sm"
                style={{ color: 'var(--color-text)' }}
              />
            </div>
          </div>

          {/* Right: Actions + User */}
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-slate-100"
              style={{ color: 'var(--color-muted)' }}
              aria-label="Thông báo"
            >
              <Bell className="h-4 w-4" />
              <span
                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
                style={{ background: 'var(--color-danger)' }}
              />
            </button>

            {/* Settings */}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-slate-100"
              style={{ color: 'var(--color-muted)' }}
              aria-label="Cài đặt"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* User profile */}
            <div className="relative ml-2">
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-semibold"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold leading-none" style={{ color: 'var(--color-text)' }}>
                    {displayName}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Quản trị viên</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5" style={{ color: 'var(--color-muted)' }} />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-44 rounded-xl py-1 shadow-lg z-50"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-slate-50"
                    style={{ color: 'var(--color-danger)' }}
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page title bar */}
        <div
          className="px-6 py-4"
          style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
        >
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            {pageTitle}
          </h1>
        </div>

        {/* Main content */}
        <main className="px-6 py-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile fallback (no sidebar offset) */}
      <style>{`
        @media (max-width: 1023px) {
          .hidden-mobile-offset { padding-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
