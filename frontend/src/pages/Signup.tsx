import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: '',
    password: '',
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
    <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4 py-12">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-brand-cyan tracking-tight font-display">Create Student Profile</h2>
          <p className="text-slate-400 mt-2 text-sm">Join UniSphere Nepal to discover housing & roommates.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-900/30 border border-rose-800 text-rose-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase mb-2">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Aayush Adhikari"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-cyan text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase mb-2">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-cyan text-sm"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase mb-2">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="e.g. 9841234567"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-cyan text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@college.edu.np"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-cyan text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase mb-2">Origin District</label>
              <input
                type="text"
                name="hometownDistrict"
                required
                value={formData.hometownDistrict}
                onChange={handleChange}
                placeholder="e.g. Biratnagar, Jhapa"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-cyan text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase mb-2">Target City</label>
              <select
                name="currentCity"
                value={formData.currentCity}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-cyan text-sm"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase mb-2">Major Course</label>
              <input
                type="text"
                name="majorCourse"
                value={formData.majorCourse}
                onChange={handleChange}
                placeholder="e.g. BBA, BIM, CSIT"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-cyan text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase mb-2">Academic Year</label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-cyan text-sm"
              >
                <option value={1}>First Year</option>
                <option value={2}>Second Year</option>
                <option value={3}>Third Year</option>
                <option value={4}>Fourth Year</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase mb-2">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 characters"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-cyan text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-cyan hover:bg-teal-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 text-sm mt-2"
          >
            {isSubmitting ? 'Registering User...' : 'Create Account'}
          </button>
        </form>

        <p className="text-slate-400 text-center text-xs mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-brand-cyan hover:underline font-semibold">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
