import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Heart, Navigation, ShieldCheck, Star } from 'lucide-react';
import { Listing, MOCK_LISTINGS } from '../services/listingsData';
import api from '../services/api';

const RoomDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/listings/${id}`);
        if (res.data) {
          setListing(res.data);
        } else {
          const mock = MOCK_LISTINGS.find(item => item.id === id);
          setListing(mock || null);
        }
      } catch (err) {
        const mock = MOCK_LISTINGS.find(item => item.id === id);
        setListing(mock || null);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-clay text-ink flex flex-col font-sans p-8 items-center justify-center">
        <div className="w-full max-w-4xl animate-pulse space-y-6">
          <div className="h-8 w-1/4 bg-ink/10 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-ink/10 rounded-[32px]"></div>
            <div className="space-y-4">
              <div className="h-6 w-3/4 bg-ink/10 rounded-xl"></div>
              <div className="h-4 w-1/2 bg-ink/10 rounded-xl"></div>
              <div className="h-24 w-full bg-ink/10 rounded-xl"></div>
              <div className="h-12 w-full bg-ink/10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-clay text-ink flex flex-col font-sans items-center justify-center p-6">
        <div className="bg-paper border border-ink/10 rounded-[32px] p-8 text-center max-w-md shadow-lg">
          <h2 className="text-xl font-bold mb-3 font-display">Listing Not Found</h2>
          <p className="text-ink-soft text-sm mb-6">The student room listing you are searching for does not exist or has been removed.</p>
          <button 
            onClick={() => navigate('/rooms')}
            className="w-full bg-marigold hover:bg-marigold-dark text-paper font-black py-3 rounded-xl transition text-xs uppercase tracking-wider shadow-sm"
          >
            Back to Room Search
          </button>
        </div>
      </div>
    );
  }

  const galleryImages = listing.images && listing.images.length > 0 
    ? listing.images 
    : [{ id: 'fallback', imageUrl: '/src/assets/rooms/media__1785938361229.jpg' }];

  // Calculate realistic travel metrics dynamically
  const bikeTime = `${Math.max(1, Math.round(listing.distanceKm * 2.5))} min`;
  const transitTime = `${Math.max(3, Math.round(listing.distanceKm * 4.5 + 2))} min`;

  return (
    <div className="min-h-screen bg-clay text-ink flex flex-col font-sans">
      
      {/* Top Header sticky bar */}
      <header className="border-b border-ink/5 bg-clay/85 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/rooms')} 
            className="w-9 h-9 rounded-full bg-paper border border-ink/10 flex items-center justify-center shadow-sm hover:bg-[#FAF3E8] transition"
          >
            <ArrowLeft size={18} className="text-ink-soft" />
          </button>
          <span className="text-xs font-bold text-ink-soft uppercase tracking-wider sm:block hidden">Listing Detail View</span>
        </div>
        
        <div className="flex items-center gap-2">
          {listing.isVerified && (
            <span className="text-[10px] bg-pine-light border border-pine/20 text-pine px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <ShieldCheck size={12} /> Verified
            </span>
          )}
          <span className="text-[10px] bg-paper border border-ink/10 text-ink px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
            {listing.roomType.replace('_', ' ')}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns (Gallery, Title, Description) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Main Photo Gallery */}
          <div className="bg-paper border border-ink/10 rounded-[32px] p-4 shadow-sm overflow-hidden flex flex-col">
            <div className="h-96 w-full bg-clay rounded-2xl overflow-hidden relative">
              <img 
                src={galleryImages[activeImageIndex]?.imageUrl} 
                alt="Room Gallery Active"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.01]"
              />
              
              <button 
                onClick={() => setIsSaved(!isSaved)}
                className="absolute top-4 right-4 bg-paper/95 hover:bg-paper border border-ink/10 text-ink p-3 rounded-full shadow-md transition"
                title="Save Room"
              >
                <Heart size={16} className={isSaved ? 'fill-rose-500 text-rose-500' : 'text-ink-soft'} />
              </button>
            </div>
            
            {/* Gallery Thumbnails List */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                      activeImageIndex === idx ? 'border-marigold' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description Card */}
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 shadow-sm space-y-5">
            <div>
              <span className="text-[10px] text-marigold font-black uppercase tracking-wider block font-mono">
                📍 {listing.distanceFromCollegeText}
              </span>
              <h1 className="text-2xl font-black text-ink font-display leading-tight mt-1">{listing.title}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-ink-soft border-t border-b border-ink/5 py-3">
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-marigold stroke-none animate-pulse" />
                <span>{listing.rating} Rating</span>
              </div>
              <div className="border-l border-ink/10 h-3"></div>
              <span>{listing.reviewCount} Student Reviews</span>
              <div className="border-l border-ink/10 h-3"></div>
              <span className="text-pine">Available Now</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-ink-soft uppercase tracking-wider">About this Room</h3>
              <p className="text-ink-soft text-sm leading-relaxed font-medium">
                {listing.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="space-y-3 pt-4 border-t border-ink/5">
              <h3 className="text-xs font-bold text-ink-soft uppercase tracking-wider">Room Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {listing.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-xs font-semibold text-ink-soft bg-[#FAF8F5] border border-ink/5 px-3 py-2 rounded-xl">
                    <span className="text-marigold">✓</span>
                    <span>{amenity.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right Sticky Column (Action Sidebar) */}
        <div className="space-y-6">
          
          {/* Booking & Price card */}
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 shadow-sm space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-ink/5">
              <div>
                <span className="text-[9px] text-ink-soft font-bold uppercase tracking-wider block">Rate per Month</span>
                <div className="text-xl font-black text-ink font-mono mt-0.5">
                  NPR {listing.rentAmount}
                  <span className="text-xs text-ink-soft font-medium font-sans ml-1">/mo</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-ink-soft font-bold uppercase tracking-wider block">Security Deposit</span>
                <div className="text-xs font-bold text-ink-soft font-mono mt-0.5">
                  NPR {listing.depositAmount}
                </div>
              </div>
            </div>

            {/* Travel breakdown stats panel */}
            <div className="bg-[#FAF8F5] border border-ink/5 rounded-2xl p-4 space-y-3">
              <h4 className="text-[10px] text-ink-soft font-bold uppercase tracking-wider flex items-center gap-1 font-display">
                <Navigation size={12} className="text-marigold" /> Travel Proximity
              </h4>
              
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 text-xs font-semibold text-ink-soft font-mono">
                <div className="flex items-center gap-1.5">
                  <span>🚶</span>
                  <span>{listing.walkingTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🚴</span>
                  <span>{bikeTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>🚌</span>
                  <span>{transitTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>📍</span>
                  <span>{listing.distanceKm} km</span>
                </div>
              </div>
              <div className="text-[9px] text-ink-soft/75 mt-1 block font-sans">
                Calculated to nearest campus: **{listing.collegeName}**
              </div>
            </div>

            {/* Show Route main action button */}
            <button 
              onClick={() => navigate(`/rooms/${listing.id}/route`)}
              className="w-full bg-marigold hover:bg-marigold-dark text-paper font-black py-4 rounded-xl shadow-md transition uppercase tracking-wider text-xs flex items-center justify-center gap-2"
            >
              Show Route Map <Navigation size={14} className="fill-paper" />
            </button>
          </div>

          {/* Contact Owner & Saved button */}
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={listing.hostAvatarUrl} 
                alt="Host Avatar" 
                className="w-10 h-10 rounded-full object-cover border border-ink/10"
              />
              <div>
                <span className="text-[8px] text-ink-soft font-bold uppercase tracking-wider block">Property Owner</span>
                <h4 className="text-xs font-bold text-ink">
                  {listing.hostName}
                </h4>
                <span className="text-[9px] text-pine font-bold uppercase tracking-wide block">✓ Verified Landlord</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/chat')}
              className="w-full bg-ink hover:bg-ink-soft text-paper font-black py-3 rounded-xl transition text-xs flex items-center justify-center gap-2"
            >
              <MessageSquare size={13} /> Contact Owner
            </button>

            <button 
              onClick={() => setIsSaved(!isSaved)}
              className={`w-full py-3 rounded-xl border border-ink/10 text-xs font-black transition ${
                isSaved 
                  ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100' 
                  : 'bg-paper hover:bg-[#FAF3E8] text-ink-soft'
              }`}
            >
              {isSaved ? '♥ Saved in Shortlist' : '♡ Save Room'}
            </button>
          </div>

        </div>

      </main>
    </div>
  );
};

export default RoomDetails;
