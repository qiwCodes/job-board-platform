import { createContext, useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { authAPI } from '../services/api';
import { extractErrorMessage } from '../utils/helpers';

const TOKEN_KEY = 'token';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const storedToken = window.localStorage.getItem(TOKEN_KEY);

    if (!storedToken) {
      setLoading(false);
      return undefined;
    }

    const restoreSession = async () => {
      try {
        const response = await authAPI.getMe();

        if (!isMounted) {
          return;
        }

        setToken(storedToken);
        setUser(response.data.data.user);
      } catch (_error) {
        if (!isMounted) {
          return;
        }

        window.localStorage.clear();
        setToken(null);
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const persistSession = (nextToken, nextUser) => {
    window.localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = async (credentials) => {
    setLoading(true);

    try {
      const response = await authAPI.login(credentials);
      const nextToken = response.data.data.token;
      const nextUser = response.data.data.user;

      persistSession(nextToken, nextUser);
      toast.success('Welcome back.');

      return nextUser;
    } catch (error) {
      const message = extractErrorMessage(error, 'Unable to login right now.');
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);

    try {
      const response = await authAPI.register(payload);
      const nextToken = response.data.data.token;
      const nextUser = response.data.data.user;

      persistSession(nextToken, nextUser);
      toast.success('Account created successfully.');

      return nextUser;
    } catch (error) {
      const message = extractErrorMessage(error, 'Unable to create your account.');
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    window.localStorage.clear();
    setToken(null);
    setUser(null);
    toast.success('You have been logged out.');
    window.location.assign('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
          },
        }}
      />
    </AuthContext.Provider>
  );
}
