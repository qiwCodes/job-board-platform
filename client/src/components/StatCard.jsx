export default function StatCard({ label, value, hint, tone = 'default' }) {
  const toneClasses =
    tone === 'accent'
      ? 'border-indigo-200 bg-indigo-50'
      : tone === 'warm'
        ? 'border-yellow-200 bg-yellow-50'
        : 'border-gray-200 bg-white';

  return (
    <div className={`rounded-xl border p-6 shadow-sm ${toneClasses}`}>
      <p className="label-text">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
      {hint ? <p className="mt-2 text-sm text-gray-600">{hint}</p> : null}
    </div>
  );
}
