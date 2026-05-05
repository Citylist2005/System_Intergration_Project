import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import Register from '../pages/Register';
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
import { useAuth } from '../hooks/useAuth';
import { canAccessRoute } from '../utils/accessControl';

function AuthorizedPage({ path, children }) {
  const auth = useAuth();
  return canAccessRoute(path, auth) ? children : <Navigate to="/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register" element={<Register />} />

      {/* Protected guard layer */}
      <Route element={<ProtectedRoute />}>
        {/* MainLayout wraps all protected pages */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<AuthorizedPage path="/dashboard"><Dashboard /></AuthorizedPage>} />
          <Route path="/employees" element={<AuthorizedPage path="/employees"><Employees /></AuthorizedPage>} />
          <Route path="/attendance" element={<AuthorizedPage path="/attendance"><Attendance /></AuthorizedPage>} />
          <Route path="/payroll" element={<AuthorizedPage path="/payroll"><Payroll /></AuthorizedPage>} />
          <Route path="/reports" element={<AuthorizedPage path="/reports"><Reports /></AuthorizedPage>} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/admin" element={<AuthorizedPage path="/admin"><Admin /></AuthorizedPage>} />
          <Route path="/sync" element={<AuthorizedPage path="/sync"><Sync /></AuthorizedPage>} />
          <Route path="/employee-lifecycle" element={<AuthorizedPage path="/employee-lifecycle"><ManagementPage config={managementConfigs.employeeLifecycle} /></AuthorizedPage>} />
          <Route path="/onboarding-offboarding" element={<AuthorizedPage path="/onboarding-offboarding"><ManagementPage config={managementConfigs.onboardingOffboarding} /></AuthorizedPage>} />
          <Route path="/work-shifts" element={<AuthorizedPage path="/work-shifts"><TabbedManagementPage tabs={[
            { id: 'shifts', label: 'Danh mục ca', config: managementConfigs.workShifts },
            { id: 'assignments', label: 'Phân ca nhân viên', config: managementConfigs.shiftAssignments },
          ]} /></AuthorizedPage>} />
          <Route path="/overtime-leave" element={<AuthorizedPage path="/overtime-leave"><TabbedManagementPage tabs={[
            { id: 'leave', label: 'Nghỉ phép', config: managementConfigs.overtimeLeave },
            { id: 'overtime', label: 'Tăng ca', config: managementConfigs.overtimeRequests },
          ]} /></AuthorizedPage>} />
          <Route path="/salary-policies" element={<AuthorizedPage path="/salary-policies"><ManagementPage config={managementConfigs.salaryPolicies} /></AuthorizedPage>} />
          <Route path="/benefits-insurance" element={<AuthorizedPage path="/benefits-insurance"><ManagementPage config={managementConfigs.benefitsInsurance} /></AuthorizedPage>} />
          <Route path="/payroll-adjustments" element={<AuthorizedPage path="/payroll-adjustments"><ManagementPage config={managementConfigs.payrollAdjustments} /></AuthorizedPage>} />
          <Route path="/kpi-okr" element={<AuthorizedPage path="/kpi-okr"><ManagementPage config={managementConfigs.kpiOkr} /></AuthorizedPage>} />
          <Route path="/performance-evaluation" element={<AuthorizedPage path="/performance-evaluation"><ManagementPage config={managementConfigs.performanceEvaluation} /></AuthorizedPage>} />
          <Route path="/users" element={<AuthorizedPage path="/users"><ManagementPage config={managementConfigs.users} /></AuthorizedPage>} />
          <Route path="/system-backup" element={<AuthorizedPage path="/system-backup"><ManagementPage config={managementConfigs.systemBackup} /></AuthorizedPage>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
