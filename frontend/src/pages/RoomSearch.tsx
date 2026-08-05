import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, Star, MapPin, Heart, ArrowLeft } from 'lucide-react';
import { Listing, MOCK_LISTINGS } from '../services/listingsData';

const RoomSearch: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const res = await api.get('/listings');
      if (res.data && res.data.length > 0) {
        setListings(res.data);
      } else {
        setListings(MOCK_LISTINGS);
      }
    } catch (err) {
      console.warn("API listing fetch failed, using mock listings data", err);
      setListings(MOCK_LISTINGS);
    }
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card navigation
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(wId => wId !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  const filteredListings = listings.filter(room => 
    room.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.collegeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-clay text-ink flex flex-col font-sans">
      
      {/* Search Header Panel */}
      <header className="border-b border-ink/5 bg-clay/85 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-9 h-9 rounded-full bg-paper border border-ink/10 flex items-center justify-center shadow-sm hover:bg-[#FAF3E8] transition"
          >
            <ArrowLeft size={18} className="text-ink-soft" />
          </button>
          
          <div className="flex items-center gap-1.5">
            {/* Sahavas Mandala Logo */}
            <div className="w-7 h-7 rounded-full bg-paper flex items-center justify-center border border-ink/10">
              <svg className="w-4.5 h-4.5 text-marigold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-ink tracking-tight font-display">सहवास Rooms</h1>
          </div>
        </div>

        {/* Search Input bar */}
        <div className="flex-1 max-w-xl bg-paper border border-ink/10 rounded-full px-5 py-2.5 flex items-center gap-3 shadow-sm w-full">
          <Search className="text-marigold" size={16} />
          <input
            type="text"
            placeholder="Search rooms near your college (e.g. Pulchowk, NCIT)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-ink focus:outline-none w-full text-xs font-semibold placeholder-ink-soft/40"
          />
        </div>

        <div className="w-9 h-9 sm:block hidden"></div> {/* Placeholder spacer for header alignment */}
      </header>

      {/* Main Grid View */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-ink-soft uppercase tracking-wider">Explore Student Listings</h2>
          <span className="text-xs bg-pine-light text-pine font-bold px-3.5 py-1 rounded-full border border-pine/20 font-mono">
            {filteredListings.length} places available
          </span>
        </div>

        {filteredListings.length === 0 ? (
          <div className="text-center py-16 bg-paper border border-ink/10 rounded-[32px] max-w-md mx-auto p-8 shadow-sm">
            <h3 className="text-lg font-bold mb-2 font-display">No Listings Found</h3>
            <p className="text-ink-soft text-sm mb-6">We couldn't find any rooms matching your search. Try searching for other colleges or districts.</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="bg-marigold hover:bg-marigold-dark text-paper font-black py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition shadow-sm"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredListings.map((room) => (
              <div 
                key={room.id} 
                onClick={() => navigate(`/rooms/${room.id}`)}
                className="dashboard-card overflow-hidden hover:-translate-y-1 transition duration-300 group flex flex-col cursor-pointer hover:shadow-md border border-ink/5"
              >
                
                {/* Photo section */}
                <div className="h-64 w-full bg-clay relative overflow-hidden">
                  <img 
                    src={room.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=600'} 
                    alt="Listing Photo"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  
                  {/* Overlays */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {room.isVerified && (
                      <span className="text-[9px] bg-pine-light border border-pine/20 text-pine px-2.5 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm flex items-center gap-1 shadow-sm">
                        <CheckCircle size={10} /> Verified
                      </span>
                    )}
                    <span className="text-[9px] bg-paper/90 border border-ink/10 text-ink px-2.5 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm">
                      {room.roomType.replace('_', ' ')}
                    </span>
                  </div>

                  <button 
                    onClick={(e) => toggleWishlist(room.id, e)}
                    className="absolute top-4 right-4 bg-paper/90 border border-ink/10 hover:bg-paper text-slate-300 p-2.5 rounded-full backdrop-blur-sm transition shadow-sm"
                  >
                    <Heart size={14} className={wishlist.includes(room.id) ? 'fill-rose-500 text-rose-500' : 'text-ink-soft'} />
                  </button>
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
                        {room.rating} <span className="text-ink-soft font-semibold font-sans">({room.reviewCount})</span>
                      </div>
                    </div>

                    <h3 className="text-base font-black text-ink leading-snug group-hover:text-marigold transition font-display line-clamp-2">
                      {room.title}
                    </h3>

                    {/* Amenities Tags */}
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
                      onClick={() => navigate(`/rooms/${room.id}`)}
                      className="bg-marigold hover:bg-marigold-dark text-paper font-black py-2 px-4 rounded-xl transition text-[10px] uppercase tracking-wider shadow-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RoomSearch;
