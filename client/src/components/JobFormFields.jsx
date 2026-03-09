import { employmentTypeOptions } from '../utils/helpers';

const inputClasses =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100';

export default function JobFormFields({
  formState,
  onChange,
  disabled = false,
  includeStatus = false,
}) {
  return (
    <div className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Job title
          <input
            required
            name="title"
            value={formState.title}
            onChange={onChange}
            disabled={disabled}
            className={inputClasses}
            placeholder="Senior Product Designer"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Location
          <input
            name="location"
            value={formState.location}
            onChange={onChange}
            disabled={disabled}
            className={inputClasses}
            placeholder="Bangkok or remote"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Description
        <textarea
          required
          name="description"
          value={formState.description}
          onChange={onChange}
          disabled={disabled}
          rows={6}
          className={`${inputClasses} resize-none`}
          placeholder="Describe the role, team, and impact."
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Requirements
        <textarea
          name="requirements"
          value={formState.requirements}
          onChange={onChange}
          disabled={disabled}
          rows={5}
          className={`${inputClasses} resize-none`}
          placeholder="List the must-have skills and experience."
        />
      </label>

      <div className="grid gap-5 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Employment type
          <select
            name="employment_type"
            value={formState.employment_type}
            onChange={onChange}
            disabled={disabled}
            className={inputClasses}
          >
            {employmentTypeOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Salary min
          <input
            name="salary_min"
            type="number"
            min="0"
            value={formState.salary_min}
            onChange={onChange}
            disabled={disabled}
            className={inputClasses}
            placeholder="50000"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Salary max
          <input
            name="salary_max"
            type="number"
            min="0"
            value={formState.salary_max}
            onChange={onChange}
            disabled={disabled}
            className={inputClasses}
            placeholder="80000"
          />
        </label>
      </div>

      {includeStatus ? (
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Status
          <select
            name="status"
            value={formState.status}
            onChange={onChange}
            disabled={disabled}
            className={inputClasses}
          >
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
          </select>
        </label>
      ) : null}
    </div>
  );
}
