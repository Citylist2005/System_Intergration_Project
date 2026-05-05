import { useEffect, useMemo, useState } from 'react';
import { Calculator, Download, Eye, FileSpreadsheet, Pencil, Plus, RefreshCw, Save, X } from 'lucide-react';
import { getEmployees } from '../api/services/employeesService';
import { calculatePayroll, getPayroll, updatePayroll, upsertPayroll } from '../api/services/payrollService';
import { SelectField } from '../components/ui/Field';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import SimpleLineChart from '../components/charts/SimpleLineChart';
import { enrichPayrollRows, normalizeDepartmentLabel, buildPayrollTrend } from '../utils/analytics';
import { monthOptions, yearOptions } from '../utils/constants';
import { exportPayrollExcel, exportPayrollPDF } from '../utils/exportUtils';
import { formatCurrency, formatDateLabel } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';

function SeverityBadge({ value }) {
  const n = Number(value ?? 0);
  if (n <= 0) return <span style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>-</span>;
  return (
    <span
      className="rounded px-2 py-0.5 text-xs font-semibold"
      style={{ background: 'var(--badge-critical-bg)', color: 'var(--badge-critical-text)' }}
    >
      {formatCurrency(n)}
    </span>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl bg-[var(--color-bg)] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">{value}</p>
    </div>
  );
}

const emptyPayrollForm = {
  salaryId: '',
  employeeId: '',
  month: '9',
  year: '2024',
  baseSalary: '0',
  bonus: '0',
  deductions: '0',
};

export default function Payroll() {
  const { hasPermission } = useAuth();
  const canReadEmployees = hasPermission('employee.read');
  const canCalculate = hasPermission('payroll.calculate');
  const canUpdate = hasPermission('payroll.update');

  const [filters, setFilters] = useState({ month: '9', year: '2024', employeeId: '', departmentId: '' });
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [calcResult, setCalcResult] = useState(null);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [payrollFormOpen, setPayrollFormOpen] = useState(false);
  const [payrollFormMode, setPayrollFormMode] = useState('create');
  const [payrollForm, setPayrollForm] = useState(emptyPayrollForm);
  const [savingPayroll, setSavingPayroll] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  async function loadPayroll(activeFilters = filters) {
    setLoading(true);
    setError('');
    try {
      const [payrollRes, empRes] = await Promise.all([
        getPayroll({
          month: activeFilters.month || undefined,
          year: activeFilters.year || undefined,
          employeeId: activeFilters.employeeId || undefined,
        }),
        canReadEmployees ? getEmployees({ limit: 1000 }) : Promise.resolve({ data: [] }),
      ]);
      setRows(payrollRes.data ?? []);
      setMeta(payrollRes.meta ?? null);
      setEmployees(empRes.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải dữ liệu lương.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPayroll(); }, []);

  async function handleCalculate() {
    setCalculating(true);
    setError('');
    try {
      const res = await calculatePayroll({
        month: Number(filters.month || 9),
        year: Number(filters.year || 2024),
        employeeIds: filters.employeeId ? [Number(filters.employeeId)] : undefined,
      });
      setCalcResult(res.data ?? null);
      await loadPayroll(filters);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tính bảng lương.');
    } finally {
      setCalculating(false);
    }
  }

  function openCreatePayrollForm() {
    setPayrollFormMode('create');
    setActionMessage('');
    setError('');
    setPayrollForm({
      ...emptyPayrollForm,
      employeeId: filters.employeeId || '',
      month: filters.month || '9',
      year: filters.year || '2024',
    });
    setPayrollFormOpen(true);
  }

  function openEditPayrollForm(row) {
    const salaryMonth = row.SalaryMonth ? new Date(row.SalaryMonth) : null;

    setPayrollFormMode('edit');
    setActionMessage('');
    setError('');
    setPayrollForm({
      salaryId: String(row.SalaryID ?? ''),
      employeeId: String(row.EmployeeID ?? ''),
      month: String(salaryMonth && !Number.isNaN(salaryMonth.getTime()) ? salaryMonth.getUTCMonth() + 1 : filters.month || '9'),
      year: String(salaryMonth && !Number.isNaN(salaryMonth.getTime()) ? salaryMonth.getUTCFullYear() : filters.year || '2024'),
      baseSalary: String(Number(row.BaseSalary ?? 0)),
      bonus: String(Number(row.Bonus ?? 0)),
      deductions: String(Number(row.Deductions ?? 0)),
    });
    setPayrollFormOpen(true);
  }

  async function handleSavePayroll(event) {
    event.preventDefault();
    setSavingPayroll(true);
    setError('');
    setActionMessage('');

    try {
      const payload = {
        employeeId: Number(payrollForm.employeeId),
        month: Number(payrollForm.month),
        year: Number(payrollForm.year),
        baseSalary: Number(payrollForm.baseSalary || 0),
        bonus: Number(payrollForm.bonus || 0),
        deductions: Number(payrollForm.deductions || 0),
      };

      if (!payload.employeeId) {
        throw new Error('Vui lòng chọn nhân viên.');
      }

      if (payrollFormMode === 'edit' && payrollForm.salaryId) {
        await updatePayroll(Number(payrollForm.salaryId), {
          baseSalary: payload.baseSalary,
          bonus: payload.bonus,
          deductions: payload.deductions,
        });
      } else {
        await upsertPayroll(payload);
      }

      setPayrollFormOpen(false);
      setActionMessage(payrollFormMode === 'edit' ? 'Cập nhật lương thành công.' : 'Nhập lương thành công.');
      await loadPayroll({
        ...filters,
        month: String(payload.month),
        year: String(payload.year),
      });
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Không thể lưu bản ghi lương.');
    } finally {
      setSavingPayroll(false);
    }
  }

  const enrichedRows = useMemo(() => enrichPayrollRows(rows, employees), [rows, employees]);

  const filteredRows = useMemo(() =>
    enrichedRows.filter((row) => {
      if (filters.departmentId && String(row.DepartmentID) !== filters.departmentId) return false;
      if (filters.employeeId && String(row.EmployeeID) !== filters.employeeId) return false;
      return true;
    }),
    [enrichedRows, filters.departmentId, filters.employeeId],
  );

  const trendData = useMemo(() => buildPayrollTrend(enrichedRows), [enrichedRows]);
  const exportMeta = { month: filters.month || undefined, year: filters.year || undefined };

  const employeeOptions = [
    { value: '', label: 'Tất cả nhân viên' },
    ...employees.map((e) => ({ value: String(e.EmployeeID), label: `${e.EmployeeID} - ${e.FullName}` })),
  ];
  const departmentOptions = [
    { value: '', label: 'Tất cả phòng ban' },
    ...Array.from(
      new Map(
        employees.map((e) => [
          String(e.DepartmentID),
          { value: String(e.DepartmentID), label: normalizeDepartmentLabel(e.DepartmentID) },
        ]),
      ).values(),
    ),
  ];

  return (
    <div className="space-y-5">
      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
        Quản lý bản ghi lương nhân viên và tạo báo cáo tiền lương.
      </p>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--badge-critical-bg)', color: 'var(--badge-critical-text)', border: '1px solid #fca5a5' }}>
          {error}
        </div>
      )}
      {calcResult && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
          Đã tính bảng lương cho {calcResult.totalEmployees} nhân viên. Tổng thực lĩnh: {formatCurrency(calcResult.totalNetSalary)}
        </div>
      )}
      {actionMessage && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
          {actionMessage}
        </div>
      )}

      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="grid gap-4 lg:grid-cols-[240px_minmax(220px,1fr)_minmax(220px,1fr)_auto] lg:items-end">
          <div className="grid gap-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Tháng lương</span>
              <select
                value={filters.month}
                onChange={(e) => setFilters((f) => ({ ...f, month: e.target.value }))}
                className="h-[50px] w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-text)] shadow-sm outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              >
                {monthOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Năm</span>
              <select
                value={filters.year}
                onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
                className="h-[50px] w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-text)] shadow-sm outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
              >
                {yearOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          </div>

          {canReadEmployees ? (
            <>
              <SelectField
                label="Nhân viên"
                value={filters.employeeId}
                onChange={(e) => setFilters((f) => ({ ...f, employeeId: e.target.value }))}
                options={employeeOptions}
              />
              <SelectField
                label="Phòng ban"
                value={filters.departmentId}
                onChange={(e) => setFilters((f) => ({ ...f, departmentId: e.target.value }))}
                options={departmentOptions}
              />
            </>
          ) : null}

          <div className="flex flex-wrap gap-2 lg:justify-end">
            {canUpdate && (
              <button
                type="button"
                onClick={openCreatePayrollForm}
                className="flex h-[50px] items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition-opacity"
                style={{ background: 'var(--color-primary-dark)' }}
              >
                <Plus className="h-4 w-4" />
                Nhập lương
              </button>
            )}
            <button
              type="button"
              onClick={() => exportPayrollExcel(filteredRows, exportMeta)}
              disabled={loading || filteredRows.length === 0}
              className="flex h-[50px] items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: '#16a34a' }}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Xuất Excel
            </button>
            <button
              type="button"
              onClick={() => exportPayrollPDF(filteredRows, exportMeta)}
              disabled={loading || filteredRows.length === 0}
              className="flex h-[50px] items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: '#dc2626' }}
            >
              <Download className="h-4 w-4" />
              Xuất PDF
            </button>
            <button
              type="button"
              onClick={() => loadPayroll(filters)}
              className="flex h-[50px] items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors hover:bg-slate-50"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </button>
            {canCalculate && (
              <button
                type="button"
                onClick={handleCalculate}
                disabled={calculating}
                className="flex h-[50px] items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition-all disabled:opacity-60"
                style={{ background: 'var(--color-primary)' }}
              >
                <Calculator className="h-4 w-4" />
                {calculating ? 'Đang tính...' : 'Tạo bảng lương'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div
          className="overflow-hidden rounded-2xl"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <h2 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>Tổng quan lương</h2>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--color-muted)' }}>
              Đang hiển thị {filteredRows.length} / {meta?.total ?? rows.length} bản ghi
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                  {[
                    'Tháng lương',
                    'Lương cơ bản',
                    'Thưởng',
                    'Tăng ca',
                    'Điều chỉnh',
                    'Khấu trừ',
                    'Vắng mặt',
                    'Phúc lợi/thuế',
                    'Thực lĩnh',
                    'Thao tác',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {Array.from({ length: 10 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 animate-pulse rounded" style={{ background: 'var(--color-bg)' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
                      Không có bản ghi lương.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr
                      key={row.SalaryID}
                      className="transition-colors hover:bg-slate-50"
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                    >
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text)' }}>
                        {formatDateLabel(row.SalaryMonth)}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--color-text)' }}>
                        {formatCurrency(row.BaseSalary)}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--color-success)' }}>
                        {formatCurrency(row.Bonus)}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--color-success)' }}>
                        {formatCurrency(row.OvertimePay)}
                      </td>
                      <td className="px-4 py-3">
                        <SeverityBadge value={row.PayrollAdjustments} />
                      </td>
                      <td className="px-4 py-3">
                        <SeverityBadge value={row.Deductions} />
                      </td>
                      <td className="px-4 py-3">
                        <SeverityBadge value={row.AttendanceDeduction} />
                      </td>
                      <td className="px-4 py-3">
                        <SeverityBadge value={Number(row.BenefitDeductions ?? 0) + Number(row.TaxDeduction ?? 0)} />
                      </td>
                      <td className="px-4 py-3 font-bold" style={{ color: 'var(--color-primary-dark)' }}>
                        {formatCurrency(row.NetSalary)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPayroll(row)}
                            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-blue-50"
                            style={{ color: 'var(--color-primary)', border: '1px solid var(--color-primary-soft)' }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Xem chi tiết
                          </button>
                          {canUpdate && (
                            <button
                              type="button"
                              onClick={() => openEditPayrollForm(row)}
                              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-amber-50"
                              style={{ color: '#b45309', border: '1px solid #fde68a' }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Sửa
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <h2 className="mb-1 text-base font-bold" style={{ color: 'var(--color-text)' }}>Xu hướng lương</h2>
          <p className="mb-4 text-xs" style={{ color: 'var(--color-muted)' }}>Thực lĩnh - Lương cơ bản</p>
          {trendData.length > 0 ? (
            <SimpleLineChart data={trendData} valueFormatter={(v) => formatCurrency(v)} />
          ) : (
            <div className="flex h-48 items-center justify-center text-sm" style={{ color: 'var(--color-muted)' }}>
              Chưa có dữ liệu xu hướng.
            </div>
          )}
        </div>
      </div>

      <Modal
        open={payrollFormOpen}
        title={payrollFormMode === 'edit' ? 'Sửa lương nhân viên' : 'Nhập lương nhân viên'}
        description="Dữ liệu sẽ được lưu trực tiếp vào bảng lương trong database."
        onClose={() => setPayrollFormOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setPayrollFormOpen(false)}>
              Hủy
            </Button>
            <Button disabled={savingPayroll} onClick={handleSavePayroll}>
              <Save className="mr-2 h-4 w-4" />
              {savingPayroll ? 'Đang lưu...' : 'Lưu vào DB'}
            </Button>
          </div>
        }
      >
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSavePayroll}>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Nhân viên</span>
            <select
              value={payrollForm.employeeId}
              onChange={(event) => setPayrollForm((current) => ({ ...current, employeeId: event.target.value }))}
              disabled={payrollFormMode === 'edit'}
              className="h-[50px] w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-text)] shadow-sm outline-none disabled:bg-slate-100"
            >
              <option value="">Chọn nhân viên</option>
              {employees.map((employee) => (
                <option key={employee.EmployeeID} value={employee.EmployeeID}>
                  {employee.EmployeeID} - {employee.FullName}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Tháng</span>
              <select
                value={payrollForm.month}
                onChange={(event) => setPayrollForm((current) => ({ ...current, month: event.target.value }))}
                disabled={payrollFormMode === 'edit'}
                className="h-[50px] w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-text)] shadow-sm outline-none disabled:bg-slate-100"
              >
                {monthOptions.filter((option) => option.value).map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Năm</span>
              <select
                value={payrollForm.year}
                onChange={(event) => setPayrollForm((current) => ({ ...current, year: event.target.value }))}
                disabled={payrollFormMode === 'edit'}
                className="h-[50px] w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-text)] shadow-sm outline-none disabled:bg-slate-100"
              >
                {yearOptions.filter((option) => option.value).map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          {[
            ['baseSalary', 'Lương cơ bản'],
            ['bonus', 'Thưởng'],
            ['deductions', 'Khấu trừ'],
          ].map(([field, label]) => (
            <label key={field} className="space-y-2">
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={payrollForm[field]}
                onChange={(event) => setPayrollForm((current) => ({ ...current, [field]: event.target.value }))}
                className="h-[50px] w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-text)] shadow-sm outline-none"
              />
            </label>
          ))}

          <div className="rounded-2xl bg-[var(--color-bg)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Thực lĩnh dự kiến</p>
            <p className="mt-2 text-lg font-bold text-[var(--color-primary-dark)]">
              {formatCurrency(
                Number(payrollForm.baseSalary || 0) +
                Number(payrollForm.bonus || 0) -
                Number(payrollForm.deductions || 0),
              )}
            </p>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(selectedPayroll)}
        title="Chi tiết bảng lương"
        description={selectedPayroll ? `${selectedPayroll.FullName ?? `Nhân viên #${selectedPayroll.EmployeeID}`} - ${formatDateLabel(selectedPayroll.SalaryMonth)}` : ''}
        onClose={() => setSelectedPayroll(null)}
        footer={
          selectedPayroll && (
            <div className="flex flex-wrap justify-end gap-3">
              <Button onClick={() => exportPayrollExcel([selectedPayroll], exportMeta)} style={{ background: '#16a34a', borderColor: '#16a34a', color: 'white' }}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Xuất Excel
              </Button>
              <Button onClick={() => exportPayrollPDF([selectedPayroll], exportMeta)} style={{ background: '#dc2626', borderColor: '#dc2626', color: 'white' }}>
                <Download className="mr-2 h-4 w-4" />
                Xuất PDF
              </Button>
            </div>
          )
        }
      >
        {selectedPayroll && (
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Mã lương" value={selectedPayroll.SalaryID ?? '-'} />
            <DetailItem label="Mã nhân viên" value={selectedPayroll.EmployeeID ?? '-'} />
            <DetailItem label="Nhân viên" value={selectedPayroll.FullName ?? '-'} />
            <DetailItem
              label="Phòng ban"
              value={selectedPayroll.DepartmentLabel ?? normalizeDepartmentLabel(selectedPayroll.DepartmentID)}
            />
            <DetailItem label="Tháng lương" value={formatDateLabel(selectedPayroll.SalaryMonth)} />
            <DetailItem label="Lương cơ bản" value={formatCurrency(selectedPayroll.BaseSalary)} />
            <DetailItem label="Thưởng" value={formatCurrency(selectedPayroll.Bonus)} />
            <DetailItem label="Tăng ca" value={formatCurrency(selectedPayroll.OvertimePay)} />
            <DetailItem label="Điều chỉnh lương" value={formatCurrency(selectedPayroll.PayrollAdjustments)} />
            <DetailItem label="Khấu trừ" value={formatCurrency(selectedPayroll.Deductions)} />
            <DetailItem label="Khấu trừ vắng mặt" value={formatCurrency(selectedPayroll.AttendanceDeduction)} />
            <DetailItem label="Khấu trừ phúc lợi" value={formatCurrency(selectedPayroll.BenefitDeductions)} />
            <DetailItem label="Thuế/chính sách" value={formatCurrency(selectedPayroll.TaxDeduction)} />
            <DetailItem label="Ngày công" value={selectedPayroll.WorkDays ?? '-'} />
            <DetailItem label="Ngày vắng" value={selectedPayroll.AbsentDays ?? '-'} />
            <DetailItem label="Ngày nghỉ phép" value={selectedPayroll.LeaveDays ?? '-'} />
            <DetailItem label="Thực lĩnh" value={formatCurrency(selectedPayroll.NetSalary)} />
            <DetailItem
              label="Ngày tạo"
              value={selectedPayroll.CreatedAt ? new Date(selectedPayroll.CreatedAt).toLocaleDateString('vi-VN') : '-'}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
