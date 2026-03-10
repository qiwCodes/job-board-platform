import { BriefcaseBusiness, Building2, MapPin, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  buildAssetUrl,
  formatCurrencyRange,
  formatEmploymentType,
  formatRelativeDate,
  getInitials,
} from '../utils/helpers';

export default function JobCard({ job, footer }) {
  const description = job?.description || 'No description available';

  return (
    <article className="card-base flex h-full flex-col gap-5 transition-transform duration-200 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {job.logo_url ? (
            <img
              src={buildAssetUrl(job.logo_url)}
              alt={job.company_name || 'Company logo'}
              className="h-14 w-14 rounded-xl border border-gray-200 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-sm font-semibold text-indigo-700">
              {getInitials(job.company_name)}
            </div>
          )}
          <div className="min-w-0">
            <p className="label-text">{job.company_name || 'Hiring company'}</p>
            <Link
              to={`/jobs/${job.id}`}
              className="mt-2 block text-lg font-medium text-gray-900 transition-colors hover:text-indigo-700"
            >
              {job.title}
            </Link>
          </div>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          {formatRelativeDate(job.created_at)}
        </span>
      </div>

      <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-400" />
          <span>{job.company_name || 'Confidential company'}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{job.location || 'Flexible location'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-gray-400" />
          <span>{formatCurrencyRange(job.salary_min, job.salary_max)}</span>
        </div>
        <div className="flex items-center gap-2">
          <BriefcaseBusiness className="h-4 w-4 text-gray-400" />
          <span>{formatEmploymentType(job.employment_type)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          {job.location || 'Anywhere'}
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          {formatEmploymentType(job.employment_type)}
        </span>
      </div>

      <p className="body-text flex-1 leading-6">
        {description.length > 220 ? `${description.slice(0, 220)}...` : description}
      </p>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/jobs/${job.id}`}
          className="btn-primary"
        >
          View Details
        </Link>
        {footer}
      </div>
    </article>
  );
}
