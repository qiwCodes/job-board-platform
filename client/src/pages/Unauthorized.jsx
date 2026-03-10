import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center rounded-[2rem] border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
      <p className="text-6xl font-black tracking-tight text-primary-600 sm:text-7xl">403</p>
      <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-primary-600">
        Access Denied
      </p>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-900">
        403 - Access Denied
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-gray-600">
        You don't have permission to view this page.
      </p>
      <Link to="/" className="btn-primary mt-8 inline-flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}
