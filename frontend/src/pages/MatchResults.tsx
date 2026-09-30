import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { roommateService } from '../services/roommateService';
import { RoommateCard } from '../components/roommate/RoommateCard';
import Footer from '../components/Footer';

const MatchResults: React.FC = () => {
  const navigate = useNavigate();
  const [roommates, setRoommates] = useState<any[]>([]);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [interestedIds, setInterestedIds] = useState<string[]>([]);

  // Modal connection request state
  const [selectedRoommate, setSelectedRoommate] = useState<any | null>(null);
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
        const res = await roommateService.getSuggestions();
        if (res && res.length > 0) {
          const mapped = res.map((r: any) => ({
            id: r.studentId,
            name: r.fullName,
            compatibilityScore: Math.round(r.matchScorePercentage || 85),
            college: r.collegeName || "NCIT Balkumari",
            department: r.majorCourse || "Computer Science",
            academicYear: r.academicYear ? `${r.academicYear} Year` : "1st Year",
            budgetRange: r.budgetMin && r.budgetMax ? `NPR ${Math.round(r.budgetMin)} - ${Math.round(r.budgetMax)} / mo` : "NPR 6000 - 8000 / mo",
            smokingStatus: r.matchingPreferences?.smoking || "Non-Smoker",
            drinkingHabit: "Socially",
            studyStyle: "Quiet library study",
            sleepSchedule: r.matchingPreferences?.sleepSchedule || "Early Bird",
            cleanlinessLevel: r.matchingPreferences?.cleanliness || "Moderate Cleanliness",
            guestPreference: "No overnight guests",
            hometown: r.hometownDistrict || "Kathmandu",
            bio: r.bio || "Student matching partner on Sahavas",
            avatarUrl: r.avatarUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
            interests: r.interests && r.interests.length > 0 ? r.interests : ["Football", "Guitar", "Gaming"],
            compatibilityBreakdown: r.compatibilityBreakdown ? {
              lifestyle: Math.round(r.compatibilityBreakdown.lifestyle || 80),
              study: Math.round(r.compatibilityBreakdown.study || 80),
              budget: Math.round(r.compatibilityBreakdown.budget || 80),
              cleanliness: Math.round(r.compatibilityBreakdown.cleanliness || 80),
              location: Math.round(r.compatibilityBreakdown.location || 80)
            } : {
              lifestyle: 80,
              study: 80,
              budget: 80,
              cleanliness: 80,
              location: 80
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

  const handleSaveToggle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    const isSaved = savedIds.includes(id);
    try {
      if (isSaved) {
        await roommateService.swipe(id, 'PASS');
        updated = savedIds.filter(savedId => savedId !== id);
      } else {
        await roommateService.swipe(id, 'SAVE');
        updated = [...savedIds, id];
      }
      setSavedIds(updated);
      localStorage.setItem('savedRoommates', JSON.stringify(updated));
      localStorage.setItem('savedProfilesCount', updated.length.toString());
    } catch (err) {
      console.error("Failed to toggle save roommate", err);
    }
  };

  const handleOpenInterestModal = (roommate: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRoommate(roommate);
    setShowConfirmModal(true);
  };

  const handleConfirmInterest = async () => {
    if (!selectedRoommate) return;
    try {
      await roommateService.swipe(selectedRoommate.id, 'INTERESTED');
      const updated = [...interestedIds, selectedRoommate.id];
      setInterestedIds(updated);
      localStorage.setItem('interestedRoommates', JSON.stringify(updated));
      localStorage.setItem('pendingRequestsCount', updated.length.toString());
      setShowConfirmModal(false);
      setSelectedRoommate(null);
      alert(`🎉 Connection request sent to ${selectedRoommate.name}!`);
    } catch (err) {
      console.error("Failed to send interest request", err);
      alert("Failed to send connection request. Please try again.");
    }
  };

  const handleRefresh = () => {
    setSkippedIds([]);
    localStorage.removeItem('skippedRoommates');
  };

  // Filter out skipped profiles
  const visibleRoommates = roommates.filter(r => !skippedIds.includes(r.id));

  return (
    <div className="min-h-screen bg-clay text-ink flex flex-col font-sans animate-fade-in">
      
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
          onClick={handleRefresh}
          className="text-xs font-bold text-marigold hover:text-marigold-dark flex items-center gap-1.5 transition"
          title="Reset Skipped Profiles"
        >
          <RefreshCw size={13} /> Reset Skipped
        </button>
      </header>

      {/* Main List */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-6">
        
        <div className="flex justify-between items-center">
          <h3 className="text-xs uppercase tracking-wider font-bold text-ink-soft">Your Top Roommate Suggestions</h3>
          <span className="text-xs bg-pine-light border border-pine/20 text-pine px-3.5 py-1 rounded-full font-bold font-mono">
            {visibleRoommates.length} potential matches
          </span>
        </div>

        {visibleRoommates.length === 0 ? (
          <div className="text-center py-20 bg-paper border border-ink/10 rounded-[32px] max-w-md mx-auto p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold font-display">No Matches Left</h3>
            <p className="text-ink-soft text-xs leading-relaxed font-semibold">
              You have skipped or saved all suggested roommate profiles. Retake the Compatibility Quiz to refresh your matching pool.
            </p>
            <button 
              onClick={() => navigate('/roommates')}
              className="bg-marigold hover:bg-marigold-dark text-paper font-black py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition shadow-sm w-full"
            >
              Retake Compatibility Quiz
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleRoommates.map(roommate => (
              <RoommateCard 
                key={roommate.id}
                roommate={roommate}
                variant="results"
                isSaved={savedIds.includes(roommate.id)}
                isInterested={interestedIds.includes(roommate.id)}
                onSkip={(e) => handleSkip(roommate.id, e)}
                onSaveToggle={(e) => handleSaveToggle(roommate.id, e)}
                onInterestClick={(e) => handleOpenInterestModal(roommate, e)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Connection Confirmation Modal Popup */}
      {showConfirmModal && selectedRoommate && (
        <div className="fixed inset-0 bg-[#1E1E1E]/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-paper border border-[#EAE5D9] rounded-[32px] w-full max-w-sm p-6 shadow-2xl animate-scale-in text-center space-y-4">
            
            <span className="text-[10px] uppercase tracking-wider block font-bold text-marigold">Connection Request</span>
            <h3 className="text-lg font-black text-ink font-display">Connect with {selectedRoommate.name}?</h3>
            
            <p className="text-xs text-ink-soft leading-relaxed font-semibold px-2">
              If {selectedRoommate.name} accepts your connection request, both of you will unlock a direct chat channel to plan your student relocation together.
            </p>

            <div className="flex gap-3 pt-3">
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

      <Footer />
    </div>
  );
};

export default MatchResults;
