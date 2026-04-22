export function Loading() {
  return (
    <div
      role="status"
      aria-label="جاري التحميل"
      style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--c-text-tertiary)',
        fontSize: 'var(--fs-sm)',
      }}
    >
      جاري التحميل...
    </div>
  );
}
