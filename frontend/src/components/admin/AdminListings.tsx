import React from 'react';
import { ListingItem } from '../../types/admin';

interface AdminListingsProps {
  listings: ListingItem[];
  onModerate: (item: ListingItem) => void;
}

export const AdminListings: React.FC<AdminListingsProps> = ({ listings, onModerate }) => {
  return (
    <div className="bg-paper border border-ink/5 rounded-[24px] overflow-hidden shadow-sm animate-fade-in">
      <div className="px-6 py-4 border-b border-ink/5">
        <h3 className="text-sm font-bold text-ink">Room Listings Moderation</h3>
      </div>
      {listings.length === 0 ? (
        <div className="text-center py-12 text-xs font-bold text-ink-soft">
          No room listings posted in the system yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-clay/35 text-[10px] uppercase font-bold text-ink-soft border-b border-ink/5">
                <th className="p-4">Room Title</th>
                <th className="p-4">Rent</th>
                <th className="p-4">Type</th>
                <th className="p-4">Moderation Status</th>
                <th className="p-4">Owner Info</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {listings.map(item => (
                <tr key={item.id} className="border-b border-ink/5 hover:bg-clay/10 transition">
                  <td className="p-4 font-black">{item.title}</td>
                  <td className="p-4 font-mono font-bold text-pine">NPR {item.rentAmount}</td>
                  <td className="p-4 uppercase text-[10px] font-semibold text-ink-soft">{item.roomType.replace('_', ' ')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      item.verificationStatus === 'APPROVED' ? 'bg-pine-light text-pine' : 
                      item.verificationStatus === 'PENDING' ? 'bg-marigold/10 text-marigold-dark' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {item.verificationStatus}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[10px] text-ink-soft">{item.owner?.phoneNumber || 'N/A'}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onModerate(item)}
                      className="bg-marigold text-paper font-bold px-3 py-1.5 rounded-lg text-[10px] hover:bg-marigold-dark transition shadow-sm"
                    >
                      Moderate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
