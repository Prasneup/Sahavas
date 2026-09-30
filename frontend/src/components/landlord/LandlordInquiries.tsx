import React from 'react';
import { Conversation } from '../../types/chat';

interface LandlordInquiriesProps {
  inquiries: Conversation[];
  onChatClick: (chat: Conversation) => void;
}

export const LandlordInquiries: React.FC<LandlordInquiriesProps> = ({ inquiries, onChatClick }) => {
  return (
    <div className="dashboard-card p-5 bg-paper space-y-4 animate-fade-in">
      {inquiries.length === 0 ? (
        <div className="text-center py-8 text-xs font-bold text-ink-soft/75">
          No active student chats yet. Complete verification to attract tenant enquiries!
        </div>
      ) : (
        <div className="divide-y divide-ink/5 space-y-3">
          {inquiries.map(chat => (
            <div 
              key={chat.conversationId}
              onClick={() => onChatClick(chat)}
              className="pt-3 first:pt-0 flex gap-3 cursor-pointer group hover:opacity-85 transition"
            >
              <img 
                src={chat.peerProfile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} 
                alt="Profile" 
                className="w-10 h-10 rounded-xl object-cover bg-clay flex-shrink-0" 
              />
              <div className="min-w-0 flex-1 flex flex-col justify-between text-left">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-xs font-bold text-ink truncate group-hover:text-marigold transition">
                    {chat.peerProfile.fullName}
                  </h4>
                  <span className="text-[8px] text-ink-soft/50 font-mono font-semibold">
                    {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-[10px] text-ink-soft leading-normal truncate font-medium">
                  {chat.lastMessage || 'Sent listing enquiry'}
                </p>
                {chat.listing && (
                  <span className="text-[8px] bg-clay/35 border border-ink/5 text-ink-soft/80 px-2 py-0.5 rounded w-fit block mt-1 font-bold">
                    Listing: {chat.listing.title}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
