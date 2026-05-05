import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const pageTitleMap = {
  '/': 'Bảng điều khiển',
  '/employees': 'Quản lý nhân viên',
  '/attendance': 'Chấm công',
  '/payroll': 'Quản lý lương',
  '/reports': 'Báo cáo và phân tích',
  '/alerts': 'Cảnh báo và thông báo',
  '/sync': 'Đồng bộ dữ liệu',
};

const academicTitleMap = {
  '/': 'Tổng quan',
  '/employees': 'Nhân viên',
  '/payroll': 'Tiền lương',
  '/reports': 'Báo cáo',
  '/employee-lifecycle': 'Vòng đời nhân viên',
  '/onboarding-offboarding': 'Tiếp nhận / Nghỉ việc',
  '/work-shifts': 'Ca làm việc',
  '/overtime-leave': 'Nghỉ phép & Tăng ca',
  '/salary-policies': 'Chính sách lương',
  '/benefits-insurance': 'Phúc lợi & Bảo hiểm',
  '/payroll-adjustments': 'Điều chỉnh lương',
  '/kpi-okr': 'KPI / OKR',
  '/performance-evaluation': 'Đánh giá hiệu suất',
  '/admin': 'Trung tâm quản trị',
};

export default function MainLayout() {
  const location = useLocation();

  const pageTitle = academicTitleMap[location.pathname] || pageTitleMap[location.pathname] || 'Bảng điều hành nhân sự và tiền lương';

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col">
      <Navbar />

      {/* Main content wrapper */}
      <div className="flex-1 w-full max-w-[var(--content-max-width)] mx-auto">
        {/* Optional Page Title Header, could be removed since pages have PageHeader, but keeping it if needed */}
        {/* We will hide this generic title bar because pages use PageHeader which looks better */}

        <main className="px-6 py-8 sm:px-10 page-transition">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
