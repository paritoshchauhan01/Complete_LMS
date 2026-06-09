import { Link } from 'react-router-dom';

/**
 * Student registration is now handled via Google OAuth on the login page.
 * This page acts as a soft redirect / informational notice.
 */
export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create an Account</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Student accounts are created automatically when you sign in with Google for the first time.
          No separate registration is needed.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition"
        >
          Sign in with Google
        </Link>
      </div>
    </div>
  );
}
