import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { applicationsAPI } from '../services/api';
import { extractErrorMessage, formatDate } from '../utils/helpers';

const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'interview', label: 'Interview' },
  { value: 'hired', label: 'Hired' },
];

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
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

  const filteredApplications = useMemo(() => {
    if (activeTab === 'all') {
      return applications;
    }

    return applications.filter((application) => application.status === activeTab);
  }, [activeTab, applications]);

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading your applications..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (applications.length === 0) {
    return (
      <EmptyState
        title="No applications yet"
        message="Start exploring roles and every application you submit will appear here with its current status."
        action={
          <Link to="/jobs" className="btn-primary">
            Browse Jobs
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-8">
      <div>
        <p className="label-text text-indigo-600">My Applications</p>
        <h1 className="page-title mt-2">Every submission, one view.</h1>
      </div>

      <div className="flex flex-wrap gap-3">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={activeTab === tab.value ? 'btn-primary' : 'btn-secondary'}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredApplications.length === 0 ? (
        <EmptyState
          title="No applications in this status"
          message="Choose another tab to review your full application history."
        />
      ) : (
        <div className="table-shell">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Job Title</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applied Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((application) => (
                <tr key={application.id} className="table-row">
                  <td className="table-cell font-medium text-gray-900">{application.job_title}</td>
                  <td className="table-cell">{application.company_name}</td>
                  <td className="table-cell">{application.job_location || 'Flexible location'}</td>
                  <td className="table-cell">
                    <StatusBadge status={application.status} />
                  </td>
                  <td className="table-cell">{formatDate(application.applied_at)}</td>
                  <td className="table-cell">
                    <Link to={`/jobs/${application.job_id}`} className="font-medium text-indigo-600 hover:text-indigo-700">
                      View Job
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
