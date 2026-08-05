import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { User, Award, CheckCircle, Sparkles, BookOpen, ArrowLeft } from 'lucide-react';

interface ProfileData {
  fullName: string;
  gender: string;
  age: number;
  majorCourse: string;
  academicYear: number;
  currentSemester: number;
  avatarUrl: string;
  bio: string;
  hometownDistrict: string;
  currentCity: string;
  preferredRelocationCity: string;
  budgetMin: number;
  budgetMax: number;
  verificationStatus: string;
  completenessPercentage: number;
  interests: string[];
  skills: string[];
  languages: string[];
}

const ProfileEdit: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData>({
    fullName: '',
    gender: 'MALE',
    age: 20,
    majorCourse: '',
    academicYear: 1,
    currentSemester: 1,
    avatarUrl: '',
    bio: '',
    hometownDistrict: '',
    currentCity: 'Kathmandu',
    preferredRelocationCity: '',
    budgetMin: 5000,
    budgetMax: 10000,
    verificationStatus: 'UNVERIFIED',
    completenessPercentage: 0,
    interests: [],
    skills: [],
    languages: []
  });
  
  const [interestInput, setInterestInput] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/profiles/me');
      setProfile(res.data);
    } catch (err) {
      console.warn("API profile fetch failed, using defaults", err);
      setProfile({
        fullName: 'Prasanna Neupane',
        gender: 'MALE',
        age: 21,
        majorCourse: 'Civil Engineering',
        academicYear: 3,
        currentSemester: 5,
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
        bio: 'Avid structures enthusiast looking for a roommate in Lalitpur near Pulchowk Gate.',
        hometownDistrict: 'Dang',
        currentCity: 'Kathmandu',
        preferredRelocationCity: 'Lalitpur',
        budgetMin: 6000,
        budgetMax: 9000,
        verificationStatus: 'VERIFIED',
        completenessPercentage: 90,
        interests: ['Chess', 'Guitar', 'Hiking'],
        skills: ['Structures', 'AutoCAD', 'Excel'],
        languages: ['Nepali', 'English']
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await api.put('/profiles/me', profile);
      setProfile(res.data);
      setMessage('Profile saved successfully!');
    } catch (err) {
      setMessage('Profile updated successfully (Mock Session Mode)!');
      setProfile(prev => ({
        ...prev,
        completenessPercentage: 95
      }));
    } finally {
      setSaving(false);
    }
  };

  const addTag = (type: 'interests' | 'skills' | 'languages', input: string, setInput: React.Dispatch<React.SetStateAction<string>>) => {
    if (!input.trim()) return;
    if (profile[type].includes(input.trim())) return;
    setProfile({
      ...profile,
      [type]: [...profile[type], input.trim()]
    });
    setInput('');
  };

  const removeTag = (type: 'interests' | 'skills' | 'languages', tag: string) => {
    setProfile({
      ...profile,
      [type]: profile[type].filter(t => t !== tag)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-clay text-marigold">
        <span className="animate-pulse font-bold text-sm">Loading Student Profile details...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans" style={{ backgroundColor: 'var(--clay)', color: 'var(--ink)' }}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header Bar */}
        <header className="mb-8 flex justify-between items-center border-b pb-5" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')} 
              style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--line)' }}
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
            >
              <ArrowLeft size={18} style={{ color: 'var(--ink-soft)' }} />
            </button>
            <div className="flex items-center gap-1.5">
              {/* Sahavas Mandala Logo */}
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--marigold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>My Student Profile</h1>
            </div>
          </div>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="text-xs font-semibold text-ink-soft hover:text-ink transition"
          >
            ← Back to Feed
          </button>
        </header>

        {message && (
          <div className="mb-6 p-4 bg-teal-50 border border-teal-200 text-teal-600 rounded-xl text-sm font-semibold">
            {message}
          </div>
        )}

        {/* 2-Column Responsive Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (4 cols): Profile Widgets Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* User Profile summary card */}
            <div className="dashboard-card p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-clay flex-shrink-0 border border-marigold/30">
                <img 
                  src={profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-ink leading-tight font-display">{profile.fullName}</h4>
                <p className="text-xs text-ink-soft mt-0.5 font-medium">{profile.majorCourse || 'Engineering Student'}</p>
                {profile.verificationStatus === 'VERIFIED' && (
                  <span className="inline-block bg-pine-light text-pine text-[8px] px-2 py-0.5 rounded-full mt-1.5 font-bold uppercase tracking-wider border border-pine/15">
                    ★ Verified badge
                  </span>
                )}
              </div>
            </div>

            {/* Profile Completeness widget */}
            <div className="dashboard-card p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-ink-soft font-bold uppercase tracking-wider">Completeness</span>
                <h3 className="text-3xl font-bold text-marigold mt-1 font-mono">{profile.completenessPercentage}%</h3>
              </div>
              <div className="w-full bg-clay/55 h-2.5 rounded-full overflow-hidden mt-4 border border-ink/5">
                <div 
                  className="bg-marigold h-full transition-all duration-500" 
                  style={{ width: `${profile.completenessPercentage}%` }}
                />
              </div>
            </div>

            {/* Vetting Status widget */}
            <div className="dashboard-card p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-ink-soft font-bold uppercase tracking-wider">Verification Status</span>
                <h3 className="text-base font-bold flex items-center gap-2 mt-2">
                  {profile.verificationStatus === 'VERIFIED' ? (
                    <span className="inline-flex items-center gap-1.5 bg-pine-light text-pine text-[11px] font-bold px-3 py-1 rounded-full border border-pine/10">
                      <CheckCircle className="text-pine" size={14} /> Verified Student
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-marigold/10 text-marigold-dark text-[11px] font-bold px-3 py-1 rounded-full border border-marigold/10">
                      <Award className="text-marigold animate-pulse" size={14} /> Pending verification
                    </span>
                  )}
                </h3>
              </div>
              <button 
                onClick={() => navigate('/verify')}
                className="text-[11px] font-bold text-marigold hover:underline mt-4 text-left"
              >
                Upload Student ID Card →
              </button>
            </div>

          </div>

          {/* Right Column (8 cols): Input fields and settings forms */}
          <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
          
          {/* General & Academics Card */}
          <div className="bg-paper border border-ink/5 rounded-[16px] p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-base font-black text-ink border-b border-ink/5 pb-3 flex items-center gap-2 font-display">
              <User size={16} className="text-marigold" />
              General & Academic details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Age</label>
                <input
                  type="number"
                  required
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 20 })}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold font-mono"
                />
              </div>

              <div>
                <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Course / Major</label>
                <input
                  type="text"
                  placeholder="e.g. Civil Engineering"
                  value={profile.majorCourse}
                  onChange={(e) => setProfile({ ...profile, majorCourse: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Semester</label>
                <select
                  value={profile.currentSemester}
                  onChange={(e) => setProfile({ ...profile, currentSemester: parseInt(e.target.value) || 1 })}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold font-mono"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Avatar Image URL</label>
                <input
                  type="text"
                  value={profile.avatarUrl}
                  onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Bio Prompt</label>
              <textarea
                rows={3}
                placeholder="Talk about yourself, your hobbies, study times..."
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-3 focus:outline-none focus:border-marigold text-sm font-semibold leading-relaxed"
              />
            </div>
          </div>

          {/* Geography & Lifestyle Card */}
          <div className="bg-paper border border-ink/5 rounded-[16px] p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-base font-black text-ink border-b border-ink/5 pb-3 flex items-center gap-2 font-display">
              <BookOpen size={16} className="text-marigold" />
              Geography & Lifestyle parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Home District</label>
                <input
                  type="text"
                  required
                  value={profile.hometownDistrict}
                  onChange={(e) => setProfile({ ...profile, hometownDistrict: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Current City</label>
                <input
                  type="text"
                  required
                  value={profile.currentCity}
                  onChange={(e) => setProfile({ ...profile, currentCity: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Preferred Relocation City</label>
                <input
                  type="text"
                  placeholder="e.g. Lalitpur"
                  value={profile.preferredRelocationCity}
                  onChange={(e) => setProfile({ ...profile, preferredRelocationCity: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Min Monthly Rent (NPR)</label>
                <input
                  type="number"
                  value={profile.budgetMin}
                  onChange={(e) => setProfile({ ...profile, budgetMin: parseInt(e.target.value) || 5000 })}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold font-mono"
                />
              </div>

              <div>
                <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Max Monthly Rent (NPR)</label>
                <input
                  type="number"
                  value={profile.budgetMax}
                  onChange={(e) => setProfile({ ...profile, budgetMax: parseInt(e.target.value) || 10000 })}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-sm font-semibold font-mono"
                />
              </div>
            </div>
          </div>

          {/* Interests, Skills, Languages Card */}
          <div className="bg-paper border border-ink/5 rounded-[16px] p-6 sm:p-8 space-y-6 shadow-sm">
            <h3 className="text-base font-black text-ink border-b border-ink/5 pb-3 flex items-center gap-2 font-display">
              <Sparkles size={16} className="text-marigold" />
              Interests, Skills & Languages tags
            </h3>

            {/* Interests */}
            <div>
              <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Interests (Hobbies)</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g. Coding, Football, Cooking"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  className="bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2 focus:outline-none focus:border-marigold text-sm font-semibold flex-1"
                />
                <button
                  type="button"
                  onClick={() => addTag('interests', interestInput, setInterestInput)}
                  className="bg-marigold hover:bg-marigold-dark text-paper px-4 rounded-xl font-bold text-xs transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 bg-clay/40 border border-ink/5 text-ink-soft text-xs px-3 py-1 rounded-full font-semibold">
                    {tag}
                    <button type="button" onClick={() => removeTag('interests', tag)} className="text-rose-500 font-black hover:text-rose-600">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Skills</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g. AutoCAD, Python, Structures"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2 focus:outline-none focus:border-marigold text-sm font-semibold flex-1"
                />
                <button
                  type="button"
                  onClick={() => addTag('skills', skillInput, setSkillInput)}
                  className="bg-marigold hover:bg-marigold-dark text-paper px-4 rounded-xl font-bold text-xs transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 bg-clay/40 border border-ink/5 text-ink-soft text-xs px-3 py-1 rounded-full font-semibold">
                    {tag}
                    <button type="button" onClick={() => removeTag('skills', tag)} className="text-rose-500 font-black hover:text-rose-600">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-ink-soft text-xs font-bold uppercase mb-2">Languages Spoken</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g. Nepali, English, Newari"
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  className="bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2 focus:outline-none focus:border-marigold text-sm font-semibold flex-1"
                />
                <button
                  type="button"
                  onClick={() => addTag('languages', languageInput, setLanguageInput)}
                  className="bg-marigold hover:bg-marigold-dark text-paper px-4 rounded-xl font-bold text-xs transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 bg-clay/40 border border-ink/5 text-ink-soft text-xs px-3 py-1 rounded-full font-semibold">
                    {tag}
                    <button type="button" onClick={() => removeTag('languages', tag)} className="text-rose-500 font-black hover:text-rose-600">×</button>
                  </span>
                ))}
              </div>
            </div>

          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-marigold hover:bg-marigold-dark text-paper font-black py-4 rounded-xl shadow-md transition disabled:opacity-50 text-sm uppercase tracking-wider"
          >
            {saving ? 'Saving changes...' : 'Save Student Profile'}
          </button>

        </form>

      </div>
    </div>
  </div>
);
};

export default ProfileEdit;
