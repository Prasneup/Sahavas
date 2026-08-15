import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, Info } from 'lucide-react';
import { Listing } from '../services/listingsData';
import api from '../services/api';

// Coordinate Projection Map Boundaries for Lalitpur/Kathmandu Valley
const MIN_LAT = 27.65;
const MAX_LAT = 27.71;
const MIN_LNG = 85.27;
const MAX_LNG = 85.36;

const COLLEGE_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "IOE Pulchowk Campus": { lat: 27.6812, lng: 85.3184 },
  "IOE Pulchowk": { lat: 27.6812, lng: 85.3184 },
  "Pulchowk": { lat: 27.6812, lng: 85.3184 },
  "Patan Multiple Campus": { lat: 27.6751, lng: 85.3210 },
  "Patan Campus": { lat: 27.6751, lng: 85.3210 },
  "NCIT Campus": { lat: 27.6780, lng: 85.3490 },
  "NCIT": { lat: 27.6780, lng: 85.3490 },
  "Nepal College of Information Technology": { lat: 27.6780, lng: 85.3490 },
  "KCMIT Campus": { lat: 27.6854, lng: 85.3441 },
  "KCMIT": { lat: 27.6854, lng: 85.3441 },
  "TU Kirtipur Campus": { lat: 27.6795, lng: 85.2870 },
  "Tribhuvan University Gate": { lat: 27.6795, lng: 85.2870 },
  "Tribhuvan University": { lat: 27.6795, lng: 85.2870 },
  "Kathmandu Engineering College": { lat: 27.6970, lng: 85.2970 },
  "KEC": { lat: 27.6970, lng: 85.2970 },
};

const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

const isValidCoordinate = (lat: any, lng: any) => {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  return (
    !isNaN(latNum) &&
    !isNaN(lngNum) &&
    latNum >= -90 &&
    latNum <= 90 &&
    lngNum >= -180 &&
    lngNum <= 180
  );
};

const RouteMap: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  // Geolocation and navigation States: default to college
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'denied'>('idle');
  const [startLocationType, setStartLocationType] = useState<'geolocation' | 'college'>('college');

  // SVG coordinate projections
  const getSvgX = (lng: number) => {
    const clampedLng = Math.max(MIN_LNG, Math.min(MAX_LNG, lng));
    return ((clampedLng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 400;
  };

  const getSvgY = (lat: number) => {
    const clampedLat = Math.max(MIN_LAT, Math.min(MAX_LAT, lat));
    return (1 - (clampedLat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 400;
  };

  // Lazy request browser geolocation permission
  const requestGeolocation = () => {
    setStartLocationType('geolocation');
    
    if (locationStatus === 'success') {
      return;
    }

    setLocationStatus('loading');
    console.log("RouteMap - Geolocation request triggered by user action");

    if (!navigator.geolocation) {
      console.warn("RouteMap - Geolocation not supported by browser");
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;
        console.log(`RouteMap - Geolocation success: Lat=${uLat}, Lng=${uLng}`);
        setUserLocation({ lat: uLat, lng: uLng });
        setLocationStatus('success');
      },
      (error) => {
        console.warn("RouteMap - Geolocation error:", error.message);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('denied');
        } else {
          setLocationStatus('error');
        }
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Fetch listing details
  useEffect(() => {
    console.log("RouteMap - Room ID:", id);
    const fetchListing = async () => {
      setLoading(true);
      try {
        console.log("RouteMap - Route API request sent for listing:", id);
        const res = await api.get(`/listings/${id}`);
        console.log("RouteMap - Fetched room data:", res.data);
        if (res.data) {
          setListing(res.data);
        } else {
          setListing(null);
        }
      } catch (err) {
        console.error("RouteMap - Fetched room data error:", err);
        setListing(null);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    };

    fetchListing();
  }, [id]);

  // Map initializing logging
  useEffect(() => {
    console.log("RouteMap - Map initialization started");
  }, []);

  // Handle Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-clay text-ink flex flex-col font-sans p-8 items-center justify-center">
        <div className="w-full max-w-4xl animate-pulse space-y-6">
          <div className="h-8 w-1/4 bg-ink/10 rounded-xl"></div>
          <div className="h-[520px] w-full bg-ink/10 rounded-[32px] flex items-center justify-center">
            <span className="text-xs font-bold text-ink-soft uppercase tracking-wider animate-pulse">Loading map...</span>
          </div>
        </div>
      </div>
    );
  }

  // Handle Missing Listing State
  if (!listing) {
    return (
      <div className="min-h-screen bg-clay text-ink flex flex-col font-sans items-center justify-center p-6">
        <div className="bg-paper border border-ink/10 rounded-[32px] p-8 text-center max-w-md shadow-lg font-sans">
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

  // Validate room coordinates
  const roomLat = parseFloat(listing.locationLat as any);
  const roomLng = parseFloat(listing.locationLng as any);
  const hasValidRoomCoords = isValidCoordinate(roomLat, roomLng);

  if (!hasValidRoomCoords) {
    console.error(`RouteMap - Invalid room coordinates: Lat=${listing.locationLat}, Lng=${listing.locationLng}`);
    return (
      <div className="min-h-screen bg-clay text-ink flex flex-col font-sans items-center justify-center p-6">
        <div className="bg-paper border border-ink/10 rounded-[32px] p-8 text-center max-w-md shadow-lg font-sans">
          <h2 className="text-xl font-bold mb-3 font-display">Room Location is Unavailable</h2>
          <p className="text-ink-soft text-sm mb-6">The latitude and longitude for this room are missing or invalid.</p>
          <button 
            onClick={() => navigate(`/rooms/${id}`)}
            className="w-full bg-marigold hover:bg-marigold-dark text-paper font-black py-3 rounded-xl transition text-xs uppercase tracking-wider shadow-sm"
          >
            Back to Room Details
          </button>
        </div>
      </div>
    );
  }

  // Resolve college coordinates and name
  const getCollegeCoordinatesAndName = (lst: any) => {
    let name = lst.collegeName || "";
    let coords = { lat: 27.6812, lng: 85.3184 }; // Default Pulchowk
    
    if (name) {
      const matchedKey = Object.keys(COLLEGE_COORDINATES).find(key => 
        name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())
      );
      if (matchedKey) {
        coords = COLLEGE_COORDINATES[matchedKey];
        return { name, ...coords };
      }
    }
    
    const textToSearch = `${lst.distanceFromCollegeText || ''} ${lst.title || ''}`;
    const matchedKey = Object.keys(COLLEGE_COORDINATES).find(key => 
      textToSearch.toLowerCase().includes(key.toLowerCase())
    );
    
    if (matchedKey) {
      name = matchedKey;
      coords = COLLEGE_COORDINATES[matchedKey];
    } else {
      name = name || "IOE Pulchowk Campus";
    }
    
    return { name, ...coords };
  };

  const resolvedCollege = getCollegeCoordinatesAndName(listing);
  const collegeLat = resolvedCollege.lat;
  const collegeLng = resolvedCollege.lng;
  const collegeName = resolvedCollege.name;

  // Select current starting location with fallback logic
  let startLat = collegeLat;
  let startLng = collegeLng;
  let startName = collegeName;
  let isUsingUserLocation = false;

  if (startLocationType === 'geolocation') {
    if (userLocation && isValidCoordinate(userLocation.lat, userLocation.lng)) {
      const inBounds = userLocation.lat >= MIN_LAT && userLocation.lat <= MAX_LAT && userLocation.lng >= MIN_LNG && userLocation.lng <= MAX_LNG;
      if (inBounds) {
        startLat = userLocation.lat;
        startLng = userLocation.lng;
        startName = "Your Location";
        isUsingUserLocation = true;
      } else {
        console.log("RouteMap - Geolocation is outside Kathmandu map boundaries. Using campus fallback for projection.");
        // Use college location coordinates but keep startName as fallback indication
        startName = `${collegeName} (Map Fallback)`;
      }
    } else {
      // Geolocation is active but coordinates are not yet available or failed
      // Fallback to college location so page is functional and does not show NaN
      startName = `${collegeName} (Fallback)`;
    }
  }

  // Validate starting coordinates
  const hasValidStartCoords = isValidCoordinate(startLat, startLng);

  if (!hasValidStartCoords) {
    console.error(`RouteMap - Invalid start coordinates: Lat=${startLat}, Lng=${startLng}`);
    return (
      <div className="min-h-screen bg-clay text-ink flex flex-col font-sans items-center justify-center p-6">
        <div className="bg-paper border border-ink/10 rounded-[32px] p-8 text-center max-w-md shadow-lg font-sans">
          <h2 className="text-xl font-bold mb-3 font-display">Unable to load route</h2>
          <p className="text-ink-soft text-sm mb-6">The starting location coordinates are missing or invalid.</p>
          <button 
            onClick={() => navigate(`/rooms/${id}`)}
            className="w-full bg-marigold hover:bg-marigold-dark text-paper font-black py-3 rounded-xl transition text-xs uppercase tracking-wider shadow-sm"
          >
            Back to Room Details
          </button>
        </div>
      </div>
    );
  }

  // Log final map inputs
  console.log(`RouteMap - Room coordinates: Lat=${roomLat}, Lng=${roomLng}`);
  console.log(`RouteMap - Start coordinates (${startName}): Lat=${startLat}, Lng=${startLng}`);

  // Compute dynamic distance
  const distanceKm = calculateDistanceKm(startLat, startLng, roomLat, roomLng);

  // Compute dynamic travel times
  const walkingTime = `${Math.max(1, Math.round(distanceKm * 12))} min`;
  const bikeTime = `${Math.max(1, Math.round(distanceKm * 2.5))} min`;
  const transitTime = `${Math.max(3, Math.round(distanceKm * 4.5 + 2))} min`;

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
        
        {/* Left Side: Route descriptions, stats cards, and Geolocation status */}
        <div className="space-y-6">
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 shadow-sm space-y-4">
            <span className="text-[9px] bg-pine-light border border-pine/20 text-pine px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-block">
              Route Verified
            </span>
            <h1 className="text-xl font-black text-ink font-display leading-tight">Campus Distance Details</h1>
            <div className="text-ink-soft text-xs font-medium">
              {startLocationType === 'college' ? (
                <p>Travel estimates from **{collegeName}** to this room.</p>
              ) : (
                <p>Travel estimates from **Your Location** to this room.</p>
              )}
            </div>

            {/* Travel breakdown stats panel */}
            <div className="space-y-3 pt-3 border-t border-ink/5">
              
              <div className="flex justify-between items-center bg-[#FAF8F5] border border-ink/5 p-3.5 rounded-2xl">
                <span className="text-xs font-semibold text-ink-soft flex items-center gap-1.5">
                  🚶 Walking Route:
                </span>
                <span className="text-sm font-bold text-ink font-mono">{walkingTime}</span>
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
                <span className="text-sm font-bold text-ink font-mono">{distanceKm} km</span>
              </div>

            </div>
          </div>

          {/* Start Location Selector and Geolocation Alert Widget */}
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-ink-soft uppercase tracking-wider flex items-center gap-1.5">
              📍 Route Starting Point
            </h4>

            {/* Start location selector controls */}
            <div className="grid grid-cols-2 gap-2 pt-1 pb-1">
              <button
                type="button"
                onClick={() => setStartLocationType('college')}
                className={`py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition border ${
                  startLocationType === 'college'
                    ? 'bg-marigold border-marigold-dark text-paper shadow-sm'
                    : 'bg-paper border-ink/10 text-ink-soft hover:bg-[#FAF3E8]'
                }`}
              >
                My College
              </button>
              <button
                type="button"
                onClick={requestGeolocation}
                className={`py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition border ${
                  startLocationType === 'geolocation'
                    ? 'bg-marigold border-marigold-dark text-paper shadow-sm'
                    : 'bg-paper border-ink/10 text-ink-soft hover:bg-[#FAF3E8]'
                }`}
              >
                My Location
              </button>
            </div>
            
            {startLocationType === 'geolocation' && locationStatus === 'loading' && (
              <div className="text-xs text-ink-soft bg-[#FAF8F5] border border-ink/5 p-3.5 rounded-2xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-marigold animate-ping" />
                <span>Fetching current location...</span>
              </div>
            )}
            
            {startLocationType === 'geolocation' && (locationStatus === 'error' || locationStatus === 'denied') && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 p-3.5 rounded-2xl space-y-1.5 leading-relaxed font-semibold">
                <span>Your current location is unavailable. Geolocation access is disabled or unsupported. Displaying campus fallback estimates.</span>
              </div>
            )}

            {startLocationType === 'geolocation' && locationStatus === 'success' && (
              <div className="text-xs text-pine bg-[#FAF8F5] border border-ink/5 p-3.5 rounded-2xl flex flex-col gap-1 font-semibold font-sans">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pine" />
                  Geolocation Active
                </span>
                {userLocation && (
                  <span className="font-mono text-[10px] text-ink-soft ml-3.5">
                    [{userLocation.lat.toFixed(4)}° N, {userLocation.lng.toFixed(4)}° E]
                  </span>
                )}
              </div>
            )}

            {/* Outside bounds warning */}
            {startLocationType === 'geolocation' && userLocation && (userLocation.lat < MIN_LAT || userLocation.lat > MAX_LAT || userLocation.lng < MIN_LNG || userLocation.lng > MAX_LNG) && (
              <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 p-3 rounded-xl font-semibold leading-relaxed">
                ⚠️ Your location is outside the Kathmandu map region bounds. Using campus location projection as visual fallback.
              </div>
            )}
          </div>

          {/* Coordinates table details */}
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-ink-soft uppercase tracking-wider">Physical Coordinates</h4>
            
            <div className="w-full bg-[#FAF6EC] border border-ink/5 rounded-xl p-3.5 text-left space-y-2 font-mono text-[9px] text-ink-soft">
              <div className="flex justify-between items-center">
                <span className="font-bold text-ink font-sans flex items-center gap-1">📍 Start Point ({startName.split(' ')[0]})</span>
                <span>[{startLat.toFixed(4)}° N, {startLng.toFixed(4)}° E]</span>
              </div>
              <div className="flex justify-between items-center border-t border-ink/5 pt-2">
                <span className="font-bold text-ink font-sans flex items-center gap-1">🏠 Room Location</span>
                <span>[{roomLat.toFixed(4)}° N, {roomLng.toFixed(4)}° E]</span>
              </div>
            </div>
            
            <span className="text-[8px] text-ink-soft/75 italic flex items-center gap-1 pt-1 font-sans">
              <Info size={10} /> Computed dynamically based on student neighborhood coordinates.
            </span>
          </div>
        </div>

        {/* Right Side: Expanded Vector Map Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-paper border border-ink/10 rounded-[32px] p-6 shadow-sm flex flex-col h-[520px]">
            
            {/* Map title block */}
            <div className="mb-4">
              <h4 className="text-sm font-bold text-ink flex items-center gap-1.5 font-display">
                <Navigation className="text-marigold animate-pulse" size={16} /> 
                {startLocationType === 'college' ? "Route from Campus to Room" : "Route from Your Location to Room"}
              </h4>
              <p className="text-[10px] text-ink-soft mt-0.5">Focused mapping coordinates from **{startName}** to room</p>
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
                  d={`M ${getSvgX(roomLng)},${getSvgY(roomLat)} L ${getSvgX(startLng)},${getSvgY(startLat)}`}
                  fill="none"
                  stroke="var(--marigold)"
                  strokeWidth="4"
                  opacity="0.2"
                  strokeLinecap="round"
                />
                <path 
                  d={`M ${getSvgX(roomLng)},${getSvgY(roomLat)} L ${getSvgX(startLng)},${getSvgY(startLat)}`}
                  fill="none"
                  stroke="var(--marigold)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                  className="animate-dash"
                />

                {/* Room Location Pin */}
                {(() => {
                  const rx = getSvgX(roomLng);
                  const ry = getSvgY(roomLat);
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

                {/* Start Location Marker */}
                {(() => {
                  const cx = getSvgX(startLng);
                  const cy = getSvgY(startLat);
                  const isCollege = startLocationType === 'college' || !isUsingUserLocation;
                  const markerColor = isCollege ? "var(--pine)" : "#D32F2F";
                  return (
                    <g transform={`translate(${cx}, ${cy})`}>
                      <circle cx="0" cy="0" r="12" fill={markerColor} opacity="0.2" className="animate-pulse" />
                      <circle cx="0" cy="0" r="6" fill={markerColor} stroke="var(--paper)" strokeWidth="1.5" />
                      
                      <g transform="translate(0, -18)">
                        <rect x="-45" y="-12" width="90" height="15" rx="4" fill={markerColor} />
                        <text x="0" y="-2" fill="var(--paper)" fontSize="6" fontWeight="bold" textAnchor="middle">
                          {startName}
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
