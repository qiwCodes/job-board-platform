import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { jobsAPI } from '../services/api';
import { buildJobSearchParams, employmentTypeOptions, extractErrorMessage, parseJobSearchParams } from '../utils/helpers';

export default function JobList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const filters = parseJobSearchParams(searchParams);
  const typesKey = filters.types.join(',');

  useEffect(() => {
    let isMounted = true;

    const loadJobs = async () => {
      setLoading(true);

      try {
        const response = await jobsAPI.getAll({
          search: filters.search || undefined,
          location: filters.location || undefined,
          type: typesKey || undefined,
          salary_min: filters.salaryMin || undefined,
          salary_max: filters.salaryMax || undefined,
          page: filters.page,
          limit: 9,
        });

        if (!isMounted) {
          return;
        }

        setJobs(response.data.data.jobs);
        setPagination(response.data.data.pagination);
        setError(null);
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
  }, [
    filters.location,
    filters.page,
    filters.salaryMax,
    filters.salaryMin,
    filters.search,
    typesKey,
    retryCount,
  ]);

  const updateFilters = (updates, options = {}) => {
    const nextFilters = {
      ...filters,
      ...updates,
      page: updates.page ?? (options.keepPage ? filters.page : 1),
    };

    setSearchParams(buildJobSearchParams(nextFilters), { replace: true });
  };

  const handleCheckboxChange = (value, checked) => {
    const nextTypes = checked
      ? [...filters.types, value]
      : filters.types.filter((item) => item !== value);

    updateFilters({ types: nextTypes });
  };

  const clearFilters = () => {
    setSearchParams(buildJobSearchParams({
      search: '',
      location: '',
      types: [],
      salaryMin: '',
      salaryMax: '',
      page: 1,
    }), { replace: true });
  };

  return (
    <div className="grid gap-8">
      <div className="flex flex-col gap-3">
        <p className="label-text text-indigo-600">Job Discovery</p>
        <h1 className="page-title">Browse active opportunities</h1>
        <p className="body-text max-w-2xl leading-7">
          Narrow the jobs board by keyword, location, employment type, and salary range. Filters
          are synced to the URL so results can be shared or revisited.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <aside className="card-base lg:sticky lg:top-24">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              updateFilters({ page: 1 }, { keepPage: true });
            }}
            className="grid gap-5"
          >
            <div className="grid gap-2">
              <label className="label-text">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={filters.search}
                  onChange={(event) => updateFilters({ search: event.target.value })}
                  className="input-base pl-10"
                  placeholder="Frontend, designer, data"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="label-text">Location</label>
              <input
                value={filters.location}
                onChange={(event) => updateFilters({ location: event.target.value })}
                className="input-base"
                placeholder="Bangkok, Remote"
              />
            </div>

            <div className="grid gap-3">
              <p className="label-text">Employment Type</p>
              <div className="grid gap-3">
                {employmentTypeOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-3 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={filters.types.includes(option.value)}
                      onChange={(event) => handleCheckboxChange(option.value, event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <p className="label-text">Salary Range</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <input
                  type="number"
                  min="0"
                  value={filters.salaryMin}
                  onChange={(event) => updateFilters({ salaryMin: event.target.value })}
                  className="input-base"
                  placeholder="Min"
                />
                <input
                  type="number"
                  min="0"
                  value={filters.salaryMax}
                  onChange={(event) => updateFilters({ salaryMax: event.target.value })}
                  className="input-base"
                  placeholder="Max"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="btn-primary">
                Apply Filters
              </button>
              <button type="button" onClick={clearFilters} className="text-sm font-medium text-gray-500 hover:text-indigo-600">
                Clear
              </button>
            </div>
          </form>
        </aside>

        <section className="grid gap-6">
          <div className="card-base">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="section-title">
                  Showing {pagination.total} job{pagination.total === 1 ? '' : 's'}
                </p>
                <p className="body-text mt-1">
                  Page {pagination.page} of {pagination.totalPages || 1}
                </p>
              </div>
            </div>
          </div>

          {loading ? <LoadingSpinner label="Loading jobs..." /> : null}

          {!loading && error ? (
            <div className="grid gap-4">
              <ErrorMessage message={error} />
              <div>
                <button
                  type="button"
                  onClick={() => setRetryCount((current) => current + 1)}
                  className="btn-primary"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : null}

          {!loading && !error && jobs.length === 0 ? (
            <EmptyState
              title="No jobs matched these filters"
              message="Try broadening your search or clearing one of the filters to see more opportunities."
            />
          ) : null}

          {!loading && !error && jobs.length > 0 ? (
            <>
              <div className="grid gap-5 xl:grid-cols-2">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              <div className="card-base">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => updateFilters({ page }, { keepPage: true })}
                />
              </div>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}
