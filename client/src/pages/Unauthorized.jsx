import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] border border-rose-200 bg-white p-10 text-center shadow-soft">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-600">Access denied</p>
      <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">You do not have permission to open this page.</h1>
      <p className="mt-5 text-base leading-8 text-slate-600">
        The current route is protected by role-based access control. Return to a public page or sign in with a different account.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          to="/"
          className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Go home
        </Link>
        <Link
          to="/login"
          className="inline-flex rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
