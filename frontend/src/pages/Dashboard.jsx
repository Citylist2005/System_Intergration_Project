import { useEffect, useState } from 'react';
import {
  Activity,
  BriefcaseBusiness,
  CalendarCheck2,
  CircleDollarSign,
  RefreshCw,
  ServerCog,
  UserCheck,
} from 'lucide-react';
import { getEmployees } from '../api/services/employeesService';
import { getAttendance } from '../api/services/attendanceService';
import { getPayroll } from '../api/services/payrollService';
import { getSyncStatus } from '../api/services/syncService';
import Button from '../components/ui/Button';
import InfoCard from '../components/ui/InfoCard';
import InlineMessage from '../components/ui/InlineMessage';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import {
  formatCompactNumber,
  formatCurrency,
  formatDateTime,
  getActiveEmployeesCount,
} from '../utils/formatters';

const refreshIntervalMs = 30000;

function getConnectionBadgeClass(connected) {
  return connected
    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border border-rose-200 bg-rose-50 text-rose-700';
}

export default function Dashboard() {
  const [state, setState] = useState({
    employees: [],
    employeesMeta: null,
    attendance: [],
    attendanceMeta: null,
    payroll: [],
    payrollMeta: null,
    syncStatus: null,
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
      const [employeesResponse, attendanceResponse, payrollResponse, syncResponse] =
        await Promise.all([
          getEmployees(),
          getAttendance(),
          getPayroll(),
          getSyncStatus(),
        ]);

      setState({
        employees: employeesResponse.data ?? [],
        employeesMeta: employeesResponse.meta ?? null,
        attendance: attendanceResponse.data ?? [],
        attendanceMeta: attendanceResponse.meta ?? null,
        payroll: payrollResponse.data ?? [],
        payrollMeta: payrollResponse.meta ?? null,
        syncStatus: syncResponse,
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

  const connections = state.syncStatus?.connections ?? {};
  const apiHealthy = Object.values(connections).every(
    (connection) => connection?.connected,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Tổng quan"
        title="Bảng điều hành nhân sự và tiền lương"
        description="Theo dõi dữ liệu vận hành theo thời gian thực với cơ chế tự làm mới mỗi 30 giây và tình trạng kết nối API."
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

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng số nhân viên"
          value={state.loading ? '...' : formatCompactNumber(totalEmployees)}
          subtitle="Số nhân sự hiện có trong hệ thống lương"
          icon={BriefcaseBusiness}
          accent="bg-[linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))] text-white"
        />
        <StatCard
          title="Tổng bản ghi chấm công"
          value={state.loading ? '...' : formatCompactNumber(totalAttendance)}
          subtitle="Số bản ghi chấm công đang tải"
          icon={CalendarCheck2}
          accent="bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]"
        />
        <StatCard
          title="Tổng lương"
          value={state.loading ? '...' : formatCurrency(totalSalary)}
          subtitle="Tổng thực lĩnh của dữ liệu hiện tại"
          icon={CircleDollarSign}
          accent="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          title="Nhân viên đang làm việc"
          value={state.loading ? '...' : formatCompactNumber(activeEmployees)}
          subtitle="Nhân viên đang ở trạng thái hoạt động"
          icon={UserCheck}
          accent="bg-sky-50 text-sky-700"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <InfoCard
          title="Bảng tin thời gian thực"
          description="Trang này tự làm mới và liên tục theo dõi khả năng kết nối backend."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
              <p className="text-sm text-[var(--color-muted)]">Chu kỳ làm mới</p>
              <p className="mt-2 text-xl font-semibold text-[var(--color-text)]">
                30 giây
              </p>
            </div>
            <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4">
              <p className="text-sm text-[var(--color-muted)]">Cập nhật lần cuối</p>
              <p className="mt-2 text-xl font-semibold text-[var(--color-text)]">
                {formatDateTime(state.lastUpdated)}
              </p>
            </div>
          </div>
        </InfoCard>

        <InfoCard
          title="Trạng thái API"
          description="Tình trạng kết nối được lấy từ endpoint sync status của backend."
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-4">
              <span className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                <Activity className="h-4 w-4 text-[var(--color-primary)]" />
                Trạng thái tổng thể
              </span>
              <span
                className={[
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  apiHealthy
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border border-rose-200 bg-rose-50 text-rose-700',
                ].join(' ')}
              >
                {apiHealthy ? 'Ổn định' : 'Suy giảm'}
              </span>
            </div>
            <div className="grid gap-3">
              {Object.entries(connections).map(([name, connection]) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-[24px] border border-[var(--color-border)] bg-white px-4 py-4 shadow-sm"
                >
                  <span className="flex items-center gap-3 text-sm font-medium text-[var(--color-text)]">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--color-surface-soft)] text-[var(--color-primary)]">
                      <ServerCog className="h-4 w-4" />
                    </span>
                    {name}
                  </span>
                  <span
                    className={[
                      'rounded-full px-3 py-1 text-xs font-semibold',
                      getConnectionBadgeClass(connection?.connected),
                    ].join(' ')}
                  >
                    {connection?.connected ? 'Đã kết nối' : 'Mất kết nối'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </InfoCard>
      </div>
    </div>
  );
}
