import { BriefcaseBusiness, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRouteForRole } from '../utils/helpers';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user) {
      navigate(getRouteForRole(user.role), { replace: true });
    }
  }, [navigate, user]);

  const onSubmit = async (values) => {
    try {
      const nextUser = await login({
        email: values.email.trim(),
        password: values.password,
      });

      navigate(getRouteForRole(nextUser.role), { replace: true });
    } catch (_error) {
      // AuthContext handles toast feedback.
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[28px] bg-gray-900 p-8 text-white shadow-sm lg:p-10">
        <p className="label-text text-indigo-200">Welcome Back</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Log in to your hiring workspace.</h1>
        <p className="mt-5 text-sm leading-7 text-gray-300">
          Applicants can track every application while employers manage open jobs and candidate
          pipelines from one secure account.
        </p>

        <div className="mt-8 grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
            <BriefcaseBusiness className="h-6 w-6 text-indigo-200" />
            <h2 className="mt-4 text-lg font-medium">Application tracking</h2>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              Keep an eye on pending, interview, and hired outcomes from one dashboard.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
            <ShieldCheck className="h-6 w-6 text-indigo-200" />
            <h2 className="mt-4 text-lg font-medium">Protected access</h2>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              Role-aware routes keep applicant and company workflows separated cleanly.
            </p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="card-base lg:p-10">
        <div>
          <p className="label-text text-indigo-600">Account Access</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">Login</h2>
          <p className="body-text mt-3">Use the email and password you registered with.</p>
        </div>

        <div className="mt-8 grid gap-5">
          <label className="grid gap-2">
            <span className="label-text">Email</span>
            <input
              type="email"
              className="input-base"
              placeholder="you@company.com"
              {...register('email', {
                required: 'Email is required.',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Enter a valid email address.',
                },
              })}
            />
            {errors.email ? <p className="text-sm text-red-500">{errors.email.message}</p> : null}
          </label>

          <label className="grid gap-2">
            <span className="label-text">Password</span>
            <input
              type="password"
              className="input-base"
              placeholder="Your secure password"
              {...register('password', {
                required: 'Password is required.',
              })}
            />
            {errors.password ? <p className="text-sm text-red-500">{errors.password.message}</p> : null}
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button type="button" className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700">
            Forgot password?
          </button>
        </div>

        <button type="submit" disabled={loading} className="btn-primary mt-8 w-full">
          {loading ? 'Signing In...' : 'Login'}
        </button>

        <p className="mt-6 text-sm text-gray-600">
          Need an account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 transition-colors hover:text-indigo-700">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
