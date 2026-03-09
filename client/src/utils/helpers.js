const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
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
    return 'Compensation not disclosed';
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

export const employmentTypeOptions = [
  { value: '', label: 'All types' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
];

export const applicationStatusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'interview', label: 'Interview' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'hired', label: 'Hired' },
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
