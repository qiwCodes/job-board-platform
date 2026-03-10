import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.55),rgba(255,255,255,0.55)),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:auto,72px_72px,72px_72px]" />
      <div className="relative min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <footer className="border-t border-gray-200 bg-white/90">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>JobBoard helps applicants discover roles and companies move hiring faster.</p>
            <p>Built with React, Tailwind CSS, Express, and PostgreSQL.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
