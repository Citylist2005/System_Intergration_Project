import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import ManagementPage from './ManagementPage';
import useAuth from '../hooks/useAuth';
import { canAccessEndpoint } from '../utils/accessControl';

export default function TabbedManagementPage({ tabs }) {
  const auth = useAuth();
  const roleKey = auth.roles.join('|');
  const permissionKey = auth.permissions.join('|');
  const visibleTabs = useMemo(
    () => tabs.filter((tab) => canAccessEndpoint(tab.config.endpoint, auth)),
    [tabs, roleKey, permissionKey],
  );
  const [activeId, setActiveId] = useState(visibleTabs[0]?.id);

  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.id === activeId)) {
      setActiveId(visibleTabs[0]?.id);
    }
  }, [activeId, visibleTabs]);

  if (!visibleTabs.length) {
    return <Navigate to="/" replace />;
  }

  const activeTab = visibleTabs.find((tab) => tab.id === activeId) ?? visibleTabs[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-[var(--color-border)] bg-white p-2 shadow-sm">
        {visibleTabs.map((tab) => {
          const active = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveId(tab.id)}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition"
              style={{
                background: active ? 'var(--color-primary)' : 'transparent',
                color: active ? '#fff' : 'var(--color-muted)',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <ManagementPage config={activeTab.config} />
    </div>
  );
}
