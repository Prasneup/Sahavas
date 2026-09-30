import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { NivaroLogo } from '../components/NivaroLogo';
import { trustService } from '../services/trustService';
import { 
  validatePhoneNumber, 
  validateEmail, 
  validatePassword 
} from '../utils/validation';

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
    trustService.getColleges()
      .then(res => setColleges(res || []))
      .catch(err => console.error("Failed to load college registers", err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber') {
      if (value.length > 0 && !/^\d*$/.test(value)) return; // Restrict to numbers only
      if (value.length > 10) return; // Limit length to 10
      
      const err = validatePhoneNumber(value);
      setPhoneError(err === 'invalid_chars' || err === 'invalid_length' ? '' : err);
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

    if (!formData.phoneNumber || validatePhoneNumber(formData.phoneNumber)) {
      setError('Please enter a valid 10-digit Nepal mobile number starting with 97 or 98.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.email || !validateEmail(formData.email)) {
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
    const pwdErr = validatePassword(formData.password);
    if (pwdErr) {
      setError(pwdErr);
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
      setError(err.response?.data?.message || 'Verification / Registration failed. Phone/email might be registered.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-clay py-12 px-4 font-sans text-ink">
      <div className="w-full max-w-lg bg-paper border border-ink/5 rounded-[32px] p-8 shadow-lg">
        
        {/* Header Bar */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center border border-ink/10 shadow-sm mb-3">
            <NivaroLogo className="w-6 h-6 text-marigold" />
          </div>
          <h2 className="text-3xl font-black text-ink font-display">NIVARO</h2>
          <p className="text-xs text-ink-soft font-semibold mt-2">
            Create an account to search flatmates or rent out rooms
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-pine-light border border-pine/20 text-pine rounded-xl text-xs font-semibold">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-left">
          
          {/* Form fields layout exact copy of layout definitions */}
          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-bold text-ink-soft">Account Category</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-3 focus:outline-none focus:border-marigold text-xs font-bold"
            >
              <option value="student">🎓 I am a Student (seeking room/roommate)</option>
              <option value="owner">🏠 I am a Landlord / Owner (renting out a space)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] uppercase font-bold text-ink-soft">Full Name</label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="e.g. Prasanna Neupane"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-3 focus:outline-none focus:border-marigold text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-ink-soft">Nepal Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                required
                placeholder="e.g. 9841XXXXXX"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-3 focus:outline-none focus:border-marigold text-xs font-semibold font-mono"
              />
              {phoneError && (
                <span className="text-[10px] font-bold text-rose-500 block mt-1 leading-tight">{phoneError}</span>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-ink-soft">Email Address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="e.g. student@college.edu.np"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-3 focus:outline-none focus:border-marigold text-xs font-semibold"
              />
            </div>
          </div>

          {/* Location details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-ink-soft">Hometown District</label>
              <input
                type="text"
                name="hometownDistrict"
                required
                placeholder="e.g. Dang, Kaski, Lalitpur"
                value={formData.hometownDistrict}
                onChange={handleChange}
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-3 focus:outline-none focus:border-marigold text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-ink-soft">Target / Current City</label>
              <input
                type="text"
                name="currentCity"
                required
                placeholder="e.g. Kathmandu"
                value={formData.currentCity}
                onChange={handleChange}
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-3 focus:outline-none focus:border-marigold text-xs font-semibold"
              />
            </div>
          </div>

          {/* Conditional Fields for Students role */}
          {formData.role === 'student' && (
            <div className="p-4 bg-[#FAF8F5] border border-ink/5 rounded-2xl space-y-4">
              <span className="text-[9px] uppercase tracking-wider block font-bold text-marigold">Student Academic Details</span>
              
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-ink-soft">Select College / Campus</label>
                <select
                  name="collegeId"
                  value={formData.collegeId}
                  onChange={handleChange}
                  className="w-full bg-paper border border-ink/10 text-ink rounded-xl px-4 py-3 focus:outline-none focus:border-marigold text-xs font-bold"
                >
                  <option value="">-- Choose College --</option>
                  {colleges.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.location})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-ink-soft">Major Course / Department</label>
                  <input
                    type="text"
                    name="majorCourse"
                    placeholder="e.g. Civil Engineering"
                    value={formData.majorCourse}
                    onChange={handleChange}
                    className="w-full bg-paper border border-ink/10 text-ink rounded-xl px-4 py-3 focus:outline-none focus:border-marigold text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-ink-soft">Academic Year</label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className="w-full bg-paper border border-ink/10 text-ink rounded-xl px-4 py-3 focus:outline-none focus:border-marigold text-xs font-bold"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-ink-soft">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-3 focus:outline-none focus:border-marigold text-xs font-bold"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-ink-soft">Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="Min 8 chars (numbers + letters)"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-3 focus:outline-none focus:border-marigold text-xs font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !!phoneError}
            className="w-full bg-marigold hover:bg-marigold-dark text-paper font-black py-4 rounded-xl shadow-md transition disabled:opacity-50 text-xs uppercase tracking-wider mt-4"
          >
            {isSubmitting ? 'Creating profile account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-ink-soft text-center text-xs mt-6 font-semibold animate-fade-in">
          Already have an account?{' '}
          <Link to="/login" className="text-marigold hover:underline font-bold">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
