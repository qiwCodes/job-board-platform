import { employmentTypeOptions, jobStatusOptions } from '../utils/helpers';

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-sm text-red-500">{message}</p>;
}

export default function JobFormFields({
  register,
  errors = {},
  disabled = false,
  includeStatus = false,
}) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="label-text">Title *</span>
          <input
            disabled={disabled}
            className="input-base"
            placeholder="Senior Product Designer"
            {...register('title', {
              required: 'Title is required.',
              maxLength: {
                value: 255,
                message: 'Title must be 255 characters or fewer.',
              },
            })}
          />
          <FieldError message={errors.title?.message} />
        </label>

        <label className="grid gap-2">
          <span className="label-text">Location *</span>
          <input
            disabled={disabled}
            className="input-base"
            placeholder="Bangkok or remote"
            {...register('location', {
              required: 'Location is required.',
              maxLength: {
                value: 100,
                message: 'Location must be 100 characters or fewer.',
              },
            })}
          />
          <FieldError message={errors.location?.message} />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="label-text">Description *</span>
        <textarea
          disabled={disabled}
          rows={6}
          className="input-base resize-none"
          placeholder="Describe the role, team, and impact."
          {...register('description', {
            required: 'Description is required.',
          })}
        />
        <FieldError message={errors.description?.message} />
      </label>

      <label className="grid gap-2">
        <span className="label-text">Requirements</span>
        <textarea
          disabled={disabled}
          rows={5}
          className="input-base resize-none"
          placeholder="List the must-have skills and experience."
          {...register('requirements')}
        />
        <FieldError message={errors.requirements?.message} />
      </label>

      <div className="grid gap-5 md:grid-cols-3">
        <label className="grid gap-2">
          <span className="label-text">Employment Type *</span>
          <select
            disabled={disabled}
            className="input-base"
            {...register('employment_type', {
              required: 'Employment type is required.',
            })}
          >
            <option value="">Select employment type</option>
            {employmentTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError message={errors.employment_type?.message} />
        </label>

        <label className="grid gap-2">
          <span className="label-text">Salary Min</span>
          <input
            type="number"
            min="0"
            disabled={disabled}
            className="input-base"
            placeholder="50000"
            {...register('salary_min')}
          />
          <FieldError message={errors.salary_min?.message} />
        </label>

        <label className="grid gap-2">
          <span className="label-text">Salary Max</span>
          <input
            type="number"
            min="0"
            disabled={disabled}
            className="input-base"
            placeholder="80000"
            {...register('salary_max')}
          />
          <FieldError message={errors.salary_max?.message} />
        </label>
      </div>

      {includeStatus ? (
        <label className="grid gap-2">
          <span className="label-text">Status</span>
          <select
            disabled={disabled}
            className="input-base"
            {...register('status', {
              required: 'Status is required.',
            })}
          >
            {jobStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError message={errors.status?.message} />
        </label>
      ) : null}
    </div>
  );
}
