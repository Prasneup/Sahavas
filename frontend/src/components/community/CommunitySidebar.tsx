import React from 'react';
import { Plus } from 'lucide-react';
import { Community } from '../../types/community';

interface CommunitySidebarProps {
  myCommunities: Community[];
  discoverCommunities: Community[];
  selectedCommunity: Community | null;
  onSelect: (c: Community) => void;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
  onCreateClick: () => void;
}

export const CommunitySidebar: React.FC<CommunitySidebarProps> = ({
  myCommunities,
  discoverCommunities,
  selectedCommunity,
  onSelect,
  onJoin,
  onLeave,
  onCreateClick
}) => {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-4">
      <div className="dashboard-card p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs uppercase tracking-wider font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink-soft)' }}>Communities</h3>
          <button 
            onClick={onCreateClick}
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
                      onClick={() => onSelect(c)}
                      className={`flex-1 text-left px-3 py-2 rounded-xl text-xs font-bold transition truncate ${selectedCommunity?.id === c.id ? 'bg-[#FAF3E8] text-[#D9A25A] border border-[#D9A25A]/15' : 'text-[#8E8674] hover:bg-clay/10'
                        }`}
                    >
                      👥 {c.name}
                    </button>
                    <button 
                      onClick={() => onLeave(c.id)}
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
                      onClick={() => onSelect(c)}
                      className={`flex-1 text-left px-3 py-2 rounded-xl text-xs font-bold transition truncate ${selectedCommunity?.id === c.id ? 'bg-[#FAF3E8] text-[#D9A25A] border border-[#D9A25A]/15' : 'text-[#8E8674] hover:bg-clay/10'
                        }`}
                    >
                      🌐 {c.name}
                    </button>
                    <button 
                      onClick={() => onJoin(c.id)}
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
  );
};
