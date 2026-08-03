import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertTriangle, Check, User, Heart, MessageCircle, X } from 'lucide-react';

interface Match {
  studentId: string;
  fullName: string;
  collegeName: string;
  gender: string;
  age: number;
  course: string;
  semester: number;
  hometownDistrict: string;
  avatarUrl: string;
  matchScorePercentage: number;
  interests: string[];
  skills: string[];
  languages: string[];
  matchingPreferences: Record<string, string>;
  mismatchedPreferences: Record<string, string>;
}

const RoommateDiscovery: React.FC = () => {
  const [step, setStep] = useState<'QUIZ' | 'MATCHES'>('QUIZ');
  const [preferences, setPreferences] = useState({
    smoking: 0,
    drinking: 0,
    sleepSchedule: 0,
    cleanliness: 1,
    budgetMin: 5000,
    budgetMax: 8000,
    studyHabits: 0,
    foodPreference: 2,
    socialLevel: 1,
    noiseTolerance: 1
  });
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Save preferences
      await api.post('/matching/preferences', preferences);
      
      // Load suggestions
      const res = await api.get('/matching/suggestions');
      // Format response to include newly added profile fields
      setMatches(res.data);
      setStep('MATCHES');
    } catch (err: any) {
      console.warn("API matching failed, using mock data", err);
      setMatches([
        {
          studentId: "1",
          fullName: "Suman Thapa",
          collegeName: "IOE Pulchowk Campus",
          gender: "MALE",
          age: 21,
          course: "Mechanical Engineering",
          semester: 5,
          hometownDistrict: "Kaski, Pokhara",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
          matchScorePercentage: 88.5,
          interests: ["Football", "Guitar", "Gaming"],
          skills: ["SolidWorks", "Excel", "CAD"],
          languages: ["Nepali", "English"],
          matchingPreferences: {
            "smoking": "Non-smoker",
            "sleepSchedule": "Early Bird"
          },
          mismatchedPreferences: {
            "socialLevel": "User is Introverted; Match is Extroverted"
          }
        },
        {
          studentId: "2",
          fullName: "Rohan Basnet",
          collegeName: "Apex College",
          gender: "MALE",
          age: 22,
          course: "BBA",
          semester: 3,
          hometownDistrict: "Jhapa, Biratnagar",
          avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
          matchScorePercentage: 74.5,
          interests: ["Cooking", "Reading", "Chess"],
          skills: ["Marketing", "Photoshop"],
          languages: ["Nepali", "English", "Hindi"],
          matchingPreferences: {
            "smoking": "Non-smoker"
          },
          mismatchedPreferences: {
            "sleepSchedule": "Opposite schedules (Early Bird vs Night Owl)"
          }
        }
      ]);
      setStep('MATCHES');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-brand-cyan">Roommate Discovery</h1>
            <p className="text-slate-400 text-sm mt-1">LinkedIn + Bumble hybrid discovery tool evaluating lifestyle compatibility.</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="text-sm font-semibold text-slate-400 hover:text-white transition"
          >
            ← Back to Feed
          </button>
        </header>

        {step === 'QUIZ' ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
            <h2 className="text-xl font-bold font-display text-slate-200 mb-6 flex items-center gap-2">
              <Sparkles className="text-brand-cyan" size={20} />
              Habits & Compatibility Quiz
            </h2>

            <form onSubmit={handleQuizSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Smoking</label>
                  <select
                    value={preferences.smoking}
                    onChange={(e) => setPreferences({ ...preferences, smoking: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-cyan text-sm"
                  >
                    <option value={0}>Strict Non-Smoker</option>
                    <option value={1}>Tolerant</option>
                    <option value={2}>Active Smoker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Drinking</label>
                  <select
                    value={preferences.drinking}
                    onChange={(e) => setPreferences({ ...preferences, drinking: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-cyan text-sm"
                  >
                    <option value={0}>Non-Drinker</option>
                    <option value={1}>Social Drinker</option>
                    <option value={2}>Regular</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Sleep Schedule</label>
                  <select
                    value={preferences.sleepSchedule}
                    onChange={(e) => setPreferences({ ...preferences, sleepSchedule: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-cyan text-sm"
                  >
                    <option value={0}>Early Bird (sleeps before 10 PM)</option>
                    <option value={1}>Night Owl (sleeps after 12 AM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Cleanliness</label>
                  <select
                    value={preferences.cleanliness}
                    onChange={(e) => setPreferences({ ...preferences, cleanliness: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-cyan text-sm"
                  >
                    <option value={0}>Relaxed / Casual</option>
                    <option value={1}>Moderate</option>
                    <option value={2}>Cleanliness Freak</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Min Monthly Budget (NPR)</label>
                  <input
                    type="number"
                    value={preferences.budgetMin}
                    onChange={(e) => setPreferences({ ...preferences, budgetMin: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-cyan text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Max Monthly Budget (NPR)</label>
                  <input
                    type="number"
                    value={preferences.budgetMax}
                    onChange={(e) => setPreferences({ ...preferences, budgetMax: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-cyan text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Study Habits</label>
                  <select
                    value={preferences.studyHabits}
                    onChange={(e) => setPreferences({ ...preferences, studyHabits: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-cyan text-sm"
                  >
                    <option value={0}>Prefers Library/Outside Study</option>
                    <option value={1}>Prefers Room Study</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Food Preference</label>
                  <select
                    value={preferences.foodPreference}
                    onChange={(e) => setPreferences({ ...preferences, foodPreference: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-cyan text-sm"
                  >
                    <option value={0}>Strict Vegetarian</option>
                    <option value={1}>Non-Vegetarian</option>
                    <option value={2}>No Preference</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Social Level</label>
                  <select
                    value={preferences.socialLevel}
                    onChange={(e) => setPreferences({ ...preferences, socialLevel: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-cyan text-sm"
                  >
                    <option value={0}>Introverted / Quiet</option>
                    <option value={1}>Balanced / Ambivert</option>
                    <option value={2}>Highly Social / Outgoing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">Noise Tolerance</label>
                  <select
                    value={preferences.noiseTolerance}
                    onChange={(e) => setPreferences({ ...preferences, noiseTolerance: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-cyan text-sm"
                  >
                    <option value={0}>Zero Tolerance (Strict Silence)</option>
                    <option value={1}>Moderate (Normal talks/music is fine)</option>
                    <option value={2}>High (Party environment friendly)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-cyan hover:bg-teal-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 text-sm mt-4"
              >
                {loading ? 'Evaluating Compatibility Matrix...' : 'Find Matches'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold font-display text-slate-200">Compatible Candidates</h2>
              <button 
                onClick={() => setStep('QUIZ')}
                className="text-xs text-brand-cyan hover:underline font-semibold"
              >
                Retake Matching Quiz
              </button>
            </div>

            {/* Premium Bumble Deck Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {matches.map((match) => (
                <div key={match.studentId} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col group relative hover:border-slate-700 transition duration-300">
                  {/* Photo Section */}
                  <div className="h-72 bg-slate-950 relative overflow-hidden">
                    <img 
                      src={match.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200'} 
                      alt="Student Photo"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />

                    {/* Floating compatibility badge */}
                    <div className="absolute top-4 right-4 bg-teal-950/95 border border-teal-800 text-teal-400 text-xs font-black px-4 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                      {match.matchScorePercentage}% Match
                    </div>

                    {/* Basic Name Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 pt-16">
                      <h3 className="text-2xl font-black text-white flex items-center gap-2 font-display">
                        {match.fullName}, <span className="font-semibold text-slate-300">{match.age}</span>
                        <span className="text-xs bg-brand-cyan text-slate-950 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                          {match.gender.charAt(0)}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 font-semibold">{match.collegeName} • From {match.hometownDistrict}</p>
                    </div>
                  </div>

                  {/* LinkedIn Style Credentials */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Course / Semester row */}
                      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 flex justify-between text-xs font-semibold text-slate-300 mb-4">
                        <span>Course: <span className="text-white">{match.course}</span></span>
                        <span>Semester: <span className="text-white">{match.semester}</span></span>
                      </div>

                      {/* Hobbies / Interests tags */}
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Interests</span>
                          <div className="flex flex-wrap gap-1.5">
                            {match.interests?.map(tag => (
                              <span key={tag} className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-bold">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Skills</span>
                          <div className="flex flex-wrap gap-1.5">
                            {match.skills?.map(tag => (
                              <span key={tag} className="text-[10px] bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan px-2.5 py-0.5 rounded-full font-bold">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Warnings / mismatches list */}
                      <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-2">
                        {Object.entries(match.matchingPreferences || {}).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-2 text-[10px] text-teal-400">
                            <Check size={12} />
                            <span>Common preference: <span className="font-semibold">{val}</span></span>
                          </div>
                        ))}

                        {Object.entries(match.mismatchedPreferences || {}).map(([key, val]) => (
                          <div key={key} className="flex items-start gap-2 text-[10px] text-amber-400">
                            <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
                            <span>{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Call to Actions */}
                    <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-800/60 mt-6">
                      <button className="bg-slate-950 hover:bg-slate-800 border border-slate-800/80 text-rose-500 py-3 rounded-xl transition flex items-center justify-center">
                        <X size={18} />
                      </button>
                      <button className="col-span-2 bg-brand-cyan hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/20">
                        <MessageCircle size={16} />
                        Start Chatting
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoommateDiscovery;
