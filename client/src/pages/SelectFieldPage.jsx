import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const FIELDS = ['B.Tech', 'BCA', 'MBA', 'MCA', 'B.Sc'];

export default function SelectFieldPage() {
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!selected) return setError('Please select your course field.');
    setLoading(true);
    try {
      await api.put('/auth/profile', { courseField: selected });
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-1">
          <div className="text-4xl mb-2">🎓</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome!</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Select your course field to see your subjects and assignments.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {FIELDS.map((field) => (
            <button
              key={field}
              onClick={() => setSelected(field)}
              className={`w-full px-4 py-3 rounded-xl border-2 text-left font-medium transition
                ${selected === field
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-indigo-300 dark:hover:border-indigo-500'
                }`}
            >
              {field}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selected || loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition"
        >
          {loading ? 'Saving…' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}
