import React, { useState } from 'react';

interface CreatePostModalProps {
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    content: string;
    postType: 'TEXT' | 'POLL' | 'EVENT';
    pollOptions: string[] | null;
    eventDate: string | null;
    location: string | null;
  }) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  onClose,
  onSubmit
}) => {
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'TEXT' | 'POLL' | 'EVENT'>('TEXT');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const payload = {
      title: postTitle,
      content: postContent,
      postType,
      pollOptions: postType === 'POLL' ? pollOptions.filter(o => o.trim() !== '') : null,
      eventDate: postType === 'EVENT' ? eventDate : null,
      location: postType === 'EVENT' ? eventLocation : null
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-[#1E1E1E]/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white border border-[#EAE5D9] rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-scale-in">
        <h3 className="text-xl font-black text-[#1E1E1E] mb-4 font-display">New Community Post</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Select Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-[#FAF8F5] p-1 rounded-xl border border-[#EAE5D9]/60">
            <button
              type="button"
              onClick={() => setPostType('TEXT')}
              className={`py-2 rounded-lg text-[10px] font-black tracking-wider uppercase transition ${postType === 'TEXT' ? 'bg-white border border-[#EAE5D9] text-[#D9A25A]' : 'text-[#8E8674]'}`}
            >
              📝 Post
            </button>
            <button
              type="button"
              onClick={() => setPostType('POLL')}
              className={`py-2 rounded-lg text-[10px] font-black tracking-wider uppercase transition ${postType === 'POLL' ? 'bg-white border border-[#EAE5D9] text-[#D9A25A]' : 'text-[#8E8674]'}`}
            >
              📊 Poll
            </button>
            <button
              type="button"
              onClick={() => setPostType('EVENT')}
              className={`py-2 rounded-lg text-[10px] font-black tracking-wider uppercase transition ${postType === 'EVENT' ? 'bg-white border border-[#EAE5D9] text-[#D9A25A]' : 'text-[#8E8674]'}`}
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
              onClick={onClose}
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
  );
};
