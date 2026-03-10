const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const stripApiSuffix = (value) => value.replace(/\/api\/?$/, '');

export const getApiBaseUrl = () => process.env.REACT_APP_API_URL || '';

export const getApiOrigin = () => {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return '';
  }

  try {
    return new URL(baseUrl).origin;
  } catch (_error) {
    return stripApiSuffix(baseUrl);
  }
};

export const buildAssetUrl = (assetPath) => {
  if (!assetPath) {
    return '';
  }

  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }

  const origin = getApiOrigin();

  if (!origin) {
    return assetPath;
  }

  return `${origin}${assetPath.startsWith('/') ? assetPath : `/${assetPath}`}`;
};

export const extractErrorMessage = (error, fallbackMessage = 'Something went wrong.') =>
  error?.response?.data?.message || error?.message || fallbackMessage;

export const formatCurrencyRange = (minimum, maximum) => {
  if (minimum == null && maximum == null) {
    return 'Not specified';
  }

  if (minimum != null && maximum != null) {
    return `${currencyFormatter.format(minimum)} - ${currencyFormatter.format(maximum)}`;
  }

  if (minimum != null) {
    return `From ${currencyFormatter.format(minimum)}`;
  }

  return `Up to ${currencyFormatter.format(maximum)}`;
};

export const formatDate = (value) => {
  if (!value) {
    return 'N/A';
  }

  return dateFormatter.format(new Date(value));
};

export const formatRelativeDate = (value) => {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);
  const deltaInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(deltaInSeconds);

  if (absSeconds < 60) {
    return relativeTimeFormatter.format(deltaInSeconds, 'second');
  }

  if (absSeconds < 3600) {
    return relativeTimeFormatter.format(Math.round(deltaInSeconds / 60), 'minute');
  }

  if (absSeconds < 86400) {
    return relativeTimeFormatter.format(Math.round(deltaInSeconds / 3600), 'hour');
  }

  if (absSeconds < 604800) {
    return relativeTimeFormatter.format(Math.round(deltaInSeconds / 86400), 'day');
  }

  if (absSeconds < 2629800) {
    return relativeTimeFormatter.format(Math.round(deltaInSeconds / 604800), 'week');
  }

  if (absSeconds < 31557600) {
    return relativeTimeFormatter.format(Math.round(deltaInSeconds / 2629800), 'month');
  }

  return relativeTimeFormatter.format(Math.round(deltaInSeconds / 31557600), 'year');
};

export const employmentTypeOptions = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
];

export const employmentTypeFilterOptions = [
  { value: '', label: 'All types' },
  ...employmentTypeOptions,
];

export const applicationStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'interview', label: 'Interview' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'hired', label: 'Hired' },
];

export const jobStatusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
  { value: 'draft', label: 'Draft' },
];

export const getRouteForRole = (role) => {
  if (role === 'company') {
    return '/company/dashboard';
  }

  return '/dashboard';
};

export const createJobPayload = (formState, options = {}) => {
  const includeStatus = options.includeStatus ?? false;
  const payload = {
    title: formState.title.trim(),
    description: formState.description.trim(),
    requirements: formState.requirements.trim(),
    location: formState.location.trim(),
    employment_type: formState.employment_type,
    salary_min: formState.salary_min === '' ? undefined : Number(formState.salary_min),
    salary_max: formState.salary_max === '' ? undefined : Number(formState.salary_max),
  };

  if (includeStatus) {
    payload.status = formState.status;
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );
};

export const formatEmploymentType = (value) => {
  if (!value) {
    return 'Not specified';
  }

  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const getInitials = (value) =>
  String(value || 'JB')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

export const splitLines = (value) =>
  String(value || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\-\u2022]\s*/, '').trim())
    .filter(Boolean);

export const parseJobSearchParams = (searchParams) => ({
  search: searchParams.get('search') || '',
  location: searchParams.get('location') || '',
  types: (searchParams.get('type') || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
  salaryMin: searchParams.get('salary_min') || '',
  salaryMax: searchParams.get('salary_max') || '',
  page: Math.max(Number.parseInt(searchParams.get('page') || '1', 10) || 1, 1),
});

export const buildJobSearchParams = (filters) => {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set('search', filters.search.trim());
  }

  if (filters.location?.trim()) {
    params.set('location', filters.location.trim());
  }

  if (filters.types?.length) {
    params.set('type', filters.types.join(','));
  }

  if (filters.salaryMin !== '' && filters.salaryMin != null) {
    params.set('salary_min', String(filters.salaryMin));
  }

  if (filters.salaryMax !== '' && filters.salaryMax != null) {
    params.set('salary_max', String(filters.salaryMax));
  }

  if (filters.page && filters.page > 1) {
    params.set('page', String(filters.page));
  }

  return params;
};
