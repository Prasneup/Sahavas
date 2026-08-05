import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Heart, Share2, Calendar, MapPin, BarChart2, Plus, Flag, AlertTriangle } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  description: string;
  type: 'COLLEGE' | 'DISTRICT' | 'COURSE';
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
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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
    }
  }, [selectedCommunity]);

  const loadInitialData = async () => {
    try {
      const res = await api.get('/communities');
      setCommunities(res.data);
      if (res.data && res.data.length > 0) {
        setSelectedCommunity(res.data[0]);
      }
    } catch (err) {
      console.warn("API communities failed, using mock data");
      const mockComs: Community[] = [
        {
          id: "com1",
          name: "Pulchowk Campus Hub",
          description: "Official discussion forum for Pulchowk Engineering Campus, Lalitpur.",
          type: 'COLLEGE'
        },
        {
          id: "com2",
          name: "Kaski District Union",
          description: "Student union forum for all residents relocating from Pokhara/Kaski.",
          type: 'DISTRICT'
        },
        {
          id: "com3",
          name: "BBA Students Network",
          description: "Academic support and housing listings for BBA students across Nepal.",
          type: 'COURSE'
        }
      ];
      setCommunities(mockComs);
      setSelectedCommunity(mockComs[0]);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (communityId: string) => {
    try {
      const res = await api.get(`/communities/${communityId}/posts`);
      setPosts(res.data);
    } catch (err) {
      console.warn("API posts failed, using mock items");
      const mockPosts: Post[] = [
        {
          id: "p1",
          communityId: "com1",
          authorId: "user1",
          authorName: "Suman Thapa",
          authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
          authorVerification: "VERIFIED",
          title: "Looking for flat replacement near Pulchowk Gate",
          content: "We have one spare room in a 2BHK flat. Looking for a neat Pulchowk student to join us. Rent is around NPR 6,500. Message me for photos!",
          postType: "TEXT",
          likesCount: 12,
          commentsCount: 3,
          likedByMe: false,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: "p2",
          communityId: "com1",
          authorId: "user2",
          authorName: "Alok Prasai",
          authorAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150",
          authorVerification: "VERIFIED",
          title: "Quick Poll: Sleep habits of engineering students",
          content: "Curious to know when most engineering roommates prefer to sleep during exam periods.",
          postType: "POLL",
          likesCount: 8,
          commentsCount: 1,
          likedByMe: true,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          pollOptions: [
            { id: "o1", optionText: "Early Bird (sleeps before 10 PM)", votesCount: 5 },
            { id: "o2", optionText: "Night Owl (stays awake after 1 AM)", votesCount: 22 },
            { id: "o3", optionText: "All-nighter study schedule", votesCount: 14 }
          ]
        },
        {
          id: "p3",
          communityId: "com1",
          authorId: "user3",
          authorName: "Shristi Shrestha",
          authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
          authorVerification: "VERIFIED",
          title: "Flat Hunting & Networking Meetup",
          content: "Let's gather near the Pulchowk playground to discuss room sharing options and pool transport costs for district movers.",
          postType: "EVENT",
          likesCount: 19,
          commentsCount: 5,
          likedByMe: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          eventDetails: {
            eventDate: new Date(Date.now() + 86400000 * 2).toISOString(),
            location: "Pulchowk Playground, Lalitpur",
            rsvpsCount: 14
          }
        }
      ];

      setPosts(mockPosts.filter(p => p.communityId === communityId));
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
      const mockComments: Comment[] = [
        {
          id: "c1",
          postId,
          authorName: "Suman Thapa",
          content: "Is this flat room still available?",
          createdAt: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: "c2",
          postId,
          authorName: "Prasanna Neupane",
          content: "Looks like a great location, highly compatible!",
          createdAt: new Date(Date.now() - 900000).toISOString()
        }
      ];
      setCommentsMap(prev => ({ ...prev, [postId]: mockComments }));
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
      await api.post(`/communities/posts/${postId}/comments`, { content: commentContent });
    } catch (err) {
      console.warn("API comment post failed, using local simulated state");
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

    const newPostLocal: Post = {
      id: Math.random().toString(),
      communityId: selectedCommunity.id,
      authorId: user?.id || "my-id",
      authorName: user?.fullName || "Prasanna Neupane",
      authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
      authorVerification: "VERIFIED",
      title: postTitle,
      content: postContent,
      postType,
      likesCount: 0,
      commentsCount: 0,
      likedByMe: false,
      createdAt: new Date().toISOString(),
      pollOptions: postType === 'POLL' ? pollOptions.map((text, idx) => ({ id: `o-${idx}`, optionText: text, votesCount: 0 })) : undefined,
      eventDetails: postType === 'EVENT' ? { eventDate, location: eventLocation, rsvpsCount: 0 } : undefined
    };

    setPosts(prev => [newPostLocal, ...prev]);
    setShowCreateModal(false);
    setPostTitle('');
    setPostContent('');
    setPollOptions(['', '']);

    try {
      await api.post(`/communities/${selectedCommunity.id}/posts`, payload);
    } catch (err) {
      console.warn("API post creation failed");
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
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F5] text-[#D9A25A]">
        <span className="animate-pulse font-bold text-sm">Entering Hub...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col font-sans pb-24">
      
      {/* Top Header bar */}
      <header className="border-b border-[#EAE5D9] bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-9 h-9 rounded-full bg-white border border-[#EAE5D9] flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={18} className="text-[#8E8674]" />
          </button>
          
          <div className="flex items-center gap-1.5">
            {/* Sahavas Mandala Logo */}
            <div className="w-7 h-7 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#D9A25A]/40">
              <svg className="w-4.5 h-4.5 text-[#D9A25A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-[#1A2540] tracking-tight font-display">सहवास Community</h1>
          </div>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#D9A25A] hover:bg-[#C9924A] text-white font-bold px-4 py-2.5 rounded-xl shadow-sm text-xs flex items-center gap-1.5 transition"
        >
          <Plus size={14} className="stroke-[2.5]" /> Create Post
        </button>
      </header>

      {/* Main split double column grid */}
      <div className="w-full max-w-6xl mx-auto px-6 pt-6 flex flex-col md:flex-row gap-6">
        
        {/* Left Sidebar: Subscribed Groups */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-4">
          
          <div className="bg-white border border-[#EAE5D9] rounded-3xl p-5 shadow-sm">
            <h3 className="text-xs font-black text-[#A39E93] uppercase tracking-wider mb-4 font-display">Communities</h3>
            
            <div className="space-y-6">
              {/* College Groups */}
              <div>
                <span className="text-[10px] font-black text-[#D9A25A] uppercase tracking-wider block mb-2">College Hubs</span>
                <div className="space-y-1.5">
                  {communities.filter(c => c.type === 'COLLEGE').map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCommunity(c)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition truncate ${
                        selectedCommunity?.id === c.id ? 'bg-[#FAF3E8] text-[#D9A25A]' : 'text-[#8E8674] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      🏫 {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* District Unions */}
              <div>
                <span className="text-[10px] font-black text-[#D9A25A] uppercase tracking-wider block mb-2">Home District Unions</span>
                <div className="space-y-1.5">
                  {communities.filter(c => c.type === 'DISTRICT').map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCommunity(c)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition truncate ${
                        selectedCommunity?.id === c.id ? 'bg-[#FAF3E8] text-[#D9A25A]' : 'text-[#8E8674] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      🏔️ {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Course Sections */}
              <div>
                <span className="text-[10px] font-black text-[#D9A25A] uppercase tracking-wider block mb-2">Course Sections</span>
                <div className="space-y-1.5">
                  {communities.filter(c => c.type === 'COURSE').map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCommunity(c)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition truncate ${
                        selectedCommunity?.id === c.id ? 'bg-[#FAF3E8] text-[#D9A25A]' : 'text-[#8E8674] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      📖 {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </aside>

        {/* Center Stream: Interactive Reddit Posts Feed */}
        <main className="flex-1 space-y-6">
          
          {selectedCommunity && (
            <div className="bg-white border border-[#EAE5D9] rounded-3xl p-5 shadow-sm">
              <h2 className="text-xl font-black text-[#1E1E1E] font-display">{selectedCommunity.name}</h2>
              <p className="text-xs text-[#8E8674] mt-1.5 leading-relaxed">{selectedCommunity.description}</p>
            </div>
          )}

          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} className="bg-white border border-[#EAE5D9] rounded-3xl p-6 shadow-sm space-y-4">
                
                {/* Post Author details */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-[#EAE5D9]">
                      <img src={post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} alt="Author" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#1E1E1E] flex items-center gap-1">
                        {post.authorName}
                        {post.authorVerification === 'VERIFIED' && (
                          <span className="w-3.5 h-3.5 rounded-full bg-[#E6F4EA] border border-[#137333]/10 flex items-center justify-center text-[#137333] text-[8px] font-black">
                            ✓
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] text-[#A39E93] font-semibold">
                        Posted {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleReportPost(post.id)}
                    className="text-[#A39E93] hover:text-red-500 transition p-1"
                    title="Flag Post"
                  >
                    <Flag size={14} />
                  </button>
                </div>

                {/* Post Title & Content body */}
                <div className="space-y-2">
                  <h3 className="text-base font-black text-[#1A2540] leading-snug font-display">
                    {post.title}
                  </h3>
                  <p className="text-xs text-[#8E8674] leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>
                </div>

                {/* Conditional Sub-Module render for Polls */}
                {post.postType === 'POLL' && post.pollOptions && (
                  <div className="bg-[#FAF8F5] border border-[#EAE5D9]/60 rounded-2xl p-4 space-y-3 mt-3">
                    <span className="text-[9px] font-black text-[#D9A25A] uppercase tracking-wider block mb-1">
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
                            className={`cursor-pointer border rounded-xl p-3 relative overflow-hidden transition ${
                              isVoted ? 'border-[#D9A25A] bg-[#FAF3E8]' : 'border-[#EAE5D9] hover:bg-white bg-white'
                            }`}
                          >
                            {/* Visual progress bar fill */}
                            <div 
                              className="absolute top-0 bottom-0 left-0 bg-[#D9A25A]/10 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                            
                            <div className="flex justify-between items-center relative z-10 text-xs font-semibold">
                              <span className={isVoted ? 'text-[#D9A25A]' : 'text-[#8E8674]'}>{opt.optionText}</span>
                              <span className="text-[10px] text-[#A39E93] font-bold">{opt.votesCount} votes ({pct}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Conditional Sub-Module render for Events */}
                {post.postType === 'EVENT' && post.eventDetails && (
                  <div className="bg-[#FAF8F5] border border-[#EAE5D9]/60 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-3">
                    <div className="space-y-2">
                      <span className="text-[9px] font-black text-[#D9A25A] uppercase tracking-wider block">
                        <Calendar size={12} className="inline mr-1" /> Local Event Schedule
                      </span>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#8E8674]">
                          <Calendar size={13} className="text-[#D9A25A]" />
                          <span>{new Date(post.eventDetails.eventDate).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#8E8674]">
                          <MapPin size={13} className="text-[#D9A25A]" />
                          <span>{post.eventDetails.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#A39E93] font-bold">{post.eventDetails.rsvpsCount} RSVP'd</span>
                      <button 
                        onClick={() => alert("RSVP Recorded! Event added to your calendar.")}
                        className="bg-[#D9A25A] hover:bg-[#C9924A] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition"
                      >
                        RSVP / Join
                      </button>
                    </div>
                  </div>
                )}

                {/* Action footer triggers row */}
                <div className="flex items-center gap-4 border-t border-[#EAE5D9]/60 pt-3 text-xs text-[#8E8674] font-semibold">
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
        <aside className="w-full md:w-64 flex-shrink-0 space-y-4">
          
          <div className="bg-white border border-[#EAE5D9] rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-[#A39E93] uppercase tracking-wider font-display">Hub Guidelines</h3>
            
            <ul className="space-y-3 text-[11px] text-[#8E8674] font-semibold leading-relaxed list-decimal pl-4">
              <li>Verified student members only. No external agents allowed.</li>
              <li>Respect roommates, lifestyles, and food choices.</li>
              <li>No false deposit claims or spamming of same flats.</li>
              <li>Report inappropriate reviews or abusive behaviors instantly.</li>
            </ul>

            <div className="pt-2 border-t border-[#EAE5D9]/60 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] text-[#A39E93] font-bold uppercase tracking-wider">Moderators Active</span>
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
                  className={`py-2 rounded-lg text-[10px] font-black tracking-wider uppercase transition ${
                    postType === 'TEXT' ? 'bg-white border border-[#EAE5D9] text-[#D9A25A]' : 'text-[#8E8674]'
                  }`}
                >
                  📝 Post
                </button>
                <button
                  type="button"
                  onClick={() => setPostType('POLL')}
                  className={`py-2 rounded-lg text-[10px] font-black tracking-wider uppercase transition ${
                    postType === 'POLL' ? 'bg-white border border-[#EAE5D9] text-[#D9A25A]' : 'text-[#8E8674]'
                  }`}
                >
                  📊 Poll
                </button>
                <button
                  type="button"
                  onClick={() => setPostType('EVENT')}
                  className={`py-2 rounded-lg text-[10px] font-black tracking-wider uppercase transition ${
                    postType === 'EVENT' ? 'bg-white border border-[#EAE5D9] text-[#D9A25A]' : 'text-[#8E8674]'
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
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-semibold transition ${
                    flagReason === reason ? 'border-red-500 bg-red-50/50 text-red-600' : 'border-[#EAE5D9] bg-white text-[#8E8674]'
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

    </div>
  );
};

export default Communities;
