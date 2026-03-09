import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import { useAuth } from '../hooks/useAuth';
import { jobsAPI } from '../services/api';
import { extractErrorMessage, formatDate } from '../utils/helpers';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      try {
        const response = await jobsAPI.getAll({ limit: 100, search: user?.name });

        if (!isMounted) {
          return;
        }

        const ownedJobs = response.data.data.jobs.filter((job) => job.company_name === user?.name);
        setJobs(ownedJobs);
        setError('');
      } catch (err) {
        if (isMounted) {
          setError(extractErrorMessage(err, 'Unable to load company dashboard.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (user?.name) {
      loadJobs();
    }

    return () => {
      isMounted = false;
    };
  }, [user?.name]);

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading company dashboard..." />;
  }

  if (error) {
    return <EmptyState title="Dashboard unavailable" description={error} />;
  }

  const latestJob = jobs[0];
  const remoteRoles = jobs.filter((job) => job.employment_type === 'remote').length;

  return (
    <div className="grid gap-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Company dashboard</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Manage active hiring without extra noise.</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard label="Active roles" value={jobs.length} hint="Derived from the active public jobs feed." tone="accent" />
        <StatCard label="Remote roles" value={remoteRoles} hint="Current openings tagged remote." />
        <StatCard label="Latest post" value={latestJob ? formatDate(latestJob.created_at) : 'N/A'} hint="Most recently created active role." tone="warm" />
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Recent active roles</h2>
            <p className="mt-2 text-sm text-slate-600">
              The current backend exposes active jobs publicly, so this dashboard filters the active list by your company name.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/company/post-job"
              className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Post a job
            </Link>
            <Link
              to="/company/jobs"
              className="inline-flex rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Manage jobs
            </Link>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No active jobs yet"
              description="Create a role to start collecting applicants."
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{job.title}</p>
                  <p className="text-sm text-slate-600">
                    {job.location || 'Flexible location'} • {job.employment_type || 'Open role'} • Posted {formatDate(job.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/jobs/${job.id}`}
                    className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    View job
                  </Link>
                  <Link
                    to={`/company/jobs/${job.id}/applicants`}
                    className="inline-flex rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                  >
                    Review applicants
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
