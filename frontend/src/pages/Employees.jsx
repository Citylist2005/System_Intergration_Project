import { useEffect, useState } from 'react';
import { PencilLine, Plus, Search, Trash2 } from 'lucide-react';
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
} from '../api/services/employeesService';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/ui/EmptyState';
import { InputField, SelectField } from '../components/ui/Field';
import InfoCard from '../components/ui/InfoCard';
import InlineMessage from '../components/ui/InlineMessage';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import SectionToolbar from '../components/ui/SectionToolbar';
import StatusBadge from '../components/ui/StatusBadge';
import { employeeStatusOptions, STATUS_OPTIONS } from '../utils/constants';

const defaultStatus = STATUS_OPTIONS[0] ?? 'Active';

const defaultForm = {
  EmployeeID: '',
  FullName: '',
  DepartmentID: '',
  PositionID: '',
  Status: defaultStatus,
};

function getActionErrorMessage(error, fallbackMessage) {
  const responseMessage = error?.response?.data?.message;

  if (Array.isArray(responseMessage)) {
    return responseMessage.join(', ');
  }

  return responseMessage || error?.message || fallbackMessage;
}

export default function Employees() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [modalMode, setModalMode] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [actionMessage, setActionMessage] = useState('');
  const [actionTone, setActionTone] = useState('success');
  const [submitting, setSubmitting] = useState(false);

  async function loadEmployees(activeQuery = filters) {
    setLoading(true);
    setError('');

    try {
      const response = await getEmployees({
        search: activeQuery.search || undefined,
        status: activeQuery.status || undefined,
      });
      setRows(response.data ?? []);
      setMeta(response.meta ?? null);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Không thể tải danh sách nhân viên.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadEmployees(filters);
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [filters.search, filters.status]);

  function openCreateModal() {
    setForm(defaultForm);
    setActionMessage('');
    setActionTone('success');
    setModalMode('create');
  }

  function openEditModal(employee) {
    setForm({
      EmployeeID: String(employee.EmployeeID ?? ''),
      FullName: employee.FullName ?? '',
      DepartmentID: String(employee.DepartmentID ?? ''),
      PositionID: String(employee.PositionID ?? ''),
      Status: employee.Status ?? defaultStatus,
    });
    setActionMessage('');
    setActionTone('success');
    setModalMode('edit');
  }

  function openDeleteModal(employee) {
    setForm({
      EmployeeID: String(employee.EmployeeID ?? ''),
      FullName: employee.FullName ?? '',
      DepartmentID: String(employee.DepartmentID ?? ''),
      PositionID: String(employee.PositionID ?? ''),
      Status: employee.Status ?? defaultStatus,
    });
    setActionMessage('');
    setActionTone('success');
    setModalMode('delete');
  }

  function closeModal() {
    setModalMode('');
    setActionMessage('');
    setActionTone('success');
    setSubmitting(false);
  }

  async function handleEmployeeAction(event) {
    event.preventDefault();
    setSubmitting(true);
    setActionMessage('');

    try {
      if (modalMode === 'create') {
        await createEmployee({
          EmployeeID: Number(form.EmployeeID),
          FullName: form.FullName.trim(),
          DepartmentID: Number(form.DepartmentID),
          PositionID: Number(form.PositionID),
          Status: form.Status,
        });
        setActionTone('success');
        setActionMessage('Tạo nhân viên thành công.');
      } else if (modalMode === 'edit') {
        await updateEmployee(Number(form.EmployeeID), {
          FullName: form.FullName.trim(),
          DepartmentID: Number(form.DepartmentID),
          PositionID: Number(form.PositionID),
          Status: form.Status,
        });
        setActionTone('success');
        setActionMessage('Cập nhật nhân viên thành công.');
      } else if (modalMode === 'delete') {
        await deleteEmployee(Number(form.EmployeeID));
        setActionTone('success');
        setActionMessage('Xóa nhân viên thành công.');
        setRows((current) =>
          current.filter((row) => row.EmployeeID !== Number(form.EmployeeID)),
        );
        setMeta((current) =>
          current
            ? {
                ...current,
                total: Math.max(0, Number(current.total ?? 0) - 1),
              }
            : current,
        );
      }

      await loadEmployees(filters);
      window.setTimeout(() => {
        closeModal();
      }, 700);
    } catch (actionError) {
      setActionTone('danger');
      setActionMessage(
        getActionErrorMessage(
          actionError,
          modalMode === 'delete'
            ? 'Không thể xóa nhân viên.'
            : 'Không thể lưu thông tin nhân viên.',
        ),
      );
    } finally {
      setSubmitting(false);
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
      render: (row) => (
        <span className="font-medium text-slate-700">{row.FullName}</span>
      ),
    },
    {
      key: 'DepartmentID',
      header: 'Phòng ban',
      render: (row) => row.DepartmentID ?? 'N/A',
    },
    {
      key: 'PositionID',
      header: 'Chức vụ',
      render: (row) => row.PositionID ?? 'N/A',
    },
    {
      key: 'Status',
      header: 'Trạng thái',
      render: (row) => <StatusBadge status={row.Status} />,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => openEditModal(row)}>
            <PencilLine className="mr-2 h-4 w-4" />
            Sửa
          </Button>
          <Button variant="danger" size="sm" onClick={() => openDeleteModal(row)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Nhân viên"
        title="Quản lý nhân viên"
        description="Tra cứu và quản lý hồ sơ nhân viên trong không gian làm việc nhân sự - tiền lương."
        action={
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm nhân viên
          </Button>
        }
      />

      {error ? <InlineMessage tone="danger">{error}</InlineMessage> : null}

      <InfoCard
        title="Danh sách nhân viên"
        description={`Đang hiển thị ${meta?.total ?? rows.length} nhân viên.`}
      >
        <SectionToolbar>
          <div className="grid flex-1 gap-3 md:grid-cols-[1.8fr_1fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={filters.search}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, search: event.target.value }))
                }
                placeholder="Tìm theo tên nhân viên"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({ ...current, status: event.target.value }))
              }
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            >
              {employeeStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </SectionToolbar>

        {rows.length > 0 || loading ? (
          <DataTable
            columns={columns}
            rows={rows}
            loading={loading}
            rowKey="EmployeeID"
            emptyMessage="Không tìm thấy nhân viên."
          />
        ) : (
          <EmptyState
            title="Không tìm thấy nhân viên"
            description="Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc trạng thái."
          />
        )}
      </InfoCard>

      <Modal
        open={Boolean(modalMode)}
        title={
          modalMode === 'create'
            ? 'Thêm nhân viên'
            : modalMode === 'edit'
              ? 'Chỉnh sửa nhân viên'
              : 'Xóa nhân viên'
        }
        description={
          modalMode === 'delete'
            ? 'Xóa sẽ làm nhân viên biến mất khỏi danh sách mặc định.'
            : 'Tạo mới và cập nhật thông tin nhân viên trong cơ sở dữ liệu lương.'
        }
        onClose={closeModal}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeModal}>
              Hủy
            </Button>
            <Button
              variant={modalMode === 'delete' ? 'danger' : 'primary'}
              onClick={handleEmployeeAction}
              disabled={submitting}
            >
              {submitting
                ? modalMode === 'delete'
                  ? 'Đang xóa...'
                  : 'Đang lưu...'
                : modalMode === 'delete'
                  ? 'Xóa nhân viên'
                  : 'Lưu nhân viên'}
            </Button>
          </div>
        }
      >
        {modalMode === 'delete' ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Bạn đang chuẩn bị xóa <strong>{form.FullName}</strong> (#{form.EmployeeID}).
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Sau khi xóa, nhân viên này sẽ không còn hiển thị trong danh sách mặc định.
            </div>
          </div>
        ) : (
          <form className="grid gap-4 md:grid-cols-2">
            <InputField
              label="Mã nhân viên"
              type="number"
              value={form.EmployeeID}
              onChange={(event) =>
                setForm((current) => ({ ...current, EmployeeID: event.target.value }))
              }
              placeholder="Nhập mã nhân viên"
              disabled={modalMode === 'edit'}
            />
            <SelectField
              label="Trạng thái"
              value={form.Status}
              onChange={(event) =>
                setForm((current) => ({ ...current, Status: event.target.value }))
              }
              options={employeeStatusOptions.filter((option) => option.value)}
            />
            <InputField
              label="Mã phòng ban"
              type="number"
              value={form.DepartmentID}
              onChange={(event) =>
                setForm((current) => ({ ...current, DepartmentID: event.target.value }))
              }
              placeholder="Nhập mã phòng ban"
            />
            <InputField
              label="Mã chức vụ"
              type="number"
              value={form.PositionID}
              onChange={(event) =>
                setForm((current) => ({ ...current, PositionID: event.target.value }))
              }
              placeholder="Nhập mã chức vụ"
            />
            <div className="md:col-span-2">
              <InputField
                label="Họ và tên"
                value={form.FullName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, FullName: event.target.value }))
                }
                placeholder="Nhập họ và tên"
              />
            </div>
          </form>
        )}
        {actionMessage ? (
          <div className="mt-4">
            <InlineMessage tone={actionTone}>{actionMessage}</InlineMessage>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
