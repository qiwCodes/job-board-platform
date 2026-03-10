import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import JobFormFields from '../components/JobFormFields';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { jobsAPI } from '../services/api';
import { createJobPayload, extractErrorMessage, formatDate, formatEmploymentType } from '../utils/helpers';

const toFormValues = (job) => ({
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
  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    setError: setFormError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: toFormValues({}),
  });

  const loadJobs = async () => {
    setLoading(true);

    try {
      const response = await jobsAPI.getMine({ limit: 100 });
      setJobs(response.data.data.jobs);
      setError(null);
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to load your jobs.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const openEditModal = (job) => {
    setEditingJob(job);
    clearErrors();
    reset(toFormValues(job));
  };

  const closeEditModal = () => {
    setEditingJob(null);
    clearErrors();
    reset(toFormValues({}));
  };

  const saveJob = async (values) => {
    if (!editingJob) {
      return;
    }

    clearErrors('salary_max');

    if (
      values.salary_min !== '' &&
      values.salary_max !== '' &&
      Number(values.salary_max) < Number(values.salary_min)
    ) {
      setFormError('salary_max', {
        type: 'validate',
        message: 'Salary max must be greater than salary min.',
      });
      return;
    }

    try {
      const response = await jobsAPI.update(
        editingJob.id,
        createJobPayload(values, { includeStatus: true }),
      );
      const updatedJob = response.data.data.job;

      setJobs((current) =>
        current.map((job) =>
          job.id === editingJob.id
            ? {
                ...job,
                ...updatedJob,
                applicants_count: job.applicants_count,
                hired_count: job.hired_count,
              }
            : job,
        ),
      );
      toast.success('Job updated successfully.');
      closeEditModal();
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Unable to update this job.'));
    }
  };

  const deleteJob = async (jobId) => {
    const confirmed = window.confirm('Delete this job permanently?');

    if (!confirmed) {
      return;
    }

    setDeletingId(jobId);

    try {
      await jobsAPI.delete(jobId);
      setJobs((current) => current.filter((job) => job.id !== jobId));
      if (editingJob?.id === jobId) {
        closeEditModal();
      }
      toast.success('Job deleted successfully.');
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Unable to delete this job.'));
    } finally {
      setDeletingId('');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen label="Loading your jobs..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <>
      <div className="grid gap-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label-text text-indigo-600">Manage Jobs</p>
            <h1 className="page-title mt-2">Review and update your posted roles.</h1>
          </div>
          <Link to="/company/post-job" className="btn-primary">
            Post New Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <EmptyState
            title="No jobs to manage yet"
            message="Create your first job posting and it will appear here with applicant counts and quick actions."
            action={
              <Link to="/company/post-job" className="btn-primary">
                Post Your First Job
              </Link>
            }
          />
        ) : (
          <div className="table-shell">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Applicants</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Posted Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="table-row">
                    <td className="table-cell font-medium text-gray-900">{job.title}</td>
                    <td className="table-cell">{job.location || 'Flexible location'}</td>
                    <td className="table-cell">{formatEmploymentType(job.employment_type)}</td>
                    <td className="table-cell">{job.applicants_count}</td>
                    <td className="table-cell">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="table-cell">{formatDate(job.created_at)}</td>
                    <td className="table-cell">
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => openEditModal(job)}
                          className="font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteJob(job.id)}
                          disabled={deletingId === job.id}
                          className="font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          {deletingId === job.id ? 'Deleting...' : 'Delete'}
                        </button>
                        <Link
                          to={`/company/jobs/${job.id}/applicants`}
                          className="font-medium text-gray-700 hover:text-gray-900"
                        >
                          View Applicants
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={Boolean(editingJob)} onClose={() => !isSubmitting && closeEditModal()} className="relative z-50">
        <div className="fixed inset-0 bg-gray-900/50" aria-hidden="true" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
              <DialogTitle className="text-xl font-semibold text-gray-900">Edit Job</DialogTitle>
              <p className="body-text mt-2">Update the job details shown to applicants and your company team.</p>

              <form onSubmit={handleSubmit(saveJob)} className="mt-6 grid gap-6">
                <JobFormFields
                  register={register}
                  errors={errors}
                  disabled={isSubmitting}
                  includeStatus
                />

                <div className="flex flex-wrap justify-end gap-3">
                  <button type="button" onClick={closeEditModal} disabled={isSubmitting} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
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
