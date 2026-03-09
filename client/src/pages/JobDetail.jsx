import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { applicationsAPI, jobsAPI } from '../services/api';
import {
  buildAssetUrl,
  extractErrorMessage,
  formatCurrencyRange,
  formatDate,
} from '../utils/helpers';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadJob = async () => {
      try {
        const response = await jobsAPI.getById(id);

        if (!isMounted) {
          return;
        }

        setJob(response.data.data.job);
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

    loadJob();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleApply = async (event) => {
    event.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'applicant') {
      navigate('/unauthorized');
      return;
    }

    if (!resumeFile) {
      toast.error('Please attach your resume as a PDF.');
      return;
    }

    if (resumeFile.size > 5 * 1024 * 1024) {
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
      await applicationsAPI.apply(id, formData);
      setCoverLetter('');
      setResumeFile(null);
      setHasApplied(true);
      toast.success('Application submitted successfully.');
    } catch (err) {
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
          <Link
            to="/jobs"
            className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to jobs
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="grid gap-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              {job.logo_url ? (
                <img
                  src={buildAssetUrl(job.logo_url)}
                  alt={job.company_name}
                  className="h-16 w-16 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-xl font-black text-emerald-700">
                  {job.company_name?.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  {job.company_name}
                </p>
                <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">{job.title}</h1>
                <p className="mt-3 text-base text-slate-600">
                  {job.location || 'Flexible location'} • {job.employment_type || 'Open type'} • Posted {formatDate(job.created_at)}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
              {formatCurrencyRange(job.salary_min, job.salary_max)}
            </span>
          </div>

          <div className="mt-8 grid gap-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Role overview</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{job.description}</p>
            </div>

            {job.requirements ? (
              <div>
                <h2 className="text-lg font-bold text-slate-900">Requirements</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{job.requirements}</p>
              </div>
            ) : null}

            <div>
              <h2 className="text-lg font-bold text-slate-900">About the company</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {job.company_description || 'This company has not added a description yet.'}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                {job.company_location ? <span className="rounded-full bg-slate-100 px-3 py-2">{job.company_location}</span> : null}
                {job.company_website ? (
                  <a
                    href={job.company_website}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-slate-900 px-3 py-2 font-semibold text-white transition hover:bg-slate-800"
                  >
                    Company website
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="grid gap-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Apply now</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Send your application</h2>

          {!user ? (
            <div className="mt-6 grid gap-4">
              <p className="text-sm leading-6 text-slate-600">
                Sign in as an applicant to upload your resume and submit a cover letter.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Login to apply
              </Link>
            </div>
          ) : null}

          {user?.role === 'company' ? (
            <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
              Company accounts can manage roles and applicants, but only applicant accounts can apply to jobs.
            </p>
          ) : null}

          {user?.role === 'applicant' ? (
            <>
              {hasApplied ? (
                <p className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-700">
                  Your application was submitted. You can track updates from the My Applications page.
                </p>
              ) : (
                <form onSubmit={handleApply} className="mt-6 grid gap-4">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Resume (PDF)
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(event) => setResumeFile(event.target.files?.[0] || null)}
                      disabled={submitting}
                      className="w-full rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Cover letter
                    <textarea
                      rows={6}
                      value={coverLetter}
                      onChange={(event) => setCoverLetter(event.target.value)}
                      disabled={submitting}
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Explain why you are a strong fit for this role."
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? 'Submitting...' : 'Apply for this role'}
                  </button>
                </form>
              )}
            </>
          ) : null}
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-slate-900 p-8 text-white shadow-soft">
          <h2 className="text-xl font-black tracking-tight">Keep your search organized</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Applicants can review every submission status from the dedicated applications dashboard after logging in.
          </p>
          <Link
            to={user?.role === 'applicant' ? '/my-applications' : '/jobs'}
            className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            {user?.role === 'applicant' ? 'View my applications' : 'Explore more jobs'}
          </Link>
        </div>
      </aside>
    </div>
  );
}
