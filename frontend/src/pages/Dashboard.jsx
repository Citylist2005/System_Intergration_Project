import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BriefcaseBusiness,
  CalendarCheck2,
  CircleDollarSign,
  RefreshCw,
  ServerCog,
  SlidersHorizontal,
  Star,
  UserCheck,
} from 'lucide-react';
import { getEmployees } from '../api/services/employeesService';
import { getAttendance } from '../api/services/attendanceService';
import { getPayroll } from '../api/services/payrollService';
import { getSyncStatus } from '../api/services/syncService';
import { listRecords } from '../api/services/srsService';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import InlineMessage from '../components/ui/InlineMessage';
import PageHeader from '../components/ui/PageHeader';
import useAuth from '../hooks/useAuth';
import {
  formatCompactNumber,
  formatCurrency,
  formatDateTime,
  getActiveEmployeesCount,
} from '../utils/formatters';

const refreshIntervalMs = 30000;

function getConnectionBadgeClass(connected) {
  return connected
    ? 'bg-green-100 text-green-700'
    : 'bg-red-100 text-red-700';
}

export default function Dashboard() {
  const { hasPermission, hasRole } = useAuth();
  const [state, setState] = useState({
    employees: [],
    employeesMeta: null,
    attendance: [],
    attendanceMeta: null,
    payroll: [],
    payrollMeta: null,
    syncStatus: null,
    srs: {},
    loading: true,
    error: '',
    lastUpdated: null,
  });
  const [refreshing, setRefreshing] = useState(false);

  async function loadDashboard({ silent = false } = {}) {
    if (silent) {
      setRefreshing(true);
    } else {
      setState((current) => ({ ...current, loading: true, error: '' }));
    }

    try {
      const canReadEmployees = hasPermission('employee.read');
      const canReadAttendance = hasPermission('attendance.read');
      const canReadPayroll = hasPermission('payroll.read');
      const canReadHrRecords = hasPermission('lifecycle.read') || hasRole('ADMIN', 'HR_MANAGER');
      const canReadLeave =
        hasPermission('leave.read') || hasRole('ADMIN', 'HR_MANAGER', 'EMPLOYEE');
      const canReadOvertime =
        hasPermission('leave.read') || hasRole('ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER', 'EMPLOYEE');
      const canReadBenefits = hasPermission('benefits.read') || hasRole('ADMIN', 'PAYROLL_MANAGER');
      const canReadPayrollAdjustments = hasRole('ADMIN', 'PAYROLL_MANAGER');
      const canReadKpi = hasPermission('kpi.read') || hasRole('ADMIN', 'HR_MANAGER', 'EMPLOYEE');
      const canReadBackups = hasRole('ADMIN');

      const [
        employeesResponse,
        attendanceResponse,
        payrollResponse,
        syncResponse,
        lifecycleResponse,
        leaveResponse,
        overtimeResponse,
        benefitsResponse,
        kpiResponse,
        adjustmentsResponse,
        backupResponse,
      ] = await Promise.all([
        canReadEmployees ? getEmployees({ limit: 1000 }) : Promise.resolve({ data: [], meta: { total: 0 } }),
        canReadAttendance ? getAttendance({ limit: 1000 }) : Promise.resolve({ data: [], meta: { total: 0 } }),
        canReadPayroll ? getPayroll({ limit: 1000 }) : Promise.resolve({ data: [], meta: { total: 0 } }),
        getSyncStatus(),
        canReadHrRecords ? listRecords('/employee-lifecycle', { limit: 100 }) : Promise.resolve({ data: [] }),
        canReadLeave ? listRecords('/leave-requests', { limit: 100 }) : Promise.resolve({ data: [] }),
        canReadOvertime ? listRecords('/overtime-requests', { limit: 100 }) : Promise.resolve({ data: [] }),
        canReadBenefits ? listRecords('/benefits-insurance', { limit: 100 }) : Promise.resolve({ data: [] }),
        canReadKpi ? listRecords('/kpi-okr', { limit: 100 }) : Promise.resolve({ data: [] }),
        canReadPayrollAdjustments ? listRecords('/payroll-adjustments', { limit: 100 }) : Promise.resolve({ data: [] }),
        canReadBackups ? listRecords('/system-backup', { limit: 10 }) : Promise.resolve({ data: [] }),
      ]);

      setState({
        employees: employeesResponse.data ?? [],
        employeesMeta: employeesResponse.meta ?? null,
        attendance: attendanceResponse.data ?? [],
        attendanceMeta: attendanceResponse.meta ?? null,
        payroll: payrollResponse.data ?? [],
        payrollMeta: payrollResponse.meta ?? null,
        syncStatus: syncResponse,
        srs: {
          lifecycle: lifecycleResponse.data ?? [],
          leave: leaveResponse.data ?? [],
          overtime: overtimeResponse.data ?? [],
          benefits: benefitsResponse.data ?? [],
          kpi: kpiResponse.data ?? [],
          adjustments: adjustmentsResponse.data ?? [],
          backups: backupResponse.data ?? [],
        },
        loading: false,
        error: '',
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error instanceof Error ? error.message : 'Không thể tải trang tổng quan.',
      }));
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();

    const intervalId = window.setInterval(() => {
      loadDashboard({ silent: true });
    }, refreshIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const totalEmployees = state.employeesMeta?.total ?? state.employees.length;
  const totalAttendance = state.attendanceMeta?.total ?? state.attendance.length;
  const totalSalary = state.payroll.reduce(
    (sum, item) => sum + Number(item.NetSalary ?? 0),
    0,
  );
  const activeEmployees = getActiveEmployeesCount(state.employees);
  const lifecycleActive = state.srs.lifecycle?.filter((item) => item.EventType !== 'Terminated').length ?? 0;
  const leaveOvertime = (state.srs.leave?.length ?? 0) + (state.srs.overtime?.length ?? 0);
  const benefitsCost = (state.srs.benefits ?? []).reduce(
    (sum, item) => sum + Number(item.MonthlyCost ?? 0),
    0,
  );
  const averageKpi =
    state.srs.kpi?.length > 0
      ? state.srs.kpi.reduce((sum, item) => sum + Number(item.Score ?? 0), 0) / state.srs.kpi.length
      : 0;
  const latestBackup = state.srs.backups?.[0]?.Status ?? 'Chưa có';

  const connections = state.syncStatus?.connections ?? {};
  const apiHealthy = Object.values(connections).every(
    (connection) => connection?.connected,
  );
  const isPayrollManager = hasRole('PAYROLL_MANAGER') && !hasRole('ADMIN');
  const isHrManager = hasRole('HR_MANAGER') && !hasRole('ADMIN');
  const isEmployeeOnly = hasRole('EMPLOYEE') && !hasRole('ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER');

  const canShowEmployeeMetrics =
    hasPermission('employee.read') && !isPayrollManager && !isEmployeeOnly;
  const canShowAttendanceMetrics = hasPermission('attendance.read');
  const canShowPayrollMetrics = hasPermission('payroll.read') && !isHrManager;
  const canShowBenefitsMetrics =
    (hasPermission('benefits.read') || hasRole('ADMIN', 'PAYROLL_MANAGER')) &&
    !isHrManager &&
    !isEmployeeOnly;
  const canShowLeaveMetrics =
    hasPermission('leave.read') || hasRole('ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER', 'EMPLOYEE');
  const canShowLifecycleMetrics =
    (hasPermission('lifecycle.read') || hasRole('ADMIN', 'HR_MANAGER')) &&
    !isPayrollManager &&
    !isEmployeeOnly;
  const canShowKpiMetrics =
    (hasPermission('kpi.read') || hasRole('ADMIN', 'HR_MANAGER', 'EMPLOYEE')) &&
    !isPayrollManager;

  const dashboardCards = [
    canShowEmployeeMetrics && {
      title: 'Tổng số nhân viên',
      value: state.loading ? '...' : formatCompactNumber(totalEmployees),
      subtitle: 'Số nhân sự hiện có trong hệ thống',
      icon: BriefcaseBusiness,
      accent: 'bg-blue-100 text-blue-600',
    },
    canShowAttendanceMetrics && {
      title: isEmployeeOnly ? 'Chấm công của tôi' : 'Tổng bản ghi chấm công',
      value: state.loading ? '...' : formatCompactNumber(totalAttendance),
      subtitle: 'Số bản ghi chấm công',
      icon: CalendarCheck2,
      accent: 'bg-indigo-100 text-indigo-600',
    },
    canShowPayrollMetrics && {
      title: isEmployeeOnly ? 'Lương của tôi' : 'Tổng lương',
      value: state.loading ? '...' : formatCurrency(totalSalary),
      subtitle: 'Tổng thực lĩnh',
      icon: CircleDollarSign,
      accent: 'bg-blue-100 text-blue-600',
    },
    canShowEmployeeMetrics && {
      title: 'Nhân viên đang làm việc',
      value: state.loading ? '...' : formatCompactNumber(activeEmployees),
      subtitle: 'Nhân sự ở trạng thái hoạt động',
      icon: UserCheck,
      accent: 'bg-blue-50 text-blue-500',
    },
    canShowLifecycleMetrics && {
      title: 'Hồ sơ vòng đời',
      value: state.loading ? '...' : formatCompactNumber(lifecycleActive),
      subtitle: 'Bản ghi vòng đời hoạt động',
      icon: Activity,
      accent: 'bg-indigo-50 text-indigo-500',
    },
    canShowLeaveMetrics && {
      title: isEmployeeOnly ? 'Nghỉ phép / tăng ca của tôi' : isPayrollManager ? 'Tăng ca' : 'Nghỉ phép / tăng ca',
      value: state.loading ? '...' : formatCompactNumber(leaveOvertime),
      subtitle: 'Tổng đơn yêu cầu',
      icon: CalendarCheck2,
      accent: 'bg-blue-100 text-blue-600',
    },
    canShowBenefitsMetrics && {
      title: 'Chi phí phúc lợi',
      value: state.loading ? '...' : formatCurrency(benefitsCost),
      subtitle: 'Tổng chi phí hằng tháng',
      icon: SlidersHorizontal,
      accent: 'bg-indigo-100 text-indigo-600',
    },
    canShowKpiMetrics && {
      title: isEmployeeOnly ? 'KPI của tôi' : 'KPI trung bình',
      value: state.loading ? '...' : averageKpi.toFixed(1),
      subtitle: `Điều chỉnh: ${state.srs.adjustments?.length ?? 0}. Sao lưu: ${latestBackup}`,
      icon: Star,
      accent: 'bg-blue-50 text-blue-500',
    },
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="TỔNG QUAN"
        title="Bảng điều hành nhân sự và tiền lương"
        description="Quản lý dữ liệu nhân sự và tiền lương. Hệ thống được làm mới tự động và liên tục giám sát trạng thái kết nối với máy chủ."
        action={
          <Button
            variant="secondary"
            loading={refreshing}
            onClick={() => loadDashboard({ silent: true })}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới ngay
          </Button>
        }
      />

      {state.error ? <InlineMessage tone="danger">{state.error}</InlineMessage> : null}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[20px] bg-white p-6 shadow-sm border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">Bảng tin thời gian thực</h3>
            <p className="text-sm text-slate-500">Chu kỳ làm mới dữ liệu và thời gian cập nhật gần nhất.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <p className="text-sm font-medium text-slate-500 mb-1">Chu kỳ làm mới</p>
              <p className="text-2xl font-bold text-slate-800">30 giây</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <p className="text-sm font-medium text-slate-500 mb-1">Cập nhật lần cuối</p>
              <p className="text-2xl font-bold text-slate-800">
                {state.lastUpdated ? formatDateTime(state.lastUpdated) : '...'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] bg-white p-6 shadow-sm border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">Trạng thái API</h3>
            <p className="text-sm text-slate-500">Khả năng kết nối đến máy chủ và các cơ sở dữ liệu.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Activity className="h-4 w-4 text-blue-500" />
                Tổng thể
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  apiHealthy
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {apiHealthy ? 'Ổn định' : 'Suy giảm'}
              </span>
            </div>
            <div className="grid gap-3">
              {Object.entries(connections).map(([name, connection]) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-xl bg-white border border-slate-100 px-4 py-3 shadow-sm"
                >
                  <span className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <ServerCog className="h-4 w-4" />
                    </span>
                    {name}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getConnectionBadgeClass(connection?.connected)}`}
                  >
                    {connection?.connected ? 'Đã kết nối' : 'Mất kết nối'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
