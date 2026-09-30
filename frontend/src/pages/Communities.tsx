import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MessageSquare, AlertTriangle } from 'lucide-react';
import { NivaroLogo } from '../components/NivaroLogo';
import Footer from '../components/Footer';
import { Community, Post } from '../types/community';
import { communityService } from '../services/communityService';
import { CommunitySidebar } from '../components/community/CommunitySidebar';
import { PostCard } from '../components/community/PostCard';
import { CreateCommunityModal } from '../components/community/CreateCommunityModal';
import { CreatePostModal } from '../components/community/CreatePostModal';

const Communities: React.FC = () => {
  const navigate = useNavigate();
  
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [discoverCommunities, setDiscoverCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Moderation state
  const [flaggedPostId, setFlaggedPostId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCommunity) {
      loadPosts(selectedCommunity.id);
    } else {
      setPosts([]);
    }
  }, [selectedCommunity]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [myRes, discRes] = await Promise.all([
        communityService.getMyCommunities(),
        communityService.getDiscoverCommunities()
      ]);
      setMyCommunities(myRes || []);
      setDiscoverCommunities(discRes || []);
      
      if (myRes && myRes.length > 0) {
        setSelectedCommunity(myRes[0]);
      } else if (discRes && discRes.length > 0) {
        setSelectedCommunity(discRes[0]);
      } else {
        setSelectedCommunity(null);
      }
    } catch (err) {
      console.error("Failed to load communities", err);
      setMyCommunities([]);
      setDiscoverCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (communityId: string) => {
    try {
      const data = await communityService.getPosts(communityId);
      setPosts(data || []);
    } catch (err) {
      console.error("Failed to load posts", err);
      setPosts([]);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    try {
      await communityService.joinCommunity(communityId);
      const joinedObj = discoverCommunities.find(c => c.id === communityId) || myCommunities.find(c => c.id === communityId);
      if (joinedObj) {
        setMyCommunities(prev => prev.some(c => c.id === communityId) ? prev : [...prev, joinedObj]);
        setDiscoverCommunities(prev => prev.filter(c => c.id !== communityId));
        setSelectedCommunity(joinedObj);
      }
    } catch (err) {
      console.error("Failed to join community", err);
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    try {
      await communityService.leaveCommunity(communityId);
      const leftObj = myCommunities.find(c => c.id === communityId);
      if (leftObj) {
        setDiscoverCommunities(prev => prev.some(c => c.id === communityId) ? prev : [...prev, leftObj]);
        setMyCommunities(prev => prev.filter(c => c.id !== communityId));
        if (selectedCommunity?.id === communityId) {
          const remaining = myCommunities.filter(c => c.id !== communityId);
          setSelectedCommunity(remaining.length > 0 ? remaining[0] : null);
        }
      }
    } catch (err) {
      console.error("Failed to leave community", err);
    }
  };

  const handleCreateCommunitySubmit = async (name: string, description: string, type: 'COLLEGE' | 'COURSE' | 'LOCATION' | 'HOUSING' | 'INTEREST') => {
    try {
      const newComm = await communityService.createCommunity({ name, description, type });
      if (newComm) {
        setMyCommunities(prev => [...prev, newComm]);
        setSelectedCommunity(newComm);
        setShowCreateCommunityModal(false);
      }
    } catch (err: any) {
      console.error("Failed to create community", err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || "Failed to create community. Please try again.";
      alert(errMsg);
    }
  };

  const handleCreatePostSubmit = async (payload: {
    title: string;
    content: string;
    postType: 'TEXT' | 'POLL' | 'EVENT';
    pollOptions: string[] | null;
    eventDate: string | null;
    location: string | null;
  }) => {
    if (!selectedCommunity) return;

    try {
      await communityService.createPost(selectedCommunity.id, payload);
      await loadPosts(selectedCommunity.id);
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create post", err);
      alert("Failed to publish post.");
    }
  };

  const handleReportPost = (postId: string) => {
    setFlaggedPostId(postId);
    setFlagReason('');
  };

  const submitReport = () => {
    if (!flagReason.trim()) return;
    setFlaggedPostId(null);
    alert("Post flagged for student moderation. Admin will review within 2 hours.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-clay text-marigold">
        <span className="animate-pulse font-bold text-sm">Entering Hub...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-0 animate-fade-in" style={{ backgroundColor: 'var(--clay)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>

      {/* Top Header bar */}
      <header className="border-b bg-paper px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--line)' }}
            className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={18} style={{ color: 'var(--ink-soft)' }} />
          </button>

          <div className="flex items-center gap-1.5">
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--marigold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>
              <NivaroLogo className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Nivaro Community</h1>
          </div>
        </div>

        {selectedCommunity && !myCommunities.some(c => c.id === selectedCommunity.id) ? (
          <button
            onClick={() => handleJoinCommunity(selectedCommunity.id)}
            style={{ backgroundColor: 'var(--marigold)', color: 'var(--paper)' }}
            className="hover:bg-marigold-dark font-bold px-4 py-2.5 rounded-xl shadow-sm text-xs flex items-center gap-1.5 transition"
          >
            Join Community
          </button>
        ) : selectedCommunity ? (
          <button
            onClick={() => setShowCreateModal(true)}
            style={{ backgroundColor: 'var(--marigold)', color: 'var(--paper)' }}
            className="hover:bg-marigold-dark font-bold px-4 py-2.5 rounded-xl shadow-sm text-xs flex items-center gap-1.5 transition"
          >
            <Plus size={14} className="stroke-[2.5]" /> Create Post
          </button>
        ) : null}
      </header>

      {/* Main split triple column grid */}
      <div className="w-full max-w-7xl mx-auto px-6 pt-6 flex flex-col lg:flex-row gap-6 items-start">

        {/* Left Sidebar: Subscribed Groups */}
        <CommunitySidebar 
          myCommunities={myCommunities}
          discoverCommunities={discoverCommunities}
          selectedCommunity={selectedCommunity}
          onSelect={setSelectedCommunity}
          onJoin={handleJoinCommunity}
          onLeave={handleLeaveCommunity}
          onCreateClick={() => setShowCreateCommunityModal(true)}
        />

        {/* Center Stream: Interactive Reddit Posts Feed */}
        <main className="flex-1 space-y-6 w-full">

          {selectedCommunity && (
            <div className="dashboard-card p-5">
              <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{selectedCommunity.name}</h2>
              <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{selectedCommunity.description}</p>
            </div>
          )}

          {posts.length > 0 ? (
            posts.map(post => (
              <PostCard 
                key={post.id}
                post={post}
                selectedCommunity={selectedCommunity}
                onReport={handleReportPost}
              />
            ))
          ) : (
            <div className="text-center p-12 bg-white border border-[#EAE5D9] rounded-3xl shadow-sm text-[#8E8674]">
              <MessageSquare className="mx-auto text-[#D9A25A]/40 mb-3" size={36} />
              <h4 className="text-sm font-black text-[#1E1E1E] font-display">No Posts Yet</h4>
              <p className="text-[11px] mt-1">Be the first to share room configurations or union announcements!</p>
            </div>
          )}

        </main>

        {/* Right Sidebar: Rules & Student Moderation Guidelines */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-4">
          <div className="dashboard-card p-5 space-y-4">
            <h3 className="text-xs uppercase tracking-wider mb-4 font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-soft)' }}>Hub Guidelines</h3>

            <ul className="space-y-3 text-[11px] font-semibold leading-relaxed list-decimal pl-4 animate-slide-in" style={{ color: 'var(--ink-soft)' }}>
              <li>Verified student members only. No external agents allowed.</li>
              <li>Respect roommates, lifestyles, and food choices.</li>
              <li>No false deposit claims or spamming of same flats.</li>
              <li>Report inappropriate reviews or abusive behaviors instantly.</li>
            </ul>

            <div className="pt-3 border-t flex items-center gap-2" style={{ borderColor: 'var(--line)' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--pine)' }} />
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--pine)' }}>Moderators Active</span>
            </div>
          </div>
        </aside>

      </div>

      {/* Floating Create Post Modal Dialogue */}
      {showCreateModal && (
        <CreatePostModal 
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePostSubmit}
        />
      )}

      {/* Floating Flag Post Modal Dialog */}
      {flaggedPostId && (
        <div className="fixed inset-0 bg-[#1E1E1E]/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white border border-[#EAE5D9] rounded-[32px] w-full max-w-sm p-6 shadow-2xl animate-scale-in">

            <div className="flex items-center gap-2 text-red-500 mb-3">
              <AlertTriangle size={20} />
              <h3 className="text-lg font-black font-display">Report Community Post</h3>
            </div>

            <p className="text-[11px] text-[#8E8674] leading-relaxed mb-4">
              Help keep UniSphere safe! Tell us what is wrong with this post:
            </p>

            <div className="space-y-3">
              {['Broker spam listing', 'False housing deposit request', 'Inappropriate or abusive comments', 'Irrelevant study post'].map(reason => (
                <button
                  key={reason}
                  onClick={() => setFlagReason(reason)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-semibold transition ${flagReason === reason ? 'border-red-500 bg-red-50/50 text-red-600' : 'border-[#EAE5D9] bg-white text-[#8E8674]'
                    }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex gap-3 justify-end pt-5">
              <button
                type="button"
                onClick={() => setFlaggedPostId(null)}
                className="bg-transparent hover:bg-slate-100 text-[#8E8674] font-bold px-4 py-2.5 rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                disabled={!flagReason.trim()}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition"
              >
                Submit Report
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Floating Create Community Modal Dialog */}
      {showCreateCommunityModal && (
        <CreateCommunityModal 
          onClose={() => setShowCreateCommunityModal(false)}
          onSubmit={handleCreateCommunitySubmit}
        />
      )}

      <Footer />

    </div>
  );
};

export default Communities;
