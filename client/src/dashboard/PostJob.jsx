import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import JobFormFields from '../components/JobFormFields';
import { jobsAPI } from '../services/api';
import { createJobPayload, extractErrorMessage } from '../utils/helpers';

const defaultValues = {
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
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
  });

  const onSubmit = async (values) => {
    clearErrors('salary_max');

    if (
      values.salary_min !== '' &&
      values.salary_max !== '' &&
      Number(values.salary_max) < Number(values.salary_min)
    ) {
      setError('salary_max', {
        type: 'validate',
        message: 'Salary max must be greater than salary min.',
      });
      return;
    }

    try {
      await jobsAPI.create(createJobPayload(values));
      toast.success('Job posted successfully.');
      navigate('/company/jobs');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Unable to create job.'));
    }
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-8">
      <div>
        <p className="label-text text-indigo-600">Post Job</p>
        <h1 className="page-title mt-2">Create a role ready for applicants.</h1>
        <p className="body-text mt-3 max-w-2xl">
          Add the essentials clearly so applicants can evaluate the opportunity before they apply.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card-base">
        <JobFormFields register={register} errors={errors} disabled={isSubmitting} />

        <div className="mt-8 flex flex-wrap gap-3">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Publishing...' : 'Publish Job'}
          </button>
          <button
            type="button"
            onClick={() => {
              reset(defaultValues);
              clearErrors();
            }}
            disabled={isSubmitting}
            className="btn-secondary"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
