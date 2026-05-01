import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, Bell, Calendar, ChevronRight, DollarSign,
  Info, Plus, X, Clock, UserCheck, TrendingUp, Filter,
} from 'lucide-react';
import { getAttendanceSummary } from '../api/services/attendanceService';
import { getPayroll } from '../api/services/payrollService';
import { getEmployees } from '../api/services/employeesService';
import { buildAlerts } from '../utils/analytics';

// ── helpers ──────────────────────────────────────────────────────
const SEVERITY_MAP = {
  high:   { label: 'Nghiêm trọng', bg: 'var(--badge-critical-bg)', color: 'var(--badge-critical-text)' },
  medium: { label: 'Cảnh báo',     bg: 'var(--badge-warning-bg)',  color: 'var(--badge-warning-text)'  },
  low:    { label: 'Thông tin',    bg: 'var(--badge-info-bg)',     color: 'var(--badge-info-text)'     },
};

function SeverityBadge({ severity }) {
  const s = SEVERITY_MAP[severity] ?? SEVERITY_MAP.low;
  return (
    <span className="rounded px-2 py-0.5 text-xs font-bold" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function AlertIcon({ type }) {
  if (type === 'Tăng lương')             return <TrendingUp  className="h-4 w-4" style={{ color: 'var(--badge-critical-text)' }} />;
  if (type === 'Bất thường chấm công')   return <AlertTriangle className="h-4 w-4" style={{ color: 'var(--badge-warning-text)' }} />;
  if (type === 'Vắng nhiều')             return <Clock        className="h-4 w-4" style={{ color: 'var(--badge-warning-text)' }} />;
  if (type === 'Kỷ niệm công tác')      return <UserCheck    className="h-4 w-4" style={{ color: 'var(--badge-info-text)' }} />;
  return <Bell className="h-4 w-4" style={{ color: 'var(--color-muted)' }} />;
}

// Generate richer alerts from real data
function buildRichAlerts(payroll, attendanceSummary, employees, threshold) {
  const base = buildAlerts(payroll, attendanceSummary, Number(threshold || 5));

  // Add attendance alerts for any absent days > 0
  const extraAtt = attendanceSummary
    .filter((r) => Number(r.AbsentDays ?? 0) > 0 && Number(r.AbsentDays ?? 0) <= Number(threshold || 5))
    .map((r) => ({
      id: `absent-low-${r.EmployeeID}`,
      type: 'Vắng nhiều',
      severity: 'low',
      employeeId: r.EmployeeID,
      employeeName: r.FullName ?? `NV #${r.EmployeeID}`,
      summary: `Vắng ${r.AbsentDays} ngày trong kỳ`,
      detail: `${r.FullName} có ${r.AbsentDays} ngày vắng và ${r.LeaveDays} ngày nghỉ phép trong kỳ chấm công.`,
    }));

  // Add work anniversary alerts from hire date
  const today = new Date();
  const extraAnni = employees
    .filter((e) => e.HireDate)
    .map((e) => {
      const hire = new Date(e.HireDate);
      const years = today.getFullYear() - hire.getFullYear();
      const sameMonthDay =
        today.getMonth() === hire.getMonth() &&
        Math.abs(today.getDate() - hire.getDate()) <= 7;
      if (years > 0 && sameMonthDay) {
        return {
          id: `anni-${e.EmployeeID}`,
          type: 'Kỷ niệm công tác',
          severity: 'low',
          employeeId: e.EmployeeID,
          employeeName: e.FullName ?? `NV #${e.EmployeeID}`,
          summary: `${years} năm công tác`,
          detail: `${e.FullName} đã làm việc tại công ty được ${years} năm kể từ ${hire.toLocaleDateString('vi-VN')}.`,
        };
      }
      return null;
    })
    .filter(Boolean);

  return [...base, ...extraAtt, ...extraAnni];
}

// ── New Alert Modal ──────────────────────────────────────────────
function NewAlertModal({ employees, onClose, onAdd }) {
  const [form, setForm] = useState({ type: 'Tăng lương', severity: 'medium', employeeId: '', note: '' });

  function handleSubmit(e) {
    e.preventDefault();
    const emp = employees.find((x) => String(x.EmployeeID) === form.employeeId);
    onAdd({
      id: `manual-${Date.now()}`,
      type: form.type,
      severity: form.severity,
      employeeId: Number(form.employeeId) || 0,
      employeeName: emp?.FullName ?? 'Không xác định',
      summary: form.note || `Cảnh báo ${form.type}`,
      detail: form.note || `Cảnh báo thủ công: ${form.type}`,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>Tạo cảnh báo mới</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X className="h-4 w-4" style={{ color: 'var(--color-muted)' }} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-muted)' }}>Loại cảnh báo</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
              <option>Tăng lương</option>
              <option>Bất thường chấm công</option>
              <option>Vắng nhiều</option>
              <option>Kỷ niệm công tác</option>
              <option>Khác</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-muted)' }}>Mức độ</label>
            <select value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
              <option value="high">Nghiêm trọng</option>
              <option value="medium">Cảnh báo</option>
              <option value="low">Thông tin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-muted)' }}>Nhân viên</label>
            <select value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
              <option value="">-- Chọn nhân viên --</option>
              {employees.map((emp) => (
                <option key={emp.EmployeeID} value={emp.EmployeeID}>{emp.EmployeeID} - {emp.FullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-muted)' }}>Ghi chú</label>
            <textarea value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              rows={3} placeholder="Mô tả chi tiết cảnh báo..."
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }} />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
              Huỷ
            </button>
            <button type="submit"
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white"
              style={{ background: 'var(--color-primary)' }}>
              Tạo cảnh báo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────
export default function Alerts() {
  const [payroll, setPayroll] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [manualAlerts, setManualAlerts] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [threshold, setThreshold] = useState('5');
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  async function loadData() {
    setLoading(true); setError('');
    try {
      const [pRes, aRes, eRes] = await Promise.all([getPayroll(), getAttendanceSummary(), getEmployees()]);
      setPayroll(pRes.data ?? []);
      setAttendance(aRes.data ?? []);
      setEmployees(eRes.data ?? []);
    } catch (e) { setError(e.message || 'Không thể tải cảnh báo.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  const allAlerts = useMemo(() => [
    ...buildRichAlerts(payroll, attendance, employees, threshold),
    ...manualAlerts,
  ].filter((a) => !dismissedIds.has(a.id)), [payroll, attendance, employees, threshold, manualAlerts, dismissedIds]);

  const filtered = useMemo(() => allAlerts.filter((a) => {
    if (typeFilter && a.type !== typeFilter) return false;
    if (severityFilter === 'critical' && a.severity !== 'high') return false;
    if (severityFilter === 'warning' && a.severity !== 'medium') return false;
    if (severityFilter === 'info' && a.severity !== 'low') return false;
    return true;
  }), [allAlerts, typeFilter, severityFilter]);

  const selected = filtered.find((a) => a.id === selectedId) ?? filtered[0] ?? null;
  useEffect(() => { if (!selectedId && filtered[0]) setSelectedId(filtered[0].id); }, [filtered]);

  const types = [...new Set(allAlerts.map((a) => a.type))];
  const counts = {
    total: allAlerts.length,
    critical: allAlerts.filter((a) => a.severity === 'high').length,
    warning: allAlerts.filter((a) => a.severity === 'medium').length,
    info: allAlerts.filter((a) => a.severity === 'low').length,
  };

  function dismiss(id) {
    setDismissedIds((prev) => new Set([...prev, id]));
    if (selectedId === id) setSelectedId(null);
  }

  function investigate(alert) {
    window.alert(`Đang điều tra: ${alert.employeeName}\n\n${alert.detail}`);
  }

  function forward(alert) {
    window.alert(`Đã chuyển tiếp cảnh báo của ${alert.employeeName} đến quản lý.`);
  }

  return (
    <div className="space-y-5">
      {showModal && (
        <NewAlertModal
          employees={employees}
          onClose={() => setShowModal(false)}
          onAdd={(a) => setManualAlerts((prev) => [a, ...prev])}
        />
      )}

      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
        Theo dõi bất thường về lương, chấm công và các thông báo quan trọng.
      </p>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'var(--badge-critical-bg)', color: 'var(--badge-critical-text)' }}>
          {error}
        </div>
      )}

      {/* ── Summary KPIs ── */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: 'Tổng cảnh báo', val: counts.total, color: 'var(--color-text)' },
          { label: 'Nghiêm trọng',   val: counts.critical, color: 'var(--badge-critical-text)' },
          { label: 'Cảnh báo',       val: counts.warning,  color: 'var(--badge-warning-text)'  },
          { label: 'Thông tin',      val: counts.info,     color: 'var(--badge-info-text)'      },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>{k.label}</p>
            <p className="text-2xl font-extrabold mt-1" style={{ color: k.color }}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>Cảnh báo và thông báo</h2>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            <Plus className="h-4 w-4" /> Tạo cảnh báo
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 items-end">
          {/* Threshold */}
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-muted)' }}>Ngưỡng vắng (ngày)</p>
            <input
              type="number" min="1" max="30" value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm outline-none w-20"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
            />
          </div>
          {/* Type filter */}
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-muted)' }}>Loại cảnh báo</p>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm outline-none"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', minWidth: 150 }}>
              <option value="">Tất cả loại</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {/* Severity filter */}
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-muted)' }}>Mức độ</p>
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm outline-none"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', minWidth: 130 }}>
              <option value="">Tất cả</option>
              <option value="critical">Nghiêm trọng</option>
              <option value="warning">Cảnh báo</option>
              <option value="info">Thông tin</option>
            </select>
          </div>
          {/* Reset filters */}
          {(typeFilter || severityFilter) && (
            <button type="button" onClick={() => { setTypeFilter(''); setSeverityFilter(''); }}
              className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-slate-50"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
              <Filter className="h-3.5 w-3.5" /> Đặt lại
            </button>
          )}
        </div>
      </div>

      {/* ── Table + Side panel ── */}
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
              Cảnh báo đang hoạt động <span className="font-normal text-xs ml-1" style={{ color: 'var(--color-muted)' }}>({filtered.length})</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                  {['Loại cảnh báo', 'Nhân viên', 'Nội dung', 'Mức độ', 'Ngày', 'Thao tác'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 rounded animate-pulse" style={{ background: 'var(--color-bg)' }} /></td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
                      <Info className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--color-border)' }} />
                      Không có cảnh báo nào. Hệ thống đang hoạt động bình thường.
                    </td>
                  </tr>
                ) : (
                  filtered.map((alert) => (
                    <tr key={alert.id} onClick={() => setSelectedId(alert.id)}
                      className="cursor-pointer transition-colors hover:bg-slate-50"
                      style={{
                        borderBottom: '1px solid var(--color-border)',
                        background: selected?.id === alert.id ? 'var(--color-primary-soft)' : undefined,
                      }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <AlertIcon type={alert.type} />
                          <span className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>{alert.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-text)' }}>{alert.employeeName}</td>
                      <td className="px-4 py-3 text-xs max-w-xs truncate" style={{ color: 'var(--color-muted)' }}>{alert.summary}</td>
                      <td className="px-4 py-3"><SeverityBadge severity={alert.severity} /></td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>
                        <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date().toLocaleDateString('vi-VN')}</div>
                      </td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedId(alert.id); }}
                          className="rounded-lg p-1 hover:bg-blue-50" style={{ color: 'var(--color-primary)' }}>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>Chi tiết cảnh báo nhân viên</h3>
            {selected && (
              <button type="button" onClick={() => setSelectedId(null)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="h-4 w-4" style={{ color: 'var(--color-muted)' }} />
              </button>
            )}
          </div>

          {selected ? (
            <div className="p-5 space-y-4">
              {/* Employee info */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>Thông tin nhân viên</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-sm"
                    style={{ background: 'var(--color-primary)' }}>
                    {(selected.employeeName || 'U').charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{selected.employeeName}</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>ID: EMP-{String(selected.employeeId).padStart(3, '0')}</p>
                  </div>
                </div>
                <div className="rounded-xl p-3 space-y-2" style={{ background: 'var(--color-bg)' }}>
                  {[
                    ['Loại cảnh báo', selected.type],
                    ['Mức độ', SEVERITY_MAP[selected.severity]?.label ?? selected.severity],
                    ['Mã nhân viên', `#${selected.employeeId}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span style={{ color: 'var(--color-muted)' }}>{k}:</span>
                      <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detail */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>Dữ liệu liên quan</p>
                <div className="rounded-xl p-3" style={{ background: 'var(--color-bg)' }}>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text)' }}>{selected.detail}</p>
                </div>
              </div>

              <SeverityBadge severity={selected.severity} />

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                <button type="button" onClick={() => dismiss(selected.id)}
                  className="rounded-xl py-2 text-sm font-semibold hover:bg-slate-50"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                  Bỏ qua
                </button>
                <button type="button" onClick={() => investigate(selected)}
                  className="rounded-xl py-2 text-sm font-semibold text-white"
                  style={{ background: 'var(--color-primary)' }}>
                  Điều tra
                </button>
                <button type="button" onClick={() => forward(selected)}
                  className="rounded-xl py-2 text-sm font-semibold hover:bg-slate-50"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                  Gửi quản lý
                </button>
                <button type="button" onClick={() => { const n = window.prompt('Ghi chú:'); if (n) window.alert(`Đã lưu ghi chú: "${n}"`); }}
                  className="rounded-xl py-2 text-sm font-semibold hover:bg-slate-50"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                  Thêm ghi chú
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-2 px-5">
              <Info className="h-8 w-8" style={{ color: 'var(--color-border)' }} />
              <p className="text-sm text-center" style={{ color: 'var(--color-muted)' }}>Chọn một cảnh báo để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
