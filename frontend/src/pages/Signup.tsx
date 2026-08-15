import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { NivaroLogo } from '../components/NivaroLogo';

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
    academicYear: 1,
    collegeId: ''
  });
  
  const [colleges, setColleges] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load colleges list for students selection dropdown
    api.get('/colleges')
      .then(res => setColleges(res.data || []))
      .catch(err => console.error("Failed to load college registers", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber') {
      if (value.length > 0 && !/^\d*$/.test(value)) return; // Restrict to numbers only
      if (value.length > 10) return; // Limit length to 10
      
      if (value.length > 0 && value.length < 10) {
        setPhoneError('Nepal mobile numbers must be exactly 10 digits');
      } else if (value.length === 10 && !/^(98|97)/.test(value)) {
        setPhoneError('Nepal mobile numbers must start with 97 or 98');
      } else {
        setPhoneError('');
      }
    }

    const valueParsed = name === 'academicYear' ? parseInt(value, 10) : value;
    setFormData({
      ...formData,
      [name]: valueParsed
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Pre-submission validation
    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      setError('Full name must be at least 3 characters long.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.phoneNumber || !/^(98|97)\d{8}$/.test(formData.phoneNumber)) {
      setError('Please enter a valid 10-digit Nepal mobile number starting with 97 or 98.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.hometownDistrict.trim()) {
      setError('Origin district is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.currentCity.trim()) {
      setError('Target city is required.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (formData.role === 'student') {
      if (!formData.collegeId) {
        setError('Please select a college.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (!formData.majorCourse.trim()) {
        setError('Major course is required for students.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    } else if (formData.role !== 'owner') {
      setError('Please select a valid account type.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Password validation: min 8 chars, must contain both letters and numbers
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!/[A-Za-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError('Password must contain both letters and numbers.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    
    // Construct payload matching SignupRequest DTO format
    const payload: any = {
      phoneNumber: formData.phoneNumber,
      email: formData.email || null,
      password: formData.password,
      role: formData.role,
      fullName: formData.fullName,
      gender: formData.gender,
      hometownDistrict: formData.hometownDistrict,
      currentCity: formData.currentCity
    };

    if (formData.role === 'student') {
      payload.collegeId = formData.collegeId;
      payload.majorCourse = formData.majorCourse;
      payload.academicYear = formData.academicYear;
    }

    try {
      await signup(payload);
      setSuccessMessage('🎉 Account created successfully! Redirecting you to sign in...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      const backendMessage = err.response?.data?.message || '';
      if (backendMessage.includes("Email is already in use") || backendMessage.includes("Email already exists")) {
        setError("An account with this email already exists. Please sign in instead.");
      } else if (backendMessage.includes("Phone number is already in use")) {
        setError("An account with this phone number already exists.");
      } else {
        setError(backendMessage || 'Registration failed. Please check inputs.');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <NivaroLogo className="w-6 h-6 text-marigold" />
          </div>
          <h2 className="text-3xl font-black text-ink font-display">NIVARO</h2>
          <p className="text-xs text-ink-soft font-semibold mt-2">
            Find your room. Find your perfect roommate.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-semibold animate-shake">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl text-sm font-semibold">
            {successMessage}
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
                className={`w-full bg-[#FAF8F5] border text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold ${phoneError ? 'border-brick' : 'border-ink/10'}`}
              />
              {phoneError && (
                <span className="text-[10px] text-brick font-semibold mt-1 block">{phoneError}</span>
              )}
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
            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-ink-soft text-xs font-bold uppercase mb-2">College Name</label>
                <select
                  name="collegeId"
                  value={formData.collegeId}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold"
                >
                  <option value="">-- Select Your College --</option>
                  {colleges.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Major Course</label>
                  <input
                    type="text"
                    name="majorCourse"
                    required
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
            disabled={isSubmitting || phoneError.length > 0 || successMessage.length > 0}
            className="w-full bg-marigold hover:bg-marigold-dark text-paper font-black py-4 rounded-xl shadow-md transition disabled:opacity-50 text-sm uppercase tracking-wider mt-4"
          >
            {isSubmitting ? 'Registering User...' : successMessage ? 'Redirecting...' : 'Create Account'}
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
