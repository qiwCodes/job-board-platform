import { Building2, UserRound } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRouteForRole } from '../utils/helpers';

const roleCards = [
  {
    value: 'applicant',
    title: "I'm looking for a job",
    description: 'Search roles, apply with your resume, and track your hiring progress.',
    icon: UserRound,
  },
  {
    value: 'company',
    title: "I'm hiring",
    description: 'Post roles, review applicants, and manage recruiting in one company workspace.',
    icon: Building2,
  },
];

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser, loading, user } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'applicant',
    },
  });

  const selectedRole = watch('role');
  const password = watch('password');

  useEffect(() => {
    if (user) {
      navigate(getRouteForRole(user.role), { replace: true });
    }
  }, [navigate, user]);

  const onSubmit = async (values) => {
    try {
      const nextUser = await registerUser({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
      });

      navigate(getRouteForRole(nextUser.role), { replace: true });
    } catch (_error) {
      // AuthContext handles toast feedback.
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-[28px] bg-indigo-600 p-8 text-white shadow-sm lg:p-10">
        <p className="label-text text-indigo-100">Create Account</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">Join the marketplace with the right role.</h1>
        <p className="mt-5 text-sm leading-7 text-indigo-100">
          Choose the experience that matches your goal now. You can start applying immediately or
          begin publishing jobs for your company.
        </p>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="card-base lg:p-10">
        <div>
          <p className="label-text text-indigo-600">Registration</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900">Register</h2>
          <p className="body-text mt-3">Complete your profile and select how you will use the platform.</p>
        </div>

        <div className="mt-8 grid gap-5">
          <label className="grid gap-2">
            <span className="label-text">Name</span>
            <input
              type="text"
              className="input-base"
              placeholder="Full name or company name"
              {...register('name', {
                required: 'Name is required.',
                maxLength: {
                  value: 100,
                  message: 'Name must be 100 characters or fewer.',
                },
              })}
            />
            {errors.name ? <p className="text-sm text-red-500">{errors.name.message}</p> : null}
          </label>

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

          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="label-text">Password</span>
              <input
                type="password"
                className="input-base"
                placeholder="At least 8 characters"
                {...register('password', {
                  required: 'Password is required.',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters long.',
                  },
                })}
              />
              {errors.password ? <p className="text-sm text-red-500">{errors.password.message}</p> : null}
            </label>

            <label className="grid gap-2">
              <span className="label-text">Confirm Password</span>
              <input
                type="password"
                className="input-base"
                placeholder="Repeat your password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password.',
                  validate: (value) => value === password || 'Passwords do not match.',
                })}
              />
              {errors.confirmPassword ? (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              ) : null}
            </label>
          </div>

          <div className="grid gap-3">
            <span className="label-text">Choose Your Role</span>
            <input type="hidden" {...register('role', { required: 'Role is required.' })} />
            <div className="grid gap-4 md:grid-cols-2">
              {roleCards.map((card) => {
                const Icon = card.icon;
                const isSelected = selectedRole === card.value;

                return (
                  <button
                    key={card.value}
                    type="button"
                    onClick={() => setValue('role', card.value, { shouldValidate: true })}
                    className={[
                      'rounded-2xl border p-5 text-left transition-colors',
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{card.description}</p>
                  </button>
                );
              })}
            </div>
            {errors.role ? <p className="text-sm text-red-500">{errors.role.message}</p> : null}
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary mt-8 w-full">
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <p className="mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 transition-colors hover:text-indigo-700">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
