const toneMap = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-700',
  closed: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
  interview: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
  hired: 'bg-green-100 text-green-800',
};

const labelMap = {
  active: 'Active',
  draft: 'Draft',
  closed: 'Closed',
  pending: 'Pending',
  reviewed: 'Reviewed',
  interview: 'Interview',
  rejected: 'Rejected',
  hired: 'Hired',
};

export default function StatusBadge({ status }) {
  const normalizedStatus = String(status || '').toLowerCase();
  const tone = toneMap[normalizedStatus] || 'bg-gray-100 text-gray-700';
  const label = labelMap[normalizedStatus] || status || 'Unknown';

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${tone}`}>
      {label}
    </span>
  );
}
