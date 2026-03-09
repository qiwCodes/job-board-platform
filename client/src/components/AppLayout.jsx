import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.28),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_32%)]" />
      <div className="relative">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <footer className="border-t border-slate-200/80 bg-white/70">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>JobBoard keeps hiring workflows readable, fast, and production-ready.</p>
            <p>React, Tailwind, axios, and JWT session auth.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
