import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, RefreshCw, Search } from 'lucide-react';
import {
  getAttendance,
  getAttendanceSummary,
  updateAttendance,
  upsertManualAttendance,
} from '../api/services/attendanceService';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/ui/EmptyState';
import { InputField, SelectField } from '../components/ui/Field';
import InfoCard from '../components/ui/InfoCard';
import InlineMessage from '../components/ui/InlineMessage';
import Modal from '../components/ui/Modal';
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
  const [modalMode, setModalMode] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    AttendanceID: '',
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    workDays: 26,
    absentDays: 0,
    leaveDays: 0,
    overtimeHours: 0,
  });

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
      setError(loadError?.message || 'Không thể tải dữ liệu chấm công.');
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
    overtimeHours: sumValues(summary, 'OvertimeHours'),
  };

  function openCreateModal() {
    setForm({
      AttendanceID: '',
      employeeId: '',
      month: filters.month || new Date().getMonth() + 1,
      year: filters.year || new Date().getFullYear(),
      workDays: 26,
      absentDays: 0,
      leaveDays: 0,
      overtimeHours: 0,
    });
    setModalMode('create');
  }

  function openEditModal(row) {
    const date = new Date(row.AttendanceMonth);
    setForm({
      AttendanceID: row.AttendanceID,
      employeeId: row.EmployeeID,
      month: date.getUTCMonth() + 1,
      year: date.getUTCFullYear(),
      workDays: row.WorkDays ?? 0,
      absentDays: row.AbsentDays ?? 0,
      leaveDays: row.LeaveDays ?? 0,
      overtimeHours: row.OvertimeHours ?? 0,
    });
    setModalMode('edit');
  }

  async function saveManualAttendance(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      employeeId: Number(form.employeeId),
      month: Number(form.month),
      year: Number(form.year),
      workDays: Number(form.workDays),
      absentDays: Number(form.absentDays),
      leaveDays: Number(form.leaveDays),
      overtimeHours: Number(form.overtimeHours),
    };

    try {
      if (modalMode === 'edit') {
        await updateAttendance(Number(form.AttendanceID), payload);
      } else {
        await upsertManualAttendance(payload);
      }
      setModalMode('');
      await loadAttendance(filters, { silent: true });
    } catch (saveError) {
      setError(saveError?.response?.data?.message || saveError?.message || 'Không thể lưu dữ liệu công.');
    } finally {
      setSaving(false);
    }
  }

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
    { key: 'OvertimeHours', header: 'Giờ tăng ca' },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (row) => (
        <Button variant="secondary" size="sm" onClick={() => openEditModal(row)}>
          <Pencil className="mr-2 h-4 w-4" />
          Sửa công
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Chấm công"
        title="Quản lý chấm công"
        description="Lọc theo tháng, năm và tên nhân viên để theo dõi số liệu công, vắng, nghỉ phép và tăng ca."
        action={
          <div className="flex gap-3">
            <Button onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" />
              Nhập công
            </Button>
            <Button
              variant="secondary"
              loading={refreshing}
              onClick={() => loadAttendance(filters, { silent: true })}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
          </div>
        }
      />

      {error ? <InlineMessage tone="danger">{error}</InlineMessage> : null}

      <div className="grid gap-6 lg:grid-cols-4">
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
        <InfoCard title="Tổng giờ tăng ca">
          <p className="text-3xl font-semibold text-slate-900">
            {formatCompactNumber(summaryTotals.overtimeHours)}
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

      <Modal
        open={Boolean(modalMode)}
        title={modalMode === 'edit' ? 'Cập nhật dữ liệu công' : 'Nhập công thủ công'}
        description="Nhập ngày công, ngày vắng, ngày nghỉ phép và giờ tăng ca theo kỳ."
        onClose={() => setModalMode('')}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalMode('')}>Hủy</Button>
            <Button loading={saving} onClick={saveManualAttendance}>Lưu</Button>
          </div>
        }
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={saveManualAttendance}>
          <InputField label="Mã nhân viên" type="number" value={form.employeeId} disabled={modalMode === 'edit'} onChange={(event) => setForm((current) => ({ ...current, employeeId: event.target.value }))} />
          <InputField label="Tháng" type="number" value={form.month} disabled={modalMode === 'edit'} onChange={(event) => setForm((current) => ({ ...current, month: event.target.value }))} />
          <InputField label="Năm" type="number" value={form.year} disabled={modalMode === 'edit'} onChange={(event) => setForm((current) => ({ ...current, year: event.target.value }))} />
          <InputField label="Ngày công" type="number" value={form.workDays} onChange={(event) => setForm((current) => ({ ...current, workDays: event.target.value }))} />
          <InputField label="Ngày vắng" type="number" value={form.absentDays} onChange={(event) => setForm((current) => ({ ...current, absentDays: event.target.value }))} />
          <InputField label="Ngày nghỉ phép" type="number" value={form.leaveDays} onChange={(event) => setForm((current) => ({ ...current, leaveDays: event.target.value }))} />
          <InputField label="Giờ tăng ca" type="number" value={form.overtimeHours} onChange={(event) => setForm((current) => ({ ...current, overtimeHours: event.target.value }))} />
        </form>
      </Modal>
    </div>
  );
}
