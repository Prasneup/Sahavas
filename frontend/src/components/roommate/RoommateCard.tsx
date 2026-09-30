import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

interface RoommateCardProps {
  roommate: any; // Can accept Roommate or RoommateMatch
  variant?: 'results' | 'preview' | 'recommendation';
  isSaved?: boolean;
  isInterested?: boolean;
  onSkip?: (e: React.MouseEvent) => void;
  onSaveToggle?: (e: React.MouseEvent) => void;
  onInterestClick?: (e: React.MouseEvent) => void;
}

export const RoommateCard: React.FC<RoommateCardProps> = ({
  roommate,
  variant = 'results',
  isSaved = false,
  isInterested = false,
  onSkip,
  onSaveToggle,
  onInterestClick
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/matches/${roommate.id}`, { state: { roommate } });
  };

  const compatibility = roommate.compatibilityScore !== undefined 
    ? roommate.compatibilityScore 
    : (roommate.matchScore !== undefined ? roommate.matchScore : 85);

  if (variant === 'recommendation') {
    const badges = roommate.badges || ['Clean', 'Quiet'];
    return (
      <div 
        onClick={handleCardClick}
        className="dashboard-card p-5 bg-paper flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer min-h-[190px]"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img src={roommate.avatarUrl} alt={roommate.name} className="w-12 h-12 rounded-full object-cover border border-ink/10" />
            <div>
              <h4 className="text-xs font-black text-ink">{roommate.name}</h4>
              <span className="text-[10px] text-ink-soft block font-semibold">{roommate.college}</span>
            </div>
          </div>
          <span className="text-xs font-black text-pine bg-pine-light px-2.5 py-0.5 rounded-full font-mono">
            {compatibility}% Match
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-3">
          {badges.map((badge: string) => (
            <span key={badge} className="text-[8px] bg-clay/35 border border-ink/5 text-ink-soft px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              {badge}
            </span>
          ))}
        </div>
        
        <button className="w-full bg-clay border border-ink/10 text-ink-soft hover:text-ink font-bold mt-4 py-2.5 rounded-xl transition text-[10px] uppercase tracking-wider">
          View Profile &rarr;
        </button>
      </div>
    );
  }

  if (variant === 'preview') {
    return (
      <div 
        onClick={handleCardClick}
        className="dashboard-card p-5 bg-paper flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img src={roommate.avatarUrl} alt={roommate.name} className="w-12 h-12 rounded-full object-cover border border-ink/10" />
            <div>
              <h4 className="text-xs font-black text-ink">{roommate.name}</h4>
              <span className="text-[10px] text-ink-soft block font-semibold">{roommate.college}</span>
            </div>
          </div>
          <span className="text-xs font-black text-pine bg-pine-light px-2.5 py-0.5 rounded-full font-mono">
            {compatibility}% Match
          </span>
        </div>
        
        <div className="border-t border-b border-ink/5 py-2.5 my-3 flex justify-between text-[9px] font-semibold text-ink-soft font-mono">
          <span>Sleep: **{roommate.sleepSchedule || 'Early Bird'}**</span>
          <span>Smoking: **{roommate.smokingStatus || 'Non-Smoker'}**</span>
        </div>
        
        <p className="text-[10px] text-ink-soft line-clamp-2 italic leading-relaxed font-semibold">
          "{roommate.bio || 'Student matching partner on Sahavas'}"
        </p>
        
        <button className="w-full bg-clay border border-ink/10 text-ink-soft hover:text-ink font-bold mt-4 py-2.5 rounded-xl transition text-[10px] uppercase tracking-wider">
          View Profile &rarr;
        </button>
      </div>
    );
  }

  // Full 'results' variant (from MatchResults)
  return (
    <div 
      onClick={handleCardClick}
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
              {compatibility}% Match
            </span>
          </div>
          
          <div className="text-[10px] text-ink-soft font-bold flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span>🏫 {roommate.college}</span>
            <span>•</span>
            <span>{roommate.department || 'Student'}</span>
          </div>

          <p className="text-[10px] text-ink-soft/85 italic line-clamp-2 pt-1 font-medium leading-relaxed">
            "{roommate.bio || 'Student matching partner on Sahavas'}"
          </p>
        </div>
      </div>

      {/* Roommate details tags */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 py-3.5 my-3.5 border-t border-b border-ink/5 text-[9px] font-semibold text-ink-soft">
        <div className="flex justify-between">
          <span>Sleep schedule:</span>
          <span className="font-bold text-ink font-mono">{roommate.sleepSchedule || 'Early Bird'}</span>
        </div>
        <div className="flex justify-between">
          <span>Smoking status:</span>
          <span className="font-bold text-ink font-mono">{roommate.smokingStatus || 'Non-Smoker'}</span>
        </div>
        <div className="flex justify-between">
          <span>Study style:</span>
          <span className="font-bold text-ink font-mono truncate max-w-[120px]">{roommate.studyStyle || 'Quiet study'}</span>
        </div>
        <div className="flex justify-between">
          <span>Budget range:</span>
          <span className="font-bold text-ink font-mono">{(roommate.budgetRange || 'NPR 6k-8k').replace(' / mo', '')}</span>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex items-center justify-between pt-1">
        {onSkip && (
          <button 
            onClick={onSkip}
            className="text-[10px] font-black uppercase text-ink-soft/60 hover:text-rose-500 py-1.5 px-3 rounded-lg transition"
            title="Skip match"
          >
            👎 Skip
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {onSaveToggle && (
            <button 
              onClick={onSaveToggle}
              className={`p-2.5 rounded-full border transition ${
                isSaved 
                  ? 'bg-amber-50 border-amber-200 text-amber-500' 
                  : 'bg-paper border-ink/10 text-ink-soft/60 hover:bg-clay/10'
              }`}
              title={isSaved ? "Saved" : "Save Profile"}
            >
              <Star size={14} className={isSaved ? "fill-amber-500 text-amber-500" : ""} />
            </button>
          )}

          {onInterestClick && (
            <button 
              onClick={onInterestClick}
              disabled={isInterested}
              className={`py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 ${
                isInterested 
                  ? 'bg-pine-light border border-pine/20 text-pine cursor-not-allowed shadow-none' 
                  : 'bg-marigold hover:bg-marigold-dark text-paper'
              }`}
            >
              {isInterested ? '✓ Request Sent' : '❤️ Interested'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
