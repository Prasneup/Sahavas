import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, ArrowLeft, Paperclip, CheckCheck, Home, User, MessageCircle, Compass, MessageSquare, ShieldCheck } from 'lucide-react';
import { NivaroLogo } from '../components/NivaroLogo';
interface PeerProfile {
  id: string;
  fullName: string;
  collegeName: string;
  majorCourse: string;
  avatarUrl: string;
  completenessPercentage: number;
  role?: string;
}

interface Conversation {
  conversationId: string;
  peerProfile: PeerProfile;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  listing?: {
    id: string;
    title: string;
    rentAmount: number;
    distanceFromCollegeText?: string;
  };
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'ROOM_SHARE' | 'PROFILE_SHARE';
  sharedResourceId?: string;
  isRead: boolean;
  createdAt: string;
}

const Chat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const getAvatarUrl = (profile?: any) => {
    if (profile?.avatarUrl && profile.avatarUrl.trim().length > 0) {
      return profile.avatarUrl;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || 'User')}&background=FAF3E8&color=D9A25A&bold=true&size=128`;
  };

  const formatLastMessageTime = (timeStr?: string) => {
    if (!timeStr) return "No messages yet";
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return "No messages yet";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.conversationId);
      setupWebSocket(activeConversation.conversationId);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const loadConversations = async () => {
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const listingId = queryParams.get('listingId');

      // If id is present, first create/retrieve conversation with that peer ID
      if (id) {
        try {
          await api.post('/chats/conversations', { 
            recipientUserId: id,
            listingId: listingId || undefined
          });
        } catch (err) {
          console.warn("Failed to create conversation via API", err);
        }
      }

      const res = await api.get('/chats/conversations');
      let list: Conversation[] = res.data || [];
      
      // Frontend defensive deduplication to merge any duplicate UI sections
      const uniqueMap = new Map<string, Conversation>();
      
      const generalConvs: Conversation[] = [];
      const listingConvs: Conversation[] = [];
      
      list.forEach((conv) => {
        if (conv.listing && conv.listing.id) {
          listingConvs.push(conv);
        } else {
          generalConvs.push(conv);
        }
      });
      
      listingConvs.forEach((conv) => {
        const key = conv.peerProfile.id + "_" + conv.listing!.id;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, conv);
        } else {
          const existing = uniqueMap.get(key)!;
          existing.unreadCount += conv.unreadCount;
          const existingTime = new Date(existing.lastMessageTime || 0).getTime();
          const newTime = new Date(conv.lastMessageTime || 0).getTime();
          if (newTime > existingTime) {
            existing.lastMessage = conv.lastMessage;
            existing.lastMessageTime = conv.lastMessageTime;
          }
        }
      });
      
      generalConvs.forEach((conv) => {
        const peerListings = Array.from(uniqueMap.values()).filter(c => c.peerProfile.id === conv.peerProfile.id);
        if (peerListings.length > 0) {
          const target = peerListings[0];
          target.unreadCount += conv.unreadCount;
          const targetTime = new Date(target.lastMessageTime || 0).getTime();
          const convTime = new Date(conv.lastMessageTime || 0).getTime();
          if (convTime > targetTime) {
            target.lastMessage = conv.lastMessage;
            target.lastMessageTime = conv.lastMessageTime;
          }
        } else {
          const key = conv.peerProfile.id + "_null";
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, conv);
          } else {
            const existing = uniqueMap.get(key)!;
            existing.unreadCount += conv.unreadCount;
            const existingTime = new Date(existing.lastMessageTime || 0).getTime();
            const newTime = new Date(conv.lastMessageTime || 0).getTime();
            if (newTime > existingTime) {
              existing.lastMessage = conv.lastMessage;
              existing.lastMessageTime = conv.lastMessageTime;
            }
          }
        }
      });
      list = Array.from(uniqueMap.values());
      
      setConversations(list);
      
      if (id) {
        const found = list.find((c: any) => {
          const matchesPeer = c.peerProfile?.id === id;
          if (!matchesPeer) return false;
          if (listingId) {
            return c.listing?.id === listingId;
          }
          return true;
        });
        if (found) {
          setActiveConversation(found);
        } else if (list.length > 0) {
          setActiveConversation(list[0]);
        }
      } else if (list.length > 0) {
        setActiveConversation(list[0]);
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const res = await api.get(`/chats/conversations/${convId}/messages`);
      setMessages(res.data || []);
    } catch (err) {
      console.error("Failed to load messages", err);
      setMessages([]);
    }
  };

  const setupWebSocket = (convId: string) => {
    // Attempt standard browser WebSocket connection
    try {
      const wsUrl = `ws://localhost:8080/ws`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log("WebSocket connected successfully");
      };

      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        if (payload.conversationId === convId) {
          if (payload.type === 'TYPING') {
            setIsTyping(payload.content === 'true');
          } else if (payload.type === 'CHAT') {
            setMessages(prev => [...prev, {
              id: payload.id,
              conversationId: payload.conversationId,
              senderId: payload.senderId,
              content: payload.content,
              messageType: payload.messageType,
              sharedResourceId: payload.sharedResourceId,
              isRead: false,
              createdAt: payload.createdAt
            }]);
          }
        }
      };

      socketRef.current = ws;
    } catch (err) {
      console.warn("WebSocket initiation skipped (Mock Session Mode active)");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConversation) return;

    const text = inputMessage.trim();
    setInputMessage('');

    const newMsg: Message = {
      id: Math.random().toString(),
      conversationId: activeConversation.conversationId,
      senderId: user?.id || "my-id",
      content: text,
      messageType: "TEXT",
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);

    try {
      await api.post(`/chats/conversations/${activeConversation.conversationId}/messages`, { content: text });
    } catch (err) {
      console.warn("Failed to send message via REST API", err);
    }

    // Send payload via socket or fallbacks
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        conversationId: activeConversation.conversationId,
        senderId: user?.id,
        recipientId: activeConversation.peerProfile?.id,
        content: text,
        type: 'CHAT',
        messageType: 'TEXT'
      }));
    }
  };

  const handleShareResource = (type: 'ROOM' | 'PROFILE') => {
    if (!activeConversation) return;
    
    let shareMsg: Message;
    if (type === 'ROOM') {
      shareMsg = {
        id: Math.random().toString(),
        conversationId: activeConversation.conversationId,
        senderId: user?.id || "my-id",
        content: "Shared a housing listing:",
        messageType: "ROOM_SHARE",
        sharedResourceId: "1",
        isRead: false,
        createdAt: new Date().toISOString()
      };
    } else {
      shareMsg = {
        id: Math.random().toString(),
        conversationId: activeConversation.conversationId,
        senderId: user?.id || "my-id",
        content: "Shared a roommate profile card:",
        messageType: "PROFILE_SHARE",
        sharedResourceId: activeConversation.peerProfile.id,
        isRead: false,
        createdAt: new Date().toISOString()
      };
    }

    setMessages(prev => [...prev, shareMsg]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F5] text-[#D9A25A]">
        <span className="animate-pulse font-bold text-sm">Opening Inbox...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--clay)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
      
      {/* Centralized Desktop Chat Container */}
      <div className="w-full max-w-6xl mx-auto flex-1 my-6 flex flex-col overflow-hidden dashboard-card bg-paper">
        
        {/* Top Header bar */}
        <header className="border-b px-6 py-4 flex justify-between items-center z-10 flex-shrink-0" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/dashboard')} 
              style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--line)' }}
              className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
            >
              <ArrowLeft size={18} style={{ color: 'var(--ink-soft)' }} />
            </button>
            
            <div className="flex items-center gap-1.5">
              {/* Nivaro Mandala Logo */}
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--marigold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>
                <NivaroLogo className="w-4.5 h-4.5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Nivaro Messages</h1>
            </div>
          </div>

          <span className="text-xs font-bold" style={{ color: 'var(--ink-soft)' }}>
            Logged in as: <span style={{ color: 'var(--marigold-dark)' }}>{user?.fullName || 'Prasanna'}</span>
          </span>
        </header>

        {/* Main double column screen layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Sidebar: Inbox conversations list */}
          <aside className="w-80 border-r flex flex-col flex-shrink-0 hidden md:flex bg-paper" style={{ borderColor: 'var(--line)' }}>
            <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--line)' }}>
              <MessageCircle size={16} className="text-marigold" />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink-soft)' }}>Active Conversations</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: 'var(--line)' }}>
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-xs font-semibold text-ink-soft/75">
                  No conversations yet.
                  <span className="text-[10px] text-marigold block mt-2 font-bold uppercase tracking-wider">Find your room. Find your perfect roommate.</span>
                </div>
              ) : conversations.map(conv => {
                const isActive = activeConversation?.conversationId === conv.conversationId;
                return (
                  <div
                    key={conv.conversationId}
                    onClick={() => setActiveConversation(conv)}
                    className={`p-4 cursor-pointer flex items-center gap-3 transition ${
                      isActive ? 'bg-clay/20' : 'hover:bg-clay/5'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden relative border flex-shrink-0" style={{ borderColor: 'var(--line)', backgroundColor: 'var(--paper)' }}>
                      <img src={getAvatarUrl(conv.peerProfile)} alt="Peer Avatar" className="w-full h-full object-cover" />
                      {/* Active online circle indicator */}
                      <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full" style={{ backgroundColor: 'var(--pine)' }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-xs font-bold truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                          {conv.peerProfile.fullName}
                        </h4>
                        <span className="text-[9px] font-semibold font-mono" style={{ color: 'var(--ink-soft)' }}>
                          {formatLastMessageTime(conv.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-[11px] truncate font-medium" style={{ color: 'var(--ink-soft)' }}>{conv.lastMessage || 'No messages yet'}</p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-marigold text-paper text-[9px] font-bold flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Right Main Chat Frame (Messenger Style) */}
          <main className="flex-1 flex flex-col overflow-hidden bg-paper">
            {activeConversation ? (
              <>
                {/* Active Conversation Header */}
                <div className="border-b px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ borderColor: 'var(--line)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full overflow-hidden border relative flex-shrink-0" style={{ borderColor: 'var(--line)' }}>
                      <img src={getAvatarUrl(activeConversation.peerProfile)} alt="Peer" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                        {activeConversation.peerProfile.fullName}
                        {activeConversation.peerProfile.role === 'owner' ? (
                          <span className="inline-flex items-center gap-0.5 bg-marigold/10 text-marigold-dark text-[8px] font-black px-2 py-0.5 rounded-full border border-marigold/20">
                            <ShieldCheck size={8} /> Verified Landlord
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 bg-pine-light text-pine text-[8px] font-black px-2 py-0.5 rounded-full border border-pine/10">
                            <CheckCheck size={8} /> Student
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] font-semibold" style={{ color: 'var(--ink-soft)' }}>
                        {activeConversation.peerProfile.role === 'owner' 
                          ? 'Property Owner' 
                          : `${activeConversation.peerProfile.collegeName} • ${activeConversation.peerProfile.majorCourse}`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Compatibility gauge pill */}
                  <div className="bg-[#FAF3E8] border border-marigold/10 rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--ink-soft)' }}>Match Score</span>
                    <span className="text-xs font-bold font-mono" style={{ color: 'var(--marigold-dark)' }}>{activeConversation.peerProfile.completenessPercentage}%</span>
                  </div>
                </div>

                {activeConversation.listing && (
                  <div className="bg-[#FAF8F5] border-b px-6 py-3 flex items-center justify-between gap-4 flex-shrink-0" style={{ borderColor: 'var(--line)' }}>
                    <div className="min-w-0 flex-1">
                      <span className="text-[8px] text-ink-soft font-bold uppercase tracking-wider block">Interested in:</span>
                      <h4 className="text-xs font-bold text-ink truncate font-display">
                        {activeConversation.listing.title}
                      </h4>
                      <p className="text-[9px] text-ink-soft/75 mt-0.5 font-semibold">
                        NPR {activeConversation.listing.rentAmount.toLocaleString()}/month 
                        {activeConversation.listing.distanceFromCollegeText && ` • ${activeConversation.listing.distanceFromCollegeText}`}
                      </p>
                    </div>
                    <button 
                      onClick={() => navigate(`/rooms/${activeConversation.listing?.id}`)}
                      className="bg-paper hover:bg-[#FAF3E8] border border-ink/10 text-ink text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition shrink-0"
                    >
                      View Room
                    </button>
                  </div>
                )}

                {/* Scrollable Message stream panel */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-ink-soft space-y-4 my-auto min-h-[300px]">
                    <div className="w-14 h-14 rounded-full bg-[#FAF3E8] flex items-center justify-center text-marigold-dark shadow-sm">
                      <MessageSquare size={24} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-ink font-display">Start a conversation</h3>
                      <p className="text-xs max-w-sm leading-relaxed text-ink-soft/80 font-medium">
                        Ask the owner about rent, availability, utilities, location, roommates, or move-in details.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInputMessage("Hi, I'm interested in this room. Is it still available?")}
                      className="text-xs bg-[#FAF8F5] border border-ink/10 hover:bg-[#FAF3E8] text-ink-soft px-4 py-2.5 rounded-full font-bold transition shadow-sm"
                    >
                      Suggest: "Hi, I'm interested in this room. Is it still available?"
                    </button>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId === (user?.id || "my-id");
                    return (
                      <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
                        <div className="max-w-[70%] flex flex-col">
                          
                          {/* Render Message bubble based on type */}
                          <div className={`p-4 rounded-[20px] shadow-sm text-xs font-semibold leading-relaxed border ${
                            isMe 
                              ? 'text-paper rounded-tr-none' 
                              : 'text-ink rounded-tl-none'
                          }`} style={{
                            backgroundColor: isMe ? 'var(--marigold)' : 'var(--paper)',
                            borderColor: isMe ? 'var(--marigold-dark)' : 'var(--line)'
                          }}>
                            
                            {msg.messageType === 'TEXT' && (
                              <p>{msg.content}</p>
                            )}

                            {msg.messageType === 'ROOM_SHARE' && (
                              <div className="space-y-3">
                                <p className="font-bold underline text-[10px] uppercase tracking-wider mb-2">
                                  {msg.content}
                                </p>
                                {/* Renders shared Housing Card */}
                                <div className="border rounded-2xl overflow-hidden shadow-inner max-w-xs text-ink bg-paper" style={{ borderColor: 'var(--line)' }}>
                                  <img 
                                    src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=300" 
                                    className="w-full h-32 object-cover" 
                                    alt="Shared Flat"
                                  />
                                  <div className="p-3">
                                    <h4 className="text-xs font-black truncate font-display">Premium Single flat near Pulchowk</h4>
                                    <span className="text-[10px] font-bold block mt-1" style={{ color: 'var(--marigold-dark)' }}>NPR 7,500 / month</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {msg.messageType === 'PROFILE_SHARE' && (
                              <div className="space-y-3">
                                <p className="font-bold underline text-[10px] uppercase tracking-wider mb-2">
                                  {msg.content}
                                </p>
                                {/* Renders shared student Profile card */}
                                <div className="border rounded-2xl p-4 shadow-inner flex items-center gap-3 max-w-xs text-ink bg-paper" style={{ borderColor: 'var(--line)' }}>
                                  <div className="w-10 h-10 rounded-full overflow-hidden border" style={{ borderColor: 'var(--line)' }}>
                                    <img src={getAvatarUrl(activeConversation.peerProfile)} alt="Student" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-xs font-black truncate font-display">{activeConversation.peerProfile.fullName}</h4>
                                    <span className="text-[9px] truncate block mt-0.5" style={{ color: 'var(--ink-soft)' }}>{activeConversation.peerProfile.collegeName}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>

                          {/* Timestamp + Read Receipts */}
                          <div className={`flex items-center gap-1.5 mt-1.5 text-[9px] font-semibold ${
                            isMe ? 'justify-end' : 'justify-start'
                          }`} style={{ color: 'var(--ink-soft)' }}>
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              <CheckCheck size={11} className={msg.isRead ? 'text-marigold' : ''} />
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })
                )}

                {/* Animated Typing Indicator bubble */}
                {isTyping && (
                  <div className="flex justify-start w-full">
                    <div className="bg-paper border px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1 text-[11px] font-semibold" style={{ borderColor: 'var(--line)', color: 'var(--ink-soft)' }}>
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--ink-soft)', animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--ink-soft)', animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--ink-soft)', animationDelay: '300ms' }} />
                      <span className="ml-1 text-[10px]">{activeConversation.peerProfile.fullName.split(' ')[0]} is typing...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom toolbar & Message Input Area */}
              <div className="bg-paper border-t p-4 flex-shrink-0 space-y-3" style={{ borderColor: 'var(--line)' }}>
                
                {/* Sharing attachment row */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--ink-soft)' }}>Quick Share:</span>
                  <button 
                    onClick={() => handleShareResource('ROOM')}
                    className="bg-[#FAF8F5] border border-ink/10 hover:bg-clay/10 text-ink-soft hover:text-marigold-dark text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm transition"
                  >
                    <Home size={11} /> Share Room Flat
                  </button>
                  <button 
                    onClick={() => handleShareResource('PROFILE')}
                    className="bg-[#FAF8F5] border border-ink/10 hover:bg-clay/10 text-ink-soft hover:text-marigold-dark text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm transition"
                  >
                    <User size={11} /> Share Profile Vector
                  </button>
                </div>

                {/* Form Input row */}
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <button 
                    type="button" 
                    className="w-11 h-11 bg-[#FAF8F5] border border-ink/10 hover:bg-clay/10 text-ink-soft rounded-xl flex items-center justify-center shadow-sm transition"
                  >
                    <Paperclip size={18} />
                  </button>

                  <input
                    type="text"
                    placeholder="Type a message or share coordinate maps..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 bg-[#FAF8F5] border border-ink/10 text-ink rounded-xl px-5 py-3.5 focus:outline-none focus:border-marigold text-sm font-semibold placeholder-ink-soft/40"
                  />

                  <button
                    type="submit"
                    style={{ backgroundColor: 'var(--marigold)', color: 'var(--paper)' }}
                    className="w-11 h-11 hover:bg-marigold-dark rounded-xl flex items-center justify-center shadow-md transition"
                  >
                    <Send size={16} />
                  </button>
                </form>

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{ color: 'var(--ink-soft)' }}>
              <Compass className="animate-spin text-marigold mb-4" size={48} />
              <h3 className="text-lg font-black text-ink font-display">Select a Chat</h3>
              <p className="text-xs max-w-xs leading-relaxed mt-2">
                Click on one of your roommate matches on the left to start coordinating housing search plans!
              </p>
              <span className="text-[10px] text-marigold block mt-4 font-bold uppercase tracking-wider">Find your room. Find your perfect roommate.</span>
            </div>
          )}
        </main>

      </div>

    </div>
  </div>
);
};

export default Chat;
