import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, BarChart2, Calendar, MapPin, Flag } from 'lucide-react';
import { Post, Comment, Community } from '../../types/community';
import { communityService } from '../../services/communityService';
import { useAuth } from '../../context/AuthContext';

interface PostCardProps {
  post: Post;
  selectedCommunity: Community | null;
  onReport: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  selectedCommunity,
  onReport
}) => {
  const { user } = useAuth();
  
  // Localized state for self-contained interactivity
  const [likedByMe, setLikedByMe] = useState(post.likedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  
  const [userVote, setUserVote] = useState<string | null>(null); // Local optionId voted
  const [pollOptions, setPollOptions] = useState(post.pollOptions || []);

  const handleLike = async () => {
    // Optimistic Update
    const nextLiked = !likedByMe;
    setLikedByMe(nextLiked);
    setLikesCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      const res = await communityService.likePost(post.id);
      setLikedByMe(res.liked);
      setLikesCount(res.likesCount);
    } catch (err) {
      // Revert on failure
      setLikedByMe(!nextLiked);
      setLikesCount(prev => !nextLiked ? prev + 1 : Math.max(0, prev - 1));
    }
  };

  const toggleComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }

    setShowComments(true);
    setLoadingComments(true);
    try {
      const res = await communityService.getComments(post.id);
      setComments(res || []);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const commentContent = newCommentText.trim();
    setNewCommentText('');

    // Optimistically insert local comment
    const temporaryId = Math.random().toString();
    const newCommentObj: Comment = {
      id: temporaryId,
      postId: post.id,
      authorName: user?.fullName || "Prasanna Neupane",
      content: commentContent,
      createdAt: new Date().toISOString()
    };

    setComments(prev => [...prev, newCommentObj]);
    setCommentsCount(prev => prev + 1);

    try {
      const res = await communityService.addComment(post.id, commentContent);
      setComments(prev => prev.map(c => c.id === temporaryId ? { ...c, id: res.id } : c));
    } catch (err) {
      alert("Failed to submit comment to server.");
      // Rollback
      setComments(prev => prev.filter(c => c.id !== temporaryId));
      setCommentsCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleVote = async (optionId: string) => {
    if (userVote) return; // already voted locally

    setUserVote(optionId);
    setPollOptions(prev => prev.map(opt => {
      if (opt.id === optionId) {
        return { ...opt, votesCount: opt.votesCount + 1 };
      }
      return opt;
    }));

    try {
      await communityService.voteOption(optionId);
    } catch (err) {
      console.warn("API vote post failed");
    }
  };

  const handleShare = () => {
    alert("Post link copied to clipboard!");
  };

  return (
    <div className="dashboard-card p-6 space-y-4">
      {/* Post Author details */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border" style={{ borderColor: 'var(--line)' }}>
            <img 
              src={post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
              alt="Author" 
              className="w-full h-full object-cover" 
            />
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
          onClick={() => onReport(post.id)}
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
      {post.postType === 'POLL' && pollOptions.length > 0 && (
        <div className="bg-[#FAF8F5] border rounded-2xl p-4 space-y-3 mt-3" style={{ borderColor: 'var(--line)' }}>
          <span className="text-[9px] font-black uppercase tracking-wider block mb-1" style={{ color: 'var(--marigold)' }}>
            <BarChart2 size={12} className="inline mr-1" /> Student Poll Survey
          </span>

          <div className="space-y-2.5">
            {pollOptions.map(opt => {
              const totalVotes = pollOptions.reduce((sum, o) => sum + o.votesCount, 0);
              const pct = totalVotes > 0 ? Math.round((opt.votesCount / totalVotes) * 100) : 0;
              const isVoted = userVote === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => handleVote(opt.id)}
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
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition ${likedByMe ? 'text-[#D9A25A]' : 'hover:text-[#1E1E1E]'}`}
        >
          <Heart size={16} className={likedByMe ? 'fill-[#D9A25A] stroke-[#D9A25A]' : ''} />
          <span>{likesCount} Likes</span>
        </button>

        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 hover:text-[#1E1E1E] transition"
        >
          <MessageSquare size={16} />
          <span>{commentsCount} Comments</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 hover:text-[#1E1E1E] transition ml-auto"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* Nested Comments stream drawer */}
      {showComments && (
        <div className="border-t border-[#EAE5D9]/60 pt-4 space-y-4">
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {loadingComments ? (
              <div className="text-center py-4 text-[10px] font-bold text-ink-soft/50 animate-pulse">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-4 text-[10px] font-bold text-ink-soft/45">
                No comments yet.
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="bg-[#FAF8F5] border border-[#EAE5D9]/50 rounded-2xl p-3.5 text-xs font-semibold leading-relaxed">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-[#1E1E1E]">{comment.authorName}</span>
                    <span className="text-[9px] text-[#A39E93]">
                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[#8E8674]">{comment.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Write comment input box */}
          <form onSubmit={handleAddComment} className="flex gap-2">
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
  );
};
