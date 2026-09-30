import React, { useState } from 'react';

interface CreateCommunityModalProps {
  onClose: () => void;
  onSubmit: (name: string, description: string, type: 'COLLEGE' | 'COURSE' | 'LOCATION' | 'HOUSING' | 'INTEREST') => void;
}

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  onClose,
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'COLLEGE' | 'COURSE' | 'LOCATION' | 'HOUSING' | 'INTEREST'>('COLLEGE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name, description, type);
  };

  return (
    <div className="fixed inset-0 bg-[#1E1E1E]/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white border border-[#EAE5D9] rounded-[32px] w-full max-w-md p-6 shadow-2xl animate-scale-in">
        <h3 className="text-xl font-black text-[#1E1E1E] mb-4 font-display">Create a Student Hub</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#1E1E1E]">Hub Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Kathmandu CSE 2026, Lalitpur Housing Help"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#EAE5D9] text-[#1E1E1E] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#D9A25A]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#1E1E1E]">Description</label>
            <textarea
              rows={3}
              placeholder="What is this hub for? Rules, goals, context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#EAE5D9] text-[#1E1E1E] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#D9A25A] resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#1E1E1E]">Category Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
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
              onClick={onClose}
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
  );
};
