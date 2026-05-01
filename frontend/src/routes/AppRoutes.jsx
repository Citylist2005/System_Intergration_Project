import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Employees from '../pages/Employees';
import Attendance from '../pages/Attendance';
import Payroll from '../pages/Payroll';
import Reports from '../pages/Reports';
import Alerts from '../pages/Alerts';
import Sync from '../pages/Sync';
import Admin from '../pages/Admin';
import ManagementPage from '../pages/ManagementPage';
import TabbedManagementPage from '../pages/TabbedManagementPage';
import { managementConfigs } from '../pages/managementConfigs';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected guard layer */}
      <Route element={<ProtectedRoute />}>
        {/* MainLayout wraps all protected pages */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/sync" element={<Sync />} />
          <Route path="/employee-lifecycle" element={<ManagementPage config={managementConfigs.employeeLifecycle} />} />
          <Route path="/onboarding-offboarding" element={<ManagementPage config={managementConfigs.onboardingOffboarding} />} />
          <Route path="/work-shifts" element={<TabbedManagementPage tabs={[
            { id: 'shifts', label: 'Danh mục ca', config: managementConfigs.workShifts },
            { id: 'assignments', label: 'Phân ca nhân viên', config: managementConfigs.shiftAssignments },
          ]} />} />
          <Route path="/overtime-leave" element={<TabbedManagementPage tabs={[
            { id: 'leave', label: 'Nghỉ phép', config: managementConfigs.overtimeLeave },
            { id: 'overtime', label: 'Tăng ca', config: managementConfigs.overtimeRequests },
          ]} />} />
          <Route path="/salary-policies" element={<ManagementPage config={managementConfigs.salaryPolicies} />} />
          <Route path="/benefits-insurance" element={<ManagementPage config={managementConfigs.benefitsInsurance} />} />
          <Route path="/payroll-adjustments" element={<ManagementPage config={managementConfigs.payrollAdjustments} />} />
          <Route path="/kpi-okr" element={<ManagementPage config={managementConfigs.kpiOkr} />} />
          <Route path="/performance-evaluation" element={<ManagementPage config={managementConfigs.performanceEvaluation} />} />
          <Route path="/users" element={<ManagementPage config={managementConfigs.users} />} />
          <Route path="/system-backup" element={<ManagementPage config={managementConfigs.systemBackup} />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
