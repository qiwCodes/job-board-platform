import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRouteForRole } from '../utils/helpers';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, user } = useAuth();
  const [formState, setFormState] = useState({
    email: '',
    password: '',
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
      const nextUser = await login({
        email: formState.email.trim(),
        password: formState.password,
      });

      navigate(getRouteForRole(nextUser.role), { replace: true });
    } catch (_error) {
      // Toast feedback is handled in the auth context.
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-soft lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Welcome back</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight">Access your hiring workspace.</h1>
        <p className="mt-5 text-base leading-8 text-slate-300">
          Applicants can track submissions and companies can manage open roles from one authenticated session.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft lg:p-10">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Login</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Use the account you registered with JobBoard.</p>
        </div>

        <div className="mt-8 grid gap-5">
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
              name="password"
              value={formState.password}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="Your secure password"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Login'}
        </button>

        <p className="mt-6 text-sm text-slate-600">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-emerald-600 transition hover:text-emerald-700">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}
