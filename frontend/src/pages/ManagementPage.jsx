import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { PencilLine, Plus, Search, Trash2 } from 'lucide-react';
import {
  createRecord,
  deleteRecord,
  listRecords,
  updateRecord,
} from '../api/services/srsService';
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
import useAuth from '../hooks/useAuth';
import { canAccessEndpoint } from '../utils/accessControl';

function getInitialForm(fields) {
  return Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? '']));
}

function coerceValue(field, value) {
  if (value === '') {
    return null;
  }

  if (field.type === 'number') {
    return Number(value);
  }

  if (field.type === 'checkbox') {
    return Boolean(value);
  }

  return value;
}

function formatValue(row, field) {
  const value = row[field.name];

  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  if (field.badge) {
    return <StatusBadge status={String(value)} />;
  }

  if (field.type === 'checkbox') {
    return value ? 'Yes' : 'No';
  }

  if (field.format === 'json') {
    return typeof value === 'string' ? value : JSON.stringify(value);
  }

  return String(value);
}

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message;
  return Array.isArray(message) ? message.join(', ') : message || error?.message || fallback;
}

export default function ManagementPage({ config }) {
  const auth = useAuth();
  const hasEndpointAccess = canAccessEndpoint(config.endpoint, auth);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState('');
  const [form, setForm] = useState(() => getInitialForm(config.fields));
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState('success');
  const [submitting, setSubmitting] = useState(false);

  const visibleFields = useMemo(
    () => config.fields.filter((field) => field.table !== false),
    [config.fields],
  );

  async function load(activeSearch = search) {
    if (!hasEndpointAccess) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await listRecords(config.endpoint, {
        search: activeSearch || undefined,
        limit: 50,
      });
      setRows(response.data ?? []);
      setMeta(response.meta ?? null);
    } catch (loadError) {
      setError(getErrorMessage(loadError, `Không thể tải ${config.title}.`));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!hasEndpointAccess) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => load(search), 200);
    return () => window.clearTimeout(timeoutId);
  }, [config.endpoint, hasEndpointAccess, search]);

  if (!hasEndpointAccess) {
    return <Navigate to="/" replace />;
  }

  function openCreate() {
    setForm(getInitialForm(config.fields));
    setMessage('');
    setTone('success');
    setModalMode('create');
  }

  function openEdit(row) {
    setForm(
      Object.fromEntries(
        config.fields.map((field) => [
          field.name,
          row[field.name] === null || row[field.name] === undefined ? '' : row[field.name],
        ]),
      ),
    );
    setMessage('');
    setTone('success');
    setModalMode('edit');
  }

  function openDelete(row) {
    setForm(row);
    setMessage('');
    setTone('success');
    setModalMode('delete');
  }

  function closeModal() {
    setModalMode('');
    setMessage('');
    setTone('success');
    setSubmitting(false);
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      if (modalMode === 'delete') {
        await deleteRecord(config.endpoint, form[config.idField]);
        setMessage('Đã xóa hoặc vô hiệu hóa bản ghi.');
      } else {
        const payload = Object.fromEntries(
          config.fields
            .filter((field) => !field.readOnly)
            .map((field) => [field.name, coerceValue(field, form[field.name])]),
        );

        if (modalMode === 'create') {
          await createRecord(config.endpoint, payload);
          setMessage('Đã tạo bản ghi.');
        } else {
          await updateRecord(config.endpoint, form[config.idField], payload);
          setMessage('Đã cập nhật bản ghi.');
        }
      }

      setTone('success');
      await load(search);
      window.setTimeout(closeModal, 600);
    } catch (actionError) {
      setTone('danger');
      setMessage(getErrorMessage(actionError, 'Không thể lưu bản ghi.'));
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    ...visibleFields.map((field) => ({
      key: field.name,
      header: field.label,
      render: (row) => formatValue(row, field),
    })),
    ...(config.readOnly
      ? []
      : [
          {
            key: 'actions',
            header: 'Thao tác',
            render: (row) => (
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>
                  <PencilLine className="mr-2 h-4 w-4" />
                  Sửa
                </Button>
                <Button variant="danger" size="sm" onClick={() => openDelete(row)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </Button>
              </div>
            ),
          },
        ]),
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        action={
          config.readOnly ? null : (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm mới
            </Button>
          )
        }
      />

      {error ? <InlineMessage tone="danger">{error}</InlineMessage> : null}

      <InfoCard
        title={`Danh sách ${config.title.toLowerCase()}`}
        description={`Đang hiển thị ${meta?.total ?? rows.length} bản ghi.`}
      >
        <SectionToolbar>
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Tìm kiếm ${config.title.toLowerCase()}`}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </SectionToolbar>

        {rows.length > 0 || loading ? (
          <DataTable
            columns={columns}
            rows={rows}
            loading={loading}
            rowKey={config.idField}
            emptyMessage="Không có dữ liệu."
          />
        ) : (
          <EmptyState title="Không có dữ liệu" description="Điều chỉnh từ khóa tìm kiếm hoặc thêm bản ghi mới." />
        )}
      </InfoCard>

      <Modal
        open={Boolean(modalMode)}
        title={modalMode === 'delete' ? `Xóa ${config.title}` : `${modalMode === 'create' ? 'Thêm' : 'Cập nhật'} ${config.title}`}
        description={modalMode === 'delete' ? 'Hệ thống sẽ xóa hoặc vô hiệu hóa bản ghi nếu module hỗ trợ xóa mềm.' : 'Nhập thông tin và lưu bản ghi.'}
        onClose={closeModal}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeModal}>Hủy</Button>
            <Button variant={modalMode === 'delete' ? 'danger' : 'primary'} disabled={submitting} onClick={submit}>
              {submitting ? 'Đang lưu...' : modalMode === 'delete' ? 'Xóa' : 'Lưu'}
            </Button>
          </div>
        }
      >
        {modalMode === 'delete' ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            Xóa bản ghi #{form[config.idField]}?
          </div>
        ) : (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
            {config.fields.map((field) =>
              field.options ? (
                <SelectField
                  key={field.name}
                  label={field.label}
                  value={form[field.name] ?? ''}
                  disabled={field.readOnly || (modalMode === 'edit' && field.lockOnEdit)}
                  onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                  options={field.options}
                />
              ) : (
                <InputField
                  key={field.name}
                  label={field.label}
                  type={field.type ?? 'text'}
                  value={form[field.name] ?? ''}
                  disabled={field.readOnly || (modalMode === 'edit' && field.lockOnEdit)}
                  onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                  placeholder={field.placeholder ?? field.label}
                />
              ),
            )}
          </form>
        )}
        {message ? (
          <div className="mt-4">
            <InlineMessage tone={tone}>{message}</InlineMessage>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
