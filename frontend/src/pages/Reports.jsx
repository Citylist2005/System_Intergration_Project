import { useEffect, useMemo, useState } from 'react';
import { FileSpreadsheet, Download, RefreshCw } from 'lucide-react';

import { getAttendanceSummary } from '../api/services/attendanceService';
import { getEmployees } from '../api/services/employeesService';
import { getPayroll } from '../api/services/payrollService';
import HorizontalBarChart from '../components/charts/HorizontalBarChart';
import DonutChart from '../components/charts/DonutChart';
import TrendLineChart from '../components/charts/TrendLineChart';
import { SelectField } from '../components/ui/Field';
import {
  buildEmployeeDistribution,
  buildPayrollTrend,
  buildSalaryByDepartment,
  enrichPayrollRows,
} from '../utils/analytics';
import { formatCompactCurrency } from '../utils/formatters';
import { doExportExcel, doExportPDF } from '../utils/exportUtils';
import { useAuth } from '../hooks/useAuth';

// ── helpers ─────────────────────────────────────────────────────────────────
const reportTypes = [
  { id: 'hr',         label: 'Báo cáo nhân sự',      icon: '👤' },
  { id: 'payroll',    label: 'Báo cáo lương',        icon: '💰' },
  { id: 'attendance', label: 'Báo cáo chấm công',    icon: '📅' },
  { id: 'dividend',   label: 'Báo cáo tổng hợp',     icon: '📊' },
];


// ── Compact currency formatter for charts ────────────────────────────────────
function fmtTr(v) {
  const n = Number(v) / 1_000_000;
  return `${n % 1 === 0 ? n : n.toFixed(1)} Tr`;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function Reports() {
  const { hasPermission } = useAuth();
  const canReadEmployees = hasPermission('employee.read');
  const canReadPayroll = hasPermission('payroll.read');
  const canReadAttendance = hasPermission('attendance.read');
  const [employees, setEmployees] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeReport, setActiveReport] = useState('hr');
  const [department, setDepartment] = useState('');

  async function loadReports() {
    setLoading(true);
    setError('');
    try {
      const [empRes, payRes, attRes] = await Promise.all([
        canReadEmployees ? getEmployees() : Promise.resolve({ data: [] }),
        canReadPayroll ? getPayroll({ limit: 200 }) : Promise.resolve({ data: [] }),
        canReadAttendance ? getAttendanceSummary() : Promise.resolve({ data: [] }),
      ]);
      setEmployees(empRes.data ?? []);
      setPayroll(payRes.data ?? []);
      setAttendanceSummary(attRes.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải báo cáo.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReports(); }, []);

  const visibleReportTypes = reportTypes.filter((type) => {
    if (type.id === 'hr') return canReadEmployees;
    if (type.id === 'payroll') return canReadPayroll;
    if (type.id === 'attendance') return canReadAttendance;
    return canReadEmployees || canReadPayroll || canReadAttendance;
  });

  useEffect(() => {
    if (!visibleReportTypes.some((type) => type.id === activeReport)) {
      setActiveReport(visibleReportTypes[0]?.id ?? 'hr');
    }
  }, [activeReport, visibleReportTypes]);

  const enrichedPayroll = useMemo(() => enrichPayrollRows(payroll, employees), [payroll, employees]);

  const filteredPayroll = useMemo(() =>
    department
      ? enrichedPayroll.filter((r) => String(r.DepartmentID) === department)
      : enrichedPayroll,
    [enrichedPayroll, department],
  );

  const salaryByDept = useMemo(() => buildSalaryByDepartment(filteredPayroll), [filteredPayroll]);
  const empDist = useMemo(() => buildEmployeeDistribution(employees), [employees]);
  const trend = useMemo(() => buildPayrollTrend(filteredPayroll), [filteredPayroll]);

  const deptOptions = [
    { value: '', label: 'Tất cả phòng ban' },
    ...Array.from(new Set(employees.map((e) => e.DepartmentID).filter(Boolean))).map((id) => ({
      value: String(id), label: `Phòng ban ${id}`,
    })),
  ];

  // Summary stats
  const totalNet = filteredPayroll.reduce((s, r) => s + Number(r.NetSalary ?? 0), 0);
  const avgNet = filteredPayroll.length ? totalNet / filteredPayroll.length : 0;

  return (
    <div className="space-y-5">
      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
        Bảng phân tích và báo cáo dữ liệu nhân sự, lương và chấm công.
      </p>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--badge-critical-bg)', color: 'var(--badge-critical-text)' }}>
          {error}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex flex-wrap items-end gap-4">
          {/* Department filter */}
          <div style={{ minWidth: 180 }}>
            <SelectField
              label="Phòng ban"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={deptOptions}
            />
          </div>

          {/* Report Type */}
          <div className="flex-1">
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-muted)' }}>Loại báo cáo</p>
            <div className="flex gap-2 flex-wrap">
              {visibleReportTypes.map((rt) => (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => setActiveReport(rt.id)}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all"
                  style={{
                    background: activeReport === rt.id ? 'var(--color-primary)' : 'var(--color-bg)',
                    color: activeReport === rt.id ? '#fff' : 'var(--color-muted)',
                    border: `1px solid ${activeReport === rt.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  }}
                >
                  <span>{rt.icon}</span>
                  {rt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Export */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>Xuất báo cáo</p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => doExportExcel(activeReport, employees, payroll, attendanceSummary)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-50 transition-opacity"
                style={{ background: '#16a34a' }}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Xuất Excel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => doExportPDF(activeReport, employees, payroll, attendanceSummary)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-50 transition-opacity"
                style={{ background: '#dc2626' }}
              >
                <Download className="h-3.5 w-3.5" />
                Xuất PDF
              </button>
            </div>
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={loadReports}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors hover:bg-slate-50"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      {/* ── Summary KPIs ── */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Tổng nhân viên', value: employees.length, color: 'var(--color-primary)' },
          { label: 'Tổng thực lĩnh', value: formatCompactCurrency(totalNet), color: '#16a34a' },
          { label: 'Thực lĩnh TB/người', value: formatCompactCurrency(avgNet), color: '#f59e0b' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl p-4"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <p className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>{kpi.label}</p>
            <p className="text-2xl font-extrabold mt-1" style={{ color: kpi.color }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      {loading ? (
        <div className="grid gap-5 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="h-5 w-40 rounded animate-pulse mb-3" style={{ background: 'var(--color-bg)' }} />
              <div className="h-56 rounded-xl animate-pulse" style={{ background: 'var(--color-bg)' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-3">
          {/* Bar chart: Salary by Department */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>Lương theo phòng ban</h3>
            <p className="text-xs mt-0.5 mb-4" style={{ color: 'var(--color-muted)' }}>Tổng thực lĩnh theo từng phòng ban</p>
            {salaryByDept.length > 0 ? (
              <div className="overflow-y-auto" style={{ maxHeight: 280 }}>
                <HorizontalBarChart data={salaryByDept} valueFormatter={fmtTr} />
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-xs" style={{ color: 'var(--color-muted)' }}>
                Chưa có dữ liệu
              </div>
            )}
          </div>

          {/* Donut chart: Employee Distribution */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>Phân bố nhân viên</h3>
            <p className="text-xs mt-0.5 mb-4" style={{ color: 'var(--color-muted)' }}>Số lượng nhân viên theo trạng thái</p>
            {empDist.length > 0 ? (
              <DonutChart data={empDist} />
            ) : (
              <div className="h-40 flex items-center justify-center text-xs" style={{ color: 'var(--color-muted)' }}>
                Chưa có dữ liệu
              </div>
            )}
          </div>

          {/* Line chart: Payroll Trend */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>Xu hướng lương</h3>
            <p className="text-xs mt-0.5 mb-4" style={{ color: 'var(--color-muted)' }}>Thực lĩnh theo thời gian</p>
            {trend.length > 0 ? (
              <TrendLineChart data={trend} valueFormatter={fmtTr} />
            ) : (
              <div className="h-40 flex items-center justify-center text-xs" style={{ color: 'var(--color-muted)' }}>
                Chưa có dữ liệu
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
