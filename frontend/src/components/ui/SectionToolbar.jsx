export default function SectionToolbar({ children }) {
  return (
    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      {children}
    </div>
  );
}

