import React from 'react';
import { VerificationRequest } from '../../types/admin';

interface AdminVerificationsProps {
  verifications: VerificationRequest[];
  onReview: (req: VerificationRequest) => void;
}

export const AdminVerifications: React.FC<AdminVerificationsProps> = ({ verifications, onReview }) => {
  return (
    <div className="bg-paper border border-ink/5 rounded-[24px] overflow-hidden shadow-sm animate-fade-in">
      <div className="px-6 py-4 border-b border-ink/5">
        <h3 className="text-sm font-bold text-ink">Pending Credentials Verification Queue</h3>
      </div>
      {verifications.length === 0 ? (
        <div className="text-center py-12 text-xs font-bold text-ink-soft">
          No pending verification requests in the queue.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-clay/35 text-[10px] uppercase font-bold text-ink-soft border-b border-ink/5">
                <th className="p-4">Full Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">College</th>
                <th className="p-4">Reg Number</th>
                <th className="p-4">Document Type</th>
                <th className="p-4 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {verifications.map(req => (
                <tr key={req.id} className="border-b border-ink/5 hover:bg-clay/10 transition">
                  <td className="p-4 font-black">{req.fullName}</td>
                  <td className="p-4 uppercase font-bold text-[9px] text-marigold-dark">{req.role}</td>
                  <td className="p-4 text-ink-soft">{req.collegeName}</td>
                  <td className="p-4 font-mono font-bold">{req.registrationNumber}</td>
                  <td className="p-4 text-ink-soft font-semibold">{req.documentType}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onReview(req)}
                      className="bg-marigold text-paper font-bold px-3.5 py-1.5 rounded-lg text-[10px] hover:bg-marigold-dark transition shadow-sm"
                    >
                      Review Submission
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
