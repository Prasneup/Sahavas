import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Award, MapPin } from 'lucide-react';
import { Roommate, MOCK_ROOMMATES } from '../services/roommatesData';

const RoommateProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Roommate | null>(null);
  const [loading, setLoading] = useState(true);

  // Connection request modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isInterested, setIsInterested] = useState(false);

  useEffect(() => {
    const fetchProfile = () => {
      setLoading(true);
      const match = MOCK_ROOMMATES.find(item => item.id === id);
      setProfile(match || null);

      if (match) {
        const storedSaved = localStorage.getItem('savedRoommates');
        if (storedSaved) {
          const list = JSON.parse(storedSaved);
          setIsSaved(list.includes(match.id));
        }
        const storedInterested = localStorage.getItem('interestedRoommates');
        if (storedInterested) {
          const list = JSON.parse(storedInterested);
          setIsInterested(list.includes(match.id));
        }
      }
      setTimeout(() => {
        setLoading(false);
      }, 200);
    };

    fetchProfile();
  }, [id]);

  const handleSaveToggle = () => {
    if (!profile) return;
    const stored = localStorage.getItem('savedRoommates');
    let list: string[] = stored ? JSON.parse(stored) : [];

    if (isSaved) {
      list = list.filter(item => item !== profile.id);
    } else {
      list = [...list, profile.id];
    }
    
    setIsSaved(!isSaved);
    localStorage.setItem('savedRoommates', JSON.stringify(list));
    localStorage.setItem('savedProfilesCount', list.length.toString());
  };

  const handleConfirmInterest = () => {
    if (!profile) return;
    const stored = localStorage.getItem('interestedRoommates');
    const list: string[] = stored ? JSON.parse(stored) : [];

    if (!list.includes(profile.id)) {
      list.push(profile.id);
    }

    setIsInterested(true);
    localStorage.setItem('interestedRoommates', JSON.stringify(list));
    localStorage.setItem('pendingRequestsCount', list.length.toString());
    setShowConfirmModal(false);
  };

  const handleSkip = () => {
    if (!profile) return;
    const stored = localStorage.getItem('skippedRoommates');
    const list: string[] = stored ? JSON.parse(stored) : [];
    if (!list.includes(profile.id)) {
      list.push(profile.id);
    }
    localStorage.setItem('skippedRoommates', JSON.stringify(list));
    navigate('/matches/results');
  };

  const handleStartChat = () => {
    if (!profile) return;
    navigate(`/chat/${profile.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-clay text-ink flex flex-col font-sans p-8 items-center justify-center">
        <div className="w-full max-w-4xl animate-pulse space-y-6">
          <div className="h-8 w-1/4 bg-ink/10 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="h-96 bg-ink/10 rounded-[32px] md:col-span-2"></div>
            <div className="h-96 bg-ink/10 rounded-[32px]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-clay text-ink flex flex-col font-sans items-center justify-center p-6">
        <div className="bg-paper border border-ink/10 rounded-[32px] p-8 text-center max-w-md shadow-lg">
          <h2 className="text-xl font-bold mb-3 font-display">Profile Not Found</h2>
          <p className="text-ink-soft text-sm mb-6">The roommate match profile could not be loaded.</p>
          <button 
            onClick={() => navigate('/matches/results')}
            className="w-full bg-marigold hover:bg-marigold-dark text-paper font-black py-3 rounded-xl transition text-xs uppercase tracking-wider shadow-sm"
          >
            Back to Match Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clay text-ink flex flex-col font-sans">
      
      {/* Header bar */}
      <header className="border-b border-ink/5 bg-clay/85 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/matches/results')} 
            className="w-9 h-9 rounded-full bg-paper border border-ink/10 flex items-center justify-center shadow-sm hover:bg-[#FAF3E8] transition"
          >
            <ArrowLeft size={18} className="text-ink-soft" />
          </button>
          <div>
            <span className="text-[10px] text-ink-soft font-bold uppercase tracking-wider block">Roommate Match</span>
            <h2 className="text-xs font-bold text-ink truncate">{profile.name} Profile</h2>
          </div>
        </div>

        <button 
          onClick={() => navigate('/matches/results')}
          className="bg-paper hover:bg-[#FAF3E8] border border-ink/10 text-ink text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
        >
          All Matches
        </button>
      </header>

      {/* Main Profile Grid View */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left main column (2/3 width on desktop) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Header Card (Name, photo overlay, match score) */}
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
            <img 
              src={profile.avatarUrl} 
              alt={profile.name} 
              className="w-24 h-24 rounded-3xl object-cover border border-ink/10 shadow-inner shrink-0" 
            />
            <div className="min-w-0 flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h1 className="text-2xl font-black text-ink font-display leading-tight">{profile.name}</h1>
                <span className="self-center text-xs font-bold text-pine bg-pine-light border border-pine/20 px-3.5 py-1 rounded-full font-mono shadow-sm">
                  🛡️ {profile.compatibilityScore}% Compatibility Match
                </span>
              </div>
              <div className="text-xs text-ink-soft font-bold flex flex-wrap justify-center sm:justify-start items-center gap-2">
                <span>🏫 {profile.college}</span>
                <span>•</span>
                <span>{profile.department} ({profile.academicYear})</span>
              </div>
            </div>
          </div>

          {/* About Me Section */}
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-ink-soft uppercase tracking-wider font-display border-b border-ink/5 pb-2">About Me</h3>
            <div className="space-y-3">
              <div className="text-xs leading-relaxed text-ink-soft font-medium">
                <span className="block font-bold text-ink mb-1">Short Bio:</span>
                "{profile.bio}"
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-semibold text-ink-soft">
                <div>
                  <span className="text-[10px] text-ink-soft/60 block">Hometown:</span>
                  <span className="font-bold text-ink">{profile.hometown}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-ink-soft uppercase tracking-wider font-display border-b border-ink/5 pb-2">Academic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-ink-soft">
              <div>
                <span className="text-[10px] text-ink-soft/60 block">College:</span>
                <span className="font-bold text-ink">{profile.college}</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-soft/60 block">Department:</span>
                <span className="font-bold text-ink">{profile.department}</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-soft/60 block">Academic Year:</span>
                <span className="font-bold text-ink">{profile.academicYear}</span>
              </div>
            </div>
          </div>

          {/* Lifestyle Preferences */}
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-ink-soft uppercase tracking-wider font-display border-b border-ink/5 pb-2">Lifestyle Habits</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs font-semibold text-ink-soft">
              <div>
                <span className="text-[10px] text-ink-soft/60 block">Smoking habit:</span>
                <span className="font-bold text-ink">{profile.smokingStatus}</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-soft/60 block">Drinking habit:</span>
                <span className="font-bold text-ink">{profile.drinkingHabit}</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-soft/60 block">Sleep schedule:</span>
                <span className="font-bold text-ink">{profile.sleepSchedule}</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-soft/60 block">Cleanliness level:</span>
                <span className="font-bold text-ink">{profile.cleanlinessLevel}</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-soft/60 block">Guest preference:</span>
                <span className="font-bold text-ink">{profile.guestPreference}</span>
              </div>
            </div>
          </div>

          {/* Housing Preferences */}
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-ink-soft uppercase tracking-wider font-display border-b border-ink/5 pb-2">Housing Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-ink-soft">
              <div>
                <span className="text-[10px] text-ink-soft/60 block">Budget range:</span>
                <span className="font-bold text-ink">{profile.budgetRange}</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-soft/60 block">Preferred location:</span>
                <span className="font-bold text-ink flex items-center gap-0.5 mt-0.5">
                  <MapPin size={11} className="text-marigold" /> Near campus
                </span>
              </div>
              <div>
                <span className="text-[10px] text-ink-soft/60 block">Preferred room type:</span>
                <span className="font-bold text-ink">Shared Flat / Single Room</span>
              </div>
            </div>
          </div>

          {/* Interests Section */}
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-ink-soft uppercase tracking-wider font-display border-b border-ink/5 pb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map(interest => (
                <span key={interest} className="text-xs font-bold text-ink bg-clay/35 border border-ink/5 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                  {interest}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Right sidebar column (Compatibility breakdown / actions) */}
        <div className="space-y-6">
          
          {/* Compatibility Breakdown visual bars */}
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-ink font-display flex items-center gap-1.5">
              <Award className="text-marigold" size={16} /> Compatibility Breakdown
            </h3>

            <div className="space-y-4 pt-1">
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-ink-soft">
                  <span>Lifestyle Match:</span>
                  <span className="font-bold font-mono text-ink">{profile.compatibilityBreakdown.lifestyle}%</span>
                </div>
                <div className="w-full bg-clay/30 h-2 rounded-full overflow-hidden">
                  <div className="bg-marigold h-full rounded-full" style={{ width: `${profile.compatibilityBreakdown.lifestyle}%` }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-ink-soft">
                  <span>Study Habits:</span>
                  <span className="font-bold font-mono text-ink">{profile.compatibilityBreakdown.study}%</span>
                </div>
                <div className="w-full bg-clay/30 h-2 rounded-full overflow-hidden">
                  <div className="bg-marigold h-full rounded-full" style={{ width: `${profile.compatibilityBreakdown.study}%` }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-ink-soft">
                  <span>Budget Match:</span>
                  <span className="font-bold font-mono text-ink">{profile.compatibilityBreakdown.budget}%</span>
                </div>
                <div className="w-full bg-clay/30 h-2 rounded-full overflow-hidden">
                  <div className="bg-marigold h-full rounded-full" style={{ width: `${profile.compatibilityBreakdown.budget}%` }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-ink-soft">
                  <span>Cleanliness Compatibility:</span>
                  <span className="font-bold font-mono text-ink">{profile.compatibilityBreakdown.cleanliness}%</span>
                </div>
                <div className="w-full bg-clay/30 h-2 rounded-full overflow-hidden">
                  <div className="bg-marigold h-full rounded-full" style={{ width: `${profile.compatibilityBreakdown.cleanliness}%` }}></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-ink-soft">
                  <span>Location Preference:</span>
                  <span className="font-bold font-mono text-ink">{profile.compatibilityBreakdown.location}%</span>
                </div>
                <div className="w-full bg-clay/30 h-2 rounded-full overflow-hidden">
                  <div className="bg-marigold h-full rounded-full" style={{ width: `${profile.compatibilityBreakdown.location}%` }}></div>
                </div>
              </div>

            </div>
          </div>

          {/* Match Actions Sidebar */}
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 shadow-sm space-y-4">
            
            <button 
              onClick={() => setShowConfirmModal(true)}
              disabled={isInterested}
              className={`w-full font-black py-4 rounded-xl shadow-md transition uppercase tracking-wider text-xs flex items-center justify-center gap-2 ${
                isInterested 
                  ? 'bg-pine-light border border-pine/20 text-pine cursor-not-allowed shadow-none' 
                  : 'bg-marigold hover:bg-marigold-dark text-paper'
              }`}
            >
              {isInterested ? '✓ Request Sent' : '❤️ Interested'}
            </button>

            <button 
              onClick={handleStartChat}
              className="w-full bg-ink hover:bg-ink-soft text-paper font-black py-3 rounded-xl transition text-xs flex items-center justify-center gap-2"
            >
              <MessageSquare size={14} /> Message
            </button>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={handleSaveToggle}
                className={`py-3 rounded-xl border border-ink/10 text-xs font-black transition ${
                  isSaved 
                    ? 'bg-amber-50 border-amber-200 text-amber-500 hover:bg-amber-100' 
                    : 'bg-paper hover:bg-[#FAF3E8] text-ink-soft'
                }`}
              >
                {isSaved ? '★ Saved' : '☆ Save'}
              </button>

              <button 
                onClick={handleSkip}
                className="py-3 bg-paper border border-ink/10 hover:bg-[#FAF3E8] text-xs font-black text-ink-soft rounded-xl transition"
              >
                👎 Skip
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 max-w-sm w-full shadow-xl space-y-4 animate-scale-up">
            <h3 className="text-base font-black text-ink font-display">Send roommate connection request?</h3>
            <p className="text-xs text-ink-soft font-semibold leading-relaxed">
              We will notify **{profile.name}** that you are interested in sharing accommodation. They can then accept and open direct chat.
            </p>
            
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => setShowConfirmModal(false)}
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

export default RoommateProfile;
