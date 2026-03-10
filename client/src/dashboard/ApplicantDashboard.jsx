import { FileText, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import { applicationsAPI } from '../services/api';
import { extractErrorMessage, formatDate } from '../utils/helpers';

export default function ApplicantDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadApplications = async () => {
      try {
        const response = await applicationsAPI.getMine();

        if (!isMounted) {
          return;
        }

        setApplications(response.data.data.applications);
        setError(null);
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

    loadApplications();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: applications.length,
      pending: applications.filter((application) => application.status === 'pending').length,
      interviews: applications.filter((application) => application.status === 'interview').length,
      hired: applications.filter((application) => application.status === 'hired').length,
    }),
    [applications],
  );

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading your dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="grid gap-8">
      <section className="card-base overflow-hidden bg-indigo-600 text-white">
        <p className="label-text text-indigo-100">Applicant Dashboard</p>
        <h1 className="mt-2 text-3xl font-bold">Welcome back, {user?.name}.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100">
          Track every application in one place, see where momentum is building, and jump back into
          the jobs board when you are ready for the next opportunity.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Applications" value={stats.total} hint="All submissions from your account." tone="accent" />
        <StatCard label="Pending" value={stats.pending} hint="Awaiting review from hiring teams." />
        <StatCard label="Interviews" value={stats.interviews} hint="Applications moved to interview stage." tone="warm" />
        <StatCard label="Hired" value={stats.hired} hint="Successful offers recorded so far." />
      </section>

      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Recent Applications</h2>
          <Link to="/my-applications" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            View all
          </Link>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            message="Apply to a role from the jobs board and your latest submissions will appear here."
            action={
              <Link to="/jobs" className="btn-primary">
                Browse Jobs
              </Link>
            }
          />
        ) : (
          <div className="table-shell">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">Job Title</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Applied Date</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 5).map((application) => (
                  <tr key={application.id} className="table-row">
                    <td className="table-cell font-medium text-gray-900">{application.job_title}</td>
                    <td className="table-cell">{application.company_name}</td>
                    <td className="table-cell">
                      <StatusBadge status={application.status} />
                    </td>
                    <td className="table-cell">{formatDate(application.applied_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <Link to="/jobs" className="card-base transition-colors hover:border-indigo-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Search className="h-6 w-6" />
          </div>
          <h2 className="card-title mt-4">Browse Jobs</h2>
          <p className="body-text mt-2">Return to the full jobs board and discover your next application.</p>
        </Link>

        <Link to="/profile" className="card-base transition-colors hover:border-indigo-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="card-title mt-4">Update Profile</h2>
          <p className="body-text mt-2">Review your account details before sending more applications.</p>
        </Link>
      </section>
    </div>
  );
}
