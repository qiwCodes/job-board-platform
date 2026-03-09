import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import JobFormFields from '../components/JobFormFields';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import { jobsAPI } from '../services/api';
import {
  createJobPayload,
  extractErrorMessage,
  formatCurrencyRange,
  formatDate,
} from '../utils/helpers';

const createEditableState = (job) => ({
  title: job.title || '',
  description: job.description || '',
  requirements: job.requirements || '',
  location: job.location || '',
  employment_type: job.employment_type || '',
  salary_min: job.salary_min ?? '',
  salary_max: job.salary_max ?? '',
  status: job.status || 'active',
});

export default function ManageJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [editingJobId, setEditingJobId] = useState('');
  const [editForm, setEditForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState('');
  const [error, setError] = useState('');

  const loadJobs = async () => {
    setLoading(true);

    try {
      const response = await jobsAPI.getAll({ limit: 100, search: user?.name });
      const ownedJobs = response.data.data.jobs.filter((job) => job.company_name === user?.name);

      setJobs(ownedJobs);
      setError('');
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to load your jobs.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.name) {
      loadJobs();
    }
  }, [user?.name]);

  const beginEdit = (job) => {
    setEditingJobId(job.id);
    setEditForm(createEditableState(job));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const saveJob = async (event) => {
    event.preventDefault();

    if (!editForm) {
      return;
    }

    const payload = createJobPayload(editForm, { includeStatus: true });

    if (
      payload.salary_min !== undefined &&
      payload.salary_max !== undefined &&
      payload.salary_max < payload.salary_min
    ) {
      toast.error('Salary max must be greater than or equal to salary min.');
      return;
    }

    setSaving(true);

    try {
      const response = await jobsAPI.update(editingJobId, payload);
      const updatedJob = response.data.data.job;

      setJobs((current) =>
        current.map((job) => (job.id === editingJobId ? { ...job, ...updatedJob } : job)),
      );
      setEditingJobId('');
      setEditForm(null);
      toast.success('Job updated successfully.');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Unable to update this job.'));
    } finally {
      setSaving(false);
    }
  };

  const deleteJob = async (jobId) => {
    const confirmed = window.confirm('Delete this job permanently?');

    if (!confirmed) {
      return;
    }

    setDeletingJobId(jobId);

    try {
      await jobsAPI.delete(jobId);
      setJobs((current) => current.filter((job) => job.id !== jobId));
      if (editingJobId === jobId) {
        setEditingJobId('');
        setEditForm(null);
      }
      toast.success('Job deleted successfully.');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Unable to delete this job.'));
    } finally {
      setDeletingJobId('');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading your jobs..." />;
  }

  if (error) {
    return <EmptyState title="Jobs unavailable" description={error} />;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
      <section className="grid gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Manage jobs</p>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Review, update, and clean up active roles.</h1>
          </div>
          <Link
            to="/company/post-job"
            className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Post another job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            title="No active jobs to manage"
            description="Create a job first and it will appear here for editing and applicant review."
          />
        ) : (
          jobs.map((job) => (
            <article key={job.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">{job.title}</h2>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {job.location || 'Flexible location'} • {job.employment_type || 'Open role'} • {formatCurrencyRange(job.salary_min, job.salary_max)}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">Posted {formatDate(job.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => beginEdit(job)}
                    className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <Link
                    to={`/company/jobs/${job.id}/applicants`}
                    className="inline-flex rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
                  >
                    Applicants
                  </Link>
                  <button
                    type="button"
                    disabled={deletingJobId === job.id}
                    onClick={() => deleteJob(job.id)}
                    className="inline-flex rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingJobId === job.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      <aside className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          {editingJobId ? 'Edit selected job' : 'Select a job to edit'}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Updates call the protected company job endpoint directly and preserve the rest of the record locally.
        </p>

        {!editingJobId || !editForm ? (
          <div className="mt-6">
            <EmptyState
              title="No job selected"
              description="Choose Edit on a job card to load its current fields into this editor."
            />
          </div>
        ) : (
          <form onSubmit={saveJob} className="mt-6 grid gap-6">
            <JobFormFields
              formState={editForm}
              onChange={handleEditChange}
              disabled={saving}
              includeStatus
            />

            <div className="flex flex-wrap gap-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingJobId('');
                  setEditForm(null);
                }}
                className="inline-flex rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}
