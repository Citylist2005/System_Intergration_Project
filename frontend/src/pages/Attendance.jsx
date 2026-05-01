import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { getAttendance, getAttendanceSummary } from '../api/services/attendanceService';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/ui/EmptyState';
import { SelectField } from '../components/ui/Field';
import InfoCard from '../components/ui/InfoCard';
import InlineMessage from '../components/ui/InlineMessage';
import PageHeader from '../components/ui/PageHeader';
import SectionToolbar from '../components/ui/SectionToolbar';
import { monthOptions, yearOptions } from '../utils/constants';
import { formatCompactNumber, sumValues } from '../utils/formatters';

export default function Attendance() {
  const [filters, setFilters] = useState({ month: '', year: '', search: '' });
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function loadAttendance(activeFilters = filters, { silent = false } = {}) {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    const params = {
      month: activeFilters.month || undefined,
      year: activeFilters.year || undefined,
    };

    try {
      const [attendanceResponse, summaryResponse] = await Promise.all([
        getAttendance(params),
        getAttendanceSummary(params),
      ]);

      setRows(attendanceResponse.data ?? []);
      setMeta(attendanceResponse.meta ?? null);
      setSummary(summaryResponse.data ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu chấm công.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAttendance();
  }, []);

  const filteredRows = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      `${row.EmployeeID} ${row.FullName}`.toLowerCase().includes(query),
    );
  }, [filters.search, rows]);

  const summaryTotals = {
    workDays: sumValues(summary, 'WorkDays'),
    absentDays: sumValues(summary, 'AbsentDays'),
    leaveDays: sumValues(summary, 'LeaveDays'),
  };

  const columns = [
    {
      key: 'EmployeeID',
      header: 'Mã nhân viên',
      render: (row) => (
        <span className="font-semibold text-slate-900">{row.EmployeeID}</span>
      ),
    },
    {
      key: 'FullName',
      header: 'Họ và tên',
      render: (row) => <span className="font-medium text-slate-700">{row.FullName}</span>,
    },
    { key: 'WorkDays', header: 'Ngày công' },
    { key: 'AbsentDays', header: 'Ngày vắng' },
    { key: 'LeaveDays', header: 'Ngày nghỉ phép' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Chấm công"
        title="Quản lý chấm công"
        description="Lọc theo tháng, năm và tên nhân viên để theo dõi số liệu chấm công tổng hợp."
        action={
          <Button
            variant="secondary"
            loading={refreshing}
            onClick={() => loadAttendance(filters, { silent: true })}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        }
      />

      {error ? <InlineMessage tone="danger">{error}</InlineMessage> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <InfoCard title="Tổng ngày công">
          <p className="text-3xl font-semibold text-slate-900">
            {formatCompactNumber(summaryTotals.workDays)}
          </p>
        </InfoCard>
        <InfoCard title="Tổng ngày vắng">
          <p className="text-3xl font-semibold text-slate-900">
            {formatCompactNumber(summaryTotals.absentDays)}
          </p>
        </InfoCard>
        <InfoCard title="Tổng ngày nghỉ phép">
          <p className="text-3xl font-semibold text-slate-900">
            {formatCompactNumber(summaryTotals.leaveDays)}
          </p>
        </InfoCard>
      </div>

      <InfoCard
        title="Bản ghi chấm công"
        description={`Đã tải ${meta?.total ?? rows.length} bản ghi chấm công.`}
      >
        <SectionToolbar>
          <div className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SelectField
              label="Tháng"
              value={filters.month}
              onChange={(event) =>
                setFilters((current) => ({ ...current, month: event.target.value }))
              }
              options={monthOptions}
            />
            <SelectField
              label="Năm"
              value={filters.year}
              onChange={(event) =>
                setFilters((current) => ({ ...current, year: event.target.value }))
              }
              options={yearOptions}
            />
            <label className="space-y-2 xl:col-span-2">
              <span className="text-sm font-medium text-slate-700">Tìm kiếm nhân viên</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={filters.search}
                  onChange={(event) =>
                    setFilters((current) => ({ ...current, search: event.target.value }))
                  }
                  placeholder="Tìm theo tên hoặc mã nhân viên"
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </label>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => loadAttendance(filters)}>
              Áp dụng bộ lọc
            </Button>
          </div>
        </SectionToolbar>

        {filteredRows.length > 0 || loading ? (
          <DataTable
            columns={columns}
            rows={filteredRows}
            loading={loading}
            rowKey={(row, index) => `${row.EmployeeID}-${row.AttendanceMonth}-${index}`}
            emptyMessage="Không tìm thấy dữ liệu chấm công."
          />
        ) : (
          <EmptyState
            title="Không có dữ liệu phù hợp"
            description="Hãy điều chỉnh từ khóa tìm kiếm hoặc bộ lọc thời gian để xem nhóm khác."
          />
        )}
      </InfoCard>
    </div>
  );
}
