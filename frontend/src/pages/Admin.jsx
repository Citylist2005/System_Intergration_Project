import { useMemo, useState } from 'react';
import {
  BadgeDollarSign,
  DatabaseBackup,
  FileClock,
  HeartPulse,
  RefreshCcw,
  ShieldCheck,
  SlidersHorizontal,
  Building2,
  BriefcaseBusiness,
  UserCog,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import ManagementPage from './ManagementPage';
import Sync from './Sync';
import { managementConfigs } from './managementConfigs';

const adminModules = [
  {
    id: 'departments',
    group: 'Cơ cấu tổ chức',
    title: 'Phòng ban',
    description: 'Quản lý danh mục phòng ban.',
    icon: Building2,
    content: <ManagementPage config={managementConfigs.departments} />,
  },
  {
    id: 'positions',
    group: 'Cơ cấu tổ chức',
    title: 'Chức vụ',
    description: 'Quản lý danh mục chức vụ.',
    icon: BriefcaseBusiness,
    content: <ManagementPage config={managementConfigs.positions} />,
  },
  {
    id: 'users',
    group: 'Bảo mật',
    title: 'Người dùng',
    description: 'Quản lý tài khoản và phân quyền.',
    icon: UserCog,
    content: <ManagementPage config={managementConfigs.users} />,
  },
  {
    id: 'backup',
    group: 'Bảo mật',
    title: 'Sao lưu',
    description: 'Theo dõi bản sao lưu và trạng thái bảo mật.',
    icon: DatabaseBackup,
    content: <ManagementPage config={managementConfigs.systemBackup} />,
  },
  {
    id: 'audit',
    group: 'Bảo mật',
    title: 'Nhật ký hệ thống',
    description: 'Tra cứu thao tác quan trọng đã ghi log.',
    icon: FileClock,
    content: <ManagementPage config={managementConfigs.auditLogs} />,
  },
  {
    id: 'sync',
    group: 'Vận hành',
    title: 'Đồng bộ',
    description: 'Chạy và theo dõi đồng bộ dữ liệu.',
    icon: RefreshCcw,
    content: <Sync />,
  },
  {
    id: 'salary',
    group: 'Cấu hình lương',
    title: 'Chính sách lương',
    description: 'Cấu hình khung lương, thuế và hệ số.',
    icon: SlidersHorizontal,
    content: <ManagementPage config={managementConfigs.salaryPolicies} />,
  },
  {
    id: 'benefits',
    group: 'Cấu hình lương',
    title: 'Phúc lợi',
    description: 'Quản lý phúc lợi và bảo hiểm.',
    icon: HeartPulse,
    content: <ManagementPage config={managementConfigs.benefitsInsurance} />,
  },
  {
    id: 'adjustments',
    group: 'Cấu hình lương',
    title: 'Điều chỉnh lương',
    description: 'Quản lý thưởng, khấu trừ và phụ cấp.',
    icon: BadgeDollarSign,
    content: <ManagementPage config={managementConfigs.payrollAdjustments} />,
  },
];

export default function Admin() {
  const [activeId, setActiveId] = useState('users');
  const activeModule = adminModules.find((module) => module.id === activeId) ?? adminModules[0];
  const groups = useMemo(() => [...new Set(adminModules.map((module) => module.group))], []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Quản trị"
        title="Trung tâm quản trị"
        description="Khu vực gom các chức năng bảo mật, đồng bộ và cấu hình lương để sidebar gọn hơn."
      />

      <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
        <aside className="space-y-5 rounded-[24px] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--color-text)]">Nhóm chức năng</p>
              <p className="text-xs text-[var(--color-muted)]">Phù hợp trình bày đồ án</p>
            </div>
          </div>

          {groups.map((group) => (
            <div key={group} className="space-y-2">
              <p className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {group}
              </p>
              {adminModules
                .filter((module) => module.group === group)
                .map(({ id, title, description, icon: Icon }) => {
                  const active = id === activeId;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveId(id)}
                      className="flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition"
                      style={{
                        borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                        background: active ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                      }}
                    >
                      <Icon
                        className="mt-0.5 h-4 w-4 flex-shrink-0"
                        style={{ color: active ? 'var(--color-primary-dark)' : 'var(--color-muted)' }}
                      />
                      <span>
                        <span className="block text-sm font-semibold text-[var(--color-text)]">
                          {title}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--color-muted)]">
                          {description}
                        </span>
                      </span>
                    </button>
                  );
                })}
            </div>
          ))}
        </aside>

        <section className="min-w-0">{activeModule.content}</section>
      </div>
    </div>
  );
}
