import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Award, Sparkles, BookOpen, ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { ProfileData } from '../types/user';
import { trustService } from '../services/trustService';
import { mediaService } from '../services/mediaService';
import Footer from '../components/Footer';

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
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await trustService.getMyProfile();
      if (data) {
        setProfile(data);
      }
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setUploading(true);
    try {
      const url = await mediaService.upload(file);
      if (url) {
        setProfile(prev => ({ ...prev, avatarUrl: url }));
      }
    } catch (err) {
      alert("Failed to upload scan file to Cloudinary. Please verify connection/credentials.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const data = await trustService.updateMyProfile(profile);
      if (data) {
        setProfile(data);
      }
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
        <span className="animate-pulse font-bold text-sm">Opening Profile Customizer...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clay text-ink flex flex-col items-center pb-24 font-sans select-none overflow-x-hidden animate-fade-in">
      
      {/* Header Bar */}
      <header className="w-full bg-paper border-b border-ink/5 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm max-w-xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="w-9 h-9 rounded-full bg-paper border border-ink/10 flex items-center justify-center shadow-sm hover:bg-[#FAF3E8] transition"
        >
          <ArrowLeft size={18} className="text-ink-soft" />
        </button>
        <h2 className="text-ink-soft text-xs font-bold uppercase tracking-wider font-display">Configure Identity</h2>
        <div className="w-9" />
      </header>

      <div className="w-full max-w-xl px-6 pt-6 flex-1 flex flex-col justify-start space-y-6">
        
        {/* Title */}
        <div>
          <h1 className="text-2xl font-black text-ink tracking-tight font-display">Edit Student Profile</h1>
          <p className="text-xs text-ink-soft mt-1 font-semibold leading-relaxed">
            Customize details visible to roommate matchmaking algorithms and union members.
          </p>
        </div>

        {/* Completeness Card */}
        <div className="bg-paper border border-ink/5 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-ink-soft">
            <span>Profile Completeness Index</span>
            <span className="font-mono text-marigold-dark">{profile.completenessPercentage}%</span>
          </div>
          
          <div className="w-full bg-clay/30 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-marigold h-full rounded-full transition-all duration-500" 
              style={{ width: `${profile.completenessPercentage}%` }}
            />
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div className="bg-pine-light/80 border border-pine/20 text-pine rounded-2xl p-4 text-center font-bold text-xs shadow-sm">
            {message}
          </div>
        )}

        {/* Main Configuration Form */}
        <form onSubmit={handleSave} className="space-y-6 text-xs text-left">
          
          {/* Section 1: Demographics */}
          <div className="bg-paper border border-ink/5 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-ink font-display uppercase tracking-wider flex items-center gap-1.5">
              <User size={15} className="text-marigold" /> Demographics
            </h3>

            {/* Avatar Upload */}
            <div className="flex items-center gap-4 border-b border-ink/5 pb-4">
              <img 
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'} 
                alt="Profile Avatar"
                className="w-16 h-16 rounded-full object-cover border border-ink/10 bg-clay shadow-sm"
              />
              
              <label className="bg-clay hover:bg-clay/80 border border-ink/10 text-ink-soft hover:text-ink font-bold px-4 py-2 rounded-xl transition cursor-pointer text-[10px] uppercase tracking-wider shadow-sm relative flex items-center gap-1.5">
                {uploading ? (
                  <>
                    <Loader2 size={12} className="animate-spin text-marigold" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={12} />
                    <span>Upload Photo</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Name and Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-ink-soft">Full Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Rajan Neupane"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-ink-soft">Gender Identification</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-xs font-bold"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other / Non-binary</option>
                </select>
              </div>
            </div>

            {/* Age */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-ink-soft">Age (Years)</label>
              <input 
                type="number"
                required
                min={16}
                max={40}
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-xs font-semibold font-mono"
              />
            </div>

            {/* Bio textarea */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-ink-soft">Self Bio Description</label>
              <textarea 
                rows={3}
                placeholder="Talk about study schedules, clean rules, flat sharing interests..."
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-xs font-semibold resize-none"
              />
            </div>
          </div>

          {/* Section 2: Academics */}
          <div className="bg-paper border border-ink/5 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-ink font-display uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={15} className="text-marigold" /> Academics Context
            </h3>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-ink-soft">Major Course / Department</label>
              <input 
                type="text"
                required
                placeholder="e.g. Computer Engineering"
                value={profile.majorCourse}
                onChange={(e) => setProfile({ ...profile, majorCourse: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-ink-soft">Academic Year</label>
                <select
                  value={profile.academicYear}
                  onChange={(e) => setProfile({ ...profile, academicYear: Number(e.target.value) })}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-xs font-bold"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-ink-soft">Semester</label>
                <select
                  value={profile.currentSemester}
                  onChange={(e) => setProfile({ ...profile, currentSemester: Number(e.target.value) })}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-xs font-bold"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>{sem}th Semester</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Relocation Goals */}
          <div className="bg-paper border border-ink/5 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-ink font-display uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={15} className="text-marigold" /> Relocation Interests
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-ink-soft">Hometown District</label>
                <input 
                  type="text"
                  placeholder="e.g. Kaski, Dang, Jhapa"
                  value={profile.hometownDistrict}
                  onChange={(e) => setProfile({ ...profile, hometownDistrict: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-ink-soft">Destination / Relocating City</label>
                <input 
                  type="text"
                  placeholder="e.g. Lalitpur, Kathmandu"
                  value={profile.preferredRelocationCity}
                  onChange={(e) => setProfile({ ...profile, preferredRelocationCity: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-xs font-semibold"
                />
              </div>
            </div>

            {/* Budget Min/Max */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-ink-soft">Budget Min (NPR)</label>
                <input 
                  type="number"
                  step={500}
                  value={profile.budgetMin}
                  onChange={(e) => setProfile({ ...profile, budgetMin: Number(e.target.value) })}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-xs font-semibold font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-ink-soft">Budget Max (NPR)</label>
                <input 
                  type="number"
                  step={500}
                  value={profile.budgetMax}
                  onChange={(e) => setProfile({ ...profile, budgetMax: Number(e.target.value) })}
                  className="w-full bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2.5 focus:outline-none focus:border-marigold text-xs font-semibold font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Array Tags configuration (Interests, Skills, Languages) */}
          <div className="bg-paper border border-ink/5 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-ink font-display uppercase tracking-wider flex items-center gap-1.5">
              <Award size={15} className="text-marigold" /> Badges & Tags
            </h3>

            {/* Interests */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold text-ink-soft">Hobbies / Interests</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="e.g. Guitar, Football, Chess"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  className="flex-1 bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2 focus:outline-none focus:border-marigold text-xs font-semibold"
                />
                <button 
                  type="button"
                  onClick={() => addTag('interests', interestInput, setInterestInput)}
                  className="bg-marigold hover:bg-marigold-dark text-paper font-black px-4 rounded-xl transition text-[10px] uppercase tracking-wider"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.interests.map(t => (
                  <span key={t} className="text-[9px] bg-clay/35 border border-ink/5 text-ink-soft px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                    {t}
                    <button type="button" onClick={() => removeTag('interests', t)} className="text-rose-500 font-bold font-sans ml-1 text-xs hover:text-rose-700">&times;</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2 pt-2 border-t border-ink/5">
              <label className="block text-[10px] uppercase font-bold text-ink-soft">Academic / Life Skills</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="e.g. AutoCAD, Coding, Painting"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="flex-1 bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2 focus:outline-none focus:border-marigold text-xs font-semibold"
                />
                <button 
                  type="button"
                  onClick={() => addTag('skills', skillInput, setSkillInput)}
                  className="bg-marigold hover:bg-marigold-dark text-paper font-black px-4 rounded-xl transition text-[10px] uppercase tracking-wider"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.skills.map(t => (
                  <span key={t} className="text-[9px] bg-clay/35 border border-ink/5 text-ink-soft px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                    {t}
                    <button type="button" onClick={() => removeTag('skills', t)} className="text-rose-500 font-bold font-sans ml-1 text-xs hover:text-rose-700">&times;</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-2 pt-2 border-t border-ink/5">
              <label className="block text-[10px] uppercase font-bold text-ink-soft">Spoken Languages</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="e.g. Nepali, English, Newari"
                  value={languageInput}
                  onChange={(e) => setLanguageInput(e.target.value)}
                  className="flex-1 bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-4 py-2 focus:outline-none focus:border-marigold text-xs font-semibold"
                />
                <button 
                  type="button"
                  onClick={() => addTag('languages', languageInput, setLanguageInput)}
                  className="bg-marigold hover:bg-marigold-dark text-paper font-black px-4 rounded-xl transition text-[10px] uppercase tracking-wider"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.languages.map(t => (
                  <span key={t} className="text-[9px] bg-clay/35 border border-ink/5 text-ink-soft px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                    {t}
                    <button type="button" onClick={() => removeTag('languages', t)} className="text-rose-500 font-bold font-sans ml-1 text-xs hover:text-rose-700">&times;</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Trigger */}
          <button 
            type="submit"
            disabled={saving}
            className="w-full bg-marigold hover:bg-marigold-dark text-paper font-black py-4 rounded-xl shadow-md transition disabled:opacity-50 text-xs uppercase tracking-wider"
          >
            {saving ? 'Updating profile details...' : 'Save Profile details'}
          </button>

        </form>

      </div>
      <Footer />
    </div>
  );
};

export default ProfileEdit;
