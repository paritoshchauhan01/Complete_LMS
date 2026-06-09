import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const TeacherRegisterPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvitation();
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const response = await api.get(`/auth/register/teacher/${token}`);
      setInvitation(response.data);
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid or expired invitation';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Redirect to Google OAuth with the invite token embedded in state
  const handleGoogleAccept = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    window.location.href = `${baseUrl}/api/auth/google?inviteToken=${token}`;
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Invalid Invitation
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 underline text-sm"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-md w-full">
        
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          
          {/* Header gradient */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-center">
            <div className="text-5xl mb-3">🎓</div>
            <h1 className="text-white text-2xl font-bold">You're Invited!</h1>
            <p className="text-indigo-200 text-sm mt-1">Join EduLMS as a Teacher</p>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Invitation info */}
            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-5 mb-6">
              <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-3">
                Your invitation details:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span>👤</span>
                  <span className="font-medium">
                    {invitation?.firstName} {invitation?.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span>📧</span>
                  <span>{invitation?.email}</span>
                </div>
                {invitation?.courseField && (
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span>📚</span>
                    <span>{invitation.courseField}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span>🎯</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    Teacher
                  </span>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                How to accept
              </p>
              <ol className="space-y-2">
                {[
                  'Click "Accept with Google" below',
                  `Sign in with ${invitation?.email}`,
                  "You'll be added as a Teacher automatically ✅",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Important: must use invited email */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-4 py-3 mb-6">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                ⚠️ <strong>Important:</strong> You must sign in with{' '}
                <strong>{invitation?.email}</strong> for the invitation to work.
              </p>
            </div>

            {/* Google Sign-In Button */}
            <button
              onClick={handleGoogleAccept}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 text-gray-700 dark:text-gray-200 font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-md group"
            >
              {/* Google icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Accept with Google
              <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
            </button>

            {/* Expiry note */}
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
              ⏰ Invitation expires on{' '}
              {invitation?.expiresAt
                ? new Date(invitation.expiresAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          By accepting, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default TeacherRegisterPage;
