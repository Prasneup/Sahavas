import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation, Info } from 'lucide-react';
import { Listing } from '../services/listingsData';
import api from '../services/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Kathmandu Valley bounds for validation
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

const fetchOSRMRoute = async (profile: 'driving' | 'foot' | 'bike', start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
  const url = `https://router.project-osrm.org/route/v1/${profile}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OSRM route fetch failed: ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.routes || data.routes.length === 0) {
    throw new Error("No routes found");
  }
  return data.routes[0];
};

const collegeIcon = L.divIcon({
  html: `
    <div class="flex items-center justify-center w-8 h-8 bg-pine text-paper rounded-full border-2 border-paper shadow-md">
      <span style="font-size: 14px; line-height: 1;">🏫</span>
    </div>
  `,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const roomIcon = L.divIcon({
  html: `
    <div class="flex items-center justify-center w-8 h-8 bg-marigold text-paper rounded-full border-2 border-paper shadow-md">
      <span style="font-size: 14px; line-height: 1;">🏠</span>
    </div>
  `,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const userLocationIcon = L.divIcon({
  html: `
    <div class="flex items-center justify-center w-8 h-8 bg-[#D32F2F] text-paper rounded-full border-2 border-paper shadow-md animate-bounce">
      <span style="font-size: 14px; line-height: 1;">📍</span>
    </div>
  `,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

const RouteMap: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  // Map Refs
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.GeoJSON | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Geolocation and navigation States: default to college
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'denied'>('idle');
  const [startLocationType, setStartLocationType] = useState<'geolocation' | 'college'>('college');

  // Real OSRM Routing states
  const [routeData, setRouteData] = useState<{
    distanceKm: string;
    walkingTime: string;
    bikeTime: string;
    drivingTime: string;
    routeGeometry: any | null;
  }>({
    distanceKm: '...',
    walkingTime: '...',
    bikeTime: '...',
    drivingTime: '...',
    routeGeometry: null
  });
  const [routingError, setRoutingError] = useState<string | null>(null);

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
          <h2 className="text-xl font-bold mb-3 font-display text-rose-600">Route unavailable</h2>
          <p className="text-ink-soft text-sm mb-6 font-semibold">Route unavailable — this listing does not have a valid location.</p>
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

  // Validate college coordinates
  const hasValidCollegeCoords = isValidCoordinate(collegeLat, collegeLng);

  if (!hasValidCollegeCoords) {
    console.error(`RouteMap - Invalid college coordinates for: ${collegeName}`);
    return (
      <div className="min-h-screen bg-clay text-ink flex flex-col font-sans items-center justify-center p-6">
        <div className="bg-paper border border-ink/10 rounded-[32px] p-8 text-center max-w-md shadow-lg font-sans">
          <h2 className="text-xl font-bold mb-3 font-display text-rose-600">Route unavailable</h2>
          <p className="text-ink-soft text-sm mb-6 font-semibold">Route unavailable — this listing does not have valid college coordinates.</p>
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

  // Select current starting location with fallback logic
  let startLat = collegeLat;
  let startLng = collegeLng;
  let startName = collegeName;
  let isUsingUserLocation = false;

  if (startLocationType === 'geolocation') {
    if (userLocation && isValidCoordinate(userLocation.lat, userLocation.lng)) {
      startLat = userLocation.lat;
      startLng = userLocation.lng;
      startName = "Your Location";
      isUsingUserLocation = true;
    }
  }

  // Map Initialization useEffect
  useEffect(() => {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer || mapRef.current) return;

    console.log("RouteMap - Map initialization started");
    const map = L.map('map-container', {
      center: [27.68, 85.32],
      zoom: 14,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        console.log("RouteMap - Cleaning up Leaflet map instance");
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Compute live road route from OSRM
  useEffect(() => {
    const start = { lat: startLat, lng: startLng };
    const calculateRoutes = async () => {
      setRoutingError(null);
      try {
        console.log("RouteMap - Route API request sent for profiles from:", start, "to:", { lat: roomLat, lng: roomLng });
        
        // Fetch driving, biking, and walking paths in parallel from OSRM
        const [footRoute, bikeRoute, driveRoute] = await Promise.all([
          fetchOSRMRoute('foot', start, { lat: roomLat, lng: roomLng }).catch(e => { console.warn("OSRM walking route error:", e); return null; }),
          fetchOSRMRoute('bike', start, { lat: roomLat, lng: roomLng }).catch(e => { console.warn("OSRM cycling route error:", e); return null; }),
          fetchOSRMRoute('driving', start, { lat: roomLat, lng: roomLng }).catch(e => { console.warn("OSRM driving route error:", e); return null; })
        ]);

        const primaryRoute = driveRoute || footRoute || bikeRoute;
        console.log("RouteMap - Route API response received:", { footRoute, bikeRoute, driveRoute });

        if (!primaryRoute) {
          throw new Error("Could not calculate any road route between these locations");
        }

        const formatDuration = (secs: number) => {
          const mins = Math.round(secs / 60);
          return mins > 0 ? `${mins} min` : "1 min";
        };

        const distance = primaryRoute.distance / 1000;

        setRouteData({
          distanceKm: `${distance.toFixed(2)}`,
          walkingTime: footRoute ? formatDuration(footRoute.duration) : "Not available",
          bikeTime: bikeRoute ? formatDuration(bikeRoute.duration) : "Not available",
          drivingTime: driveRoute ? formatDuration(driveRoute.duration) : "Not available",
          routeGeometry: primaryRoute.geometry
        });

      } catch (err: any) {
        console.error("RouteMap - OSRM routing API failure:", err);
        setRoutingError(err.message || "Failed to calculate road route");
        setRouteData({
          distanceKm: "Not available",
          walkingTime: "Not available",
          bikeTime: "Not available",
          drivingTime: "Not available",
          routeGeometry: null
        });
      }
    };

    calculateRoutes();
  }, [startLat, startLng, roomLat, roomLng]);

  // Update map markers and route geometry
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let startIcon = collegeIcon;
    let startMarkerName = collegeName;

    if (startLocationType === 'geolocation' && isUsingUserLocation) {
      startIcon = userLocationIcon;
      startMarkerName = "Your Current Location";
    }

    // 1. Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // 2. Remove old route polyline
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    // 3. Create real map markers with popup information
    const startMarker = L.marker([startLat, startLng], { icon: startIcon })
      .bindPopup(`
        <div style="font-family: var(--font-sans); padding: 4px;">
          <strong style="color: var(--ink); font-size: 12px;">🏫 ${startMarkerName}</strong>
          <p style="margin: 4px 0 0 0; color: var(--ink-soft); font-size: 10px;">Starting location for route coordinates.</p>
        </div>
      `)
      .addTo(map);

    const roomMarker = L.marker([roomLat, roomLng], { icon: roomIcon })
      .bindPopup(`
        <div style="font-family: var(--font-sans); padding: 4px;">
          <strong style="color: var(--ink); font-size: 12px;">🏠 ${listing.title}</strong>
          <p style="margin: 4px 0 0 0; color: var(--ink-soft); font-size: 10px;">Rent: NPR ${listing.rentAmount}/mo</p>
        </div>
      `)
      .addTo(map);

    markersRef.current = [startMarker, roomMarker];

    // 4. Draw route polyline from geojson
    if (routeData.routeGeometry) {
      const routeLayer = L.geoJSON(routeData.routeGeometry, {
        style: {
          color: 'var(--marigold)',
          weight: 5,
          opacity: 0.85
        }
      }).addTo(map);
      routeLayerRef.current = routeLayer;

      // Adjust map viewport to display both markers cleanly
      map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
    } else {
      const bounds = L.latLngBounds([startLat, startLng], [roomLat, roomLng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [startLat, startLng, roomLat, roomLng, routeData.routeGeometry, startLocationType, isUsingUserLocation, listing]);

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
            <h1 className="text-xl font-black text-ink font-display leading-tight">Route from Campus to Room</h1>
            <div className="text-ink-soft text-xs font-medium">
              <p>Real-time route and travel information from **{startName}** to this room.</p>
            </div>

            {/* Travel breakdown stats panel */}
            <div className="space-y-3 pt-3 border-t border-ink/5">
              
              <div className="flex justify-between items-center bg-[#FAF8F5] border border-ink/5 p-3.5 rounded-2xl">
                <span className="text-xs font-semibold text-ink-soft flex items-center gap-1.5 font-sans">
                  🚶 Walking Duration:
                </span>
                <span className="text-sm font-bold text-ink font-mono">{routeData.walkingTime}</span>
              </div>

              <div className="flex justify-between items-center bg-[#FAF8F5] border border-ink/5 p-3.5 rounded-2xl">
                <span className="text-xs font-semibold text-ink-soft flex items-center gap-1.5 font-sans">
                  🚴 Biking Duration:
                </span>
                <span className="text-sm font-bold text-ink font-mono">{routeData.bikeTime}</span>
              </div>

              <div className="flex justify-between items-center bg-[#FAF8F5] border border-ink/5 p-3.5 rounded-2xl">
                <span className="text-xs font-semibold text-ink-soft flex items-center gap-1.5 font-sans">
                  🚗 Driving Duration:
                </span>
                <span className="text-sm font-bold text-ink font-mono">{routeData.drivingTime}</span>
              </div>

              <div className="flex justify-between items-center bg-[#FAF8F5] border border-ink/5 p-3.5 rounded-2xl">
                <span className="text-xs font-semibold text-ink-soft flex items-center gap-1.5 font-sans">
                  🚌 Public Transit:
                </span>
                <span className="text-sm font-bold text-ink font-mono">Not available</span>
              </div>

              <div className="flex justify-between items-center bg-[#FAF8F5] border border-ink/5 p-3.5 rounded-2xl border-t-2">
                <span className="text-xs font-bold text-ink-soft flex items-center gap-1.5 font-sans">
                  📍 Total Road Distance:
                </span>
                <span className="text-sm font-extrabold text-marigold font-mono">
                  {routeData.distanceKm !== "Not available" ? `${routeData.distanceKm} km` : "Not available"}
                </span>
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

        {/* Right Side: Interactive Leaflet Map Panel */}
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

            {/* Interactive Leaflet Map Container */}
            <div className="flex-1 bg-[#FAF6EC] border border-ink/10 rounded-2xl relative overflow-hidden shadow-inner min-h-[400px]">
              {routingError && (
                <div className="absolute top-4 left-4 right-4 z-[1000] p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-md">
                  <Info size={16} className="text-amber-600 shrink-0" />
                  <span>Route calculation warning: {routingError}. Displaying straight-line bounds.</span>
                </div>
              )}
              <div id="map-container" className="w-full h-full" style={{ zIndex: 1 }} />
            </div>
            
          </div>
        </div>

      </main>
    </div>
  );
};

export default RouteMap;
