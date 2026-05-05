import { useEffect, useState } from 'react';
import { PencilLine, Plus, Search, Trash2 } from 'lucide-react';
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  hardDeleteEmployee,
  updateEmployee,
} from '../api/services/employeesService';
import { listRecords } from '../api/services/srsService';
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
import { useAuth } from '../hooks/useAuth';

const defaultStatus = STATUS_OPTIONS[0] ?? 'Active';
const activeStatusValue = 'Active';
const allStatusesValue = 'ALL';

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
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('employee.create');
  const canUpdate = hasPermission('employee.update');
  const canDelete = hasPermission('employee.delete');

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', status: allStatusesValue });
  const [modalMode, setModalMode] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [actionMessage, setActionMessage] = useState('');
  const [actionTone, setActionTone] = useState('success');
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  async function loadEmployees(activeQuery = filters) {
    setLoading(true);
    setError('');

    try {
      const response = await getEmployees({
        search: activeQuery.search || undefined,
        status: activeQuery.status || undefined,
        limit: 1000,
      });
      setRows(response.data ?? []);
      setMeta(response.meta ?? null);
    } catch (loadError) {
      setError(loadError?.message || 'Không thể tải danh sách nhân viên.');
    } finally {
      setLoading(false);
    }
  }

  async function loadMetadata() {
    try {
      const [deptRes, posRes] = await Promise.all([
        listRecords('/departments', { limit: 100 }),
        listRecords('/positions', { limit: 100 }),
      ]);
      setDepartments(deptRes.data ?? []);
      setPositions(posRes.data ?? []);
    } catch (e) {
      console.error('Failed to load metadata', e);
    }
  }

  useEffect(() => {
    loadMetadata();
  }, []);

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

  function openDeactivateModal(employee) {
    setForm({
      EmployeeID: String(employee.EmployeeID ?? ''),
      FullName: employee.FullName ?? '',
      DepartmentID: String(employee.DepartmentID ?? ''),
      PositionID: String(employee.PositionID ?? ''),
      Status: employee.Status ?? defaultStatus,
    });
    setActionMessage('');
    setActionTone('success');
    setModalMode('deactivate');
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
      } else if (modalMode === 'deactivate') {
        await deleteEmployee(Number(form.EmployeeID));
        setActionTone('success');
        setActionMessage('Đã vô hiệu hóa nhân viên thành công.');
      } else if (modalMode === 'delete') {
        await hardDeleteEmployee(Number(form.EmployeeID));
        setActionTone('success');
        setActionMessage('Đã xóa nhân viên vĩnh viễn khỏi hệ thống.');
      }

      await loadEmployees(filters);
      window.setTimeout(() => {
        closeModal();
      }, 900);
    } catch (actionError) {
      setActionTone('danger');
      setActionMessage(
        getActionErrorMessage(
          actionError,
          modalMode === 'delete'
            ? 'Không thể xóa nhân viên này (có thể do dữ liệu đã được liên kết).'
            : modalMode === 'deactivate'
              ? 'Không thể vô hiệu hóa nhân viên.'
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
      render: (row) => row.DepartmentName ?? 'N/A',
    },
    {
      key: 'PositionID',
      header: 'Chức vụ',
      render: (row) => row.PositionName ?? 'N/A',
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
          {canUpdate && (
            <Button variant="secondary" size="sm" onClick={() => openEditModal(row)}>
              <PencilLine className="mr-2 h-4 w-4" />
              Sửa
            </Button>
          )}
          {canDelete && (
            <div className="flex gap-2">
              {row.Status !== 'Inactive' && (
                <Button variant="secondary" size="sm" onClick={() => openDeactivateModal(row)}>
                  Vô hiệu hóa
                </Button>
              )}
              <Button variant="danger" size="sm" onClick={() => openDeleteModal(row)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const editableStatusOptions = employeeStatusOptions.filter(
    (option) => option.value && option.value !== allStatusesValue,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Nhân viên"
        title="Quản lý nhân viên"
        description="Tra cứu và quản lý hồ sơ nhân viên trong cơ sở dữ liệu Payroll."
        action={
          canCreate ? (
            <Button onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm nhân viên
            </Button>
          ) : null
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
            description="Hãy điều chỉnh từ khóa tìm kiếm hoặc bộ lọc trạng thái."
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
              : modalMode === 'deactivate'
                ? 'Vô hiệu hóa nhân viên'
                : 'Xóa nhân viên'
        }
        description={
          modalMode === 'delete'
            ? 'Cảnh báo: Hành động này sẽ xóa vĩnh viễn nhân viên khỏi cơ sở dữ liệu. Không thể hoàn tác!'
            : modalMode === 'deactivate'
              ? 'Hành động này sẽ chuyển trạng thái nhân viên sang Ngừng hoạt động. Dữ liệu vẫn được giữ lại để đối soát.'
              : 'Tạo mới và cập nhật thông tin nhân viên trong cơ sở dữ liệu lương.'
        }
        onClose={closeModal}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeModal}>
              Hủy
            </Button>
            <Button
              variant={modalMode === 'delete' || modalMode === 'deactivate' ? 'danger' : 'primary'}
              onClick={handleEmployeeAction}
              disabled={submitting}
            >
              {submitting
                ? modalMode === 'delete'
                  ? 'Đang xóa...'
                  : modalMode === 'deactivate'
                    ? 'Đang vô hiệu hóa...'
                    : 'Đang lưu...'
                : modalMode === 'delete'
                  ? 'Xóa vĩnh viễn'
                  : modalMode === 'deactivate'
                    ? 'Xác nhận vô hiệu hóa'
                    : 'Lưu nhân viên'}
            </Button>
          </div>
        }
      >
        {modalMode === 'delete' || modalMode === 'deactivate' ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Bạn đang chuẩn bị {modalMode === 'delete' ? 'xóa vĩnh viễn' : 'vô hiệu hóa'} <strong>{form.FullName}</strong> (#{form.EmployeeID}).
            </div>
            <div className={`rounded-2xl p-4 text-sm ${modalMode === 'delete' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
              {modalMode === 'delete' 
                ? 'Sau thao tác này, toàn bộ dữ liệu của nhân viên này sẽ bị xóa khỏi hệ thống. Hành động này không thể hoàn tác.'
                : 'Nhân viên sẽ được chuyển sang trạng thái Ngừng hoạt động và không xuất hiện trong các danh sách mặc định.'}
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
              options={editableStatusOptions}
            />
            <SelectField
              label="Phòng ban"
              value={form.DepartmentID}
              onChange={(event) =>
                setForm((current) => ({ ...current, DepartmentID: event.target.value }))
              }
              options={[
                { label: '-- Chọn phòng ban --', value: '' },
                ...departments.map((d) => ({ label: d.DepartmentName, value: String(d.DepartmentID) })),
              ]}
            />
            <SelectField
              label="Chức vụ"
              value={form.PositionID}
              onChange={(event) =>
                setForm((current) => ({ ...current, PositionID: event.target.value }))
              }
              options={[
                { label: '-- Chọn chức vụ --', value: '' },
                ...positions.map((p) => ({ label: p.PositionName, value: String(p.PositionID) })),
              ]}
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
