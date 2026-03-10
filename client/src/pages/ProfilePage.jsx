import { CalendarDays, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/helpers';

export default function ProfilePage() {
  const { user, token, logout } = useAuth();

  return (
    <div className="mx-auto grid max-w-4xl gap-8">
      <section className="card-base overflow-hidden bg-indigo-600 text-white">
        <p className="label-text text-indigo-100">Profile</p>
        <h1 className="mt-2 text-3xl font-bold">Session and account details</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100">
          Review your account information and confirm the current authenticated session state.
        </p>
      </section>

      <section className="card-base">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="label-text text-indigo-600">{user?.role}</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">{user?.name}</h2>
          </div>
          <button
            type="button"
            onClick={logout}
            className="btn-primary"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-5">
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium">Email</span>
            </div>
            <p className="mt-3 text-sm text-gray-600">{user?.email}</p>
          </div>

          <div className="rounded-xl bg-gray-50 p-5">
            <div className="flex items-center gap-3 text-gray-700">
              <CalendarDays className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium">Member since</span>
            </div>
            <p className="mt-3 text-sm text-gray-600">{formatDate(user?.created_at)}</p>
          </div>

          <div className="rounded-xl bg-gray-50 p-5">
            <div className="flex items-center gap-3 text-gray-700">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium">JWT session</span>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              {token ? 'Active token present in localStorage.' : 'No active token found.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
