import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, RefreshCw } from 'lucide-react';
import { Roommate } from '../services/roommatesData';
import api from '../services/api';

const MatchResults: React.FC = () => {
  const navigate = useNavigate();
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [interestedIds, setInterestedIds] = useState<string[]>([]);

  // Modal connection request state
  const [selectedRoommate, setSelectedRoommate] = useState<Roommate | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    // Load from local storage if skipped or saved before
    const storedSkipped = localStorage.getItem('skippedRoommates');
    if (storedSkipped) setSkippedIds(JSON.parse(storedSkipped));

    const storedSaved = localStorage.getItem('savedRoommates');
    if (storedSaved) setSavedIds(JSON.parse(storedSaved));

    const storedInterested = localStorage.getItem('interestedRoommates');
    if (storedInterested) setInterestedIds(JSON.parse(storedInterested));

    const loadSuggestions = async () => {
      try {
        const res = await api.get('/matching/suggestions');
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((r: any) => ({
            id: r.studentId,
            name: r.fullName,
            compatibilityScore: Math.round(r.matchScorePercentage || 85),
            college: r.collegeName || "NCIT Balkumari",
            department: r.majorCourse || "Computer Science",
            academicYear: `${r.academicYear} Year`,
            budgetRange: `NPR ${r.budgetMin} - ${r.budgetMax} / mo`,
            smokingStatus: r.matchingPreferences?.smoking === 1 ? "Non-Smoker" : (r.matchingPreferences?.smoking === 5 ? "Regular Smoker" : "Social Smoker"),
            drinkingHabit: r.matchingPreferences?.drinking === 1 ? "Never" : "Socially",
            studyStyle: "Quiet library study",
            sleepSchedule: r.matchingPreferences?.sleepSchedule === 2 ? "Early Bird" : "Late Owl",
            cleanlinessLevel: r.matchingPreferences?.cleanliness === 5 ? "High Cleanliness" : (r.matchingPreferences?.cleanliness === 3 ? "Moderate Cleanliness" : "Low Cleanliness"),
            guestPreference: "No overnight guests",
            hometown: r.hometownDistrict || "Kathmandu",
            bio: r.bio || "Student matching partner on Sahavas",
            avatarUrl: r.avatarUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
            interests: ["Football", "Guitar", "Gaming"],
            compatibilityBreakdown: {
              lifestyle: Math.round(80 + Math.random() * 20),
              study: Math.round(80 + Math.random() * 20),
              budget: Math.round(80 + Math.random() * 20),
              cleanliness: Math.round(80 + Math.random() * 20),
              location: Math.round(80 + Math.random() * 20)
            }
          }));
          setRoommates(mapped.sort((a: any, b: any) => b.compatibilityScore - a.compatibilityScore));
        } else {
          setRoommates([]);
        }
      } catch (err) {
        console.error("Could not fetch backend roommate suggestions", err);
        setRoommates([]);
      }
    };

    loadSuggestions();
  }, []);

  const handleSkip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = [...skippedIds, id];
    setSkippedIds(updated);
    localStorage.setItem('skippedRoommates', JSON.stringify(updated));
  };

  const handleSaveToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (savedIds.includes(id)) {
      updated = savedIds.filter(savedId => savedId !== id);
    } else {
      updated = [...savedIds, id];
    }
    setSavedIds(updated);
    localStorage.setItem('savedRoommates', JSON.stringify(updated));
    localStorage.setItem('savedProfilesCount', updated.length.toString());
  };

  const handleOpenInterestModal = (roommate: Roommate, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRoommate(roommate);
    setShowConfirmModal(true);
  };

  const handleConfirmInterest = () => {
    if (!selectedRoommate) return;
    const updated = [...interestedIds, selectedRoommate.id];
    setInterestedIds(updated);
    localStorage.setItem('interestedRoommates', JSON.stringify(updated));
    localStorage.setItem('pendingRequestsCount', updated.length.toString());
    setShowConfirmModal(false);
    setSelectedRoommate(null);
  };

  const handleRefresh = () => {
    setSkippedIds([]);
    localStorage.removeItem('skippedRoommates');
  };

  // Filter out skipped profiles
  const visibleRoommates = roommates.filter(r => !skippedIds.includes(r.id));

  return (
    <div className="min-h-screen bg-clay text-ink flex flex-col font-sans">
      
      {/* Results Header */}
      <header className="border-b border-ink/5 bg-clay/85 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/roommates')} 
            className="w-9 h-9 rounded-full bg-paper border border-ink/10 flex items-center justify-center shadow-sm hover:bg-[#FAF3E8] transition"
          >
            <ArrowLeft size={18} className="text-ink-soft" />
          </button>
          <div>
            <span className="text-[10px] text-ink-soft font-bold uppercase tracking-wider block">Match Center</span>
            <h2 className="text-xs font-bold text-ink truncate">Matches</h2>
          </div>
        </div>

        <button 
          onClick={() => navigate('/roommates')}
          className="bg-paper hover:bg-[#FAF3E8] border border-ink/10 text-ink text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
        >
          Matches Dashboard
        </button>
      </header>

      {/* Main Results Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h1 className="text-2xl font-black text-ink font-display">Your Best Roommate Matches</h1>
          <p className="text-xs text-ink-soft font-semibold leading-relaxed">
            Based on your lifestyle, budget, study habits, and housing preferences.
          </p>
        </div>

        {/* Empty States */}
        {roommates.length === 0 ? (
          <div className="text-center py-16 bg-paper border border-ink/10 rounded-[32px] max-w-md mx-auto p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold font-display text-ink">No Matches Found</h3>
            <p className="text-ink-soft text-xs leading-relaxed font-semibold">
              No compatible roommates found yet. Adjust your preference settings to expand matches.<br/>
              <span className="text-[10px] text-marigold block mt-3 font-bold uppercase tracking-wider">Find your room. Find your perfect roommate.</span>
            </p>
            <button 
              onClick={() => navigate('/roommates')}
              className="bg-marigold hover:bg-marigold-dark text-paper font-black py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition shadow-sm"
            >
              Update Preferences
            </button>
          </div>
        ) : visibleRoommates.length === 0 ? (
          <div className="text-center py-16 bg-paper border border-ink/10 rounded-[32px] max-w-md mx-auto p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold font-display text-ink">Matches Completed</h3>
            <p className="text-ink-soft text-xs leading-relaxed font-semibold">
              You have viewed all available roommate matches in the system.<br/>
              <span className="text-[10px] text-marigold block mt-3 font-bold uppercase tracking-wider">Find your room. Find your perfect roommate.</span>
            </p>
            <button 
              onClick={handleRefresh}
              className="bg-marigold hover:bg-marigold-dark text-paper font-black py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition shadow-sm flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={14} /> Refresh Matches
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleRoommates.map(roommate => {
              const isSaved = savedIds.includes(roommate.id);
              const isInterested = interestedIds.includes(roommate.id);

              return (
                <div 
                  key={roommate.id}
                  onClick={() => navigate(`/matches/${roommate.id}`, { state: { roommate } })}
                  className="dashboard-card p-5 bg-paper flex flex-col justify-between hover:shadow-md transition cursor-pointer border border-ink/5 relative overflow-hidden group"
                >
                  {/* Top Header Card Info */}
                  <div className="flex items-start gap-4">
                    <img 
                      src={roommate.avatarUrl} 
                      alt={roommate.name} 
                      className="w-16 h-16 rounded-2xl object-cover border border-ink/10 shadow-sm shrink-0" 
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black text-ink truncate group-hover:text-marigold transition">
                          {roommate.name}
                        </h3>
                        <span className="text-xs font-bold text-pine bg-pine-light px-2.5 py-0.5 rounded-full font-mono shrink-0 ml-2">
                          {roommate.compatibilityScore}% Match
                        </span>
                      </div>
                      
                      <div className="text-[10px] text-ink-soft font-bold flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span>🏫 {roommate.college}</span>
                        <span>•</span>
                        <span>{roommate.department}</span>
                      </div>

                      <p className="text-[10px] text-ink-soft/85 italic line-clamp-2 pt-1 font-medium leading-relaxed">
                        "{roommate.bio}"
                      </p>
                    </div>
                  </div>

                  {/* Roommate details tags */}
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 py-3.5 my-3.5 border-t border-b border-ink/5 text-[9px] font-semibold text-ink-soft">
                    <div className="flex justify-between">
                      <span>Sleep schedule:</span>
                      <span className="font-bold text-ink font-mono">{roommate.sleepSchedule}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Smoking status:</span>
                      <span className="font-bold text-ink font-mono">{roommate.smokingStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Study style:</span>
                      <span className="font-bold text-ink font-mono truncate max-w-[120px]">{roommate.studyStyle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Budget range:</span>
                      <span className="font-bold text-ink font-mono">{roommate.budgetRange.replace(' / mo', '')}</span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-1">
                    <button 
                      onClick={(e) => handleSkip(roommate.id, e)}
                      className="text-[10px] font-black uppercase text-ink-soft/60 hover:text-rose-500 py-1.5 px-3 rounded-lg transition"
                      title="Skip match"
                    >
                      👎 Skip
                    </button>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => handleSaveToggle(roommate.id, e)}
                        className={`p-2.5 rounded-full border transition ${
                          isSaved 
                            ? 'bg-amber-50 border-amber-200 text-amber-500' 
                            : 'bg-paper border-ink/10 text-ink-soft/60 hover:bg-clay/10'
                        }`}
                        title={isSaved ? "Saved" : "Save Profile"}
                      >
                        <Star size={14} className={isSaved ? "fill-amber-500 text-amber-500" : ""} />
                      </button>

                      <button 
                        onClick={(e) => handleOpenInterestModal(roommate, e)}
                        disabled={isInterested}
                        className={`py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 ${
                          isInterested 
                            ? 'bg-pine-light border border-pine/20 text-pine cursor-not-allowed shadow-none' 
                            : 'bg-marigold hover:bg-marigold-dark text-paper'
                        }`}
                      >
                        {isInterested ? '✓ Request Sent' : '❤️ Interested'}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedRoommate && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 max-w-sm w-full shadow-xl space-y-4 animate-scale-up">
            <h3 className="text-base font-black text-ink font-display">Send roommate connection request?</h3>
            <p className="text-xs text-ink-soft font-semibold leading-relaxed">
              We will notify **{selectedRoommate.name}** that you are interested in sharing accommodation. They can then accept and open direct chat.
            </p>
            
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => { setShowConfirmModal(false); setSelectedRoommate(null); }}
                className="flex-1 py-3 border border-ink/10 hover:bg-clay/10 text-xs font-bold text-ink-soft rounded-xl transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmInterest}
                className="flex-1 py-3 bg-marigold hover:bg-marigold-dark text-paper text-xs font-black uppercase tracking-wider rounded-xl transition shadow-sm"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MatchResults;
