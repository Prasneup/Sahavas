import React from 'react';
import { UserItem } from '../../types/admin';

interface AdminUsersProps {
  users: UserItem[];
  onChangeStatus: (userId: string, currentStatus: string) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ users, onChangeStatus }) => {
  return (
    <div className="bg-paper border border-ink/5 rounded-[24px] overflow-hidden shadow-sm animate-fade-in">
      <div className="px-6 py-4 border-b border-ink/5">
        <h3 className="text-sm font-bold text-ink">Student & Landlord User Accounts</h3>
      </div>
      {users.length === 0 ? (
        <div className="text-center py-12 text-xs font-bold text-ink-soft">
          No user accounts found in database.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-clay/35 text-[10px] uppercase font-bold text-ink-soft border-b border-ink/5">
                <th className="p-4">Full Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">City</th>
                <th className="p-4">Origin District</th>
                <th className="p-4">Vetting Status</th>
                <th className="p-4 text-right">Status Action</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {users.map(u => (
                <tr key={u.id} className="border-b border-ink/5 hover:bg-clay/10 transition">
                  <td className="p-4 font-black">{u.fullName}</td>
                  <td className="p-4 uppercase text-[10px] font-bold text-ink-soft">{u.majorCourse === 'Landlord' ? 'Landlord' : 'Student'}</td>
                  <td className="p-4 text-ink-soft">{u.currentCity}</td>
                  <td className="p-4 text-ink-soft">{u.hometownDistrict}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      u.verificationStatus === 'VERIFIED' ? 'bg-pine-light text-pine' : 
                      u.verificationStatus === 'SUSPENDED' ? 'bg-rose-50 text-rose-600' : 'bg-marigold/10 text-marigold-dark'
                    }`}>
                      {u.verificationStatus || 'PENDING'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onChangeStatus(u.id, u.verificationStatus || '')}
                      className={`font-bold px-3 py-1.5 rounded-lg text-[10px] transition shadow-sm ${
                        u.verificationStatus === 'SUSPENDED' 
                          ? 'bg-pine text-paper hover:bg-pine/90' 
                          : 'bg-rose-500 text-paper hover:bg-rose-600'
                      }`}
                    >
                      {u.verificationStatus === 'SUSPENDED' ? 'Unsuspend' : 'Suspend User'}
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
