import { ArrowRight, BriefcaseBusiness, Building2, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import JobCard from '../components/JobCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { jobsAPI } from '../services/api';
import { extractErrorMessage, getRouteForRole } from '../utils/helpers';

export default function Home() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadFeaturedJobs = async () => {
      try {
        const response = await jobsAPI.getAll({ limit: 3 });

        if (!isMounted) {
          return;
        }

        setJobs(response.data.data.jobs);
        setError('');
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

  return (
    <div className="grid gap-10">
      <section className="grid gap-8 rounded-[2rem] bg-slate-900 px-8 py-10 text-white shadow-soft lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-14">
        <div>
          <p className="inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
            Production-ready hiring flow
          </p>
          <h1 className="mt-6 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
            Hiring should feel sharp on both sides of the marketplace.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            JobBoard gives applicants a focused path to discover and apply, while companies get a clean control surface to post roles and review candidates.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to={user ? getRouteForRole(user.role) : '/jobs'}
              className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-200"
            >
              {user ? 'Go to dashboard' : 'Browse jobs'}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to={user ? '/jobs' : '/register'}
              className="inline-flex items-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {user ? 'Explore openings' : 'Create account'}
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl bg-white/10 p-6">
            <div className="flex items-center gap-3">
              <BriefcaseBusiness className="h-6 w-6 text-amber-300" />
              <div>
                <p className="text-sm font-semibold">Built for applicants</p>
                <p className="text-sm text-slate-300">Discover roles, track statuses, keep momentum.</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 p-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-emerald-300" />
              <div>
                <p className="text-sm font-semibold">Built for companies</p>
                <p className="text-sm text-slate-300">Publish jobs, review applicants, move faster.</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-sky-300" />
              <div>
                <p className="text-sm font-semibold">JWT session handling</p>
                <p className="text-sm text-slate-300">Protected routes and auto session restore.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Featured openings</p>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Fresh roles from active companies</h2>
          </div>
          <Link to="/jobs" className="text-sm font-semibold text-slate-700 transition hover:text-emerald-600">
            View all jobs
          </Link>
        </div>

        {loading ? <LoadingSpinner label="Loading featured jobs..." /> : null}
        {!loading && error ? (
          <EmptyState
            title="Featured jobs unavailable"
            description={error}
            action={
              <Link
                to="/jobs"
                className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                Open jobs board
              </Link>
            }
          />
        ) : null}
        {!loading && !error && jobs.length === 0 ? (
          <EmptyState
            title="No active jobs yet"
            description="Once companies publish active roles, they will appear here automatically."
          />
        ) : null}
        {!loading && !error && jobs.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
