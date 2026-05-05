import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  CalendarCheck2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Database,
  FileBarChart2,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Star,
  UserRoundCheck,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { canAccessRoute } from '../../utils/accessControl';

const ROLE_LABELS = {
  ADMIN: 'Quản trị viên',
  HR_MANAGER: 'Quản lý nhân sự',
  PAYROLL_MANAGER: 'Quản lý lương',
  EMPLOYEE: 'Nhân viên',
};

const navigationGroups = [
  { key: 'dashboard', to: '/dashboard', label: 'Tổng quan', end: true },
  {
    key: 'hr',
    label: 'Nhân sự',
    children: [
      { to: '/employees', label: 'Nhân viên', desc: 'Hồ sơ và danh sách nhân sự', icon: BriefcaseBusiness },
      { to: '/employee-lifecycle', label: 'Vòng đời', desc: 'Luân chuyển và trạng thái nhân sự', icon: UserRoundCheck },
      { to: '/onboarding-offboarding', label: 'Tiếp nhận / Nghỉ việc', desc: 'Theo dõi gia nhập và nghỉ việc', icon: CalendarCheck2 },
      { to: '/performance-evaluation', label: 'Đánh giá', desc: 'Đợt đánh giá định kỳ', icon: UserRoundCheck },
    ],
  },
  {
    key: 'attendance',
    label: 'Chấm công',
    children: [
      { to: '/work-shifts', label: 'Ca làm việc', desc: 'Phân ca và lịch làm', icon: Clock3 },
      { to: '/overtime-leave', label: 'Nghỉ phép & Tăng ca', desc: 'Đơn nghỉ phép và tăng ca', icon: CalendarCheck2 },
    ],
  },
  {
    key: 'payroll',
    label: 'Tiền lương',
    children: [
      { to: '/payroll', label: 'Tiền lương', desc: 'Tính toán và chốt lương', icon: CircleDollarSign },
      { to: '/salary-policies', label: 'Chính sách lương', desc: 'Khung lương và quy tắc áp dụng', icon: CircleDollarSign },
      { to: '/benefits-insurance', label: 'Phúc lợi', desc: 'Phúc lợi và bảo hiểm', icon: BriefcaseBusiness },
      { to: '/payroll-adjustments', label: 'Điều chỉnh lương', desc: 'Phụ cấp và khấu trừ', icon: Settings },
    ],
  },
  {
    key: 'performance',
    label: 'Hiệu suất',
    children: [
      { to: '/kpi-okr', label: 'KPI / OKR', desc: 'Chỉ số hiệu suất mục tiêu', icon: Star },
    ],
  },
  {
    key: 'reports',
    label: 'Báo cáo',
    children: [
      { to: '/reports', label: 'Báo cáo', desc: 'Phân tích nhân sự, lương và chấm công', icon: FileBarChart2 },
      { to: '/system-backup', label: 'Sao lưu / Khôi phục', desc: 'Sao lưu và phục hồi hệ thống', icon: Database },
    ],
  },
  {
    key: 'system',
    label: 'Hệ thống',
    children: [
      { to: '/admin', label: 'Quản trị', desc: 'Trung tâm điều khiển', icon: ShieldCheck },
      { to: '/users', label: 'Cài đặt', desc: 'Tài khoản và cấu hình quản trị', icon: Users },
      { to: '/sync', label: 'Trạng thái API', desc: 'Sức khỏe API và kết nối dữ liệu', icon: Activity },
    ],
  },
];

function normalizePath(target) {
  return String(target || '').split('?')[0];
}

function isRouteActive(target, location) {
  const basePath = normalizePath(target);
  return location.pathname === basePath;
}

function getActiveGroupKey(location, groups) {
  const activeGroup = groups.find((group) =>
    group.children?.some((child) => isRouteActive(child.to, location)),
  );

  return activeGroup?.key ?? '';
}

function getActiveGroupLabel(location, groups) {
  const activeGroup = groups.find((group) => {
    if (!group.children) {
      return isRouteActive(group.to, location);
    }

    return group.children.some((child) => isRouteActive(child.to, location));
  });

  return activeGroup?.label ?? 'Tổng quan';
}

export default function Navbar() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredDesktopGroup, setHoveredDesktopGroup] = useState('');
  const [expandedMobileGroup, setExpandedMobileGroup] = useState('');

  const accessKey = JSON.stringify({
    roles: auth?.roles ?? [],
    permissions: auth?.permissions ?? [],
    hasUser: Boolean(auth?.user),
  });

  const displayName =
    auth?.user?.fullName || auth?.user?.username || auth?.user?.name || 'Quản trị viên';
  const roleLabel = auth?.roles?.length
    ? auth.roles.map((role) => ROLE_LABELS[role] || role).join(', ')
    : 'Khách';

  const visibleGroups = useMemo(
    () =>
      navigationGroups
        .map((group) => {
          if (!group.children) {
            return canAccessRoute(group.to, auth) ? group : null;
          }

          const visibleChildren = group.children.filter((child) =>
            canAccessRoute(normalizePath(child.to), auth),
          );

          return visibleChildren.length > 0 ? { ...group, children: visibleChildren } : null;
        })
        .filter(Boolean),
    [accessKey],
  );

  useEffect(() => {
    const activeGroupKey = getActiveGroupKey(location, visibleGroups);

    setHoveredDesktopGroup('');
    setExpandedMobileGroup(activeGroupKey);
    setUserMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname, location.search, accessKey]);

  function handleLogout() {
    localStorage.removeItem('hr_token');
    localStorage.removeItem('hr_user');
    navigate('/login');
  }

  function toggleMobileGroup(groupKey) {
    setExpandedMobileGroup((current) => (current === groupKey ? '' : groupKey));
  }

  const activeGroupLabel = getActiveGroupLabel(location, visibleGroups);

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="mx-auto flex h-[var(--header-height)] max-w-[var(--content-max-width)] items-center justify-between gap-4 px-6 xl:px-10">
        <NavLink to="/dashboard" className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-white shadow-sm">
            <BarChart3 className="h-5 w-5" />
          </div>
          <span className="hidden text-lg font-bold tracking-tight text-slate-800 sm:block">
            HR Payroll
          </span>
        </NavLink>

        <nav className="hidden lg:flex h-full items-center gap-1">
          {visibleGroups.map((group) => {
            const isExpanded = hoveredDesktopGroup === group.key;
            const isGroupActive = group.children
              ? group.children.some((child) => isRouteActive(child.to, location))
              : isRouteActive(group.to, location);

            if (!group.children) {
              return (
                <NavLink
                  key={group.key}
                  to={group.to}
                  end={group.end}
                  className={({ isActive }) =>
                    [
                      'nav-trigger flex items-center h-full rounded-xl px-4 text-sm font-semibold border-b-2',
                      isActive
                        ? 'nav-trigger-active text-blue-600 border-blue-600'
                        : 'text-slate-600 border-transparent hover:text-slate-900',
                    ].join(' ')
                  }
                >
                  {group.label}
                </NavLink>
              );
            }

            return (
              <div
                key={group.key}
                className="relative flex h-full items-center"
                onMouseEnter={() => setHoveredDesktopGroup(group.key)}
                onMouseLeave={() => setHoveredDesktopGroup('')}
              >
                <button
                  type="button"
                  className={[
                    'nav-trigger flex h-full items-center gap-1 rounded-xl px-4 text-sm font-semibold border-b-2',
                    isGroupActive || isExpanded
                      ? 'nav-trigger-active text-blue-600 border-blue-600 shadow-[0_10px_24px_-20px_rgba(37,99,235,0.9)]'
                      : 'text-slate-600 border-transparent hover:text-slate-900',
                  ].join(' ')}
                >
                  {group.label}
                  <ChevronDown
                    className={[
                      'h-4 w-4 transition-transform duration-200',
                      isExpanded ? 'rotate-180' : 'opacity-60',
                    ].join(' ')}
                  />
                </button>

                {isExpanded ? (
                  <div className="absolute left-1/2 top-full z-50 w-max min-w-[540px] -translate-x-1/2 pt-3">
                    <div className="mega-menu-enter nav-dropdown grid grid-cols-2 gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">
                      {group.children.map((child) => {
                        const isActiveChild = isRouteActive(child.to, location);

                        return (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            className={[
                              'nav-dropdown-item flex items-start gap-3 rounded-xl p-3',
                              isActiveChild
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-slate-700 hover:bg-slate-50',
                            ].join(' ')}
                          >
                            <div
                              className={[
                                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                                isActiveChild
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-slate-100 text-slate-500',
                              ].join(' ')}
                            >
                              <child.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold">{child.label}</div>
                              <div
                                className={[
                                  'mt-0.5 text-xs',
                                  isActiveChild ? 'text-blue-500/80' : 'text-slate-400',
                                ].join(' ')}
                              >
                                {child.desc}
                              </div>
                            </div>
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden xl:flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Đang hoạt động
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <Activity className="h-3.5 w-3.5 text-blue-500" />
              {activeGroupLabel}
            </div>
          </div>

          {auth?.user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((current) => !current)}
                className="flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-slate-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold leading-none text-slate-700">{displayName}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {userMenuOpen ? (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)}></div>
                  <div className="mega-menu-enter absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-100 bg-white py-2 shadow-xl">
                    <div className="border-b border-slate-100 px-4 py-2">
                      <p className="text-sm font-bold text-slate-800">{displayName}</p>
                      <p className="text-xs text-slate-500">{roleLabel}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-600 hover:shadow-md"
            >
              Đăng nhập
            </Link>
          )}

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center text-slate-600 lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="mega-menu-enter fixed inset-0 z-50 overflow-y-auto bg-white lg:hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span className="font-bold text-slate-800">HR Payroll</span>
            </div>
            <button type="button" onClick={() => setMobileOpen(false)} className="text-slate-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4 p-4">
            {visibleGroups.map((group) => {
              const isExpanded = expandedMobileGroup === group.key;
              const isGroupActive = group.children
                ? group.children.some((child) => isRouteActive(child.to, location))
                : isRouteActive(group.to, location);

              if (!group.children) {
                return (
                  <NavLink
                    key={group.key}
                    to={group.to}
                    end={group.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      [
                        'flex items-center rounded-2xl px-4 py-3 text-sm font-semibold',
                        isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50',
                      ].join(' ')
                    }
                  >
                    {group.label}
                  </NavLink>
                );
              }

              return (
                <div key={group.key} className="rounded-2xl border border-slate-100 bg-white">
                  <button
                    type="button"
                    onClick={() => toggleMobileGroup(group.key)}
                    className={[
                      'flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold transition-colors',
                      isGroupActive || isExpanded ? 'text-blue-700' : 'text-slate-700',
                    ].join(' ')}
                  >
                    <span>{group.label}</span>
                    <ChevronDown
                      className={[
                        'h-4 w-4 transition-transform duration-200',
                        isExpanded ? 'rotate-180' : '',
                      ].join(' ')}
                    />
                  </button>

                  {isExpanded ? (
                    <div className="space-y-1 border-t border-slate-100 px-3 py-3">
                      {group.children.map((child) => {
                        const isActiveChild = isRouteActive(child.to, location);

                        return (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            onClick={() => setMobileOpen(false)}
                            className={[
                              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                              isActiveChild
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-slate-700 hover:bg-slate-50',
                            ].join(' ')}
                          >
                            <child.icon className="h-4 w-4 opacity-70" />
                            {child.label}
                          </NavLink>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
