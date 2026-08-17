import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Flame, Star, FileText, CheckCircle2, GraduationCap, Home, Users, Wifi, Bus, ArrowRight, Shield } from 'lucide-react';
import Footer from '../components/Footer';

interface RelocationProgress {
  admissionCompleted: boolean;
  collegeConfirmed: boolean;
  roomFound: boolean;
  roommateFound: boolean;
  internetSetup: boolean;
  transportationSetup: boolean;
  streakDays: number;
  totalXp: number;
  unlockedBadges: string[];
  completionPercentage: number;
}

interface PathNode {
  id: keyof RelocationProgress;
  title: string;
  description: string;
  icon: React.ReactNode;
  position: 'left' | 'center' | 'right';
  appLink?: string;
  linkText?: string;
  subTasks: string[];
}

const RelocationDashboard: React.FC = () => {
  const [progress, setProgress] = useState<RelocationProgress>({
    admissionCompleted: false,
    collegeConfirmed: false,
    roomFound: false,
    roommateFound: false,
    internetSetup: false,
    transportationSetup: false,
    streakDays: 3,
    totalXp: 120,
    unlockedBadges: ['FRESH_MOVER'],
    completionPercentage: 16
  });

  const [selectedNode, setSelectedNode] = useState<PathNode | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const res = await api.get('/relocation/progress');
      setProgress(res.data);
    } catch (err) {
      console.error("Failed to load relocation progress", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskName: keyof RelocationProgress, completed: boolean) => {
    try {
      const res = await api.post('/relocation/progress/toggle', { taskName, completed });
      setProgress(res.data);
      
      if (completed) {
        showConfettiAlert();
      }
    } catch (err) {
      alert("Failed to toggle task progress. Please verify connection.");
    }
  };

  const showConfettiAlert = () => {
    alert("✨ Milestone Unlocked! +100 XP Earned. Keep climbing the relocation road! ✨");
  };

  // Node structures definition alternating positions matching winding path
  const pathNodes: PathNode[] = [
    {
      id: 'admissionCompleted',
      title: 'Admission Completed',
      description: 'Submit your college admission receipt or fee voucher to lock your registration.',
      icon: <FileText size={22} />,
      position: 'center',
      subTasks: ['Pay college admission deposit', 'Scan and upload letter of intent', 'Verify administrative clearance'],
      appLink: '/profile',
      linkText: 'Check Profile Badges'
    },
    {
      id: 'collegeConfirmed',
      title: 'College Confirmed',
      description: 'Confirm college details (Major, Semester) and obtain your digital Student Badge.',
      icon: <GraduationCap size={22} />,
      position: 'left',
      subTasks: ['Set major course and academic year', 'Verify college campus identity'],
      appLink: '/profile',
      linkText: 'Confirm College Info'
    },
    {
      id: 'roomFound',
      title: 'Room Found',
      description: 'Locate a verified room listing near campus and secure lease options.',
      icon: <Home size={22} />,
      position: 'center',
      subTasks: ['Search verified housing listings', 'Shortlist at least 3 flat rooms', 'Sign rent agreement or secure deposit'],
      appLink: '/rooms',
      linkText: 'Search Housing Rooms'
    },
    {
      id: 'roommateFound',
      title: 'Roommate Found',
      description: 'Complete the roommate preferences quiz and find compatible roommates.',
      icon: <Users size={22} />,
      position: 'right',
      subTasks: ['Save roommate preferences quiz', 'Swipe roommates matching tinder deck', 'Agree with shared flat match'],
      appLink: '/roommates',
      linkText: 'Discover Compatible Peers'
    },
    {
      id: 'internetSetup',
      title: 'Internet Setup',
      description: 'Coordinate local internet provider configuration (WorldLink, Vianet) in your flat.',
      icon: <Wifi size={22} />,
      position: 'center',
      subTasks: ['Choose ISP provider package', 'Install router device in shared study room'],
      linkText: 'Ask in Campus Community Hub',
      appLink: '/communities'
    },
    {
      id: 'transportationSetup',
      title: 'Transportation Route',
      description: 'Map out city routes, public bus transport pathways, or scooter parking spots.',
      icon: <Bus size={22} />,
      position: 'left',
      subTasks: ['Find direct bus route from flat to college', 'Mark location coordinates on map'],
      appLink: '/rooms',
      linkText: 'Inspect Location Maps'
    }
  ];

  const badgesList = [
    { id: 'FRESH_MOVER', name: 'Fresh Explorer', desc: 'Completed the first relocation step.', color: 'from-amber-400 to-amber-600' },
    { id: 'ROOF_FINDER', name: 'Roof Finder', desc: 'Found and secured student room.', color: 'from-blue-400 to-blue-600' },
    { id: 'CO_HABITOR', name: 'Co-habitor', desc: 'Matched with compatible roommate.', color: 'from-emerald-400 to-emerald-600' },
    { id: 'FULLY_SET', name: 'Fully Relocated', desc: '100% relocation process complete.', color: 'from-purple-500 to-purple-700' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-clay text-marigold">
        <span className="animate-pulse font-bold text-sm">Opening Journey...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pb-0 select-none" style={{ backgroundColor: 'var(--clay)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
      
      {/* Top Header stats bar */}
      <div className="w-full max-w-md px-6 pt-6 flex justify-between items-center z-25">
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--line)' }}
          className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition"
        >
          <ArrowLeft size={18} style={{ color: 'var(--ink-soft)' }} />
        </button>

        {/* Gamification stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-orange-600 font-bold text-sm">
            <Flame className="fill-orange-600 stroke-orange-600 animate-pulse" size={20} />
            <span style={{ fontFamily: 'var(--font-mono)' }}>{progress.streakDays} Day Streak</span>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-sm" style={{ color: 'var(--marigold)' }}>
            <Star className="fill-marigold stroke-marigold" size={20} />
            <span style={{ fontFamily: 'var(--font-mono)' }}>{progress.totalXp} XP</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md px-6 pt-6 flex-1 flex flex-col justify-start">
        
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--ink)' }}>Relocation Path</h1>
          <p className="text-xs mt-1 font-semibold" style={{ color: 'var(--ink-soft)' }}>Track milestones and earn moving rewards!</p>
        </div>

        {/* Global Progress Bar meter */}
        <div className="dashboard-card p-5 mb-8">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>Overall Progress</span>
            <span className="text-xs font-bold font-mono" style={{ color: 'var(--marigold)' }}>{progress.completionPercentage}%</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--line)' }}>
            <div 
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress.completionPercentage}%`, backgroundColor: 'var(--marigold)' }}
            />
          </div>
        </div>

        {/* Winding Checkpoints Path */}
        <div className="relative flex flex-col items-center py-6 min-h-[460px]">
          
          {/* Vertical Connecting Road Line */}
          <div className="absolute top-0 bottom-0 w-2.5 rounded-full z-0" style={{ backgroundColor: 'var(--line)' }} />

          <div className="w-full space-y-12 relative z-10 flex flex-col items-center">
            {pathNodes.map((node, idx) => {
              const isCompleted = progress[node.id] === true;
              const isNext = idx === 0 || progress[pathNodes[idx - 1].id] === true;
              const isLocked = !isCompleted && !isNext;

              // Node alignments offsets classes matching checkpoints road
              let alignClass = 'self-center';
              if (node.position === 'left') alignClass = 'self-start pl-8';
              if (node.position === 'right') alignClass = 'self-end pr-8';

              return (
                <div key={node.id} className={`flex flex-col items-center ${alignClass}`}>
                  
                  {/* Circular checkpoint button */}
                  <button
                    onClick={() => setSelectedNode(node)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-lg transition transform active:scale-95 ${
                      isCompleted 
                        ? 'hover:scale-105' 
                        : isNext 
                          ? 'animate-bounce hover:scale-105' 
                          : 'cursor-not-allowed opacity-60'
                    }`}
                    style={
                      isCompleted 
                        ? { backgroundColor: 'var(--pine-light)', borderColor: 'var(--pine)', color: 'var(--pine)' }
                        : isNext
                          ? { backgroundColor: 'var(--marigold)', borderColor: 'var(--paper)', color: 'var(--paper)' }
                          : { backgroundColor: 'var(--paper)', borderColor: 'var(--line)', color: 'var(--ink-soft)' }
                    }
                    disabled={isLocked}
                  >
                    {isCompleted ? <CheckCircle2 className="stroke-[2.5]" size={28} /> : node.icon}
                  </button>

                  <span className="text-[10px] tracking-wider mt-2.5 text-center px-2 py-0.5 rounded border shadow-sm" style={{ backgroundColor: 'var(--paper)', borderColor: 'var(--line)', color: 'var(--ink-soft)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                    {node.title}
                  </span>

                </div>
              );
            })}
          </div>

        </div>

        {/* Achievement Medals Panel */}
        <div className="border-t pt-8 mt-8 space-y-4" style={{ borderColor: 'var(--line)' }}>
          <h3 className="text-xs uppercase tracking-wider text-center" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--ink-soft)' }}>Unlocked Achievements</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {badgesList.map(badge => {
              const isUnlocked = progress.unlockedBadges.includes(badge.id);
              return (
                <div 
                  key={badge.id}
                  className={`dashboard-card p-4 flex flex-col items-center text-center relative overflow-hidden transition ${
                    isUnlocked ? '' : 'opacity-50'
                  }`}
                  style={isUnlocked ? { borderColor: 'var(--marigold)' } : {}}
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                    isUnlocked ? badge.color : 'from-slate-100 to-slate-200'
                  } flex items-center justify-center text-white shadow mb-2 relative`}>
                    <Award size={24} className="stroke-[2]" />
                    {!isUnlocked && (
                      <span className="absolute inset-0 bg-slate-900/10 rounded-full flex items-center justify-center">
                        <Shield size={14} className="text-slate-500" />
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-xs text-ink truncate" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{badge.name}</h4>
                  <p className="text-[9px] text-ink-soft font-medium leading-snug mt-1">{badge.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Milestone Sheet Modal popup */}
      {selectedNode && (
        <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-end justify-center p-0 md:p-6 animate-fade-in">
          <div className="dashboard-card rounded-t-[32px] md:rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-slide-up flex flex-col gap-5" style={{ backgroundColor: 'var(--paper)', borderTop: '1px solid var(--line)' }}>
            
            {/* Header info */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase tracking-wider block font-bold" style={{ color: 'var(--marigold)' }}>Milestone Details</span>
                <h3 className="text-xl mt-0.5" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--ink)' }}>{selectedNode.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                style={{ backgroundColor: 'var(--clay)', border: '1px solid var(--line)', color: 'var(--ink)' }}
                className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition"
              >
                ✕
              </button>
            </div>

            <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--ink-soft)' }}>{selectedNode.description}</p>

            {/* Checklist items */}
            <div className="space-y-3 border-t pt-4" style={{ borderColor: 'var(--line)' }}>
              <span className="text-[10px] uppercase tracking-wider block font-bold" style={{ color: 'var(--ink-soft)' }}>Requirement Checklist:</span>
              <div className="space-y-2">
                {selectedNode.subTasks.map((task, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-semibold" style={{ color: 'var(--ink-soft)' }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--marigold)' }} />
                    <p>{task}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Links */}
            {selectedNode.appLink && (
              <button
                onClick={() => {
                  setSelectedNode(null);
                  navigate(selectedNode.appLink!);
                }}
                style={{ backgroundColor: 'var(--clay)', border: '1px solid var(--line)', color: 'var(--ink)' }}
                className="w-full hover:bg-paper hover:border-marigold/40 hover:text-marigold font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                {selectedNode.linkText || 'Complete Action'} <ArrowRight size={13} />
              </button>
            )}

            {/* Complete / Toggle Checkpoint */}
            <button
              onClick={() => {
                const isCurrentCompleted = progress[selectedNode.id] === true;
                handleToggleTask(selectedNode.id, !isCurrentCompleted);
                setSelectedNode(null);
              }}
              style={{ backgroundColor: 'var(--marigold)', color: 'var(--paper)' }}
              className="w-full hover:bg-marigold-dark font-black py-4 rounded-xl shadow-md transition text-xs tracking-wider uppercase"
            >
              {progress[selectedNode.id] === true ? 'Mark Incomplete' : 'Complete Milestone & Claim XP'}
            </button>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RelocationDashboard;
