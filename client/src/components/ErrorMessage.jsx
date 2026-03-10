import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-800 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold">Something went wrong while loading this data.</p>
          <p className="mt-1 text-sm leading-6">{message}</p>
          <p className="mt-2 text-sm leading-6 text-red-700">
            Try again in a moment or refresh the page if the problem continues.
          </p>
        </div>
      </div>
    </div>
  );
}
