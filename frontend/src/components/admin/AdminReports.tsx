import React from 'react';
import { TrustReportItem } from '../../types/admin';

interface AdminReportsProps {
  reports: TrustReportItem[];
  onResolve: (id: string) => void;
}

export const AdminReports: React.FC<AdminReportsProps> = ({ reports, onResolve }) => {
  return (
    <div className="bg-paper border border-ink/5 rounded-[24px] overflow-hidden shadow-sm animate-fade-in">
      <div className="px-6 py-4 border-b border-ink/5">
        <h3 className="text-sm font-bold text-ink">Platform Trust & Fraud Reports</h3>
      </div>
      {reports.length === 0 ? (
        <div className="text-center py-12 text-xs font-bold text-ink-soft">
          No trust reports filed yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-clay/35 text-[10px] uppercase font-bold text-ink-soft border-b border-ink/5">
                <th className="p-4">Reporter ID</th>
                <th className="p-4">Reported User ID</th>
                <th className="p-4">Violation Type</th>
                <th className="p-4">Description</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Resolve</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {reports.map(rep => (
                <tr key={rep.id} className="border-b border-ink/5 hover:bg-clay/10 transition">
                  <td className="p-4 font-mono text-[10px] text-ink-soft">{rep.reporterId}</td>
                  <td className="p-4 font-mono text-[10px] text-brick">{rep.reportedUserId}</td>
                  <td className="p-4 font-black">{rep.reason}</td>
                  <td className="p-4 text-ink-soft max-w-xs truncate">{rep.description}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      rep.status === 'RESOLVED' ? 'bg-pine-light text-pine' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {rep.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {rep.status !== 'RESOLVED' && (
                      <button
                        onClick={() => onResolve(rep.id)}
                        className="bg-pine text-paper font-bold px-3 py-1.5 rounded-lg text-[10px] hover:bg-pine/90 transition shadow-sm"
                      >
                        Mark Resolved
                      </button>
                    )}
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
