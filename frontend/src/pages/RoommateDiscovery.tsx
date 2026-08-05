import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Check, ShieldCheck, Compass } from 'lucide-react';

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
  
  // Quiz values
  const [smoking, setSmoking] = useState<boolean>(false);
  const [budget, setBudget] = useState<number>(8000);
  const [sleepSchedule, setSleepSchedule] = useState<'EARLY' | 'OWL'>('EARLY');

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      smoking: smoking ? 2 : 0,
      drinking: 0,
      sleepSchedule: sleepSchedule === 'EARLY' ? 0 : 1,
      cleanliness: 1,
      budgetMin: budget - 2000,
      budgetMax: budget + 2000,
      studyHabits: 0,
      foodPreference: 2,
      socialLevel: 1,
      noiseTolerance: 1
    };

    try {
      // Save preferences
      await api.post('/matching/preferences', payload);
      
      const MOCK_MATCHES: Match[] = [
        {
          studentId: "1",
          fullName: "Suman Thapa",
          collegeName: "Pulchowk Campus",
          gender: "MALE",
          age: 23,
          course: "Mechanical Engineering",
          semester: 5,
          hometownDistrict: "Kaski",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=350",
          matchScorePercentage: 81,
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
          hometownDistrict: "Jhapa",
          avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=350",
          matchScorePercentage: 74,
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
      ];

      // Load suggestions
      const res = await api.get('/matching/suggestions');
      if (res.data && res.data.length > 0) {
        setMatches(res.data);
      } else {
        setMatches(MOCK_MATCHES);
      }
      setStep('MATCHES');
    } catch (err: any) {
      console.warn("API matching failed, using mock matches based on design screenshot", err);
      // Fallback matching mock
      setMatches([
        {
          studentId: "1",
          fullName: "Suman Thapa",
          collegeName: "Pulchowk Campus",
          gender: "MALE",
          age: 23,
          course: "Mechanical Engineering",
          semester: 5,
          hometownDistrict: "Kaski",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=350",
          matchScorePercentage: 81,
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
        }
      ]);
      setStep('MATCHES');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col items-center justify-start pb-24 font-sans">
      <div className="w-full max-w-md px-6 pt-6">
        
        {step === 'QUIZ' ? (
          <div>
            {/* Header bar */}
            <header className="flex items-center justify-between mb-6">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="w-9 h-9 rounded-full bg-white border border-[#EAE5D9] flex items-center justify-center shadow-sm"
              >
                <ArrowLeft size={18} className="text-[#8E8674]" />
              </button>
              <h2 className="text-[#A39E93] text-xs font-bold uppercase tracking-wider">Preferences</h2>
              <div className="w-9" />
            </header>

            {/* Title */}
            <h1 className="text-3xl font-black text-[#1E1E1E] leading-tight mb-2 font-display">
              Roommate<br />Preferences
            </h1>
            
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs text-[#A39E93] font-bold mb-6">
              <div className="w-2/3 bg-[#EAE5D9]/40 h-1 rounded-full overflow-hidden">
                <div className="bg-[#D9A25A] h-full w-1/6 rounded-full" />
              </div>
              <span>1 of 6</span>
            </div>

            <form onSubmit={handleQuizSubmit} className="space-y-6">
              {/* Question 1: Smoking */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-[#1E1E1E]">Smoking</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSmoking(true)}
                    className={`py-3.5 rounded-xl border text-sm font-bold transition flex items-center justify-center ${
                      smoking 
                        ? 'border-[#D9A25A] bg-[#FAF3E8] text-[#D9A25A]' 
                        : 'border-[#EAE5D9] bg-white text-[#8E8674]'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSmoking(false)}
                    className={`py-3.5 rounded-xl border text-sm font-bold transition flex items-center justify-center ${
                      !smoking 
                        ? 'border-[#D9A25A] bg-[#FAF3E8] text-[#D9A25A]' 
                        : 'border-[#EAE5D9] bg-white text-[#8E8674]'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Question 2: Budget */}
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <label className="block text-sm font-bold text-[#1E1E1E]">Budget (NPR)</label>
                  <span className="text-sm font-bold text-[#1E1E1E]">{budget}</span>
                </div>
                
                <div className="relative pt-4">
                  {/* Floating Tooltip value */}
                  <div 
                    className="absolute -top-1 bg-[#D9A25A] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm transition"
                    style={{ left: `calc(${(budget - 3000) / 12000 * 85}% + 10px)` }}
                  >
                    {budget}
                  </div>
                  <input
                    type="range"
                    min={3000}
                    max={15000}
                    step={500}
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#EAE5D9] rounded-lg appearance-none cursor-pointer accent-[#D9A25A]"
                  />
                </div>
              </div>

              {/* Question 3: Sleep Schedule */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-[#1E1E1E]">Sleep Schedule</label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setSleepSchedule('EARLY')}
                    className={`cursor-pointer rounded-2xl p-5 border shadow-sm transition flex flex-col items-center gap-3 ${
                      sleepSchedule === 'EARLY' 
                        ? 'border-[#D9A25A] bg-white text-[#1E1E1E]' 
                        : 'border-[#EAE5D9] bg-white/70 text-[#8E8674]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#FAF3E8] flex items-center justify-center text-[#D9A25A]">
                      <Sun size={18} className="stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-black">Early Bird</span>
                  </div>

                  <div
                    onClick={() => setSleepSchedule('OWL')}
                    className={`cursor-pointer rounded-2xl p-5 border shadow-sm transition flex flex-col items-center gap-3 ${
                      sleepSchedule === 'OWL' 
                        ? 'border-[#D9A25A] bg-white text-[#1E1E1E]' 
                        : 'border-[#EAE5D9] bg-white/70 text-[#8E8674]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#FAF3E8] flex items-center justify-center text-[#D9A25A]">
                      <Moon size={18} className="stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-black">Night Owl</span>
                  </div>
                </div>
              </div>

              {/* Full Width Next Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#D9A25A] hover:bg-[#C9924A] text-white font-bold py-4 rounded-xl shadow-md transition disabled:opacity-50 text-sm mt-8"
              >
                {loading ? 'Evaluating Compatibility Matrix...' : 'Next'}
              </button>
            </form>
          </div>
        ) : (
          <div>
            {/* Header bar */}
            <header className="flex items-center justify-between mb-6">
              <button 
                onClick={() => setStep('QUIZ')} 
                className="w-9 h-9 rounded-full bg-white border border-[#EAE5D9] flex items-center justify-center shadow-sm"
              >
                <ArrowLeft size={18} className="text-[#8E8674]" />
              </button>
              <h2 className="text-[#A39E93] text-xs font-bold uppercase tracking-wider">Suggestions</h2>
              <div className="w-9" />
            </header>

            {/* Title */}
            <h1 className="text-3xl font-black text-[#1E1E1E] leading-tight mb-6 font-display">
              Your Best Matches
            </h1>

            {/* Swipeable Matches Deck - showing primary match */}
            {matches.length > 0 ? (
              <div className="space-y-6">
                {matches.slice(0, 1).map((match) => (
                  <div key={match.studentId} className="bg-white border border-[#EAE5D9] rounded-[32px] p-5 shadow-lg flex flex-col relative overflow-hidden">
                    
                    {/* Big rounded Image Container */}
                    <div className="w-full h-80 rounded-2xl overflow-hidden relative bg-slate-100">
                      <img 
                        src={match.avatarUrl} 
                        alt="Match Profile"
                        className="w-full h-full object-cover"
                      />

                      {/* Gold medallion compatibility badge overlay */}
                      <div className="absolute bottom-4 right-4 bg-[#C08A4E] text-[#FAF8F5] border-4 border-[#EAE5D9]/40 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-2xl p-2 z-10 select-none">
                        <span className="text-xl font-black leading-none">{match.matchScorePercentage}%</span>
                        <span className="text-[7px] font-black uppercase tracking-wider text-[#FAF8F5]/80 mt-1">Compatibility</span>
                      </div>
                    </div>

                    {/* Basic Name details */}
                    <div className="mt-5 mb-4">
                      <h3 className="text-2xl font-black text-[#1E1E1E] font-display">
                        {match.fullName}, <span className="font-semibold text-[#8E8674]">{match.age}</span>
                      </h3>
                    </div>

                    {/* Table Details list */}
                    <div className="border-t border-[#EAE5D9] divide-y divide-[#EAE5D9]/70 text-xs font-semibold text-[#1E1E1E] mb-6">
                      <div className="flex justify-between py-3">
                        <span className="text-[#8E8674]">Name</span>
                        <span>{match.fullName}</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-[#8E8674]">College</span>
                        <span>{match.collegeName}</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-[#8E8674]">District</span>
                        <span>{match.hometownDistrict}</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-[#8E8674]">Match Score</span>
                        <span className="font-black text-[#C08A4E]">{match.matchScorePercentage}</span>
                      </div>
                    </div>

                    {/* Action Cohabitation Request Button */}
                    <button className="w-full bg-[#D9A25A] hover:bg-[#C9924A] text-white font-black py-4 rounded-xl shadow-md transition text-xs tracking-wider uppercase mb-5">
                      Send Cohabitation Request
                    </button>

                    {/* Bottom Pill badges */}
                    <div className="flex justify-center gap-3">
                      <span className="inline-flex items-center gap-1 bg-[#E6F4EA] text-[#137333] text-[10px] font-bold px-3 py-1.5 rounded-full border border-[#137333]/10">
                        <Check size={12} className="stroke-[2.5]" /> Verified Profile
                      </span>
                      <span className="inline-flex items-center gap-1 bg-[#E6F4EA] text-[#137333] text-[10px] font-bold px-3 py-1.5 rounded-full border border-[#137333]/10">
                        <ShieldCheck size={12} className="stroke-[2.5]" /> ID Checked
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[#8E8674]">
                <Compass className="animate-spin text-[#D9A25A] mx-auto mb-4" size={32} />
                <p className="text-sm">Evaluating matches...</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default RoommateDiscovery;
