import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { applicationsAPI, jobsAPI } from '../services/api';
import { applicationStatusOptions, buildAssetUrl, extractErrorMessage, formatDate } from '../utils/helpers';

export default function ApplicantsList() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadApplicants = async () => {
      try {
        const [jobResponse, applicantsResponse] = await Promise.all([
          jobsAPI.getById(id),
          applicationsAPI.getJobApplicants(id),
        ]);

        if (!isMounted) {
          return;
        }

        setJob(jobResponse.data.data.job);
        setApplicants(applicantsResponse.data.data.applicants);
        setError(null);
      } catch (err) {
        if (isMounted) {
          setError(extractErrorMessage(err, 'Unable to load applicants for this job.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadApplicants();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const updateStatus = async (applicationId, status) => {
    setUpdatingId(applicationId);

    try {
      await applicationsAPI.updateStatus(applicationId, status);
      setApplicants((current) =>
        current.map((applicant) =>
          applicant.id === applicationId ? { ...applicant, status } : applicant,
        ),
      );
      toast.success('Application status updated.');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Unable to update application status.'));
    } finally {
      setUpdatingId('');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading applicants..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="grid gap-8">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/company/jobs" className="hover:text-indigo-600">
            Manage Jobs
          </Link>
          <span>/</span>
          <span>{job?.title}</span>
        </div>
        <h1 className="page-title mt-3">{job?.title}</h1>
        <p className="body-text mt-2">
          {applicants.length} applicant{applicants.length === 1 ? '' : 's'} for this role.
        </p>
      </div>

      {applicants.length === 0 ? (
        <EmptyState
          title="No applicants yet"
          message="Applications will appear here as soon as candidates submit their resumes."
        />
      ) : (
        <div className="table-shell">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Applicant Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Applied Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((applicant) => (
                <tr key={applicant.id} className="table-row">
                  <td className="table-cell font-medium text-gray-900">{applicant.applicant_name}</td>
                  <td className="table-cell">{applicant.applicant_email}</td>
                  <td className="table-cell">{formatDate(applicant.applied_at)}</td>
                  <td className="table-cell">
                    <StatusBadge status={applicant.status} />
                  </td>
                  <td className="table-cell">
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={buildAssetUrl(applicant.resume_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Download Resume
                      </a>
                      <select
                        value={applicant.status}
                        disabled={updatingId === applicant.id}
                        onChange={(event) => updateStatus(applicant.id, event.target.value)}
                        className="input-base min-w-[150px]"
                      >
                        {applicationStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
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
