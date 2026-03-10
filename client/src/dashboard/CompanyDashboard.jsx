import { FileSearch, PlusCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import { jobsAPI } from '../services/api';
import { extractErrorMessage, formatDate } from '../utils/helpers';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      try {
        const response = await jobsAPI.getMine({ limit: 100 });

        if (!isMounted) {
          return;
        }

        setJobs(response.data.data.jobs);
        setError(null);
      } catch (err) {
        if (isMounted) {
          setError(extractErrorMessage(err, 'Unable to load your company dashboard.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      totalJobs: jobs.length,
      totalApplicants: jobs.reduce((total, job) => total + (job.applicants_count || 0), 0),
      activeJobs: jobs.filter((job) => job.status === 'active').length,
      hired: jobs.reduce((total, job) => total + (job.hired_count || 0), 0),
    }),
    [jobs],
  );

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading company dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="grid gap-8">
      <section className="card-base overflow-hidden bg-indigo-600 text-white">
        <p className="label-text text-indigo-100">Company Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold">Welcome back, {user?.name}.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100">
          Review posted roles, applicant volume, and the status of your current hiring pipeline from
          one company workspace.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Jobs Posted" value={stats.totalJobs} hint="All jobs created by your company." tone="accent" />
        <StatCard label="Total Applicants" value={stats.totalApplicants} hint="Applicants across all posted jobs." />
        <StatCard label="Active Jobs" value={stats.activeJobs} hint="Roles currently visible to applicants." tone="warm" />
        <StatCard label="Hired" value={stats.hired} hint="Applications moved to hired status." />
      </section>

      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Recent Jobs</h2>
          <Link to="/company/jobs" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            Manage all jobs
          </Link>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            title="No jobs posted yet"
            message="Create your first role to start collecting applicants and measuring hiring progress."
            action={
              <Link to="/company/post-job" className="btn-primary">
                Post New Job
              </Link>
            }
          />
        ) : (
          <div className="table-shell">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Applicants</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Posted Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.slice(0, 5).map((job) => (
                  <tr key={job.id} className="table-row">
                    <td className="table-cell font-medium text-gray-900">{job.title}</td>
                    <td className="table-cell">{job.applicants_count}</td>
                    <td className="table-cell">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="table-cell">{formatDate(job.created_at)}</td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-3">
                        <Link to={`/company/jobs/${job.id}/applicants`} className="font-medium text-indigo-600 hover:text-indigo-700">
                          View Applicants
                        </Link>
                        <Link to={`/jobs/${job.id}`} className="font-medium text-gray-600 hover:text-gray-900">
                          View Job
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <Link to="/company/post-job" className="card-base transition-colors hover:border-indigo-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <PlusCircle className="h-6 w-6" />
          </div>
          <h2 className="card-title mt-4">Post New Job</h2>
          <p className="body-text mt-2">Create a new role and publish it to the marketplace.</p>
        </Link>

        <Link to="/company/jobs" className="card-base transition-colors hover:border-indigo-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <FileSearch className="h-6 w-6" />
          </div>
          <h2 className="card-title mt-4">View All Applicants</h2>
          <p className="body-text mt-2">Open your jobs table and jump into any applicant list quickly.</p>
        </Link>
      </section>
    </div>
  );
}
