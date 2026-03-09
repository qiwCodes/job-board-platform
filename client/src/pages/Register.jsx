import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRouteForRole } from '../utils/helpers';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, user } = useAuth();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    role: 'applicant',
  });

  useEffect(() => {
    if (user) {
      navigate(getRouteForRole(user.role), { replace: true });
    }
  }, [navigate, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const nextUser = await register({
        name: formState.name.trim(),
        email: formState.email.trim(),
        password: formState.password,
        role: formState.role,
      });

      navigate(getRouteForRole(nextUser.role), { replace: true });
    } catch (_error) {
      // Toast feedback is handled in the auth context.
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8 shadow-soft lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-700">Join JobBoard</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">Create your account and start moving.</h1>
        <p className="mt-5 text-base leading-8 text-slate-700">
          Applicants can submit resumes and monitor outcomes. Companies can publish openings and manage applicants from a dedicated workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft lg:p-10">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Register</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Pick the role that matches the workflow you need.</p>
        </div>

        <div className="mt-8 grid gap-5">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Full name or company name
            <input
              required
              name="name"
              value={formState.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="Ariya Labs"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Email
            <input
              required
              type="email"
              name="email"
              value={formState.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="you@company.com"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Password
            <input
              required
              type="password"
              minLength={8}
              name="password"
              value={formState.password}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="At least 8 characters"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Account type
            <select
              name="role"
              value={formState.role}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="applicant">Applicant</option>
              <option value="company">Company</option>
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="mt-6 text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 transition hover:text-emerald-700">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
