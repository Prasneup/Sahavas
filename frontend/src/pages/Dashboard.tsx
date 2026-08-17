import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { User, Home as HomeIcon, Users, Flame, MapPin, Compass, Bookmark, Award, Sparkles, Activity, MessageCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { NivaroLogo } from '../components/NivaroLogo';
import Footer from '../components/Footer';

interface RoommateMatch {
  id: string;
  name: string;
  college: string;
  gender: string;
  matchScore: number;
  badges: string[];
  avatarUrl: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileCompleteness, setProfileCompleteness] = useState(60);
  const [vettingStatus, setVettingStatus] = useState('UNVERIFIED');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState(8);
  const [recommendedRooms, setRecommendedRooms] = useState<any[]>([]);
  const [savedRooms, setSavedRooms] = useState<any[]>([]);
  const [recommendedRoommates, setRecommendedRoommates] = useState<RoommateMatch[]>([]);
  const [streakDays, setStreakDays] = useState(1);
  const [totalXp, setTotalXp] = useState(0);
  const [stats, setStats] = useState<any>({
    averageRent: 0,
    totalListings: 0,
    activeThisWeek: 0,
    rentedThisMonth: 0,
    totalShortlists: 0,
    popularNeighborhood: 'No data available'
  });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  // Relocation Journey Checklist
  const [checklist, setChecklist] = useState([
    { key: 'admissionCompleted', text: 'Secure College Admission', done: false },
    { key: 'collegeConfirmed', text: 'Confirm Campus Registration', done: false },
    { key: 'roomFound', text: 'Explore & Book a Room', done: false },
    { key: 'roommateFound', text: 'Find a Compatible Roommate', done: false },
    { key: 'internetSetup', text: 'Arrange Internet Setup', done: false },
    { key: 'transportationSetup', text: 'Arrange Transportation/Moving', done: false },
  ]);

  const toggleChecklistTask = async (key: string, currentDone: boolean) => {
    try {
      const res = await api.post('/relocation/progress/toggle', {
        taskName: key,
        completed: !currentDone
      });
      if (res.data) {
        setChecklist(prev => prev.map(item => 
          item.key === key ? { ...item, done: res.data[key] } : item
        ));
        setStreakDays(res.data.streakDays || 1);
        setTotalXp(res.data.totalXp || 0);
      }
    } catch (err) {
      console.error("Failed to toggle checklist task on backend", err);
    }
  };

  const completedTasks = checklist.filter(t => t.done).length;
  const checklistPercentage = Math.round((completedTasks / checklist.length) * 100);

  useEffect(() => {
    // 0. Redirect based on user role
    if (user?.role === 'admin') {
      navigate('/admin');
      return;
    } else if (user?.role === 'owner') {
      navigate('/landlord');
      return;
    }

    // Fetch relocation progress
    api.get('/relocation/progress')
      .then(res => {
        if (res.data) {
          setChecklist([
            { key: 'admissionCompleted', text: 'Secure College Admission', done: res.data.admissionCompleted },
            { key: 'collegeConfirmed', text: 'Confirm Campus Registration', done: res.data.collegeConfirmed },
            { key: 'roomFound', text: 'Explore & Book a Room', done: res.data.roomFound },
            { key: 'roommateFound', text: 'Find a Compatible Roommate', done: res.data.roommateFound },
            { key: 'internetSetup', text: 'Arrange Internet Setup', done: res.data.internetSetup },
            { key: 'transportationSetup', text: 'Arrange Transportation/Moving', done: res.data.transportationSetup },
          ]);
          setStreakDays(res.data.streakDays || 1);
          setTotalXp(res.data.totalXp || 0);
        }
      })
      .catch(() => {});

    // 1. Fetch user profile completeness & vetting status
    api.get('/profiles/me')
      .then(res => {
        if (res.data) {
          setProfileCompleteness(res.data.completenessPercentage || 60);
          setVettingStatus(res.data.verificationStatus || 'UNVERIFIED');
          setRejectionReason(res.data.rejectionReason || null);
        }
      })
      .catch(() => {});

    // 2. Fetch roommates matching suggestions
    api.get('/matching/suggestions')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setMatchCount(res.data.length);
          setRecommendedRoommates(res.data.slice(0, 3).map((r: any) => ({
            id: r.studentId,
            name: r.fullName,
            college: r.collegeName || "NCIT Balkumari",
            gender: r.gender,
            matchScore: Math.round(r.matchScorePercentage || 85),
            badges: r.matchingPreferences ? Object.values(r.matchingPreferences).filter(v => typeof v === 'string').slice(0, 3) as string[] : ["Clean", "Quiet"],
            avatarUrl: r.avatarUrl || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200"
          })));
        } else {
          // Fallback if no quiz has been taken or no results
          setMatchCount(0);
          setRecommendedRoommates([]);
        }
      })
      .catch(() => {
        setMatchCount(0);
      });

    // 3. Fetch recommended room listings (first 3 rooms)
    api.get('/listings')
      .then(res => {
        if (res.data) {
          setRecommendedRooms(res.data.slice(0, 3).map((room: any) => ({
            id: room.id,
            title: room.title,
            rentAmount: room.rentAmount,
            distanceFromCollegeText: room.distanceFromCollegeText || "Near campus",
            images: room.images && room.images.length > 0 ? room.images : [{ imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400' }],
            compatibility: Math.round(85 + Math.random() * 14)
          })));
        }
      })
      .catch(() => {});

    // 4. Fetch bookmarked rooms shortcut list
    api.get('/listings/saved')
      .then(res => {
        if (res.data) {
          setSavedRooms(res.data.slice(0, 2));
        }
      })
      .catch(() => {});

    // 5. Fetch dashboard statistics
    api.get('/listings/stats')
      .then(res => {
        if (res.data) {
          setStats(res.data);
        }
      })
      .catch(() => {});

    // 6. Fetch recent posts
    api.get('/communities/posts/recent')
      .then(res => {
        if (res.data) {
          setRecentPosts(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Dynamic Activity Timeline
  const activityTimeline: { id: string; type: string; title: string; desc: string; color: string }[] = [];

  if (vettingStatus === 'VERIFIED') {
    activityTimeline.push({
      id: 'verify-success',
      type: 'VERIFICATION',
      title: 'Profile Verified',
      desc: 'Your student registration has been verified by the campus administration.',
      color: 'bg-pine'
    });
  }

  savedRooms.forEach((room: any) => {
    activityTimeline.push({
      id: `save-${room.id}`,
      type: 'SHORTLIST',
      title: 'Saved New Shortlist',
      desc: `You added "${room.title}" to your shortlists.`,
      color: 'bg-marigold'
    });
  });

  recommendedRoommates.slice(0, 2).forEach((match: any) => {
    activityTimeline.push({
      id: `match-${match.id}`,
      type: 'MATCH',
      title: 'New Compatible Roommate',
      desc: `${match.name} from ${match.college} is a ${match.matchScore}% compatibility match.`,
      color: 'bg-marigold'
    });
  });

  checklist.forEach((item: any) => {
    if (item.done) {
      activityTimeline.push({
        id: `chk-${item.key}`,
        type: 'CHECKLIST',
        title: 'Completed Task',
        desc: `You completed the move-in step: "${item.text}".`,
        color: 'bg-pine'
      });
    }
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pb-0" style={{ backgroundColor: 'var(--clay)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
      <div className="w-full max-w-md md:max-w-6xl px-6 pt-6 flex flex-col items-stretch space-y-8 mb-12">
        
        {/* Header Bar */}
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--marigold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>
              <NivaroLogo className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-2xl tracking-tight flex items-center gap-2.5" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--ink)' }}>
                NIVARO
              </h1>
              <span className="text-[10px] tracking-wider block -mt-1 uppercase font-semibold" style={{ color: 'var(--ink-soft)' }}>
                Namaste, {user?.fullName?.split(' ')[0] || 'Prasanna'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <button 
                onClick={() => navigate('/admin')}
                className="bg-marigold hover:bg-marigold-dark text-paper text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
              >
                🛡️ Admin Panel
              </button>
            )}
            <button 
              onClick={logout}
              className="bg-paper hover:bg-[#FAF3E8] border border-ink/10 text-ink text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition"
            >
              Logout
            </button>
            <button 
              onClick={() => navigate('/profile')}
              style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--line)' }}
              className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shadow-sm hover:scale-105 transition"
            >
              <User size={20} style={{ color: 'var(--ink-soft)' }} />
            </button>
          </div>
        </header>

        {/* Dashboard Title & Welcome Section */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-ink/5 pb-4">
          <div>
            <h2 className="text-3xl font-black" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Dashboard</h2>
            <p className="text-sm mt-1 leading-relaxed font-semibold" style={{ color: 'var(--ink-soft)' }}>
              Welcome back — here's what's happening on Nivaro.
            </p>
          </div>
          <span className="text-xs font-bold text-marigold md:text-right">
            Find your room. Find your perfect roommate.
          </span>
        </section>

        {/* Verification Notification Banner */}
        {vettingStatus === 'VERIFIED' && localStorage.getItem('hide_verified_banner') !== 'VERIFIED' && (
          <div className="bg-pine-light/80 border border-pine/20 text-pine rounded-2xl p-5 flex items-start justify-between shadow-sm relative w-full">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center text-pine shadow-sm flex-shrink-0">
                <CheckCircle size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-black font-display text-pine-dark">Your document has been approved!</h4>
                <p className="text-xs opacity-95 mt-0.5 font-semibold">Your identity verification has been successfully completed.</p>
              </div>
            </div>
            <button 
              onClick={() => {
                localStorage.setItem('hide_verified_banner', 'VERIFIED');
                setVettingStatus('VERIFIED_DISMISSED'); 
              }}
              className="text-pine-dark/50 hover:text-pine-dark text-lg font-bold absolute top-3 right-4"
            >
              &times;
            </button>
          </div>
        )}

        {vettingStatus === 'REJECTED' && localStorage.getItem('hide_rejected_banner') !== 'REJECTED' && (
          <div className="bg-rose-50 border border-brick/20 text-brick rounded-2xl p-5 flex items-start justify-between shadow-sm relative w-full">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-paper flex items-center justify-center text-brick shadow-sm flex-shrink-0">
                <AlertTriangle size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-black font-display">Your document verification was not approved.</h4>
                <p className="text-xs opacity-95 mt-0.5 font-semibold">Reason: {rejectionReason || 'No reason provided.'}</p>
                <Link to="/verify" className="text-xs font-black underline mt-2 block hover:opacity-80">
                  Correct and Resubmit Document &rarr;
                </Link>
              </div>
            </div>
            <button 
              onClick={() => {
                localStorage.setItem('hide_rejected_banner', 'REJECTED');
                setVettingStatus('REJECTED_DISMISSED');
              }}
              className="text-brick/50 hover:text-brick text-lg font-bold absolute top-3 right-4"
            >
              &times;
            </button>
          </div>
        )}

        {/* Top 4 Stats Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 w-full">
          <div className="dashboard-card p-5 flex flex-col justify-between min-h-[110px]">
            <span className="text-[10px] uppercase tracking-wider block font-bold" style={{ color: 'var(--ink-soft)' }}>Profile Completeness</span>
            <div className="flex justify-between items-baseline mt-2">
              <h3 className="text-2xl font-black font-mono" style={{ color: 'var(--ink)' }}>{profileCompleteness}%</h3>
              <span className="text-[10px] font-bold" style={{ color: 'var(--ink-soft)' }}>Finished</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden mt-3" style={{ backgroundColor: 'var(--line)' }}>
              <div className="h-full rounded-full transition-all duration-750" style={{ width: `${profileCompleteness}%`, backgroundColor: 'var(--marigold)' }} />
            </div>
          </div>

          <div className="dashboard-card p-5 flex flex-col justify-between min-h-[110px]">
            <span className="text-[10px] uppercase tracking-wider block font-bold" style={{ color: 'var(--ink-soft)' }}>Vetting Status</span>
            <div className="mt-2.5">
              <Link to="/verify" style={{ backgroundColor: 'rgba(232, 163, 61, 0.15)', color: 'var(--marigold-dark)', borderRadius: '20px', padding: '5px 12px', fontWeight: 600, fontSize: '11px' }} className="inline-block cursor-pointer hover:underline">
                🛡️ Check Status
              </Link>
            </div>
            <span className="text-[10px] block mt-2 font-black uppercase tracking-wider text-marigold-dark">{vettingStatus.replace('_', ' ')}</span>
          </div>

          <div className="dashboard-card p-5 flex flex-col justify-between min-h-[110px]">
            <span className="text-[10px] uppercase tracking-wider block font-bold" style={{ color: 'var(--ink-soft)' }}>Discovery Matches</span>
            <h3 className="text-2xl mt-2 font-black font-mono" style={{ color: 'var(--ink)' }}>{matchCount}</h3>
            <span className="text-[10px] block mt-1 font-semibold" style={{ color: 'var(--ink-soft)' }}>Compatible Peers</span>
          </div>

          <div className="dashboard-card p-5 flex flex-col justify-between min-h-[110px]">
            <span className="text-[10px] uppercase tracking-wider block font-bold" style={{ color: 'var(--ink-soft)' }}>Relocation Streak</span>
            <div className="flex items-center gap-1.5 mt-2 text-orange-600 font-bold">
              <Flame className="fill-orange-600 stroke-orange-600 animate-pulse" size={20} />
              <span style={{ fontFamily: 'var(--font-mono)' }}>{streakDays} Days</span>
            </div>
            <span className="text-[10px] block mt-1 font-semibold" style={{ color: 'var(--ink-soft)' }}>{totalXp} Total XP</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          <Link to="/rooms" className="dashboard-card action-card-primary p-6 flex flex-col justify-between h-44 transition duration-300 hover:-translate-y-0.5 cursor-pointer shadow-sm">
            <div className="icon-circle shadow-sm" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--marigold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>
              <HomeIcon size={18} className="stroke-[2.5]" />
            </div>
            <h3 className="text-lg leading-snug font-black" style={{ fontFamily: 'var(--font-display)' }}>
              Looking for<br />Housing? Explore Rooms
            </h3>
          </Link>

          <Link to="/roommates" className="dashboard-card action-card-primary p-6 flex flex-col justify-between h-44 transition duration-300 hover:-translate-y-0.5 cursor-pointer shadow-sm">
            <div className="icon-circle shadow-sm" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--marigold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>
              <Users size={18} className="stroke-[2.5]" />
            </div>
            <h3 className="text-lg leading-snug font-black" style={{ fontFamily: 'var(--font-display)' }}>
              Looking for a<br />Roommate? Quiz Matches
            </h3>
          </Link>

          <Link to="/communities" className="dashboard-card p-6 flex flex-col justify-between h-44 transition duration-300 hover:-translate-y-0.5 cursor-pointer shadow-sm">
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--pine-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pine)' }} className="shadow-sm">
              <Users size={18} className="stroke-[2]" />
            </div>
            <div>
              <h4 className="text-sm font-black text-ink" style={{ fontFamily: 'var(--font-display)' }}>Student Communities</h4>
              <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--ink-soft)' }}>Network with peer student unions.</p>
            </div>
          </Link>

          <Link to="/relocation" className="dashboard-card p-6 flex flex-col justify-between h-44 transition duration-300 hover:-translate-y-0.5 cursor-pointer shadow-sm">
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--pine-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pine)' }} className="shadow-sm">
              <Compass size={18} className="stroke-[2]" />
            </div>
            <div className="flex items-end justify-between w-full">
              <div>
                <h4 className="text-sm font-black text-ink" style={{ fontFamily: 'var(--font-display)' }}>Move-In Journey</h4>
                <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--ink-soft)' }}>Track your moving checklists.</p>
              </div>
              <span className="text-[10px] font-bold shrink-0 text-marigold-dark">Go →</span>
            </div>
          </Link>
        </div>

        {/* Redesigned Grid Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
          
          {/* Left Main Column (8 / 12) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Recommended Rooms Section */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-ink font-display flex items-center gap-1.5">
                  <Sparkles className="text-marigold" size={18} /> Recommended for You
                </h3>
                <Link to="/rooms" className="text-xs font-bold text-marigold-dark hover:underline">View All Rooms</Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {recommendedRooms.map(room => (
                  <div key={room.id} className="dashboard-card overflow-hidden flex flex-col justify-between bg-paper hover:shadow-md transition">
                    <div className="h-32 bg-clay relative overflow-hidden">
                      <img src={room.images?.[0]?.imageUrl} alt={room.title} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 text-[8px] bg-paper/95 text-ink px-2 py-0.5 rounded-full font-bold">
                        {room.compatibility}% Match
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-ink truncate">{room.title}</h4>
                        <span className="text-[9px] text-marigold font-bold flex items-center gap-0.5 mt-1">
                          <MapPin size={9} /> {room.distanceFromCollegeText.split('from')[0] || 'Near college'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-ink/5">
                        <span className="text-xs font-bold text-ink font-mono">NPR {room.rentAmount}</span>
                        <button 
                          onClick={() => navigate(`/rooms/${room.id}`)}
                          className="bg-marigold hover:bg-marigold-dark text-paper text-[8px] font-black px-2.5 py-1.5 rounded-lg transition uppercase tracking-wider"
                        >
                          View Room
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Saved Rooms Shortcut */}
            <section className="space-y-4">
              <h3 className="text-lg font-black text-ink font-display flex items-center gap-1.5">
                <Bookmark className="text-marigold" size={18} /> Recently Saved Shortlists
              </h3>

              {savedRooms.length === 0 ? (
                <div className="dashboard-card p-6 text-center text-xs font-semibold text-ink-soft bg-paper">
                  No saved rooms yet. Explore listings to shortlist.
                  <span className="text-[10px] text-marigold block mt-2 font-bold uppercase tracking-wider">Find your room. Find your perfect roommate.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {savedRooms.map(room => (
                    <div 
                      key={`saved-${room.id}`} 
                      onClick={() => navigate(`/rooms/${room.id}`)}
                      className="dashboard-card p-3.5 flex gap-4 bg-paper hover:shadow-sm transition cursor-pointer"
                    >
                      <img src={room.images?.[0]?.imageUrl} alt={room.title} className="w-16 h-16 rounded-xl object-cover bg-clay" />
                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-ink truncate">{room.title}</h4>
                          <span className="text-[9px] text-ink-soft block mt-0.5">Near: {room.collegeName}</span>
                        </div>
                        <span className="text-xs font-bold text-marigold-dark font-mono">NPR {room.rentAmount}/mo</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Move-In Checklist */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-ink font-display flex items-center gap-1.5">
                  <Award className="text-marigold" size={18} /> Moving Checklist Progress
                </h3>
                <span className="text-xs font-bold font-mono text-marigold-dark">{checklistPercentage}% Completed</span>
              </div>

              <div className="dashboard-card p-6 bg-paper space-y-5">
                <div className="w-full bg-clay/30 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-marigold h-full rounded-full transition-all duration-500" style={{ width: `${checklistPercentage}%` }}></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {checklist.map(task => (
                    <div 
                      key={task.key} 
                      onClick={() => toggleChecklistTask(task.key, task.done)}
                      className="flex items-center gap-3 p-3 bg-[#FAF8F5] border border-ink/5 rounded-xl cursor-pointer hover:bg-clay/10 transition"
                    >
                      <input 
                        type="checkbox" 
                        checked={task.done} 
                        onChange={() => {}} // Controlled by outer div onClick
                        className="rounded text-marigold focus:ring-marigold accent-marigold w-4 h-4 cursor-pointer"
                      />
                      <span className={`text-xs font-semibold ${task.done ? 'line-through text-ink-soft/50' : 'text-ink-soft'}`}>
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

          </div>

          {/* Right Column (4 / 12) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Recommended Roommates Match Sidebar */}
            <section className="space-y-4">
              <h3 className="text-lg font-black text-ink font-display flex items-center gap-1.5">
                <Sparkles className="text-marigold" size={18} /> Compatible Roommates
              </h3>

              <div className="space-y-4">
                {recommendedRoommates.map(match => (
                  <div key={match.id} className="dashboard-card p-4 bg-paper flex items-center justify-between hover:shadow-sm transition">
                    <div className="flex items-center gap-3">
                      <img src={match.avatarUrl} alt={match.name} className="w-10 h-10 rounded-full object-cover border border-ink/10" />
                      <div>
                        <h4 className="text-xs font-bold text-ink">{match.name}</h4>
                        <span className="text-[9px] text-ink-soft block font-semibold">{match.college}</span>
                        
                        <div className="flex flex-wrap gap-1 mt-1">
                          {match.badges.slice(0, 2).map(badge => (
                            <span key={badge} className="text-[7px] bg-clay/40 text-ink-soft px-1 rounded uppercase font-bold">
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className="text-xs font-bold text-pine bg-pine-light px-2 py-0.5 rounded-full font-mono">
                        {match.matchScore}%
                      </span>
                      <button 
                        onClick={() => navigate('/roommates')}
                        className="bg-marigold hover:bg-marigold-dark text-paper text-[8px] font-black px-2 py-1 rounded-md transition uppercase"
                      >
                        Match
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Housing Insights Analytics */}
            <section className="space-y-4">
              <h3 className="text-lg font-black text-ink font-display flex items-center gap-1.5">
                <Compass className="text-marigold" size={18} /> Rental Market Insights
              </h3>

              <div className="dashboard-card p-5 bg-paper space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] text-ink-soft font-bold uppercase tracking-wider block">Average Student Rent</span>
                  <div className="text-lg font-black font-mono">
                    {stats.totalListings > 0 ? `NPR ${stats.averageRent.toLocaleString()}` : 'No data available'}
                    {stats.totalListings > 0 && <span className="text-[10px] text-ink-soft font-sans font-medium"> / month</span>}
                  </div>
                </div>

                <div className="border-t border-ink/5 pt-3.5 space-y-2 text-xs font-semibold text-ink-soft">
                  <div className="flex justify-between">
                    <span>Popular Neighborhood:</span>
                    <span className="font-bold text-ink">{stats.popularNeighborhood}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Listings This Week:</span>
                    <span className="font-bold text-pine">
                      {stats.totalListings > 0 ? `+${stats.activeThisWeek} Rooms Added` : 'No data available'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rented Houses This Month:</span>
                    <span className="font-bold text-ink">
                      {stats.totalShortlists > 0 ? `${stats.totalShortlists} shortlists matched` : 'No data available'}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Platform Recent Activity Timeline */}
            <section className="space-y-4">
              <h3 className="text-lg font-black text-ink font-display flex items-center gap-1.5">
                <Activity className="text-marigold" size={18} /> Recent Activity Timeline
              </h3>

              <div className="dashboard-card p-5 bg-paper space-y-4 font-sans text-xs">
                {activityTimeline.length === 0 ? (
                  <div className="text-center py-4 text-[11px] text-ink-soft italic">
                    No activity yet
                  </div>
                ) : (
                  activityTimeline.map(act => (
                    <div key={act.id} className="flex gap-3 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-ink/5 [&:not(:first-child)]:pt-3">
                      <span className={`w-2 h-2 rounded-full ${act.color} mt-1.5 shrink-0`}></span>
                      <div>
                        <span className="font-bold text-ink block">{act.title}</span>
                        <span className="text-[10px] text-ink-soft">{act.desc}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Student Community Feed */}
            <section className="space-y-4">
              <h3 className="text-lg font-black text-ink font-display flex items-center gap-1.5">
                <MessageCircle className="text-marigold" size={18} /> Student Community Feed
              </h3>

              <div className="dashboard-card p-5 bg-paper space-y-3">
                {recentPosts.length === 0 ? (
                  <div className="text-center py-4 text-[11px] text-ink-soft italic">
                    No posts available yet
                  </div>
                ) : (
                  recentPosts.map((post: any) => (
                    <div key={post.id} className="p-3 bg-[#FAF8F5] border border-ink/5 rounded-xl">
                      <span className={`text-[8px] font-black uppercase tracking-wider block ${post.postType === 'EVENT' ? 'text-pine' : 'text-marigold'}`}>
                        {post.postType} – {post.authorName}
                      </span>
                      <h4 className="text-[11px] font-bold text-ink mt-0.5">{post.title}</h4>
                      <p className="text-[10px] text-ink-soft leading-relaxed mt-0.5 line-clamp-2">
                        {post.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>

          </div>

        </div>

      </div>

      <Footer />

    </div>
  );
};

export default Dashboard;
