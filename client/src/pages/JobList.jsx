import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { jobsAPI } from '../services/api';
import { employmentTypeOptions, extractErrorMessage } from '../utils/helpers';

const initialFilters = {
  search: '',
  location: '',
  type: '',
  page: 1,
};

export default function JobList() {
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      setLoading(true);

      try {
        const response = await jobsAPI.getAll({
          search: filters.search || undefined,
          location: filters.location || undefined,
          type: filters.type || undefined,
          page: filters.page,
          limit: 9,
        });

        if (!isMounted) {
          return;
        }

        setJobs(response.data.data.jobs);
        setPagination(response.data.data.pagination);
        setError('');
      } catch (err) {
        if (isMounted) {
          setError(extractErrorMessage(err, 'Unable to load jobs.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setFilters((current) => ({
      ...current,
      search: draftFilters.search.trim(),
      location: draftFilters.location.trim(),
      type: draftFilters.type,
      page: 1,
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraftFilters((current) => ({ ...current, [name]: value }));
  };

  const changePage = (nextPage) => {
    setFilters((current) => ({ ...current, page: nextPage }));
  };

  return (
    <div className="grid gap-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Job discovery</p>
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Browse active opportunities</h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          Filter by keyword, location, and employment type. The list reflects only active roles exposed by the backend.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft lg:grid-cols-[1.2fr_1fr_0.8fr_auto]">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Search
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              name="search"
              value={draftFilters.search}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-stone-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="Frontend, designer, data..."
            />
          </div>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Location
          <input
            name="location"
            value={draftFilters.location}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            placeholder="Bangkok, Remote..."
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Type
          <select
            name="type"
            value={draftFilters.type}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          >
            {employmentTypeOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 lg:mt-7"
        >
          Search jobs
        </button>
      </form>

      {loading ? <LoadingSpinner label="Loading jobs..." /> : null}

      {!loading && error ? (
        <EmptyState
          title="We could not load the jobs board"
          description={error}
          action={
            <button
              type="button"
              onClick={() => setFilters((current) => ({ ...current }))}
              className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Retry
            </button>
          }
        />
      ) : null}

      {!loading && !error && jobs.length === 0 ? (
        <EmptyState
          title="No jobs matched these filters"
          description="Try broadening the keyword search or clearing one of the filters."
        />
      ) : null}

      {!loading && !error && jobs.length > 0 ? (
        <>
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Showing page {pagination.page} of {pagination.totalPages || 1} with {pagination.total} active roles.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => changePage(pagination.page - 1)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={!pagination.totalPages || pagination.page >= pagination.totalPages}
                onClick={() => changePage(pagination.page + 1)}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
