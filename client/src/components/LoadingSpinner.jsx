export default function LoadingSpinner({
  fullScreen = false,
  label = 'Loading...',
  compact = false,
}) {
  const wrapperClasses = fullScreen
    ? 'flex min-h-[50vh] flex-col items-center justify-center gap-4'
    : 'flex flex-col items-center justify-center gap-3 py-10';

  const spinnerSize = compact ? 'h-8 w-8' : 'h-12 w-12';

  return (
    <div className={wrapperClasses}>
      <div
        className={`${spinnerSize} animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500`}
      />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}
