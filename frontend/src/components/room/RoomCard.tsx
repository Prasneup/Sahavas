import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, MapPin, CheckCircle } from 'lucide-react';
import { Listing } from '../../types/room';

interface RoomCardProps {
  room: Listing;
  isWishlisted?: boolean;
  onWishlistToggle?: (e: React.MouseEvent) => void;
  compatibility?: number;
  variant?: 'search' | 'dashboard';
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  isWishlisted = false,
  onWishlistToggle,
  compatibility,
  variant = 'search'
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/rooms/${room.id}`);
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600';
  const displayImage = room.images?.[0]?.imageUrl || fallbackImage;

  if (variant === 'dashboard') {
    return (
      <div 
        onClick={handleCardClick}
        className="dashboard-card overflow-hidden hover:-translate-y-1 transition duration-300 group flex flex-col cursor-pointer border border-ink/5 min-h-[340px]"
      >
        <div className="h-44 w-full bg-clay relative overflow-hidden">
          <img 
            src={displayImage} 
            alt={room.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition"
          />
          {compatibility !== undefined && (
            <div className="absolute top-4 left-4">
              <span className="text-[9px] bg-marigold border border-[#D9A25A]/25 text-paper px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                ★ {compatibility}% Match
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] text-marigold font-bold flex items-center gap-1 font-mono uppercase">
              📍 {room.distanceFromCollegeText || 'Near campus'}
            </span>
            <h4 className="text-sm font-black text-ink leading-tight group-hover:text-marigold transition line-clamp-2 font-display">
              {room.title}
            </h4>
          </div>
          
          <div className="flex items-center justify-between border-t border-ink/5 pt-3">
            <div>
              <span className="text-[8px] text-ink-soft font-bold uppercase tracking-wider block">Rent rate</span>
              <div className="flex items-center text-ink font-black text-sm font-mono leading-none">
                NPR {room.rentAmount}<span className="text-[10px] text-ink-soft font-medium ml-0.5">/mo</span>
              </div>
            </div>
            <button className="bg-marigold text-paper text-[10px] font-black uppercase px-3.5 py-2 rounded-xl transition">
              View Detail
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleCardClick}
      className="dashboard-card overflow-hidden hover:-translate-y-1 transition duration-300 group flex flex-col cursor-pointer hover:shadow-md border border-ink/5"
    >
      {/* Photo section */}
      <div className="h-64 w-full bg-clay relative overflow-hidden">
        <img 
          src={displayImage} 
          alt={room.title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
        />
        
        {/* Overlays */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {room.isVerified && (
            <span className="text-[9px] bg-pine-light border border-pine/20 text-pine px-2.5 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm flex items-center gap-1 shadow-sm">
              <CheckCircle size={10} /> Verified
            </span>
          )}
          {room.roomType && (
            <span className="text-[9px] bg-paper/90 border border-ink/10 text-ink px-2.5 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">
              {room.roomType.replace('_', ' ')}
            </span>
          )}
        </div>

        {onWishlistToggle && (
          <button 
            onClick={onWishlistToggle}
            className="absolute top-4 right-4 bg-paper/90 border border-ink/10 hover:bg-paper text-slate-300 p-2.5 rounded-full backdrop-blur-sm transition shadow-sm"
          >
            <Heart size={14} className={isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-ink-soft'} />
          </button>
        )}
      </div>

      {/* Listing Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-marigold font-black flex items-center gap-1">
              <MapPin size={12} className="stroke-[2.5]" />
              {room.distanceFromCollegeText}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-marigold-dark font-bold font-mono">
              <Star size={11} className="fill-marigold stroke-none animate-pulse" />
              {room.rating || 4.5} <span className="text-ink-soft font-semibold font-sans">({room.reviewCount || 0})</span>
            </div>
          </div>

          <h3 className="text-base font-black text-ink leading-snug group-hover:text-marigold transition font-display line-clamp-2">
            {room.title}
          </h3>

          {/* Amenities Tags */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1.5">
              {room.amenities.slice(0, 3).map((amenity) => (
                <span key={amenity} className="text-[9px] bg-clay/35 border border-ink/5 text-ink-soft px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 3 && (
                <span className="text-[9px] bg-clay/10 text-ink-soft px-1.5 py-0.5 rounded font-bold">
                  +{room.amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Rent Rate Footer */}
        <div className="flex items-center justify-between border-t border-ink/5 pt-4">
          <div>
            <span className="text-[8px] text-ink-soft font-bold uppercase tracking-wider block">Rent rate</span>
            <div className="flex items-center text-ink font-black text-base font-mono">
              <span>NPR {room.rentAmount}</span>
              <span className="text-[10px] text-ink-soft font-medium ml-1 font-sans">/mo</span>
            </div>
          </div>
          <button 
            onClick={handleCardClick}
            className="bg-marigold hover:bg-marigold-dark text-paper font-black py-2 px-4 rounded-xl transition text-[10px] uppercase tracking-wider shadow-sm"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};
