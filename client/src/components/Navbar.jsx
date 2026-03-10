import { LogOut, Menu, UserCircle2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRouteForRole } from '../utils/helpers';

const getLinkClasses = ({ isActive }) =>
  [
    'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-indigo-50 text-indigo-700'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
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
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
            JB
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-gray-900">JobBoard</p>
            <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Hire with clarity</p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-2 lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={getLinkClasses}>
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <NavLink to={getRouteForRole(user.role)} className="btn-primary ml-2">
              Open Dashboard
            </NavLink>
          ) : (
            <NavLink to="/jobs" className="btn-primary ml-2">
              Browse Jobs
            </NavLink>
          )}

          {user ? (
            <button
              type="button"
              onClick={logout}
              className="btn-secondary"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          ) : null}

          {user ? (
            <div className="ml-2 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2">
              <UserCircle2 className="h-5 w-5 text-indigo-600" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-gray-500">{user.role}</p>
              </div>
            </div>
          ) : null}
        </nav>

        <button
          type="button"
          disabled={loading}
          onClick={() => setMobileOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-700 transition hover:bg-gray-50 lg:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-gray-200 bg-white lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
            {user ? (
              <div className="rounded-xl bg-indigo-50 px-4 py-3 text-indigo-700">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">{user.role}</p>
              </div>
            ) : null}

            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={getLinkClasses}>
                {link.label}
              </NavLink>
            ))}

            <NavLink to={user ? getRouteForRole(user.role) : '/jobs'} className="btn-primary">
              {user ? 'Open Dashboard' : 'Browse Jobs'}
            </NavLink>

            {user ? (
              <button
                type="button"
                onClick={logout}
                className="btn-secondary"
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
