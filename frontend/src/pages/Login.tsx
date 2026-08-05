import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(phoneNumber, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-clay px-4 font-sans text-ink">
      <div className="w-full max-w-md bg-paper border border-ink/5 rounded-[32px] p-8 shadow-lg">
        
        {/* Header Bar */}
        <div className="text-center mb-8 flex flex-col items-center">
          {/* Sahavas Mandala/Sun Logo Icon */}
          <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center border border-ink/10 shadow-sm mb-3">
            <svg className="w-6 h-6 text-marigold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-ink font-display">सहवास</h2>
          <p className="text-xs text-ink-soft font-semibold mt-2">
            Welcome back student! Please enter details.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-ink-soft text-xs font-bold uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 9841234567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-3.5 focus:outline-none focus:border-marigold transition text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-ink-soft text-xs font-bold uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-3.5 focus:outline-none focus:border-marigold transition text-sm font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-marigold hover:bg-marigold-dark text-paper font-black py-4 rounded-xl shadow-md transition disabled:opacity-50 text-sm uppercase tracking-wider mt-4"
          >
            {isSubmitting ? 'Verifying Session...' : 'Sign In'}
          </button>
        </form>

        <p className="text-ink-soft text-center text-xs mt-6 font-semibold">
          Don't have an account?{' '}
          <Link to="/signup" className="text-marigold hover:underline font-bold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
