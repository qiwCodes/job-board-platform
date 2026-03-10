import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { BriefcaseBusiness, Building2, CircleDollarSign, MapPin, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import { applicationsAPI, jobsAPI } from '../services/api';
import {
  buildAssetUrl,
  extractErrorMessage,
  formatCurrencyRange,
  formatDate,
  formatEmploymentType,
  formatRelativeDate,
  getInitials,
  splitLines,
} from '../utils/helpers';

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [existingApplication, setExistingApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadJobDetail = async () => {
      setLoading(true);

      try {
        const requests = [jobsAPI.getById(id)];

        if (user?.role === 'applicant') {
          requests.push(applicationsAPI.getMine());
        }

        const [jobResponse, applicationsResponse] = await Promise.all(requests);

        if (!isMounted) {
          return;
        }

        setJob(jobResponse.data.data.job);

        if (applicationsResponse) {
          const matchedApplication = applicationsResponse.data.data.applications.find(
            (application) => application.job_id === id,
          );
          setExistingApplication(matchedApplication || null);
        } else {
          setExistingApplication(null);
        }

        setError('');
      } catch (err) {
        if (isMounted) {
          setError(extractErrorMessage(err, 'Unable to load job details.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadJobDetail();

    return () => {
      isMounted = false;
    };
  }, [id, user?.id, user?.role]);

  const requirementItems = useMemo(() => splitLines(job?.requirements), [job?.requirements]);

  const handleOpenApply = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'applicant') {
      navigate('/unauthorized');
      return;
    }

    if (!existingApplication) {
      setIsApplyModalOpen(true);
    }
  };

  const handleApply = async (event) => {
    event.preventDefault();

    if (!resumeFile) {
      toast.error('Please upload your resume as a PDF.');
      return;
    }

    const isPdf =
      resumeFile.type === 'application/pdf' || resumeFile.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      toast.error('Resume file must be a PDF.');
      return;
    }

    if (resumeFile.size > MAX_RESUME_SIZE) {
      toast.error('Resume file size must not exceed 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeFile);

    if (coverLetter.trim()) {
      formData.append('cover_letter', coverLetter.trim());
    }

    setSubmitting(true);

    try {
      const response = await applicationsAPI.apply(id, formData);
      const application = response.data.data.application;

      setExistingApplication(application);
      setCoverLetter('');
      setResumeFile(null);
      setIsApplyModalOpen(false);
      toast.success('Application submitted successfully.');
    } catch (err) {
      if (err?.response?.status === 409) {
        setExistingApplication((current) => current || { status: 'pending' });
        setIsApplyModalOpen(false);
      }

      toast.error(extractErrorMessage(err, 'Unable to submit application.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading job details..." />;
  }

  if (error || !job) {
    return (
      <EmptyState
        title="Job unavailable"
        description={error || 'This job could not be found.'}
        action={
          <Link to="/jobs" className="btn-primary">
            Back to jobs
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <section className="grid gap-6">
          <div className="card-base">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                {job.logo_url ? (
                  <img
                    src={buildAssetUrl(job.logo_url)}
                    alt={job.company_name || 'Company logo'}
                    className="h-16 w-16 rounded-xl border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-indigo-50 text-lg font-semibold text-indigo-700">
                    {getInitials(job.company_name)}
                  </div>
                )}

                <div>
                  <p className="label-text text-indigo-600">{job.company_name}</p>
                  <h1 className="mt-2 text-3xl font-bold text-gray-900">{job.title}</h1>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                      {job.location || 'Flexible location'}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {formatEmploymentType(job.employment_type)}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      Posted {formatRelativeDate(job.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 px-4 py-3 text-right">
                <p className="label-text">Salary</p>
                <p className="mt-2 text-lg font-medium text-gray-900">
                  {formatCurrencyRange(job.salary_min, job.salary_max)}
                </p>
              </div>
            </div>
          </div>

          <div className="card-base">
            <h2 className="section-title">Role overview</h2>
            <p className="body-text mt-4 whitespace-pre-line leading-7">{job.description}</p>
          </div>

          <div className="card-base">
            <h2 className="section-title">Requirements</h2>
            {requirementItems.length > 0 ? (
              <ul className="mt-4 grid gap-3">
                {requirementItems.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-gray-600">
                    <span className="mt-2 h-2 w-2 rounded-full bg-indigo-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="body-text mt-4">No specific requirements were provided for this role.</p>
            )}
          </div>

          <div className="card-base">
            <h2 className="section-title">Job details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-3 text-gray-900">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  <span className="font-medium">Location</span>
                </div>
                <p className="body-text mt-2">{job.location || 'Flexible location'}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-3 text-gray-900">
                  <BriefcaseBusiness className="h-5 w-5 text-indigo-600" />
                  <span className="font-medium">Employment Type</span>
                </div>
                <p className="body-text mt-2">{formatEmploymentType(job.employment_type)}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-3 text-gray-900">
                  <CircleDollarSign className="h-5 w-5 text-indigo-600" />
                  <span className="font-medium">Compensation</span>
                </div>
                <p className="body-text mt-2">{formatCurrencyRange(job.salary_min, job.salary_max)}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-3 text-gray-900">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                  <span className="font-medium">Posted On</span>
                </div>
                <p className="body-text mt-2">{formatDate(job.created_at)}</p>
              </div>
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-24">
          <div className="card-base">
            <div className="flex items-center gap-4">
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

              <div>
                <p className="card-title">{job.company_name}</p>
                <p className="body-text mt-1">{job.location || 'Flexible location'}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {!user ? (
                <>
                  <p className="body-text">
                    Sign in as an applicant to upload your resume and submit a cover letter.
                  </p>
                  <Link to="/login" className="btn-primary w-full">
                    Login to Apply
                  </Link>
                </>
              ) : null}

              {user?.role === 'company' ? (
                <p className="rounded-xl bg-yellow-50 p-4 text-sm leading-6 text-yellow-800">
                  Company accounts can review applicants, but only applicant accounts can apply to
                  jobs.
                </p>
              ) : null}

              {user?.role === 'applicant' && existingApplication ? (
                <div className="rounded-xl bg-green-50 p-4">
                  <p className="label-text text-green-700">Application Status</p>
                  <div className="mt-3">
                    <StatusBadge status={existingApplication.status} />
                  </div>
                </div>
              ) : null}

              {user?.role === 'applicant' && !existingApplication ? (
                <button type="button" onClick={handleOpenApply} className="btn-primary w-full">
                  Apply Now
                </button>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      <Dialog open={isApplyModalOpen} onClose={() => !submitting && setIsApplyModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-gray-900/50" aria-hidden="true" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
              <DialogTitle className="text-xl font-semibold text-gray-900">Apply for {job.title}</DialogTitle>
              <p className="body-text mt-2">
                Upload your PDF resume and add a short cover letter for the hiring team.
              </p>

              <form onSubmit={handleApply} className="mt-6 grid gap-5">
                <label className="grid gap-2">
                  <span className="label-text">Cover Letter</span>
                  <textarea
                    rows={6}
                    value={coverLetter}
                    onChange={(event) => setCoverLetter(event.target.value)}
                    disabled={submitting}
                    className="input-base resize-none"
                    placeholder="Share why you are a strong fit for this role."
                  />
                </label>

                <label className="grid gap-2">
                  <span className="label-text">Resume Upload</span>
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
                      disabled={submitting}
                      className="input-base border-0 bg-transparent px-0 py-0 focus:ring-0"
                    />
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                      <Upload className="h-4 w-4" />
                      <span>{resumeFile ? resumeFile.name : 'PDF only, up to 5MB'}</span>
                    </div>
                  </div>
                </label>

                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    disabled={submitting}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn-primary min-w-[140px]">
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
