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
        className={`${spinnerSize} animate-spin rounded-full border-4 border-indigo-600 border-t-transparent`}
      />
      <p className="text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
}
