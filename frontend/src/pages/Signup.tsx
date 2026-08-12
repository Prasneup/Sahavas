import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: '',
    password: '',
    role: 'student',
    fullName: '',
    gender: 'MALE',
    hometownDistrict: '',
    currentCity: 'Kathmandu',
    majorCourse: '',
    academicYear: 1
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.name === 'academicYear' ? parseInt(e.target.value, 10) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await signup(formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-clay px-4 py-12 font-sans text-ink">
      <div className="w-full max-w-lg bg-paper border border-ink/5 rounded-[32px] p-8 shadow-lg">
        
        {/* Header Bar */}
        <div className="text-center mb-8 flex flex-col items-center">
          {/* Nivaro Mandala/Sun Logo Icon */}
          <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center border border-ink/10 shadow-sm mb-3">
            <svg className="w-6 h-6 text-marigold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-ink font-display">NIVARO</h2>
          <p className="text-xs text-ink-soft font-semibold mt-2">
            Find your room. Find your perfect roommate.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Account Type</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold"
            >
              <option value="student">Student (Looking for roommate/rooms)</option>
              <option value="owner">House Owner / Landlord (Posting rooms)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Prasanna Neupane"
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="e.g. 9841234567"
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@college.edu.np"
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Origin District</label>
              <input
                type="text"
                name="hometownDistrict"
                required
                value={formData.hometownDistrict}
                onChange={handleChange}
                placeholder="e.g. Biratnagar, Jhapa"
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Target City</label>
              <select
                name="currentCity"
                value={formData.currentCity}
                onChange={handleChange}
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold"
              >
                <option value="Kathmandu">Kathmandu</option>
                <option value="Pokhara">Pokhara</option>
                <option value="Butwal">Butwal</option>
                <option value="Nepalgunj">Nepalgunj</option>
                <option value="Dharan">Dharan</option>
                <option value="Chitwan">Chitwan</option>
              </select>
            </div>
          </div>

          {formData.role === 'student' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Major Course</label>
                <input
                  type="text"
                  name="majorCourse"
                  value={formData.majorCourse}
                  onChange={handleChange}
                  placeholder="e.g. BBA, BIM, CSIT"
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Academic Year</label>
                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold"
                >
                  <option value={1}>First Year</option>
                  <option value={2}>Second Year</option>
                  <option value={3}>Third Year</option>
                  <option value={4}>Fourth Year</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 characters"
              className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-marigold hover:bg-marigold-dark text-paper font-black py-4 rounded-xl shadow-md transition disabled:opacity-50 text-sm uppercase tracking-wider mt-4"
          >
            {isSubmitting ? 'Registering User...' : 'Create Account'}
          </button>
        </form>

        <p className="text-ink-soft text-center text-xs mt-6 font-semibold">
          Already registered?{' '}
          <Link to="/login" className="text-marigold hover:underline font-bold">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
