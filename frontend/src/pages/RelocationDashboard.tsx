import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Flame, Star, FileText, CheckCircle2, GraduationCap, Home, Users, Wifi, Bus, ArrowRight, Shield } from 'lucide-react';

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
      console.warn("API progress load failed, using mock path state");
      // Keep initial mock progress state
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskName: keyof RelocationProgress, completed: boolean) => {
    try {
      const res = await api.post('/relocation/progress/toggle', { taskName, completed });
      setProgress(res.data);
      
      // Update selected node state locally to reflect live state
      if (selectedNode && selectedNode.id === taskName) {
        // Just trigger alert/audio if completed
        if (completed) {
          showConfettiAlert();
        }
      }
    } catch (err) {
      // Offline fallback state update
      const updatedMock = { ...progress };
      (updatedMock as any)[taskName] = completed;
      
      // Count completions
      let count = 0;
      if (updatedMock.admissionCompleted) count++;
      if (updatedMock.collegeConfirmed) count++;
      if (updatedMock.roomFound) count++;
      if (updatedMock.roommateFound) count++;
      if (updatedMock.internetSetup) count++;
      if (updatedMock.transportationSetup) count++;

      updatedMock.completionPercentage = Math.round((count / 6) * 100);
      updatedMock.totalXp = progress.totalXp + (completed ? 100 : -100);

      // Evaluate mock badges
      const badgesSet = new Set(progress.unlockedBadges);
      if (completed) badgesSet.add('FRESH_MOVER');
      if (updatedMock.roomFound) badgesSet.add('ROOF_FINDER');
      if (updatedMock.roommateFound) badgesSet.add('CO_HABITOR');
      if (count === 6) badgesSet.add('FULLY_SET');
      updatedMock.unlockedBadges = Array.from(badgesSet);

      setProgress(updatedMock);
      if (completed) {
        showConfettiAlert();
      }
    }
  };

  const showConfettiAlert = () => {
    alert("✨ Milestone Unlocked! +100 XP Earned. Keep climbing the relocation road! ✨");
  };

  // Node structures definition alternating positions matching Duolingo's path
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
      subTasks: ['Search Airbnb style housing listings', 'Shortlist at least 3 flat rooms', 'Sign rent agreement or secure deposit'],
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
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F5] text-[#D9A25A]">
        <span className="animate-pulse font-bold text-sm">Opening Assistant...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col items-center pb-24 font-sans select-none overflow-x-hidden">
      
      {/* Header Info Banner containing Duolingo stats */}
      <div className="w-full bg-white border-b border-[#EAE5D9] px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm w-full max-w-md">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#EAE5D9] flex items-center justify-center shadow-sm"
        >
          <ArrowLeft size={18} className="text-[#8E8674]" />
        </button>

        {/* Gamification stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-orange-500 font-black text-sm">
            <Flame className="fill-orange-500 stroke-orange-500 animate-pulse" size={20} />
            <span>{progress.streakDays} Day Streak</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#D9A25A] font-black text-sm">
            <Star className="fill-[#D9A25A] stroke-[#D9A25A]" size={20} />
            <span>{progress.totalXp} XP</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md px-6 pt-6 flex-1 flex flex-col justify-start">
        
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-[#1E1E1E] tracking-tight font-display">Relocation Path</h1>
          <p className="text-xs text-[#8E8674] mt-1 font-semibold">Track milestones and earn moving rewards!</p>
        </div>

        {/* Global Progress Bar meter */}
        <div className="bg-white border border-[#EAE5D9] rounded-2xl p-4 shadow-sm mb-8">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-[10px] font-black text-[#A39E93] uppercase tracking-wider">Overall Progress</span>
            <span className="text-xs font-black text-[#D9A25A]">{progress.completionPercentage}%</span>
          </div>
          <div className="w-full bg-[#FAF8F5] h-3 rounded-full overflow-hidden border border-[#EAE5D9]/50">
            <div 
              className="bg-[#D9A25A] h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Duolingo Winding Checkpoints Path */}
        <div className="relative flex flex-col items-center py-6 min-h-[460px]">
          
          {/* Vertical Connecting Road Line */}
          <div className="absolute top-0 bottom-0 w-2.5 bg-[#EAE5D9] rounded-full z-0" />

          <div className="w-full space-y-12 relative z-10 flex flex-col items-center">
            {pathNodes.map((node, idx) => {
              const isCompleted = progress[node.id] === true;
              const isNext = idx === 0 || progress[pathNodes[idx - 1].id] === true;
              const isLocked = !isCompleted && !isNext;

              // Node alignments offsets classes matching Duolingo road
              let alignClass = 'self-center';
              if (node.position === 'left') alignClass = 'self-start pl-8';
              if (node.position === 'right') alignClass = 'self-end pr-8';

              return (
                <div key={node.id} className={`flex flex-col items-center ${alignClass}`}>
                  
                  {/* Duolingo circular checkpoint button */}
                  <button
                    onClick={() => setSelectedNode(node)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-lg transition transform active:scale-95 ${
                      isCompleted 
                        ? 'bg-[#FAF3E8] border-[#D9A25A] text-[#D9A25A] hover:scale-105' 
                        : isNext 
                          ? 'bg-[#D9A25A] border-white text-white animate-bounce hover:scale-105' 
                          : 'bg-white border-[#EAE5D9] text-[#A39E93] cursor-not-allowed opacity-60'
                    }`}
                    disabled={isLocked}
                  >
                    {isCompleted ? <CheckCircle2 className="stroke-[2.5]" size={28} /> : node.icon}
                  </button>

                  <span className="text-[10px] font-black text-[#8E8674] uppercase tracking-wider mt-2.5 text-center bg-white/80 px-2 py-0.5 rounded border border-[#EAE5D9]/50 shadow-sm">
                    {node.title}
                  </span>

                </div>
              );
            })}
          </div>

        </div>

        {/* Achievement Medals Panel */}
        <div className="border-t border-[#EAE5D9] pt-8 mt-8 space-y-4">
          <h3 className="text-xs font-black text-[#A39E93] uppercase tracking-wider text-center font-display">Unlocked Achievements</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {badgesList.map(badge => {
              const isUnlocked = progress.unlockedBadges.includes(badge.id);
              return (
                <div 
                  key={badge.id}
                  className={`bg-white border rounded-2xl p-4 flex flex-col items-center text-center shadow-sm relative overflow-hidden transition ${
                    isUnlocked ? 'border-[#D9A25A]' : 'border-[#EAE5D9] opacity-50'
                  }`}
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
                  
                  <h4 className="text-xs font-black text-[#1E1E1E] truncate font-display">{badge.name}</h4>
                  <p className="text-[9px] text-[#8E8674] font-medium leading-snug mt-1">{badge.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Milestone Sheet Modal popup */}
      {selectedNode && (
        <div className="fixed inset-0 bg-[#1E1E1E]/60 backdrop-blur-sm z-50 flex items-end justify-center p-0 md:p-6 animate-fade-in">
          <div className="bg-white border-t md:border border-[#EAE5D9] rounded-t-[32px] md:rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-slide-up flex flex-col gap-5">
            
            {/* Header info */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-black text-[#D9A25A] uppercase tracking-wider">Milestone Details</span>
                <h3 className="text-xl font-black text-[#1E1E1E] font-display mt-0.5">{selectedNode.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedNode(null)}
                className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#EAE5D9] flex items-center justify-center text-[#8E8674] text-sm font-black hover:scale-105 transition"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#8E8674] leading-relaxed">{selectedNode.description}</p>

            {/* Checklist items */}
            <div className="space-y-3 border-t border-[#EAE5D9]/60 pt-4">
              <span className="text-[10px] font-black text-[#A39E93] uppercase tracking-wider block">Requirement Checklist:</span>
              <div className="space-y-2">
                {selectedNode.subTasks.map((task, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-semibold text-[#8E8674]">
                    <span className="w-1.5 h-1.5 bg-[#D9A25A] rounded-full mt-1.5 flex-shrink-0" />
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
                className="w-full bg-[#FAF8F5] border border-[#EAE5D9] hover:bg-[#FAF3E8] hover:border-[#D9A25A]/40 text-[#8E8674] hover:text-[#D9A25A] font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
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
              className="w-full bg-[#D9A25A] hover:bg-[#C9924A] text-white font-black py-4 rounded-xl shadow-md transition text-xs tracking-wider uppercase"
            >
              {progress[selectedNode.id] === true ? 'Mark Incomplete' : 'Complete Milestone & Claim XP'}
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default RelocationDashboard;
