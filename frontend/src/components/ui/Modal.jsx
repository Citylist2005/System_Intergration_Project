import Button from './Button';

export default function Modal({
  open,
  title,
  description,
  children,
  onClose,
  footer,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/35"
        aria-label="Đóng cửa sổ"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-300/30">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
            {description ? (
              <p className="text-sm leading-6 text-slate-500">{description}</p>
            ) : null}
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
        <div>{children}</div>
        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </div>
  );
}
