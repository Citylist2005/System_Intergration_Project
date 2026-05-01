/**
 * exportUtils.js
 * Shared export helpers for Excel (xlsx) and PDF (jspdf-autotable).
 * 
 * PDF NOTE: jsPDF's built-in fonts (Helvetica) do NOT support Vietnamese diacritics.
 * We strip diacritics for PDF output; Excel keeps full Unicode (xlsx handles it natively).
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDateLabel } from './formatters';

// ─── Vietnamese → ASCII (PDF only) ───────────────────────────────────────────
const VN_MAP = [
  [/[àáạảãâầấậẩẫăằắặẳẵ]/gi, (c) => (/[A-Z]/.test(c) ? 'A' : 'a')],
  [/[èéẹẻẽêềếệểễ]/gi,       (c) => (/[A-Z]/.test(c) ? 'E' : 'e')],
  [/[ìíịỉĩ]/gi,              (c) => (/[A-Z]/.test(c) ? 'I' : 'i')],
  [/[òóọỏõôồốộổỗơờớợởỡ]/gi, (c) => (/[A-Z]/.test(c) ? 'O' : 'o')],
  [/[ùúụủũưừứựửữ]/gi,       (c) => (/[A-Z]/.test(c) ? 'U' : 'u')],
  [/[ỳýỵỷỹ]/gi,             (c) => (/[A-Z]/.test(c) ? 'Y' : 'y')],
  [/đ/g, 'd'],
  [/Đ/g, 'D'],
];

export function removeVN(str) {
  if (!str) return '';
  let s = String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  for (const [pattern, repl] of VN_MAP) {
    s = s.replace(pattern, typeof repl === 'function' ? repl : repl);
  }
  return s;
}

// Safe cell value for PDF (numbers stay numbers, strings get VN stripped)
function pdfVal(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return v;
  return removeVN(String(v));
}

function pdfCurrency(value) {
  const amount = Number(value ?? 0);
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount)} VND`;
}

// ─── Excel helpers ────────────────────────────────────────────────────────────
function sheetHeader(ws, title, cols) {
  XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: 'A1' });
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: cols - 1 } });
  if (ws['A1']) {
    ws['A1'].s = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } };
  }
}

function autoColWidth(ws, data) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  ws['!cols'] = keys.map((k) => ({
    wch: Math.max(k.length, ...data.map((r) => String(r[k] ?? '').length), 10) + 2,
  }));
}

// ─── PDF page footer ──────────────────────────────────────────────────────────
function addPageNumbers(doc) {
  const n = doc.internal.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160);
    doc.text(
      `HR Payroll System  |  Page ${i}/${n}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 7,
      { align: 'center' },
    );
  }
}

// ─── Standard autoTable styles ────────────────────────────────────────────────
const TABLE_STYLES = {
  styles:            { fontSize: 8.5, cellPadding: 3 },
  headStyles:        { fillColor: [30, 35, 72], textColor: 255, fontStyle: 'bold', fontSize: 9 },
  alternateRowStyles:{ fillColor: [243, 246, 255] },
  tableLineColor:    [220, 225, 240],
  tableLineWidth:    0.2,
};

// ═══════════════════════════════════════════════════════════════════════════════
// HR / Employee exports
// ═══════════════════════════════════════════════════════════════════════════════
export function exportEmployeesExcel(employees) {
  const wb = XLSX.utils.book_new();
  const rows = employees.map((e) => ({
    'ID':           e.EmployeeID,
    'Ho ten':       e.FullName ?? '',
    'Phong ban':    `Phong ban ${e.DepartmentID ?? '-'}`,
    'Vi tri':       e.PositionID ?? '-',
    'Trang thai':   e.Status ?? '',
    'Email':        e.Email ?? '',
    'Dien thoai':   e.Phone ?? '',
    'Ngay vao lam': e.HireDate ? new Date(e.HireDate).toLocaleDateString('vi-VN') : '',
  }));
  const ws = XLSX.utils.json_to_sheet(rows, { origin: 'A2' });
  sheetHeader(ws, 'Bao cao Nhan su (HR Report)', 8);
  autoColWidth(ws, rows);
  XLSX.utils.book_append_sheet(wb, ws, 'HR Report');
  XLSX.writeFile(wb, `HR_Report_hr_${today()}.xlsx`);
}

export function exportEmployeesPDF(employees) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const now = new Date().toLocaleDateString('vi-VN');
  pdfTitle(doc, 'HR Report - Bao cao Nhan su', `Xuat ngay: ${now}  |  Tong: ${employees.length} nhan vien`);
  autoTable(doc, {
    ...TABLE_STYLES,
    startY: 28,
    head: [['ID', 'Ho ten', 'Phong ban', 'Vi tri', 'Trang thai', 'Email', 'Dien thoai', 'Ngay vao lam']],
    body: employees.map((e) => [
      e.EmployeeID,
      pdfVal(e.FullName),
      pdfVal(`Phong ban ${e.DepartmentID ?? '-'}`),
      pdfVal(e.PositionID ?? '-'),
      pdfVal(e.Status),
      pdfVal(e.Email),
      pdfVal(e.Phone),
      e.HireDate ? new Date(e.HireDate).toLocaleDateString('vi-VN') : '',
    ]),
    columnStyles: { 0: { cellWidth: 12 } },
  });
  addPageNumbers(doc);
  doc.save(`HR_Report_hr_${today()}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Payroll exports
// ═══════════════════════════════════════════════════════════════════════════════
export function exportPayrollExcel(payroll, meta = {}) {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  if (meta.month || meta.year) {
    const summaryRows = [
      { 'Thong tin': 'Ky luong', 'Gia tri': `Thang ${meta.month ?? '-'}/${meta.year ?? '-'}` },
      { 'Thong tin': 'Tong nhan vien', 'Gia tri': payroll.length },
      { 'Thong tin': 'Tong luong co ban', 'Gia tri': payroll.reduce((s, r) => s + Number(r.BaseSalary ?? 0), 0) },
      { 'Thong tin': 'Tong thuong', 'Gia tri': payroll.reduce((s, r) => s + Number(r.Bonus ?? 0), 0) },
      { 'Thong tin': 'Tong khau tru', 'Gia tri': payroll.reduce((s, r) => s + Number(r.Deductions ?? 0), 0) },
      { 'Thong tin': 'Tong khau tru vang mat', 'Gia tri': payroll.reduce((s, r) => s + Number(r.AttendanceDeduction ?? 0), 0) },
      { 'Thong tin': 'Tong thuc linh', 'Gia tri': payroll.reduce((s, r) => s + Number(r.NetSalary ?? 0), 0) },
    ];
    const wsSum = XLSX.utils.json_to_sheet(summaryRows, { origin: 'A2' });
    sheetHeader(wsSum, 'Tom tat Bang luong', 2);
    wsSum['!cols'] = [{ wch: 22 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSum, 'Summary');
  }

  // Detail sheet
  const rows = payroll.map((s) => ({
    'Salary ID':    s.SalaryID,
    'Nhan vien':    s.FullName ?? `#${s.EmployeeID}`,
    'Ky luong':     formatDateLabel(s.SalaryMonth),
    'Luong co ban': Number(s.BaseSalary ?? 0),
    'Thuong':       Number(s.Bonus ?? 0),
    'Khau tru':     Number(s.Deductions ?? 0),
    'Khau tru vang mat': Number(s.AttendanceDeduction ?? 0),
    'Ngay cong':    s.WorkDays ?? '',
    'Ngay vang':    s.AbsentDays ?? '',
    'Ngay nghi phep': s.LeaveDays ?? '',
    'Thuc linh':    Number(s.NetSalary ?? 0),
    'Ngay tao':     s.CreatedAt ? new Date(s.CreatedAt).toLocaleDateString('vi-VN') : '',
  }));
  const ws = XLSX.utils.json_to_sheet(rows, { origin: 'A2' });
  sheetHeader(ws, 'Chi tiet Bang luong (Payroll Report)', 8);
  autoColWidth(ws, rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Payroll Detail');
  XLSX.writeFile(wb, `HR_Report_payroll_${today()}.xlsx`);
}

export function exportPayrollPDF(payroll, meta = {}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const now = new Date().toLocaleDateString('vi-VN');
  const period = meta.month ? `Thang ${meta.month}/${meta.year ?? ''}` : 'Tat ca';
  pdfTitle(
    doc,
    'Payroll Report - Bang Luong',
    `Xuat ngay: ${now}  |  Ky: ${period}  |  Tong: ${payroll.length} ban ghi`,
  );

  // Summary box
  const totalNet  = payroll.reduce((s, r) => s + Number(r.NetSalary  ?? 0), 0);
  const totalBase = payroll.reduce((s, r) => s + Number(r.BaseSalary ?? 0), 0);
  const totalBonus = payroll.reduce((s, r) => s + Number(r.Bonus ?? 0), 0);
  const totalDed   = payroll.reduce((s, r) => s + Number(r.Deductions ?? 0), 0);
  const totalAttendanceDed = payroll.reduce((s, r) => s + Number(r.AttendanceDeduction ?? 0), 0);

  autoTable(doc, {
    ...TABLE_STYLES,
    startY: 28,
    head: [['Chi tieu', 'Gia tri (VND)']],
    body: [
      ['Tong luong co ban', pdfCurrency(totalBase)],
      ['Tong thuong',       pdfCurrency(totalBonus)],
      ['Tong khau tru',     pdfCurrency(totalDed)],
      ['Tong khau tru vang mat', pdfCurrency(totalAttendanceDed)],
      ['TONG THUC LINH',    pdfCurrency(totalNet)],
    ],
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    headStyles: { fillColor: [30, 35, 72], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [243, 246, 255] },
    tableWidth: 150,
  });

  // Detail table
  const afterSummary = doc.lastAutoTable.finalY + 6;
  doc.setFontSize(10);
  doc.setTextColor(30, 35, 72);
  doc.setFont('helvetica', 'bold');
  doc.text('Chi tiet tung nhan vien:', 14, afterSummary);

  autoTable(doc, {
    ...TABLE_STYLES,
    startY: afterSummary + 4,
    head: [['ID', 'Nhan vien', 'Ky luong', 'Luong co ban', 'Thuong', 'Khau tru', 'Tru vang', 'Thuc linh', 'Ngay tao']],
    body: payroll.map((s) => [
      s.SalaryID,
      pdfVal(s.FullName ?? `#${s.EmployeeID}`),
      pdfVal(formatDateLabel(s.SalaryMonth)),
      pdfCurrency(s.BaseSalary),
      pdfCurrency(s.Bonus),
      pdfCurrency(s.Deductions),
      pdfCurrency(s.AttendanceDeduction),
      pdfCurrency(s.NetSalary),
      s.CreatedAt ? new Date(s.CreatedAt).toLocaleDateString('vi-VN') : '',
    ]),
    columnStyles: {
      0: { cellWidth: 12 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 26 },
      5: { halign: 'right', cellWidth: 26 },
      6: { halign: 'right', cellWidth: 24 },
      7: { halign: 'right', cellWidth: 30, fontStyle: 'bold' },
    },
  });

  addPageNumbers(doc);
  doc.save(`HR_Report_payroll_${today()}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Attendance exports
// ═══════════════════════════════════════════════════════════════════════════════
export function exportAttendanceExcel(attendance) {
  const wb = XLSX.utils.book_new();
  const rows = attendance.map((a) => ({
    'ID':           a.EmployeeID,
    'Ho ten':       a.FullName ?? '',
    'Ngay cong':    Number(a.WorkDays ?? 0),
    'Ngay vang':    Number(a.AbsentDays ?? 0),
    'Nghi phep':    Number(a.LeaveDays ?? 0),
  }));
  const ws = XLSX.utils.json_to_sheet(rows, { origin: 'A2' });
  sheetHeader(ws, 'Bao cao Cham cong (Attendance Report)', 5);
  autoColWidth(ws, rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
  XLSX.writeFile(wb, `HR_Report_attendance_${today()}.xlsx`);
}

export function exportAttendancePDF(attendance) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  pdfTitle(doc, 'Attendance Report - Cham Cong', `Xuat ngay: ${new Date().toLocaleDateString('vi-VN')}  |  Tong: ${attendance.length}`);
  autoTable(doc, {
    ...TABLE_STYLES,
    startY: 28,
    head: [['ID', 'Ho ten', 'Ngay cong', 'Ngay vang', 'Nghi phep']],
    body: attendance.map((a) => [
      a.EmployeeID,
      pdfVal(a.FullName),
      a.WorkDays ?? 0,
      a.AbsentDays ?? 0,
      a.LeaveDays ?? 0,
    ]),
    columnStyles: { 2: { halign: 'center' }, 3: { halign: 'center' }, 4: { halign: 'center' } },
  });
  addPageNumbers(doc);
  doc.save(`HR_Report_attendance_${today()}.pdf`);
}

// ─── Combined (Dividend) export ───────────────────────────────────────────────
export function exportDividendExcel(employees, payroll, attendance) {
  const wb = XLSX.utils.book_new();
  // employees sheet
  const empRows = employees.map((e) => ({ 'ID': e.EmployeeID, 'Ho ten': e.FullName ?? '', 'Phong ban': `Phong ban ${e.DepartmentID ?? '-'}`, 'Trang thai': e.Status ?? '' }));
  const wsEmp = XLSX.utils.json_to_sheet(empRows, { origin: 'A2' });
  sheetHeader(wsEmp, 'Nhan su', 4); autoColWidth(wsEmp, empRows);
  XLSX.utils.book_append_sheet(wb, wsEmp, 'HR');
  // payroll sheet
  const payRows = payroll.map((s) => ({ 'ID': s.SalaryID, 'Nhan vien': s.FullName ?? `#${s.EmployeeID}`, 'Ky luong': formatDateLabel(s.SalaryMonth), 'Luong co ban': Number(s.BaseSalary ?? 0), 'Thuong': Number(s.Bonus ?? 0), 'Khau tru': Number(s.Deductions ?? 0), 'Thuc linh': Number(s.NetSalary ?? 0) }));
  const wsPay = XLSX.utils.json_to_sheet(payRows, { origin: 'A2' });
  sheetHeader(wsPay, 'Bang luong', 7); autoColWidth(wsPay, payRows);
  XLSX.utils.book_append_sheet(wb, wsPay, 'Payroll');
  XLSX.writeFile(wb, `HR_Report_dividend_${today()}.xlsx`);
}

export function exportDividendPDF(employees, payroll) {
  exportPayrollPDF(payroll);
}

// ─── Reports page dispatcher ──────────────────────────────────────────────────
export function doExportExcel(activeReport, employees, payroll, attendance) {
  switch (activeReport) {
    case 'hr':         return exportEmployeesExcel(employees);
    case 'payroll':    return exportPayrollExcel(payroll);
    case 'attendance': return exportAttendanceExcel(attendance);
    case 'dividend':   return exportDividendExcel(employees, payroll, attendance);
    default:           return exportEmployeesExcel(employees);
  }
}

export function doExportPDF(activeReport, employees, payroll, attendance) {
  switch (activeReport) {
    case 'hr':         return exportEmployeesPDF(employees);
    case 'payroll':    return exportPayrollPDF(payroll);
    case 'attendance': return exportAttendancePDF(attendance);
    case 'dividend':   return exportDividendPDF(employees, payroll);
    default:           return exportEmployeesPDF(employees);
  }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────
function today() { return new Date().toISOString().slice(0, 10); }

function pdfTitle(doc, title, subtitle) {
  doc.setFontSize(15);
  doc.setTextColor(30, 35, 72);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 14);
  if (subtitle) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(subtitle, 14, 21);
  }
}
