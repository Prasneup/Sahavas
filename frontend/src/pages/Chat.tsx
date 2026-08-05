import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, ArrowLeft, Paperclip, CheckCheck, Home, User, MessageCircle, Compass } from 'lucide-react';
import { MOCK_ROOMMATES } from '../services/roommatesData';

interface PeerProfile {
  id: string;
  fullName: string;
  collegeName: string;
  majorCourse: string;
  avatarUrl: string;
  completenessPercentage: number;
}

interface Conversation {
  conversationId: string;
  peerProfile: PeerProfile;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
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
      const res = await api.get('/chats/conversations');
      let list = res.data || [];
      
      if (id) {
        const alreadyExists = list.some((c: any) => c.peerProfile.id === id);
        if (!alreadyExists) {
          const r = MOCK_ROOMMATES.find(item => item.id === id);
          if (r) {
            const newConv: Conversation = {
              conversationId: `c_${r.id}`,
              peerProfile: {
                id: r.id,
                fullName: r.name,
                collegeName: r.college,
                majorCourse: r.department,
                avatarUrl: r.avatarUrl,
                completenessPercentage: r.compatibilityScore
              },
              lastMessage: "Hi, I saw we have a high compatibility score. Would you like to discuss accommodation options?",
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0
            };
            list = [newConv, ...list];
          }
        }
      }

      setConversations(list);
      
      if (id) {
        const found = list.find((c: any) => c.peerProfile.id === id);
        if (found) {
          setActiveConversation(found);
        } else if (list.length > 0) {
          setActiveConversation(list[0]);
        }
      } else if (list.length > 0) {
        setActiveConversation(list[0]);
      }
    } catch (err) {
      console.warn("API conversations failed, loading mock chats");
      let mockConversations: Conversation[] = [
        {
          conversationId: "c1",
          peerProfile: {
            id: "1",
            fullName: "Suman Thapa",
            collegeName: "Pulchowk Campus",
            majorCourse: "Mechanical Engineering",
            avatarUrl: "/src/assets/roommates/media__1785942064373.png",
            completenessPercentage: 81
          },
          lastMessage: "I'll visit the Pulchowk flat tomorrow morning, want to join?",
          lastMessageTime: new Date().toISOString(),
          unreadCount: 2
        },
        {
          conversationId: "c2",
          peerProfile: {
            id: "2",
            fullName: "Rohan Basnet",
            collegeName: "Apex College",
            majorCourse: "BBA student",
            avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
            completenessPercentage: 74
          },
          lastMessage: "Are you fine with non-vegetarian kitchen rules?",
          lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
          unreadCount: 0
        }
      ];

      if (id) {
        const alreadyExists = mockConversations.some(c => c.peerProfile.id === id);
        if (!alreadyExists) {
          const r = MOCK_ROOMMATES.find(item => item.id === id);
          if (r) {
            const newConv: Conversation = {
              conversationId: `c_${r.id}`,
              peerProfile: {
                id: r.id,
                fullName: r.name,
                collegeName: r.college,
                majorCourse: r.department,
                avatarUrl: r.avatarUrl,
                completenessPercentage: r.compatibilityScore
              },
              lastMessage: "Hi, I saw we have a high compatibility score. Would you like to discuss accommodation options?",
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0
            };
            mockConversations = [newConv, ...mockConversations];
          }
        }
      }

      setConversations(mockConversations);
      
      if (id) {
        const found = mockConversations.find(c => c.peerProfile.id === id);
        if (found) {
          setActiveConversation(found);
        } else if (mockConversations.length > 0) {
          setActiveConversation(mockConversations[0]);
        }
      } else if (mockConversations.length > 0) {
        setActiveConversation(mockConversations[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
    if (convId.startsWith('c_')) {
      const peerId = convId.replace('c_', '');
      setMessages([
        {
          id: `m_start_${peerId}`,
          conversationId: convId,
          senderId: peerId,
          content: "Hi, I saw we have a high compatibility score. Would you like to discuss accommodation options?",
          messageType: "TEXT",
          isRead: true,
          createdAt: new Date(Date.now() - 300000).toISOString()
        }
      ]);
      return;
    }

    try {
      const res = await api.get(`/chats/conversations/${convId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.warn("API messages failed, loading mock history");
      if (convId === "c1") {
        setMessages([
          {
            id: "m1",
            conversationId: convId,
            senderId: "1",
            content: "Hey, saw your roommate profile match! We got 81% compatibility score.",
            messageType: "TEXT",
            isRead: true,
            createdAt: new Date(Date.now() - 7200000).toISOString()
          },
          {
            id: "m2",
            conversationId: convId,
            senderId: user?.id || "my-id",
            content: "Hey Suman! Yes, mechanical engineering sounds great. Where are you planning to lease?",
            messageType: "TEXT",
            isRead: true,
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: "m3",
            conversationId: convId,
            senderId: "1",
            content: "I'll visit the Pulchowk flat tomorrow morning, want to join?",
            messageType: "TEXT",
            isRead: false,
            createdAt: new Date(Date.now() - 600000).toISOString()
          }
        ]);
      } else {
        setMessages([
          {
            id: "m4",
            conversationId: convId,
            senderId: "2",
            content: "Are you fine with non-vegetarian kitchen rules?",
            messageType: "TEXT",
            isRead: true,
            createdAt: new Date(Date.now() - 3600000).toISOString()
          }
        ]);
      }
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

    // Send payload via socket or fallbacks
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        conversationId: activeConversation.conversationId,
        senderId: user?.id,
        recipientId: activeConversation.peerProfile.id,
        content: text,
        type: 'CHAT',
        messageType: 'TEXT'
      }));
    } else {
      // Simulation simulated response after 2 seconds
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const reply: Message = {
            id: Math.random().toString(),
            conversationId: activeConversation.conversationId,
            senderId: activeConversation.peerProfile.id,
            content: `Replied: "Sounds good, let's keep details updated."`,
            messageType: "TEXT",
            isRead: false,
            createdAt: new Date().toISOString()
          };
          setMessages(prev => [...prev, reply]);
        }, 1500);
      }, 1000);
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
              {/* Sahavas Mandala Logo */}
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--marigold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              </div>
              <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>सहवास Messages</h1>
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
              {conversations.map(conv => {
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
                      <img src={conv.peerProfile.avatarUrl} alt="Peer Avatar" className="w-full h-full object-cover" />
                      {/* Active online circle indicator */}
                      <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full" style={{ backgroundColor: 'var(--pine)' }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4 className="text-xs font-bold truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                          {conv.peerProfile.fullName}
                        </h4>
                        <span className="text-[9px] font-semibold font-mono" style={{ color: 'var(--ink-soft)' }}>
                          {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] truncate font-medium" style={{ color: 'var(--ink-soft)' }}>{conv.lastMessage}</p>
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
                      <img src={activeConversation.peerProfile.avatarUrl} alt="Peer" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
                        {activeConversation.peerProfile.fullName}
                        <span className="inline-flex items-center gap-0.5 bg-pine-light text-pine text-[8px] font-black px-2 py-0.5 rounded-full border border-pine/10">
                          <CheckCheck size={8} /> Student
                        </span>
                      </h3>
                      <p className="text-[10px] font-semibold" style={{ color: 'var(--ink-soft)' }}>
                        {activeConversation.peerProfile.collegeName} • {activeConversation.peerProfile.majorCourse}
                      </p>
                    </div>
                  </div>

                  {/* Compatibility gauge pill */}
                  <div className="bg-[#FAF3E8] border border-marigold/10 rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--ink-soft)' }}>Match Score</span>
                    <span className="text-xs font-bold font-mono" style={{ color: 'var(--marigold-dark)' }}>{activeConversation.peerProfile.completenessPercentage}%</span>
                  </div>
                </div>

                {/* Scrollable Message stream panel */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => {
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
                                  <img src={activeConversation.peerProfile.avatarUrl} alt="Student" className="w-full h-full object-cover" />
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
                })}

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
            </div>
          )}
        </main>

      </div>

    </div>
  </div>
);
};

export default Chat;
