import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { applicationsAPI, jobsAPI } from '../services/api';
import { extractErrorMessage, formatDate } from '../utils/helpers';

export default function ApplicantDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const [jobsResponse, applicationsResponse] = await Promise.all([
          jobsAPI.getAll({ limit: 3 }),
          applicationsAPI.getMine(),
        ]);

        if (!isMounted) {
          return;
        }

        setJobs(jobsResponse.data.data.jobs);
        setApplications(applicationsResponse.data.data.applications);
        setError('');
      } catch (err) {
        if (isMounted) {
          setError(extractErrorMessage(err, 'Unable to load your dashboard.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading your dashboard..." />;
  }

  if (error) {
    return <EmptyState title="Dashboard unavailable" description={error} />;
  }

  const interviewCount = applications.filter((application) => application.status === 'interview').length;

  return (
    <div className="grid gap-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Applicant dashboard</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Stay on top of every application.</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard label="Active jobs" value={jobs.length} hint="Fresh roles loaded for quick discovery." tone="accent" />
        <StatCard label="Applications" value={applications.length} hint="Total submissions from your account." />
        <StatCard label="Interviews" value={interviewCount} hint="Roles that moved to interview stage." tone="warm" />
      </div>

      <section className="grid gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Recommended active roles</h2>
          <Link to="/jobs" className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-700">
            Browse all jobs
          </Link>
        </div>
        {jobs.length === 0 ? (
          <EmptyState
            title="No active jobs right now"
            description="Once companies publish roles, you will see them here."
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Recent applications</h2>
          <Link to="/my-applications" className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-700">
            View all
          </Link>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            title="No applications submitted yet"
            description="Apply to a role from the jobs board to start tracking progress."
            action={
              <Link
                to="/jobs"
                className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                Explore jobs
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4">
            {applications.slice(0, 5).map((application) => (
              <div key={application.id} className="flex flex-col gap-3 rounded-3xl border border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{application.job_title}</p>
                  <p className="text-sm text-slate-600">
                    {application.company_name} • Applied {formatDate(application.applied_at)}
                  </p>
                </div>
                <StatusBadge status={application.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
