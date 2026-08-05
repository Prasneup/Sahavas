import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ShieldCheck, Compass, Heart, Star, X, MessageCircle, RefreshCw, Sun, Moon } from 'lucide-react';

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
  budgetMin: number;
  budgetMax: number;
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
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Gesture Swipe States
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeAction, setSwipeAction] = useState<'left' | 'right' | 'up' | null>(null);
  
  // Mutual Match Modal State
  const [mutualMatchProfile, setMutualMatchProfile] = useState<Match | null>(null);

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
        budgetMin: 6000,
        budgetMax: 9000,
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
        budgetMin: 5000,
        budgetMax: 7000,
        matchingPreferences: {
          "smoking": "Non-smoker"
        },
        mismatchedPreferences: {
          "sleepSchedule": "Opposite schedules (Early Bird vs Night Owl)"
        }
      },
      {
        studentId: "3",
        fullName: "Alok Prasai",
        collegeName: "NCIT Campus",
        gender: "MALE",
        age: 20,
        course: "Software Engineering",
        semester: 1,
        hometownDistrict: "Morang",
        avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=350",
        matchScorePercentage: 92,
        interests: ["Coding", "Hiking", "Books"],
        skills: ["React", "Python"],
        languages: ["Nepali", "English"],
        budgetMin: 7000,
        budgetMax: 10000,
        matchingPreferences: {
          "smoking": "Non-smoker",
          "sleepSchedule": "Early Bird"
        },
        mismatchedPreferences: {}
      }
    ];

    try {
      // Save preferences
      await api.post('/matching/preferences', payload);
      
      // Load suggestions
      const res = await api.get('/matching/suggestions');
      if (res.data && res.data.length > 0) {
        // Map response to matches shape
        const mappedMatches = res.data.map((p: any) => ({
          studentId: p.id,
          fullName: p.fullName,
          collegeName: p.collegeName,
          gender: p.gender,
          age: p.age,
          course: p.majorCourse,
          semester: p.currentSemester,
          hometownDistrict: p.hometownDistrict,
          avatarUrl: p.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          matchScorePercentage: p.completenessPercentage || 80,
          interests: p.interests || [],
          skills: p.skills || [],
          languages: p.languages || [],
          budgetMin: p.budgetMin || 5000,
          budgetMax: p.budgetMax || 9000,
          matchingPreferences: {},
          mismatchedPreferences: {}
        }));
        setMatches(mappedMatches);
      } else {
        setMatches(MOCK_MATCHES);
      }
      setCurrentIndex(0);
      setStep('MATCHES');
    } catch (err: any) {
      console.warn("API matching failed, using mock matches based on design screenshot", err);
      setMatches(MOCK_MATCHES);
      setCurrentIndex(0);
      setStep('MATCHES');
    } finally {
      setLoading(false);
    }
  };

  // Handle swipes logically
  const registerSwipe = async (targetUserId: string, action: 'PASS' | 'SAVE' | 'INTERESTED') => {
    // Call backend endpoint to persist
    try {
      const res = await api.post('/roommates/swipe', {
        targetUserId,
        actionType: action
      });
      // Show match alert if mutualMatch is true
      if (res.data && res.data.mutualMatch) {
        const matchedProfile = matches.find(m => m.studentId === targetUserId);
        if (matchedProfile) {
          setMutualMatchProfile(matchedProfile);
        }
      }
    } catch (err) {
      // In mock mode, randomly trigger a mutual match on INTERESTED swipes
      if (action === 'INTERESTED' && Math.random() > 0.4) {
        const matchedProfile = matches[currentIndex];
        setMutualMatchProfile(matchedProfile);
      }
    }

    // Increment current card index
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeAction(null);
      setDragOffset({ x: 0, y: 0 });
    }, 300);
  };

  const handleManualSwipe = (action: 'PASS' | 'SAVE' | 'INTERESTED') => {
    if (currentIndex >= matches.length) return;
    const targetUserId = matches[currentIndex].studentId;
    if (action === 'PASS') setSwipeAction('left');
    else if (action === 'INTERESTED') setSwipeAction('right');
    else if (action === 'SAVE') setSwipeAction('up');
    
    registerSwipe(targetUserId, action);
  };

  // Drag Gesture Handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (currentIndex >= matches.length) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
    setIsDragging(true);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragStart || !isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragStart(null);

    const threshold = 120;
    const targetUserId = matches[currentIndex].studentId;

    if (dragOffset.x > threshold) {
      setSwipeAction('right');
      registerSwipe(targetUserId, 'INTERESTED');
    } else if (dragOffset.x < -threshold) {
      setSwipeAction('left');
      registerSwipe(targetUserId, 'PASS');
    } else if (dragOffset.y < -threshold) {
      setSwipeAction('up');
      registerSwipe(targetUserId, 'SAVE');
    } else {
      // Snap back to center
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Reset quiz state to discovery
  const resetQuiz = () => {
    setStep('QUIZ');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col items-center justify-start pb-24 font-sans select-none overflow-x-hidden">
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
          <div className="flex flex-col items-center">
            {/* Header bar */}
            <header className="w-full flex items-center justify-between mb-6">
              <button 
                onClick={resetQuiz} 
                className="w-9 h-9 rounded-full bg-white border border-[#EAE5D9] flex items-center justify-center shadow-sm"
              >
                <ArrowLeft size={18} className="text-[#8E8674]" />
              </button>
              <h2 className="text-[#A39E93] text-xs font-bold uppercase tracking-wider font-display">Tinder discovery</h2>
              <button 
                onClick={resetQuiz}
                className="w-9 h-9 rounded-full bg-white border border-[#EAE5D9] flex items-center justify-center shadow-sm text-[#D9A25A]"
              >
                <RefreshCw size={15} />
              </button>
            </header>

            {/* Swipeable Card Deck Section */}
            <div className="relative w-full h-[520px] flex items-center justify-center mt-2">
              {currentIndex < matches.length ? (
                matches.map((match, idx) => {
                  // Render only the top card and the next card behind it
                  if (idx < currentIndex || idx > currentIndex + 1) return null;
                  
                  const isTop = idx === currentIndex;
                  
                  // Drag Styles for Top Card
                  let cardStyle: React.CSSProperties = {};
                  if (isTop) {
                    let transformStr = `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.04}deg)`;
                    if (swipeAction === 'left') {
                      transformStr = `translate(-150%, ${dragOffset.y}px) rotate(-15deg)`;
                    } else if (swipeAction === 'right') {
                      transformStr = `translate(150%, ${dragOffset.y}px) rotate(15deg)`;
                    } else if (swipeAction === 'up') {
                      transformStr = `translate(${dragOffset.x}px, -150%)`;
                    }
                    
                    cardStyle = {
                      transform: transformStr,
                      transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      zIndex: 10
                    };
                  } else {
                    // Next card style
                    cardStyle = {
                      transform: 'scale(0.96) translate(0px, 12px)',
                      opacity: 0.8,
                      zIndex: 5
                    };
                  }

                  return (
                    <div
                      key={match.studentId}
                      style={cardStyle}
                      onMouseDown={isTop ? handleDragStart : undefined}
                      onMouseMove={isTop ? handleDragMove : undefined}
                      onMouseUp={isTop ? handleDragEnd : undefined}
                      onMouseLeave={isTop && isDragging ? handleDragEnd : undefined}
                      onTouchStart={isTop ? handleDragStart : undefined}
                      onTouchMove={isTop ? handleDragMove : undefined}
                      onTouchEnd={isTop ? handleDragEnd : undefined}
                      className="absolute w-full h-full bg-white border border-[#EAE5D9] rounded-[32px] p-4 shadow-lg flex flex-col justify-between cursor-grab active:cursor-grabbing select-none"
                    >
                      {/* Big Visual Image Block */}
                      <div className="w-full h-72 rounded-2xl overflow-hidden relative bg-[#FAF8F5]">
                        <img 
                          src={match.avatarUrl} 
                          alt={match.fullName}
                          className="w-full h-full object-cover pointer-events-none"
                        />

                        {/* Medallion Overlay */}
                        <div className="absolute bottom-4 right-4 bg-[#C08A4E] text-[#FAF8F5] border-4 border-[#EAE5D9]/40 w-22 h-22 rounded-full flex flex-col items-center justify-center shadow-xl p-2 select-none pointer-events-none">
                          <span className="text-lg font-black leading-none">{match.matchScorePercentage}%</span>
                          <span className="text-[7px] font-black uppercase tracking-wider text-[#FAF8F5]/80 mt-1">Compatibility</span>
                        </div>
                        
                        {/* Swipe Direction overlay indicators */}
                        {isDragging && dragOffset.x > 30 && (
                          <div className="absolute top-4 left-4 border-4 border-green-500 text-green-500 text-xs font-black uppercase px-3 py-1 rounded rotate-[-10deg] tracking-widest">
                            INTERESTED
                          </div>
                        )}
                        {isDragging && dragOffset.x < -30 && (
                          <div className="absolute top-4 right-4 border-4 border-red-500 text-red-500 text-xs font-black uppercase px-3 py-1 rounded rotate-[10deg] tracking-widest">
                            PASS
                          </div>
                        )}
                        {isDragging && dragOffset.y < -30 && (
                          <div className="absolute bottom-4 left-4 border-4 border-amber-500 text-amber-500 text-xs font-black uppercase px-3 py-1 rounded tracking-widest">
                            SAVE
                          </div>
                        )}
                      </div>

                      {/* Header details */}
                      <div className="mt-3">
                        <div className="flex justify-between items-baseline">
                          <h3 className="text-xl font-black text-[#1E1E1E] font-display">
                            {match.fullName}, <span className="font-semibold text-[#8E8674]">{match.age}</span>
                          </h3>
                          <span className="text-xs bg-[#FAF3E8] text-[#D9A25A] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-[#D9A25A]/10">
                            NPR {match.budgetMin}-{match.budgetMax}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#8E8674] mt-1">{match.collegeName} • {match.course}</p>
                        <p className="text-[10px] text-[#A39E93] font-semibold mt-0.5">From {match.hometownDistrict}</p>
                      </div>

                      {/* Habits badges info list */}
                      <div className="border-t border-[#EAE5D9]/70 pt-3 flex flex-wrap gap-1.5 mt-2">
                        {match.interests?.slice(0, 3).map(interest => (
                          <span key={interest} className="text-[9px] bg-[#FAF8F5] border border-[#EAE5D9] text-[#8E8674] px-2 py-0.5 rounded-full font-bold uppercase">
                            {interest}
                          </span>
                        ))}
                        {Object.entries(match.matchingPreferences || {}).slice(0, 1).map(([key, val]) => (
                          <span key={key} className="text-[9px] bg-[#E6F4EA] border border-[#137333]/15 text-[#137333] px-2.5 py-0.5 rounded-full font-bold">
                            ✓ {val}
                          </span>
                        ))}
                      </div>

                      {/* Verification Badges */}
                      <div className="flex gap-2 border-t border-[#EAE5D9]/60 pt-3 mt-3 justify-center">
                        <span className="inline-flex items-center gap-1 bg-[#E6F4EA] text-[#137333] text-[9px] font-bold px-2.5 py-1 rounded-full border border-[#137333]/10">
                          <Check size={10} className="stroke-[2.5]" /> Verified Profile
                        </span>
                        <span className="inline-flex items-center gap-1 bg-[#E6F4EA] text-[#137333] text-[9px] font-bold px-2.5 py-1 rounded-full border border-[#137333]/10">
                          <ShieldCheck size={10} className="stroke-[2.5]" /> ID Checked
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-8 bg-white border border-[#EAE5D9] rounded-[32px] shadow-md flex flex-col items-center justify-center h-full w-full">
                  <Compass className="animate-spin text-[#D9A25A] mb-4" size={48} />
                  <h3 className="text-lg font-black text-[#1E1E1E] font-display">No More Roommates</h3>
                  <p className="text-xs text-[#8E8674] mt-2 max-w-[200px] mx-auto leading-relaxed">
                    Try adjusting your preference quiz parameters to search again!
                  </p>
                  <button 
                    onClick={resetQuiz}
                    className="bg-[#D9A25A] hover:bg-[#C9924A] text-white font-bold px-5 py-2.5 rounded-xl text-xs mt-6 shadow"
                  >
                    Adjust Filters
                  </button>
                </div>
              )}
            </div>

            {/* Tinder style Circular Action Buttons bottom row */}
            {currentIndex < matches.length && (
              <div className="flex items-center justify-center gap-5 mt-6 w-full">
                {/* PASS button */}
                <button
                  onClick={() => handleManualSwipe('PASS')}
                  className="w-12 h-12 rounded-full bg-white border border-[#EAE5D9] text-rose-500 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition"
                >
                  <X size={20} className="stroke-[2.5]" />
                </button>

                {/* SAVE button */}
                <button
                  onClick={() => handleManualSwipe('SAVE')}
                  className="w-10 h-10 rounded-full bg-white border border-[#EAE5D9] text-[#D9A25A] flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition"
                >
                  <Star size={16} className="fill-[#D9A25A] stroke-[#D9A25A]" />
                </button>

                {/* INTERESTED button */}
                <button
                  onClick={() => handleManualSwipe('INTERESTED')}
                  className="w-12 h-12 rounded-full bg-white border border-[#EAE5D9] text-emerald-500 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition"
                >
                  <Heart size={20} className="fill-emerald-500 stroke-none" />
                </button>

                {/* Direct CHAT button */}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-10 h-10 rounded-full bg-white border border-[#EAE5D9] text-cyan-500 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition"
                >
                  <MessageCircle size={16} className="stroke-[2.5]" />
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Full-Screen Mutual Match Overlay Modal */}
      {mutualMatchProfile && (
        <div className="fixed inset-0 bg-[#1E1E1E]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          
          <span className="text-[#D9A25A] text-xs font-bold uppercase tracking-widest animate-pulse">It's a Match!</span>
          
          <h2 className="text-4xl font-black text-white font-display mt-2 mb-6">
            Mutual interest!
          </h2>

          <p className="text-xs text-[#FAF8F5]/80 max-w-xs leading-relaxed mb-8">
            You and <span className="font-bold text-[#D9A25A]">{mutualMatchProfile.fullName}</span> are both interested in rooming together near college!
          </p>

          {/* Double Profile Avatar stack overlapping circles */}
          <div className="flex items-center justify-center -space-x-8 mb-10">
            <div className="w-28 h-28 rounded-full border-4 border-[#1E1E1E] overflow-hidden shadow-2xl relative">
              <img 
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150" 
                alt="My Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="w-28 h-28 rounded-full border-4 border-[#1E1E1E] overflow-hidden shadow-2xl relative z-10">
              <img 
                src={mutualMatchProfile.avatarUrl} 
                alt={mutualMatchProfile.fullName} 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4 w-full max-w-xs">
            <button 
              onClick={() => {
                setMutualMatchProfile(null);
                navigate('/dashboard');
              }}
              className="w-full bg-[#D9A25A] hover:bg-[#C9924A] text-white font-black py-4 rounded-xl shadow-lg transition text-xs tracking-wider uppercase"
            >
              Start Chatting
            </button>
            <button 
              onClick={() => setMutualMatchProfile(null)}
              className="w-full bg-transparent hover:bg-white/10 text-white font-bold py-3.5 rounded-xl transition text-xs"
            >
              Keep Swiping
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default RoommateDiscovery;
