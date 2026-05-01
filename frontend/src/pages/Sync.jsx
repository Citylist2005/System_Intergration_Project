import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  FileCode2,
  RefreshCw,
  ServerCog,
  ShieldAlert,
  ShieldCheck,
  TimerReset,
} from 'lucide-react';
import {
  getSyncStatus,
  syncAll,
  syncAttendance,
  syncDepartments,
  syncEmployees,
  syncPositions,
} from '../api/services/syncService';
import Button from '../components/ui/Button';
import { SelectField } from '../components/ui/Field';
import InfoCard from '../components/ui/InfoCard';
import InlineMessage from '../components/ui/InlineMessage';
import PageHeader from '../components/ui/PageHeader';
import { monthOptions, yearOptions } from '../utils/constants';
import {
  calculateDuration,
  formatDateTime,
  getStatusBadgeClass,
} from '../utils/syncPresentation';

const syncActions = [
  { key: 'departments', label: 'Đồng bộ phòng ban', action: syncDepartments },
  { key: 'positions', label: 'Đồng bộ chức vụ', action: syncPositions },
  { key: 'employees', label: 'Đồng bộ nhân viên', action: syncEmployees },
  { key: 'all', label: 'Đồng bộ tất cả', action: syncAll },
];

function formatStatusLabel(status) {
  const normalized = String(status ?? '').toLowerCase();

  if (normalized.includes('success')) {
    return 'Thành công';
  }
  if (normalized.includes('running')) {
    return 'Đang chạy';
  }
  if (normalized.includes('partial')) {
    return 'Một phần';
  }
  if (normalized.includes('failed')) {
    return 'Thất bại';
  }

  return 'Không xác định';
}

function flattenErrors(results) {
  return results.flatMap((result) => result?.errors ?? []);
}

function extractLatestSyncSummary(lastSyncData) {
  if (!lastSyncData || !lastSyncData.entity) {
    return null;
  }

  if (lastSyncData.entity === 'ALL' && Array.isArray(lastSyncData.results)) {
    const employeeResult = lastSyncData.results.find(
      (result) => result?.data?.entity === 'EMPLOYEE',
    );
    const totals = lastSyncData.results.reduce(
      (accumulator, result) => ({
        totalRecords: accumulator.totalRecords + Number(result?.data?.totalRecords ?? 0),
        created: accumulator.created + Number(result?.data?.created ?? 0),
        updated: accumulator.updated + Number(result?.data?.updated ?? 0),
        failed: accumulator.failed + Number(result?.data?.failed ?? 0),
      }),
      { totalRecords: 0, created: 0, updated: 0, failed: 0 },
    );

    return {
      startedAt: lastSyncData.startedAt,
      completedAt: lastSyncData.completedAt,
      status: lastSyncData.status,
      entity: 'ALL',
      totalRecords: totals.totalRecords,
      created: totals.created,
      updated: totals.updated,
      failed: totals.failed,
      targetRecords: employeeResult?.data?.targetRecords,
      errors: flattenErrors(lastSyncData.results),
    };
  }

  return {
    startedAt: lastSyncData.startedAt,
    completedAt: lastSyncData.completedAt,
    status: lastSyncData.status,
    entity: lastSyncData.entity,
    totalRecords: Number(lastSyncData.totalRecords ?? 0),
    created: Number(lastSyncData.created ?? 0),
    updated: Number(lastSyncData.updated ?? 0),
    failed: Number(lastSyncData.failed ?? 0),
    targetRecords: lastSyncData.targetRecords,
    errors: lastSyncData.errors ?? [],
  };
}

function getConnectionBadgeClass(connected) {
  return connected
    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border border-rose-200 bg-rose-50 text-rose-700';
}

function formatEntityLabel(entity) {
  const key = String(entity ?? '').toLowerCase();

  if (key === 'departments') {
    return 'Phòng ban';
  }
  if (key === 'positions') {
    return 'Chức vụ';
  }
  if (key === 'employees') {
    return 'Nhân viên';
  }
  if (key === 'attendance') {
    return 'Chấm công';
  }
  if (key === 'all') {
    return 'Tất cả';
  }

  return entity || 'Không xác định';
}

export default function Sync() {
  const [status, setStatus] = useState(null);
  const [logEntries, setLogEntries] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [runningKey, setRunningKey] = useState('');
  const [error, setError] = useState('');
  const [showRawJson, setShowRawJson] = useState(false);
  const [attendanceFilters, setAttendanceFilters] = useState({
    month: '8',
    year: '2024',
  });

  async function loadStatus() {
    setLoadingStatus(true);
    setError('');

    try {
      const response = await getSyncStatus();
      setStatus(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải trạng thái đồng bộ.');
    } finally {
      setLoadingStatus(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function runSync(key, action) {
    setRunningKey(key);
    setError('');

    try {
      const response = await action();
      setLogEntries((current) => [
        {
          id: `${key}-${Date.now()}`,
          label: key,
          status: response.status,
          message: response.message,
          data: response.data ?? null,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
      await loadStatus();
    } catch (syncError) {
      const message =
        syncError instanceof Error ? syncError.message : `Không thể chạy tác vụ ${key}.`;
      setError(message);
      setLogEntries((current) => [
        {
          id: `${key}-${Date.now()}`,
          label: key,
          status: 'failed',
          message,
          data: null,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
    } finally {
      setRunningKey('');
    }
  }

  async function handleAttendanceSync() {
    await runSync('attendance', () =>
      syncAttendance({
        month: attendanceFilters.month ? Number(attendanceFilters.month) : undefined,
        year: attendanceFilters.year ? Number(attendanceFilters.year) : undefined,
      }),
    );
  }

  const lastSyncData = status?.data ?? null;
  const connections = status?.connections ?? {};
  const latestSummary = useMemo(
    () => extractLatestSyncSummary(lastSyncData),
    [lastSyncData],
  );
  const connectionEntries = Object.entries(connections);
  const apiHealthy =
    connectionEntries.length > 0 &&
    connectionEntries.every(([, connection]) => connection?.connected);

  const summaryItems = latestSummary
    ? [
        { label: 'Loại đồng bộ', value: formatEntityLabel(latestSummary.entity) },
        { label: 'Bản ghi nguồn', value: latestSummary.totalRecords },
        ...(latestSummary.targetRecords !== undefined
          ? [{ label: 'Nhân viên trong hệ lương', value: latestSummary.targetRecords }]
          : []),
        { label: 'Đã tạo', value: latestSummary.created },
        { label: 'Đã cập nhật', value: latestSummary.updated },
        { label: 'Thất bại', value: latestSummary.failed },
        {
          label: 'Thời lượng',
          value: calculateDuration(latestSummary.startedAt, latestSummary.completedAt),
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Đồng bộ"
        title="Trung tâm điều khiển đồng bộ"
        description="Chạy các tác vụ đồng bộ từ nguồn dữ liệu sang hệ thống lương, theo dõi kết quả và kiểm tra tình trạng kết nối ngay trong dashboard."
        action={
          <Button variant="secondary" loading={loadingStatus} onClick={loadStatus}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới trạng thái
          </Button>
        }
      />

      {error ? <InlineMessage tone="danger">{error}</InlineMessage> : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <InfoCard
          title="Chạy tác vụ đồng bộ"
          description="Khởi chạy từng tác vụ riêng lẻ hoặc chạy toàn bộ quy trình."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {syncActions.map((item) => (
              <Button
                key={item.key}
                loading={runningKey === item.key}
                onClick={() => runSync(item.key, item.action)}
                className="justify-start"
              >
                <DatabaseZap className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>

          <div className="mt-6 rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.96))] p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-text)]">
                  Đồng bộ chấm công
                </h4>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Đồng bộ dữ liệu chấm công theo tháng và năm khi cần.
                </p>
              </div>
              <Button
                loading={runningKey === 'attendance'}
                onClick={handleAttendanceSync}
                variant="soft"
              >
                <TimerReset className="mr-2 h-4 w-4" />
                Đồng bộ chấm công
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <SelectField
                label="Tháng"
                value={attendanceFilters.month}
                onChange={(event) =>
                  setAttendanceFilters((current) => ({
                    ...current,
                    month: event.target.value,
                  }))
                }
                options={monthOptions}
              />
              <SelectField
                label="Năm"
                value={attendanceFilters.year}
                onChange={(event) =>
                  setAttendanceFilters((current) => ({
                    ...current,
                    year: event.target.value,
                  }))
                }
                options={yearOptions}
              />
            </div>
          </div>
        </InfoCard>

        <InfoCard
          title="Trạng thái backend"
          description="Sức khỏe API và kết nối cơ sở dữ liệu được lấy từ endpoint trạng thái đồng bộ."
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-[26px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">Sức khỏe API</p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Ảnh chụp kết nối backend hiện tại.
                  </p>
                </div>
              </div>
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

            <div className="grid gap-3 md:grid-cols-2">
              {connectionEntries.map(([name, connection]) => (
                <div
                  key={name}
                  className="rounded-[24px] border border-[var(--color-border)] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-surface-soft)] text-[var(--color-primary)]">
                        <ServerCog className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text)]">
                          {name}
                        </p>
                        <p className="text-xs text-[var(--color-muted)]">
                          Tình trạng kết nối
                        </p>
                      </div>
                    </div>
                    <span
                      className={[
                        'rounded-full px-3 py-1 text-xs font-semibold',
                        getConnectionBadgeClass(connection?.connected),
                      ].join(' ')}
                    >
                      {connection?.connected ? 'Đã kết nối' : 'Mất kết nối'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4 text-sm text-[var(--color-muted)]">
              Lần đồng bộ gần nhất: {lastSyncData?.message ?? lastSyncData?.status ?? 'Chưa có dữ liệu'}
            </div>
          </div>
        </InfoCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <InfoCard
          title="Kết quả đồng bộ mới nhất"
          description="Bản tóm tắt của lần đồng bộ gần nhất."
        >
          {latestSummary ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-[28px] border border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.96))] p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    Kết quả đồng bộ mới nhất
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Bản tóm tắt của lần đồng bộ gần nhất.
                  </p>
                </div>
                <span
                  className={[
                    'inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold',
                    getStatusBadgeClass(latestSummary.status),
                  ].join(' ')}
                >
                  {formatStatusLabel(latestSummary.status)}
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {summaryItems.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface-soft)] p-4 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                      {item.label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-[26px] border border-[var(--color-border)] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">Mốc thời gian</p>
                    <p className="text-sm text-[var(--color-muted)]">
                      Thời điểm bắt đầu và hoàn tất của tác vụ này.
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-[var(--color-surface-soft)] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                      Bắt đầu lúc
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--color-text)]">
                      {formatDateTime(latestSummary.startedAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[var(--color-surface-soft)] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                      Hoàn tất lúc
                    </p>
                    <p className="mt-2 text-sm font-medium text-[var(--color-text)]">
                      {formatDateTime(latestSummary.completedAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-[var(--color-border)] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-surface-soft)] text-[var(--color-primary-dark)]">
                    {latestSummary.errors?.length ? (
                      <ShieldAlert className="h-4 w-4" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      Chi tiết lỗi
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      Thông báo xác thực và lỗi chạy từ tác vụ đồng bộ.
                    </p>
                  </div>
                </div>

                {latestSummary.errors?.length ? (
                  <div className="space-y-3">
                    {latestSummary.errors.map((entry, index) => (
                      <div
                        key={`${entry}-${index}`}
                        className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                      >
                        {entry}
                      </div>
                    ))}
                  </div>
                ) : (
                  <InlineMessage tone="success">
                    Không phát hiện lỗi. Tác vụ đồng bộ đã hoàn tất thành công.
                  </InlineMessage>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowRawJson((current) => !current)}
                >
                  <FileCode2 className="mr-2 h-4 w-4" />
                  {showRawJson ? 'Ẩn JSON gốc' : 'Xem JSON gốc'}
                </Button>
                {showRawJson ? (
                  <pre className="overflow-x-auto rounded-[24px] border border-slate-200 bg-slate-950 p-4 text-xs leading-6 text-slate-100">
                    {JSON.stringify(lastSyncData, null, 2)}
                  </pre>
                ) : null}
              </div>
            </div>
          ) : (
            <InlineMessage tone="info">
              Chưa có lần đồng bộ nào được ghi nhận. Hãy chạy một tác vụ để xem kết quả mới nhất tại đây.
            </InlineMessage>
          )}
        </InfoCard>

        <InfoCard
          title="Nhật ký"
          description="Nhật ký hoạt động đồng bộ được kích hoạt từ giao diện trong phiên hiện tại."
        >
          <div className="space-y-3">
            {logEntries.length > 0 ? (
              logEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[24px] border border-[var(--color-border)] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-surface-soft)] text-[var(--color-primary)]">
                        {String(entry.status).includes('success') ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : String(entry.status).includes('partial') ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <ShieldAlert className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold capitalize text-[var(--color-text)]">
                          {formatEntityLabel(entry.label)}
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-muted)]">
                          {entry.message}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                          {formatDateTime(entry.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={[
                        'rounded-full px-3 py-1 text-xs font-semibold',
                        getStatusBadgeClass(entry.status),
                      ].join(' ')}
                    >
                      {formatStatusLabel(entry.status)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <InlineMessage tone="info">
                Chưa có thao tác đồng bộ nào được chạy từ giao diện. Khi bạn thực hiện một tác vụ, kết quả sẽ xuất hiện ở đây kèm thời gian và trạng thái.
              </InlineMessage>
            )}
          </div>
        </InfoCard>
      </div>
    </div>
  );
}
