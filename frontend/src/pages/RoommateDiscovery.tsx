import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Users, Award, ShieldCheck, Heart, Bookmark, RefreshCw, CheckCircle, ChevronRight, Compass } from 'lucide-react';
import { MOCK_ROOMMATES } from '../services/roommatesData';

const RoommateDiscovery: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'DASHBOARD' | 'QUIZ' | 'PROCESSING'>('DASHBOARD');
  
  // Quiz State
  const [quizStep, setQuizStep] = useState(1);
  const [sleep, setSleep] = useState('EARLY');
  const [smoking, setSmoking] = useState('NON_SMOKER');
  const [cleanliness, setCleanliness] = useState('HIGH');
  const [drinking, setDrinking] = useState('NEVER');
  const [budget, setBudget] = useState('6k-8k');

  // Matching Loader State
  const [progress, setProgress] = useState(0);
  const [loaderMessage, setLoaderMessage] = useState('Analyzing Lifestyle Preferences...');

  // Dashboard Stats States
  const [stats, setStats] = useState({
    compatibleMatches: 8,
    pendingRequests: 3,
    savedProfiles: 4,
    acceptedConnections: 2
  });

  // Load Saved Stats
  useEffect(() => {
    const savedPending = localStorage.getItem('pendingRequestsCount');
    if (savedPending) {
      setStats(prev => ({ ...prev, pendingRequests: parseInt(savedPending, 10) }));
    }
    const savedBookmarks = localStorage.getItem('savedProfilesCount');
    if (savedBookmarks) {
      setStats(prev => ({ ...prev, savedProfiles: parseInt(savedBookmarks, 10) }));
    }
  }, [step]);

  // Handle quiz submit & matching animation
  const handleSubmitQuiz = () => {
    setStep('PROCESSING');
    setProgress(0);
  };

  useEffect(() => {
    if (step !== 'PROCESSING') return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 4;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            navigate('/matches/results');
          }, 300);
          return 100;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [step, navigate]);

  useEffect(() => {
    if (step !== 'PROCESSING') return;

    if (progress < 20) {
      setLoaderMessage('Analyzing Lifestyle Preferences...');
    } else if (progress < 40) {
      setLoaderMessage('Comparing Study Habits...');
    } else if (progress < 60) {
      setLoaderMessage('Matching Budget Requirements...');
    } else if (progress < 80) {
      setLoaderMessage('Evaluating Cleanliness Compatibility...');
    } else if (progress < 95) {
      setLoaderMessage('Finding Compatible Students...');
    } else {
      setLoaderMessage('Calculating Compatibility Score...');
    }
  }, [progress, step]);

  return (
    <div className="min-h-screen bg-clay text-ink flex flex-col font-sans">
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-8">
        
        {step === 'DASHBOARD' && (
          <div className="space-y-8">
            
            {/* Page Header */}
            <div>
              <h2 className="text-3xl font-black font-display text-ink">Roommate Matching Center</h2>
              <p className="text-sm mt-1 text-ink-soft font-semibold">Discover compatible peers from your college to share rooms and split rental costs.</p>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div 
                onClick={() => navigate('/matches/results')}
                className="dashboard-card p-5 bg-paper flex flex-col justify-between min-h-[110px] cursor-pointer hover:shadow-md transition"
              >
                <span className="text-[10px] uppercase tracking-wider block font-bold text-ink-soft">Compatible Matches</span>
                <h3 className="text-2xl font-black font-mono text-ink mt-2">{stats.compatibleMatches}</h3>
                <span className="text-[10px] block mt-1 text-marigold-dark font-bold">View Results →</span>
              </div>

              <div className="dashboard-card p-5 bg-paper flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] uppercase tracking-wider block font-bold text-ink-soft">Pending Requests</span>
                <h3 className="text-2xl font-black font-mono text-ink mt-2">{stats.pendingRequests}</h3>
                <span className="text-[10px] block mt-1 text-ink-soft/75 font-semibold">Awaiting reply</span>
              </div>

              <div className="dashboard-card p-5 bg-paper flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] uppercase tracking-wider block font-bold text-ink-soft">Saved Profiles</span>
                <h3 className="text-2xl font-black font-mono text-ink mt-2">{stats.savedProfiles}</h3>
                <span className="text-[10px] block mt-1 text-ink-soft/75 font-semibold">Bookmarked</span>
              </div>

              <div className="dashboard-card p-5 bg-paper flex flex-col justify-between min-h-[110px]">
                <span className="text-[10px] uppercase tracking-wider block font-bold text-ink-soft">Connections</span>
                <h3 className="text-2xl font-black font-mono text-pine mt-2">{stats.acceptedConnections}</h3>
                <span className="text-[10px] block mt-1 text-pine font-bold">Ready to chat</span>
              </div>
            </div>

            {/* Matchmaker Banner Card */}
            <div className="dashboard-card p-6 md:p-8 bg-paper flex flex-col md:flex-row justify-between items-center gap-6 border border-ink/5">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-[9px] bg-marigold/10 border border-marigold/20 text-marigold-dark px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-block">
                  ⭐ Compatibility Quiz
                </span>
                <h3 className="text-xl font-black text-ink font-display">Update Your Roommate Preferences</h3>
                <p className="text-xs text-ink-soft max-w-lg font-semibold leading-relaxed">
                  Our matching engine computes compatibility percentage based on clean habits, sleep schedules, budgets, and study styles. Retake the quiz anytime.
                </p>
              </div>
              <button 
                onClick={() => { setQuizStep(1); setStep('QUIZ'); }}
                className="bg-marigold hover:bg-marigold-dark text-paper font-black py-3 px-6 rounded-xl transition text-xs uppercase tracking-wider shadow-sm shrink-0"
              >
                Start Matchmaker Quiz
              </button>
            </div>

            {/* Quick Preview Matches List */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-ink font-display flex items-center gap-1.5">
                  <Sparkles className="text-marigold" size={18} /> Top Recommended Matches
                </h3>
                <button onClick={() => navigate('/matches/results')} className="text-xs font-bold text-marigold-dark hover:underline">
                  View All Matches
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_ROOMMATES.slice(0, 3).map((match) => (
                  <div 
                    key={match.id}
                    onClick={() => navigate(`/matches/${match.id}`)}
                    className="dashboard-card p-5 bg-paper flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img src={match.avatarUrl} alt={match.name} className="w-12 h-12 rounded-full object-cover border border-ink/10" />
                        <div>
                          <h4 className="text-xs font-black text-ink">{match.name}</h4>
                          <span className="text-[10px] text-ink-soft block font-semibold">{match.college}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-pine bg-pine-light px-2.5 py-1 rounded-full font-mono">
                        {match.compatibilityScore}%
                      </span>
                    </div>

                    <p className="text-xs text-ink-soft line-clamp-2 mt-4 font-medium italic">
                      "{match.bio}"
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-ink/5">
                      <span className="text-[8px] bg-clay text-ink-soft font-bold px-2 py-0.5 rounded uppercase">
                        {match.sleepSchedule}
                      </span>
                      <span className="text-[8px] bg-clay text-ink-soft font-bold px-2 py-0.5 rounded uppercase">
                        {match.smokingStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {step === 'QUIZ' && (
          <div className="max-w-md mx-auto bg-paper border border-ink/10 rounded-[32px] p-8 shadow-sm space-y-6">
            
            {/* Quiz Header */}
            <div className="flex justify-between items-center">
              <button 
                onClick={() => setStep('DASHBOARD')}
                className="text-xs font-bold text-ink-soft hover:underline"
              >
                ← Back
              </button>
              <span className="text-xs font-black font-mono text-marigold-dark">Question {quizStep} of 5</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-clay/30 h-1.5 rounded-full overflow-hidden">
              <div className="bg-marigold h-full rounded-full transition-all duration-300" style={{ width: `${(quizStep / 5) * 100}%` }}></div>
            </div>

            {/* Question Card View */}
            <div className="py-4 space-y-6">
              
              {quizStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-ink font-display leading-tight">What is your typical sleeping schedule?</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => { setSleep('EARLY'); setQuizStep(2); }}
                      className={`w-full text-left p-4 rounded-2xl border text-xs font-bold transition ${
                        sleep === 'EARLY' ? 'border-marigold bg-[#FAF8F5] text-marigold-dark' : 'border-ink/10 hover:bg-clay/10 text-ink-soft'
                      }`}
                    >
                      🌅 Early Bird — sleep early, wake up early
                    </button>
                    <button 
                      onClick={() => { setSleep('OWL'); setQuizStep(2); }}
                      className={`w-full text-left p-4 rounded-2xl border text-xs font-bold transition ${
                        sleep === 'OWL' ? 'border-marigold bg-[#FAF8F5] text-marigold-dark' : 'border-ink/10 hover:bg-clay/10 text-ink-soft'
                      }`}
                    >
                      🌃 Night Owl — sleep late, wake up late
                    </button>
                  </div>
                </div>
              )}

              {quizStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-ink font-display leading-tight">What is your smoking preference?</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => { setSmoking('NON_SMOKER'); setQuizStep(3); }}
                      className={`w-full text-left p-4 rounded-2xl border text-xs font-bold transition ${
                        smoking === 'NON_SMOKER' ? 'border-marigold bg-[#FAF8F5] text-marigold-dark' : 'border-ink/10 hover:bg-clay/10 text-ink-soft'
                      }`}
                    >
                      🚭 Non-Smoker — prefer smoke-free flats
                    </button>
                    <button 
                      onClick={() => { setSmoking('SOCIAL'); setQuizStep(3); }}
                      className={`w-full text-left p-4 rounded-2xl border text-xs font-bold transition ${
                        smoking === 'SOCIAL' ? 'border-marigold bg-[#FAF8F5] text-marigold-dark' : 'border-ink/10 hover:bg-clay/10 text-ink-soft'
                      }`}
                    >
                      🚬 Social Smoker — occasional smoking allowed outside
                    </button>
                    <button 
                      onClick={() => { setSmoking('SMOKER'); setQuizStep(3); }}
                      className={`w-full text-left p-4 rounded-2xl border text-xs font-bold transition ${
                        smoking === 'SMOKER' ? 'border-marigold bg-[#FAF8F5] text-marigold-dark' : 'border-ink/10 hover:bg-clay/10 text-ink-soft'
                      }`}
                    >
                      🔥 Regular Smoker — smoking allowed in private rooms
                    </button>
                  </div>
                </div>
              )}

              {quizStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-ink font-display leading-tight">How clean do you keep your living space?</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => { setCleanliness('HIGH'); setQuizStep(4); }}
                      className={`w-full text-left p-4 rounded-2xl border text-xs font-bold transition ${
                        cleanliness === 'HIGH' ? 'border-marigold bg-[#FAF8F5] text-marigold-dark' : 'border-ink/10 hover:bg-clay/10 text-ink-soft'
                      }`}
                    >
                      ✨ High Cleanliness — clean dishes instantly, daily dusting
                    </button>
                    <button 
                      onClick={() => { setCleanliness('MODERATE'); setQuizStep(4); }}
                      className={`w-full text-left p-4 rounded-2xl border text-xs font-bold transition ${
                        cleanliness === 'MODERATE' ? 'border-marigold bg-[#FAF8F5] text-marigold-dark' : 'border-ink/10 hover:bg-clay/10 text-ink-soft'
                      }`}
                    >
                      🧹 Moderate — weekly cleanup, keep common areas neat
                    </button>
                    <button 
                      onClick={() => { setCleanliness('LOW'); setQuizStep(4); }}
                      className={`w-full text-left p-4 rounded-2xl border text-xs font-bold transition ${
                        cleanliness === 'LOW' ? 'border-marigold bg-[#FAF8F5] text-marigold-dark' : 'border-ink/10 hover:bg-clay/10 text-ink-soft'
                      }`}
                    >
                      📦 Low / Chilled — relaxed about cleaning schedules
                    </button>
                  </div>
                </div>
              )}

              {quizStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-ink font-display leading-tight">What is your drinking preference?</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => { setDrinking('NEVER'); setQuizStep(5); }}
                      className={`w-full text-left p-4 rounded-2xl border text-xs font-bold transition ${
                        drinking === 'NEVER' ? 'border-marigold bg-[#FAF8F5] text-marigold-dark' : 'border-ink/10 hover:bg-clay/10 text-ink-soft'
                      }`}
                    >
                      🥤 Never Drink — prefer a dry apartment
                    </button>
                    <button 
                      onClick={() => { setDrinking('SOCIALLY'); setQuizStep(5); }}
                      className={`w-full text-left p-4 rounded-2xl border text-xs font-bold transition ${
                        drinking === 'SOCIALLY' ? 'border-marigold bg-[#FAF8F5] text-marigold-dark' : 'border-ink/10 hover:bg-clay/10 text-ink-soft'
                      }`}
                    >
                      🍻 Socially — okay with occasional weekend beers
                    </button>
                  </div>
                </div>
              )}

              {quizStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-ink font-display leading-tight">What is your monthly room budget range?</h3>
                  <div className="space-y-3">
                    {['4k-6k', '6k-8k', '8k-10k', '10k-12k'].map(range => (
                      <button 
                        key={range}
                        onClick={() => { setBudget(range); handleSubmitQuiz(); }}
                        className={`w-full text-left p-4 rounded-2xl border text-xs font-bold transition ${
                          budget === range ? 'border-marigold bg-[#FAF8F5] text-marigold-dark' : 'border-ink/10 hover:bg-clay/10 text-ink-soft'
                        }`}
                      >
                        NPR {range.replace('k', ',000').replace('k', ',000')} per month
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Back Button */}
            {quizStep > 1 && (
              <button 
                onClick={() => setQuizStep(prev => prev - 1)}
                className="w-full text-center text-xs font-bold text-ink-soft hover:text-ink pt-2 transition"
              >
                Go back to previous question
              </button>
            )}

          </div>
        )}

        {step === 'PROCESSING' && (
          <div className="max-w-md mx-auto bg-paper border border-ink/10 rounded-[32px] p-8 shadow-sm text-center py-16 space-y-8">
            {/* Spinning Mandala Logo */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-[#FAF3E8] border border-marigold flex items-center justify-center text-marigold animate-spin-slow">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-black text-ink font-display">Finding Your Roommate Matches</h3>
              <p className="text-xs text-marigold-dark font-mono font-bold animate-pulse">{loaderMessage}</p>
            </div>

            {/* Progress Percentage Counter */}
            <div className="space-y-2">
              <div className="w-full bg-clay/30 h-2.5 rounded-full overflow-hidden">
                <div className="bg-marigold h-full rounded-full transition-all duration-100" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="text-xs font-bold font-mono text-ink-soft">{progress}% Completed</span>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default RoommateDiscovery;
