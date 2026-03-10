import { ArrowRight, BriefcaseBusiness, Building2, MapPin, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { jobsAPI } from '../services/api';
import { buildJobSearchParams, extractErrorMessage } from '../utils/helpers';

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadFeaturedJobs = async () => {
      try {
        const response = await jobsAPI.getAll({ limit: 6 });

        if (!isMounted) {
          return;
        }

        setJobs(response.data.data.jobs);
        setError(null);
      } catch (err) {
        if (isMounted) {
          setError(extractErrorMessage(err, 'Unable to load featured jobs.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFeaturedJobs();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const nextParams = buildJobSearchParams({
      search,
      location,
      types: [],
      salaryMin: '',
      salaryMax: '',
      page: 1,
    }).toString();

    navigate(`/jobs${nextParams ? `?${nextParams}` : ''}`);
  };

  return (
    <div className="grid gap-10">
      <section className="overflow-hidden rounded-[32px] bg-gray-900 shadow-sm">
        <div className="grid gap-10 px-6 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:py-14">
          <div>
            <p className="inline-flex rounded-full bg-indigo-500/20 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-indigo-200">
              New roles added daily
            </p>
            <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Find Your Dream Job
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-300">
              Explore curated openings from growing teams, refine by what matters, and move from
              search to application in a clean flow.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-8 grid gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur sm:grid-cols-[1fr_1fr_auto]"
            >
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white px-10 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Job title, company, or keyword"
                />
              </label>

              <label className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white px-10 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="City or remote"
                />
              </label>

              <button type="submit" className="btn-primary min-h-[48px]">
                Search Jobs
              </button>
            </form>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: BriefcaseBusiness,
                title: 'Fast job discovery',
                body: 'Search by keyword and location, then scan clean job cards with the essentials first.',
              },
              {
                icon: Building2,
                title: 'Trusted companies',
                body: 'Review company context, salary ranges, and employment types before you commit.',
              },
              {
                icon: Users,
                title: 'Clear application tracking',
                body: 'Applicants can monitor every submission while companies manage candidates from one place.',
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-200">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-lg font-medium text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-300">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-3">
        {[
          { label: 'Jobs', value: '10,000+' },
          { label: 'Companies', value: '5,000+' },
          { label: 'Hired', value: '50,000+' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-gray-50 p-5">
            <p className="label-text">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6">
        <div>
          <p className="label-text text-indigo-600">Featured Jobs</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="page-title">Fresh openings from active companies</h2>
              <p className="body-text mt-2 max-w-2xl">
                A shortlist of current roles pulled directly from the live jobs feed.
              </p>
            </div>
            <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600">
              Browse all jobs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {loading ? <LoadingSpinner label="Loading featured jobs..." /> : null}
        {!loading && error ? (
          <div className="grid gap-4">
            <ErrorMessage message={error} />
            <div>
              <Link to="/jobs" className="btn-primary">
                Open jobs board
              </Link>
            </div>
          </div>
        ) : null}
        {!loading && !error && jobs.length === 0 ? (
          <EmptyState
            title="No active jobs yet"
            message="Once companies publish active roles, they will appear here automatically."
          />
        ) : null}
        {!loading && !error && jobs.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="card-base overflow-hidden bg-indigo-600 text-white">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="label-text text-indigo-100">For Employers</p>
            <h2 className="mt-2 text-3xl font-bold">Are you hiring?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100">
              Create a company account, post new openings, and manage applicants from a dedicated
              workspace built for daily recruiting operations.
            </p>
          </div>

          <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-50">
            Create Employer Account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
