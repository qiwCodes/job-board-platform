import toast from 'react-hot-toast';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JobFormFields from '../components/JobFormFields';
import { jobsAPI } from '../services/api';
import { createJobPayload, extractErrorMessage } from '../utils/helpers';

const initialFormState = {
  title: '',
  description: '',
  requirements: '',
  location: '',
  employment_type: '',
  salary_min: '',
  salary_max: '',
};

export default function PostJob() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = createJobPayload(formState);

    if (
      payload.salary_min !== undefined &&
      payload.salary_max !== undefined &&
      payload.salary_max < payload.salary_min
    ) {
      toast.error('Salary max must be greater than or equal to salary min.');
      return;
    }

    setSubmitting(true);

    try {
      await jobsAPI.create(payload);
      toast.success('Job posted successfully.');
      navigate('/company/jobs');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Unable to create job.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Post a job</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Create a role that is ready for applicants.</h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <JobFormFields formState={formState} onChange={handleChange} disabled={submitting} />

        <div className="mt-8 flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Publishing...' : 'Publish job'}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => setFormState(initialFormState)}
            className="inline-flex rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Reset form
          </button>
        </div>
      </form>
    </div>
  );
}
