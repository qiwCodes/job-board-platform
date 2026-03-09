import { BriefcaseBusiness, Building2, MapPin, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrencyRange, formatDate } from '../utils/helpers';

export default function JobCard({ job, footer }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition-transform duration-200 hover:-translate-y-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            {job.company_name || 'Hiring company'}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{job.title}</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {job.employment_type || 'Open role'}
        </span>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-slate-400" />
          <span>{job.company_name || 'Confidential company'}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          <span>{job.location || 'Flexible location'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-slate-400" />
          <span>{formatCurrencyRange(job.salary_min, job.salary_max)}</span>
        </div>
        <div className="flex items-center gap-2">
          <BriefcaseBusiness className="h-4 w-4 text-slate-400" />
          <span>Posted {formatDate(job.created_at)}</span>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-600">
        {job.description.length > 220 ? `${job.description.slice(0, 220)}...` : job.description}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          View details
        </Link>
        {footer}
      </div>
    </article>
  );
}
