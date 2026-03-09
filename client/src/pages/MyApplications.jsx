import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { applicationsAPI } from '../services/api';
import { buildAssetUrl, extractErrorMessage, formatDate } from '../utils/helpers';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadApplications = async () => {
      try {
        const response = await applicationsAPI.getMine();

        if (!isMounted) {
          return;
        }

        setApplications(response.data.data.applications);
        setError('');
      } catch (err) {
        if (isMounted) {
          setError(extractErrorMessage(err, 'Unable to load your applications.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadApplications();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading your applications..." />;
  }

  if (error) {
    return <EmptyState title="Applications unavailable" description={error} />;
  }

  return (
    <div className="grid gap-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">My applications</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Track every submission from one place.</h1>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Apply to an active role and your submissions will appear here immediately."
        />
      ) : (
        <div className="grid gap-5">
          {applications.map((application) => (
            <article key={application.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    {application.company_name}
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                    {application.job_title}
                  </h2>
                  <p className="mt-3 text-sm text-slate-600">
                    {application.job_location || 'Flexible location'} • {application.employment_type || 'Open role'} • Applied {formatDate(application.applied_at)}
                  </p>
                </div>
                <StatusBadge status={application.status} />
              </div>

              {application.cover_letter ? (
                <div className="mt-6 rounded-3xl bg-stone-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Cover letter</p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{application.cover_letter}</p>
                </div>
              ) : null}

              {application.resume_url ? (
                <a
                  href={buildAssetUrl(application.resume_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  View submitted resume
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
