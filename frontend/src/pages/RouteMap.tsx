import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, Info } from 'lucide-react';
import { Listing } from '../services/listingsData';
import api from '../services/api';

const RouteMap: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  // Coordinate Projection Map Helpers
  const MIN_LAT = 27.65;
  const MAX_LAT = 27.71;
  const MIN_LNG = 85.27;
  const MAX_LNG = 85.36;

  const getSvgX = (lng: number) => {
    return ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 400;
  };

  const getSvgY = (lat: number) => {
    return (1 - (lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 400;
  };

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/listings/${id}`);
        if (res.data) {
          setListing(res.data);
        } else {
          setListing(null);
        }
      } catch (err) {
        console.error("Failed to fetch listing route details", err);
        setListing(null);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-clay text-ink flex flex-col font-sans p-8 items-center justify-center">
        <div className="w-full max-w-4xl animate-pulse space-y-6">
          <div className="h-8 w-1/4 bg-ink/10 rounded-xl"></div>
          <div className="h-96 w-full bg-ink/10 rounded-[32px]"></div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-clay text-ink flex flex-col font-sans items-center justify-center p-6">
        <div className="bg-paper border border-ink/10 rounded-[32px] p-8 text-center max-w-md shadow-lg">
          <h2 className="text-xl font-bold mb-3 font-display">Listing Not Found</h2>
          <p className="text-ink-soft text-sm mb-6">The listing map coordinates could not be loaded.</p>
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

  // Calculate dynamic travel times
  const bikeTime = `${Math.max(1, Math.round(listing.distanceKm * 2.5))} min`;
  const transitTime = `${Math.max(3, Math.round(listing.distanceKm * 4.5 + 2))} min`;

  return (
    <div className="min-h-screen bg-clay text-ink flex flex-col font-sans">
      
      {/* Route Map Header Bar */}
      <header className="border-b border-ink/5 bg-clay/85 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/rooms/${listing.id}`)} 
            className="w-9 h-9 rounded-full bg-paper border border-ink/10 flex items-center justify-center shadow-sm hover:bg-[#FAF3E8] transition"
          >
            <ArrowLeft size={18} className="text-ink-soft" />
          </button>
          <div>
            <span className="text-[10px] text-ink-soft font-bold uppercase tracking-wider block">Route Map Page</span>
            <h2 className="text-xs font-bold text-ink truncate max-w-[200px] sm:max-w-sm">{listing.title}</h2>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/rooms/${listing.id}`)}
          className="bg-paper hover:bg-[#FAF3E8] border border-ink/10 text-ink text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
        >
          Back to Details
        </button>
      </header>

      {/* Main details body layout */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Route descriptions and stats cards */}
        <div className="space-y-6">
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 shadow-sm space-y-4">
            <span className="text-[9px] bg-pine-light border border-pine/20 text-pine px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-block">
              Route Verified
            </span>
            <h1 className="text-xl font-black text-ink font-display leading-tight">Campus Distance Details</h1>
            <p className="text-ink-soft text-xs font-medium">
              Below is the computed distance breakdown from the room location in **{listing.title.split('near')[1] || 'Kathmandu Valley'}** to **{listing.collegeName}**.
            </p>

            {/* Travel breakdown stats panel */}
            <div className="space-y-3 pt-3 border-t border-ink/5">
              
              <div className="flex justify-between items-center bg-[#FAF8F5] border border-ink/5 p-3.5 rounded-2xl">
                <span className="text-xs font-semibold text-ink-soft flex items-center gap-1.5">
                  🚶 Walking Route:
                </span>
                <span className="text-sm font-bold text-ink font-mono">{listing.walkingTime}</span>
              </div>

              <div className="flex justify-between items-center bg-[#FAF8F5] border border-ink/5 p-3.5 rounded-2xl">
                <span className="text-xs font-semibold text-ink-soft flex items-center gap-1.5">
                  🚴 Biking Route:
                </span>
                <span className="text-sm font-bold text-ink font-mono">{bikeTime}</span>
              </div>

              <div className="flex justify-between items-center bg-[#FAF8F5] border border-ink/5 p-3.5 rounded-2xl">
                <span className="text-xs font-semibold text-ink-soft flex items-center gap-1.5">
                  🚌 Public Transit:
                </span>
                <span className="text-sm font-bold text-ink font-mono">{transitTime}</span>
              </div>

              <div className="flex justify-between items-center bg-[#FAF8F5] border border-ink/5 p-3.5 rounded-2xl">
                <span className="text-xs font-semibold text-ink-soft flex items-center gap-1.5">
                  📍 Total Distance:
                </span>
                <span className="text-sm font-bold text-ink font-mono">{listing.distanceKm} km</span>
              </div>

            </div>
          </div>

          {/* Coordinates table details */}
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-ink-soft uppercase tracking-wider">Physical Coordinates</h4>
            
            <div className="w-full bg-[#FAF6EC] border border-ink/5 rounded-xl p-3.5 text-left space-y-2 font-mono text-[9px] text-ink-soft">
              <div className="flex justify-between items-center">
                <span className="font-bold text-ink font-sans flex items-center gap-1">🏫 {listing.collegeName}</span>
                <span>[{listing.collegeLat.toFixed(4)}° N, {listing.collegeLng.toFixed(4)}° E]</span>
              </div>
              <div className="flex justify-between items-center border-t border-ink/5 pt-2">
                <span className="font-bold text-ink font-sans flex items-center gap-1">🏠 Room Location</span>
                <span>[{listing.locationLat.toFixed(4)}° N, {listing.locationLng.toFixed(4)}° E]</span>
              </div>
            </div>
            
            <span className="text-[8px] text-ink-soft/75 italic flex items-center gap-1 pt-1 font-sans">
              <Info size={10} /> Computed dynamically based on real student neighborhood coordinates.
            </span>
          </div>
        </div>

        {/* Right Side: Expanded Vector Map Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 shadow-sm flex flex-col h-[520px]">
            
            {/* Map title block */}
            <div className="mb-4">
              <h4 className="text-sm font-bold text-ink flex items-center gap-1.5 font-display">
                <Navigation className="text-marigold animate-pulse" size={16} /> Projected Campus Route Canvas
              </h4>
              <p className="text-[10px] text-ink-soft mt-0.5">Focused mapping coordinates for **{listing.collegeName}**</p>
            </div>

            {/* SVG Projected Route Map */}
            <div className="flex-1 bg-[#FAF6EC] border border-ink/10 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner">
              <svg className="w-full h-full select-none" viewBox="0 0 400 400">
                {/* Grid Lines */}
                <defs>
                  <pattern id="routeGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect width="20" height="20" fill="none" />
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--ink)" strokeWidth="0.5" opacity="0.05" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#routeGrid)" />

                {/* Stylized River (Bagmati) */}
                <path 
                  d="M 0,280 Q 150,230 200,210 T 400,250" 
                  fill="none" 
                  stroke="#A8D0E6" 
                  strokeWidth="8" 
                  opacity="0.5" 
                  strokeLinecap="round" 
                />
                <text x="280" y="270" fill="var(--ink-soft)" fontSize="8" fontWeight="bold" opacity="0.3" className="italic font-sans">Bagmati River</text>

                {/* Route drawing */}
                <path 
                  d={`M ${getSvgX(listing.locationLng)},${getSvgY(listing.locationLat)} L ${getSvgX(listing.collegeLng)},${getSvgY(listing.collegeLat)}`}
                  fill="none"
                  stroke="var(--marigold)"
                  strokeWidth="4"
                  opacity="0.2"
                  strokeLinecap="round"
                />
                <path 
                  d={`M ${getSvgX(listing.locationLng)},${getSvgY(listing.locationLat)} L ${getSvgX(listing.collegeLng)},${getSvgY(listing.collegeLat)}`}
                  fill="none"
                  stroke="var(--marigold)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  className="animate-dash"
                />

                {/* Room Location Pin */}
                {(() => {
                  const rx = getSvgX(listing.locationLng);
                  const ry = getSvgY(listing.locationLat);
                  return (
                    <g>
                      <circle cx={rx} cy={ry} r="16" fill="var(--marigold)" opacity="0.2" className="animate-pulse" />
                      <path 
                        d={`M ${rx},${ry} C ${rx-5},${ry-8} ${rx-8},${ry-15} ${rx-8},${ry-20} A 8,8 0 1,1 ${rx+8},${ry-20} C ${rx+8},${ry-15} ${rx+5},${ry-8} ${rx},${ry} Z`} 
                        fill="var(--marigold)"
                        stroke="var(--paper)"
                        strokeWidth="1.5"
                      />
                      <circle cx={rx} cy={ry-20} r="2.5" fill="var(--paper)" />
                    </g>
                  );
                })()}

                {/* College Location Marker */}
                {(() => {
                  const cx = getSvgX(listing.collegeLng);
                  const cy = getSvgY(listing.collegeLat);
                  return (
                    <g transform={`translate(${cx}, ${cy})`}>
                      <circle cx="0" cy="0" r="12" fill="var(--pine)" opacity="0.2" className="animate-pulse" />
                      <circle cx="0" cy="0" r="6" fill="var(--pine)" stroke="var(--paper)" strokeWidth="1.5" />
                      
                      <g transform="translate(0, -18)">
                        <rect x="-45" y="-12" width="90" height="15" rx="4" fill="var(--pine)" />
                        <text x="0" y="-2" fill="var(--paper)" fontSize="6" fontWeight="bold" textAnchor="middle">
                          {listing.collegeName}
                        </text>
                      </g>
                    </g>
                  );
                })()}
              </svg>
            </div>
            
          </div>
        </div>

      </main>
    </div>
  );
};

export default RouteMap;
