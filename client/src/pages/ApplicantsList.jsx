import toast from 'react-hot-toast';
import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { applicationsAPI, jobsAPI } from '../services/api';
import {
  applicationStatusOptions,
  buildAssetUrl,
  extractErrorMessage,
  formatDate,
} from '../utils/helpers';

export default function ApplicantsList() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
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
        setError('');
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

    loadData();

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
    return (
      <EmptyState
        title="Applicants unavailable"
        description={error}
        action={
          <Link
            to="/company/jobs"
            className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to manage jobs
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Applicants</p>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">{job?.title}</h1>
        <p className="text-base text-slate-600">
          {job?.company_name} • {applicants.length} applicant{applicants.length === 1 ? '' : 's'}
        </p>
      </div>

      {applicants.length === 0 ? (
        <EmptyState
          title="No applicants yet"
          description="Once candidates apply to this role, they will appear here with their resume and current status."
        />
      ) : (
        <div className="grid gap-5">
          {applicants.map((applicant) => (
            <article key={applicant.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-2xl font-black tracking-tight text-slate-900">{applicant.applicant_name}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {applicant.applicant_email} • Applied {formatDate(applicant.applied_at)}
                  </p>
                </div>
                <StatusBadge status={applicant.status} />
              </div>

              <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-3">
                  {applicant.resume_url ? (
                    <a
                      href={buildAssetUrl(applicant.resume_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View resume
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>

                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Update status
                  <select
                    value={applicant.status}
                    disabled={updatingId === applicant.id}
                    onChange={(event) => updateStatus(applicant.id, event.target.value)}
                    className="min-w-[180px] rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  >
                    {applicationStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
