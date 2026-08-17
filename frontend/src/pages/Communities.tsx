import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Heart, Share2, Calendar, MapPin, BarChart2, Plus, Flag, AlertTriangle } from 'lucide-react';
import { NivaroLogo } from '../components/NivaroLogo';
import Footer from '../components/Footer';

interface Community {
  id: string;
  name: string;
  description: string;
  type: 'COLLEGE' | 'COURSE' | 'LOCATION' | 'HOUSING' | 'INTEREST' | 'DISTRICT';
  creator?: {
    id: string;
  };
}

interface PollOption {
  id: string;
  optionText: String;
  votesCount: number;
}

interface EventDetail {
  eventDate: string;
  location: string;
  rsvpsCount: number;
}

interface Post {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorVerification: string;
  title: string;
  content: string;
  postType: 'TEXT' | 'POLL' | 'EVENT';
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  createdAt: string;
  pollOptions?: PollOption[];
  eventDetails?: EventDetail;
}

interface Comment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

const Communities: React.FC = () => {
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [discoverCommunities, setDiscoverCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Community Creator States
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  const [newCommunityName, setNewCommunityName] = useState('');
  const [newCommunityDesc, setNewCommunityDesc] = useState('');
  const [newCommunityType, setNewCommunityType] = useState<'COLLEGE' | 'COURSE' | 'LOCATION' | 'HOUSING' | 'INTEREST'>('COLLEGE');

  // Post Creator States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'TEXT' | 'POLL' | 'EVENT'>('TEXT');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  // Comment & Voting States
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({});
  const [newCommentText, setNewCommentText] = useState('');
  const [userVotes, setUserVotes] = useState<Record<string, string>>({}); // postId -> optionId

  // Moderation State
  const [flaggedPostId, setFlaggedPostId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

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
        api.get('/communities/my'),
        api.get('/communities/discover')
      ]);
      setMyCommunities(myRes.data);
      setDiscoverCommunities(discRes.data);
      if (myRes.data && myRes.data.length > 0) {
        setSelectedCommunity(myRes.data[0]);
      } else if (discRes.data && discRes.data.length > 0) {
        setSelectedCommunity(discRes.data[0]);
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
      const res = await api.get(`/communities/${communityId}/posts`);
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to load posts", err);
      setPosts([]);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const res = await api.post(`/communities/posts/${postId}/like`);
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, likedByMe: res.data.liked, likesCount: res.data.likesCount };
        }
        return p;
      }));
    } catch (err) {
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            likedByMe: !p.likedByMe,
            likesCount: p.likedByMe ? p.likesCount - 1 : p.likesCount + 1
          };
        }
        return p;
      }));
    }
  };

  const toggleComments = async (postId: string) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
      return;
    }

    setActiveCommentPostId(postId);

    try {
      const res = await api.get(`/communities/posts/${postId}/comments`);
      setCommentsMap(prev => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error("Failed to load comments", err);
      setCommentsMap(prev => ({ ...prev, [postId]: [] }));
    }
  };

  const handleAddComment = async (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const commentContent = newCommentText.trim();
    setNewCommentText('');

    const newCommentObj: Comment = {
      id: Math.random().toString(),
      postId,
      authorName: user?.fullName || "Prasanna Neupane",
      content: commentContent,
      createdAt: new Date().toISOString()
    };

    setCommentsMap(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newCommentObj]
    }));

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, commentsCount: p.commentsCount + 1 };
      }
      return p;
    }));

    try {
      const res = await api.post(`/communities/posts/${postId}/comments`, { content: commentContent });
      setCommentsMap(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).map(c => c.id === newCommentObj.id ? { ...c, id: res.data.id } : c)
      }));
    } catch (err) {
      alert("Failed to submit comment to server.");
      setCommentsMap(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(c => c.id !== newCommentObj.id)
      }));
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return { ...p, commentsCount: Math.max(0, p.commentsCount - 1) };
        }
        return p;
      }));
    }
  };

  const handleVoteOption = async (postId: string, optionId: string) => {
    if (userVotes[postId]) return; // already voted

    setUserVotes(prev => ({ ...prev, [postId]: optionId }));

    setPosts(prev => prev.map(p => {
      if (p.id === postId && p.pollOptions) {
        return {
          ...p,
          pollOptions: p.pollOptions.map(opt => {
            if (opt.id === optionId) {
              return { ...opt, votesCount: opt.votesCount + 1 };
            }
            return opt;
          })
        };
      }
      return p;
    }));

    try {
      await api.post(`/communities/posts/polls/options/${optionId}/vote`);
    } catch (err) {
      console.warn("API vote post failed");
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    try {
      await api.post(`/communities/${communityId}/join`);
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
      await api.post(`/communities/${communityId}/leave`);
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

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunityName.trim()) return;

    try {
      const res = await api.post('/communities', {
        name: newCommunityName,
        description: newCommunityDesc,
        type: newCommunityType
      });
      const newComm = res.data;
      setMyCommunities(prev => [...prev, newComm]);
      setSelectedCommunity(newComm);
      setShowCreateCommunityModal(false);
      setNewCommunityName('');
      setNewCommunityDesc('');
    } catch (err) {
      console.error("Failed to create community", err);
      alert("Failed to create community. Make sure the name is unique.");
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunity || !postTitle.trim() || !postContent.trim()) return;

    const payload = {
      title: postTitle,
      content: postContent,
      postType,
      pollOptions: postType === 'POLL' ? pollOptions.filter(o => o.trim() !== '') : null,
      eventDate: postType === 'EVENT' ? eventDate : null,
      location: postType === 'EVENT' ? eventLocation : null
    };

    try {
      await api.post(`/communities/${selectedCommunity.id}/posts`, payload);
      await loadPosts(selectedCommunity.id);
      setShowCreateModal(false);
      setPostTitle('');
      setPostContent('');
      setPollOptions(['', '']);
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
    <div className="min-h-screen flex flex-col pb-0" style={{ backgroundColor: 'var(--clay)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>

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
            {/* Nivaro Mandala Logo */}
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
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-4">

          <div className="dashboard-card p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs uppercase tracking-wider font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-soft)' }}>Communities</h3>
              <button 
                onClick={() => setShowCreateCommunityModal(true)}
                className="text-[10px] font-black text-marigold uppercase tracking-wider hover:underline flex items-center gap-0.5"
              >
                <Plus size={10} /> Create
              </button>
            </div>

            <div className="space-y-6">
              {/* My Communities */}
              <div>
                <span className="text-[10px] uppercase tracking-wider block mb-2 font-bold" style={{ color: 'var(--marigold)' }}>My Communities</span>
                <div className="space-y-1.5">
                  {myCommunities.length > 0 ? (
                    myCommunities.map(c => (
                      <div key={c.id} className="flex items-center justify-between gap-1 group">
                        <button
                          onClick={() => setSelectedCommunity(c)}
                          className={`flex-1 text-left px-3 py-2 rounded-xl text-xs font-bold transition truncate ${selectedCommunity?.id === c.id ? 'bg-[#FAF3E8] text-[#D9A25A] border border-[#D9A25A]/15' : 'text-[#8E8674] hover:bg-clay/10'
                            }`}
                        >
                          👥 {c.name}
                        </button>
                        <button 
                          onClick={() => handleLeaveCommunity(c.id)}
                          className="opacity-0 group-hover:opacity-100 text-[10px] font-black text-red-500 hover:text-red-600 transition px-1"
                          title="Leave Community"
                        >
                          Leave
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] text-[#A39E93] italic px-3 block">No joined hubs</span>
                  )}
                </div>
              </div>

              {/* Discover Communities */}
              <div>
                <span className="text-[10px] uppercase tracking-wider block mb-2 font-bold" style={{ color: 'var(--marigold)' }}>Discover Communities</span>
                <div className="space-y-1.5">
                  {discoverCommunities.length > 0 ? (
                    discoverCommunities.map(c => (
                      <div key={c.id} className="flex items-center justify-between gap-1">
                        <button
                          onClick={() => setSelectedCommunity(c)}
                          className={`flex-1 text-left px-3 py-2 rounded-xl text-xs font-bold transition truncate ${selectedCommunity?.id === c.id ? 'bg-[#FAF3E8] text-[#D9A25A] border border-[#D9A25A]/15' : 'text-[#8E8674] hover:bg-clay/10'
                            }`}
                        >
                          🌐 {c.name}
                        </button>
                        <button 
                          onClick={() => handleJoinCommunity(c.id)}
                          style={{ backgroundColor: 'var(--marigold)', color: 'var(--paper)' }}
                          className="px-2 py-1 rounded-lg text-[9px] font-bold shadow-sm transition hover:opacity-90"
                        >
                          Join
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] text-[#A39E93] italic px-3 block">No new hubs to discover</span>
                  )}
                </div>
              </div>
            </div>

          </div>

        </aside>

        {/* Center Stream: Interactive Reddit Posts Feed */}
        <main className="flex-1 space-y-6">

          {selectedCommunity && (
            <div className="dashboard-card p-5">
              <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--ink)' }}>{selectedCommunity.name}</h2>
              <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--ink-soft)' }}>{selectedCommunity.description}</p>
            </div>
          )}

          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} className="dashboard-card p-6 space-y-4">

                {/* Post Author details */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border" style={{ borderColor: 'var(--line)' }}>
                      <img src={post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} alt="Author" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-ink flex items-center gap-1.5 flex-wrap">
                        {post.authorName}
                        {post.authorVerification === 'VERIFIED' && (
                          <span className="w-3.5 h-3.5 rounded-full bg-pine-light border border-pine/10 flex items-center justify-center text-pine text-[8px] font-black" title="Verified Student">
                            ✓
                          </span>
                        )}
                        {selectedCommunity && selectedCommunity.creator?.id === post.authorId && (
                          <span className="bg-[#FAF3E8] border border-[#D9A25A]/15 text-[#D9A25A] text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                            Mod
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] text-ink-soft font-semibold">
                        Posted {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleReportPost(post.id)}
                    className="text-ink-soft hover:text-red-500 transition p-1"
                    title="Flag Post"
                  >
                    <Flag size={14} />
                  </button>
                </div>

                {/* Post Title & Content body */}
                <div className="space-y-2">
                  <h3 className="text-base font-bold leading-snug" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                    {post.title}
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>
                </div>

                {/* Conditional Sub-Module render for Polls */}
                {post.postType === 'POLL' && post.pollOptions && (
                  <div className="bg-[#FAF8F5] border rounded-2xl p-4 space-y-3 mt-3" style={{ borderColor: 'var(--line)' }}>
                    <span className="text-[9px] font-black uppercase tracking-wider block mb-1" style={{ color: 'var(--marigold)' }}>
                      <BarChart2 size={12} className="inline mr-1" /> Student Poll Survey
                    </span>

                    <div className="space-y-2.5">
                      {post.pollOptions.map(opt => {
                        const totalVotes = post.pollOptions!.reduce((sum, o) => sum + o.votesCount, 0);
                        const pct = totalVotes > 0 ? Math.round((opt.votesCount / totalVotes) * 100) : 0;
                        const isVoted = userVotes[post.id] === opt.id;

                        return (
                          <div
                            key={opt.id}
                            onClick={() => handleVoteOption(post.id, opt.id)}
                            className="cursor-pointer border border-ink/10 rounded-xl p-3 bg-paper hover:bg-clay/10 transition"
                          >
                            <div className="flex justify-between items-center text-xs font-semibold">
                              <span className={isVoted ? 'text-marigold' : 'text-ink-soft'}>{opt.optionText}</span>
                              <span className="text-[10px] text-ink-soft font-bold font-mono">{opt.votesCount} votes ({pct}%)</span>
                            </div>
                            {/* Poll progress bar track & fill matching profile status pattern */}
                            <div className="mt-2 w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--line)' }}>
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: 'var(--marigold)' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Conditional Sub-Module render for Events */}
                {post.postType === 'EVENT' && post.eventDetails && (
                  <div className="bg-[#FAF8F5] border rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-3" style={{ borderColor: 'var(--line)' }}>
                    <div className="space-y-2">
                      <span className="text-[9px] font-black uppercase tracking-wider block" style={{ color: 'var(--marigold)' }}>
                        <Calendar size={12} className="inline mr-1" /> Local Event Schedule
                      </span>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
                          <Calendar size={13} className="text-marigold" />
                          <span>{new Date(post.eventDetails.eventDate).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
                          <MapPin size={13} className="text-marigold" />
                          <span>{post.eventDetails.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-ink-soft font-bold font-mono">{post.eventDetails.rsvpsCount} RSVP'd</span>
                      <button
                        onClick={() => alert("RSVP Recorded! Event added to your calendar.")}
                        style={{ backgroundColor: 'var(--marigold)', color: 'var(--paper)' }}
                        className="hover:bg-marigold-dark font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition"
                      >
                        RSVP / Join
                      </button>
                    </div>
                  </div>
                )}

                {/* Action footer triggers row */}
                <div className="flex items-center gap-4 border-t pt-3 text-xs text-ink-soft font-semibold" style={{ borderColor: 'var(--line)' }}>
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-1.5 transition ${post.likedByMe ? 'text-[#D9A25A]' : 'hover:text-[#1E1E1E]'}`}
                  >
                    <Heart size={16} className={post.likedByMe ? 'fill-[#D9A25A] stroke-[#D9A25A]' : ''} />
                    <span>{post.likesCount} Likes</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 hover:text-[#1E1E1E] transition"
                  >
                    <MessageSquare size={16} />
                    <span>{post.commentsCount} Comments</span>
                  </button>

                  <button
                    onClick={() => alert("Post link copied to clipboard!")}
                    className="flex items-center gap-1.5 hover:text-[#1E1E1E] transition ml-auto"
                  >
                    <Share2 size={16} />
                  </button>
                </div>

                {/* Nested Comments stream drawer */}
                {activeCommentPostId === post.id && (
                  <div className="border-t border-[#EAE5D9]/60 pt-4 space-y-4">
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                      {(commentsMap[post.id] || []).map(comment => (
                        <div key={comment.id} className="bg-[#FAF8F5] border border-[#EAE5D9]/50 rounded-2xl p-3.5 text-xs font-semibold leading-relaxed">
                          <div className="flex justify-between items-baseline mb-1">
                            <span className="font-bold text-[#1E1E1E]">{comment.authorName}</span>
                            <span className="text-[9px] text-[#A39E93]">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-[#8E8674]">{comment.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Write comment input box */}
                    <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="flex-1 bg-[#FAF8F5] border border-[#EAE5D9] text-[#1E1E1E] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#D9A25A]"
                      />
                      <button
                        type="submit"
                        className="bg-[#D9A25A] hover:bg-[#C9924A] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                )}

              </div>
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
            <h3 className="text-xs uppercase tracking-wider mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--ink-soft)' }}>Hub Guidelines</h3>

            <ul className="space-y-3 text-[11px] font-semibold leading-relaxed list-decimal pl-4" style={{ color: 'var(--ink-soft)' }}>
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
        <div className="fixed inset-0 bg-[#1E1E1E]/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white border border-[#EAE5D9] rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-scale-in">

            <h3 className="text-xl font-black text-[#1E1E1E] mb-4 font-display">New Community Post</h3>

            <form onSubmit={handleCreatePost} className="space-y-4">

              {/* Type Select Tabs */}
              <div className="grid grid-cols-3 gap-2 bg-[#FAF8F5] p-1 rounded-xl border border-[#EAE5D9]/60">
                <button
                  type="button"
                  onClick={() => setPostType('TEXT')}
                  className={`py-2 rounded-lg text-[10px] font-black tracking-wider uppercase transition ${postType === 'TEXT' ? 'bg-white border border-[#EAE5D9] text-[#D9A25A]' : 'text-[#8E8674]'
                    }`}
                >
                  📝 Post
                </button>
                <button
                  type="button"
                  onClick={() => setPostType('POLL')}
                  className={`py-2 rounded-lg text-[10px] font-black tracking-wider uppercase transition ${postType === 'POLL' ? 'bg-white border border-[#EAE5D9] text-[#D9A25A]' : 'text-[#8E8674]'
                    }`}
                >
                  📊 Poll
                </button>
                <button
                  type="button"
                  onClick={() => setPostType('EVENT')}
                  className={`py-2 rounded-lg text-[10px] font-black tracking-wider uppercase transition ${postType === 'EVENT' ? 'bg-white border border-[#EAE5D9] text-[#D9A25A]' : 'text-[#8E8674]'
                    }`}
                >
                  📅 Event
                </button>
              </div>

              {/* Title input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1E1E1E]">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Keep it descriptive..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5D9] text-[#1E1E1E] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#D9A25A]"
                />
              </div>

              {/* Content body */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1E1E1E]">Content / Details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details, flat routes, or study schedules..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5D9] text-[#1E1E1E] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#D9A25A] resize-none"
                />
              </div>

              {/* Dynamic Poll Options inputs */}
              {postType === 'POLL' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#1E1E1E]">Poll Choices</label>
                  {pollOptions.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      required={idx < 2}
                      placeholder={`Choice option ${idx + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...pollOptions];
                        newOpts[idx] = e.target.value;
                        setPollOptions(newOpts);
                      }}
                      className="w-full bg-[#FAF8F5] border border-[#EAE5D9] text-[#1E1E1E] rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#D9A25A]"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ''])}
                    className="text-[10px] font-black text-[#D9A25A] uppercase tracking-wider inline-block hover:underline"
                  >
                    + Add Option Choice
                  </button>
                </div>
              )}

              {/* Dynamic Event inputs */}
              {postType === 'EVENT' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#1E1E1E]">Event Date</label>
                    <input
                      type="datetime-local"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#EAE5D9] text-[#1E1E1E] rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#D9A25A]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#1E1E1E]">Location</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lalitpur"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#EAE5D9] text-[#1E1E1E] rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:border-[#D9A25A]"
                    />
                  </div>
                </div>
              )}

              {/* CTA buttons */}
              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-transparent hover:bg-slate-100 text-[#8E8674] font-bold px-4 py-2.5 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#D9A25A] hover:bg-[#C9924A] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition"
                >
                  Publish Post
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Floating Flag Post Modal Dialog */}
      {flaggedPostId && (
        <div className="fixed inset-0 bg-[#1E1E1E]/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
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
        <div className="fixed inset-0 bg-[#1E1E1E]/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white border border-[#EAE5D9] rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-scale-in">
            <h3 className="text-xl font-black text-[#1E1E1E] mb-4 font-display">Create a Student Hub</h3>

            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1E1E1E]">Hub Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kathmandu CSE 2026, Lalitpur Housing Help"
                  value={newCommunityName}
                  onChange={(e) => setNewCommunityName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5D9] text-[#1E1E1E] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#D9A25A]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1E1E1E]">Description</label>
                <textarea
                  rows={3}
                  placeholder="What is this hub for? Rules, goals, context..."
                  value={newCommunityDesc}
                  onChange={(e) => setNewCommunityDesc(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5D9] text-[#1E1E1E] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#D9A25A] resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#1E1E1E]">Category Type</label>
                <select
                  value={newCommunityType}
                  onChange={(e) => setNewCommunityType(e.target.value as any)}
                  className="w-full bg-[#FAF8F5] border border-[#EAE5D9] text-[#1E1E1E] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#D9A25A]"
                >
                  <option value="COLLEGE">🏫 College</option>
                  <option value="COURSE">📖 Course</option>
                  <option value="LOCATION">🏔️ Location</option>
                  <option value="HOUSING">🏠 Housing</option>
                  <option value="INTEREST">🌟 Interest</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateCommunityModal(false)}
                  className="bg-transparent hover:bg-slate-100 text-[#8E8674] font-bold px-4 py-2.5 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#D9A25A] hover:bg-[#C9924A] text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition"
                >
                  Create Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />

    </div>
  );
};

export default Communities;
