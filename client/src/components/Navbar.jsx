import { LogOut, Menu, UserCircle2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const getLinkClasses = ({ isActive }) =>
  [
    'rounded-full px-4 py-2 text-sm font-semibold transition',
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ');

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, user]);

  const applicantLinks = [
    { to: '/jobs', label: 'Jobs' },
    { to: '/my-applications', label: 'My Applications' },
    { to: '/profile', label: 'Profile' },
  ];

  const companyLinks = [
    { to: '/company/post-job', label: 'Post Job' },
    { to: '/company/jobs', label: 'Manage Jobs' },
  ];

  const guestLinks = [
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' },
  ];

  const links = user?.role === 'company' ? companyLinks : user?.role === 'applicant' ? applicantLinks : guestLinks;

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-stone-50/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white">
            JB
          </div>
          <div>
            <p className="text-lg font-black tracking-tight text-slate-900">JobBoard</p>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Find the next great fit</p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-2 lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={getLinkClasses}>
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          ) : null}

          {user ? (
            <div className="ml-2 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-soft">
              <UserCircle2 className="h-5 w-5 text-emerald-600" />
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{user.role}</p>
              </div>
            </div>
          ) : null}
        </nav>

        <button
          type="button"
          disabled={loading}
          onClick={() => setMobileOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
            {user ? (
              <div className="rounded-3xl bg-slate-900 px-4 py-3 text-white">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{user.role}</p>
              </div>
            ) : null}

            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={getLinkClasses}>
                {link.label}
              </NavLink>
            ))}

            {user ? (
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
