import { useState } from 'react';
import ManagementPage from './ManagementPage';

export default function TabbedManagementPage({ tabs }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-[var(--color-border)] bg-white p-2 shadow-sm">
        {tabs.map((tab) => {
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
