const toneMap = {
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  reviewed: 'bg-sky-100 text-sky-700',
  interview: 'bg-violet-100 text-violet-700',
  rejected: 'bg-rose-100 text-rose-700',
  hired: 'bg-emerald-100 text-emerald-700',
};

const labelMap = {
  active: 'Active',
  pending: 'Pending',
  reviewed: 'Reviewed',
  interview: 'Interview',
  rejected: 'Rejected',
  hired: 'Hired',
};

export default function StatusBadge({ status }) {
  const normalizedStatus = String(status || '').toLowerCase();
  const tone = toneMap[normalizedStatus] || 'bg-slate-100 text-slate-700';
  const label = labelMap[normalizedStatus] || status || 'Unknown';

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
      {label}
    </span>
  );
}
