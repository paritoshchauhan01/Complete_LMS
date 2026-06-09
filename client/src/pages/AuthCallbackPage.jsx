import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState('Signing you in…');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error || !token) {
      const msg = error === 'WRONG_GOOGLE_ACCOUNT'
        ? 'Wrong Google account. Please sign in with the email address that was invited.'
        : error === 'INVALID_INVITE_TOKEN'
        ? 'This invitation link is invalid or has expired.'
        : 'Google sign-in failed. Please try again.';
      navigate(`/login?error=${encodeURIComponent(msg)}`);
      return;
    }

    loginWithToken(token)
      .then((user) => {
        const role = user?.role;
        if (role === 'admin') {
          setStatus('Welcome back, Admin! Redirecting…');
          navigate('/admin');
        } else if (role === 'teacher') {
          setStatus('Welcome, Teacher! Redirecting to your dashboard…');
          navigate('/dashboard');
        } else {
          setStatus('Welcome! Redirecting…');
          navigate('/dashboard');
        }
      })
      .catch(() => navigate('/login?error=auth_failed'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-5" />
        <p className="text-gray-700 dark:text-gray-200 font-medium text-lg">{status}</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Please wait…</p>
      </div>
    </div>
  );
}
