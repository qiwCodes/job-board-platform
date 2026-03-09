export default function StatCard({ label, value, hint, tone = 'default' }) {
  const toneClasses =
    tone === 'accent'
      ? 'border-emerald-200 bg-emerald-50'
      : tone === 'warm'
        ? 'border-amber-200 bg-amber-50'
        : 'border-slate-200 bg-white';

  return (
    <div className={`rounded-3xl border p-6 shadow-soft ${toneClasses}`}>
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">{value}</p>
      {hint ? <p className="mt-2 text-sm text-slate-600">{hint}</p> : null}
    </div>
  );
}
