import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center rounded-[2rem] border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
      <p className="text-7xl font-black tracking-tight text-primary-600 sm:text-8xl">404</p>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Page not found</h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-gray-600">
        The page you are looking for may have moved or no longer exists.
      </p>
      <Link to="/" className="btn-primary mt-8 inline-flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}
