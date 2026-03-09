import { CalendarDays, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/helpers';

export default function ProfilePage() {
  const { user, token, logout } = useAuth();

  return (
    <div className="mx-auto grid max-w-4xl gap-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Profile</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Session and account details</h1>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">{user?.role}</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{user?.name}</h2>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl bg-stone-50 p-5">
            <div className="flex items-center gap-3 text-slate-700">
              <Mail className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold">Email</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{user?.email}</p>
          </div>

          <div className="rounded-3xl bg-stone-50 p-5">
            <div className="flex items-center gap-3 text-slate-700">
              <CalendarDays className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold">Member since</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{formatDate(user?.created_at)}</p>
          </div>

          <div className="rounded-3xl bg-stone-50 p-5">
            <div className="flex items-center gap-3 text-slate-700">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold">JWT session</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{token ? 'Active token present in localStorage.' : 'No active token found.'}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
