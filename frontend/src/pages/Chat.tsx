import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Paperclip, CheckCheck, Home, User, MessageCircle, Compass } from 'lucide-react';

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
      setConversations(res.data);
      if (res.data && res.data.length > 0) {
        setActiveConversation(res.data[0]);
      }
    } catch (err) {
      console.warn("API conversations failed, loading mock chats");
      const mockConversations: Conversation[] = [
        {
          conversationId: "c1",
          peerProfile: {
            id: "1",
            fullName: "Suman Thapa",
            collegeName: "Pulchowk Campus",
            majorCourse: "Mechanical Engineering",
            avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
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
      setConversations(mockConversations);
      if (mockConversations.length > 0) {
        setActiveConversation(mockConversations[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string) => {
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
    <div className="h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col font-sans overflow-hidden">
      
      {/* Top sticky header bar */}
      <header className="border-b border-[#EAE5D9] bg-[#FAF8F5]/85 backdrop-blur-md px-6 py-4 flex justify-between items-center z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-9 h-9 rounded-full bg-white border border-[#EAE5D9] flex items-center justify-center shadow-sm"
          >
            <ArrowLeft size={18} className="text-[#8E8674]" />
          </button>
          
          <div className="flex items-center gap-1.5">
            {/* Sahavas Mandala Logo */}
            <div className="w-7 h-7 rounded-full bg-[#FAF8F5] flex items-center justify-center border border-[#D9A25A]/40">
              <svg className="w-4.5 h-4.5 text-[#D9A25A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-[#1A2540] tracking-tight font-display">सहवास Messages</h1>
          </div>
        </div>

        <span className="text-xs text-[#8E8674] font-bold">
          Logged in as: <span className="text-[#D9A25A]">{user?.fullName || 'Prasanna'}</span>
        </span>
      </header>

      {/* Main double column screen layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Discord Channels/Threads list */}
        <aside className="w-80 border-r border-[#EAE5D9] bg-white flex flex-col flex-shrink-0 hidden md:flex">
          <div className="p-4 border-b border-[#EAE5D9]/60 flex items-center gap-2">
            <MessageCircle size={16} className="text-[#D9A25A]" />
            <span className="text-xs font-bold text-[#8E8674] uppercase tracking-wider">Active Conversations</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#EAE5D9]/50">
            {conversations.map(conv => {
              const isActive = activeConversation?.conversationId === conv.conversationId;
              return (
                <div
                  key={conv.conversationId}
                  onClick={() => setActiveConversation(conv)}
                  className={`p-4 cursor-pointer flex items-center gap-3 transition ${
                    isActive ? 'bg-[#FAF3E8]' : 'hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#FAF8F5] relative border border-[#EAE5D9] flex-shrink-0">
                    <img src={conv.peerProfile.avatarUrl} alt="Peer Avatar" className="w-full h-full object-cover" />
                    {/* Active online circle indicator */}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="text-xs font-black text-[#1E1E1E] truncate font-display">
                        {conv.peerProfile.fullName}
                      </h4>
                      <span className="text-[9px] text-[#A39E93] font-semibold">
                        {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8E8674] truncate font-medium">{conv.lastMessage}</p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#D9A25A] text-white text-[9px] font-black flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Main Chat Frame (Messenger Style) */}
        <main className="flex-1 flex flex-col bg-[#FAF8F5] overflow-hidden">
          {activeConversation ? (
            <>
              {/* Active Conversation Header */}
              <div className="bg-white border-b border-[#EAE5D9] px-6 py-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-[#EAE5D9] relative flex-shrink-0">
                    <img src={activeConversation.peerProfile.avatarUrl} alt="Peer" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#1E1E1E] flex items-center gap-1.5 font-display">
                      {activeConversation.peerProfile.fullName}
                      <span className="inline-flex items-center gap-0.5 bg-[#E6F4EA] text-[#137333] text-[8px] font-black px-2 py-0.5 rounded-full">
                        <CheckCheck size={8} /> Student
                      </span>
                    </h3>
                    <p className="text-[10px] text-[#8E8674] font-semibold">
                      {activeConversation.peerProfile.collegeName} • {activeConversation.peerProfile.majorCourse}
                    </p>
                  </div>
                </div>

                {/* Compatibility gauge pill */}
                <div className="bg-[#FAF3E8] border border-[#D9A25A]/25 rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-sm">
                  <span className="text-[10px] text-[#8E8674] font-bold uppercase tracking-wider">Match Score</span>
                  <span className="text-xs font-black text-[#C08A4E]">{activeConversation.peerProfile.completenessPercentage}%</span>
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
                            ? 'bg-[#D9A25A] text-white border-[#C9924A] rounded-tr-none' 
                            : 'bg-white text-[#1E1E1E] border-[#EAE5D9] rounded-tl-none'
                        }`}>
                          
                          {msg.messageType === 'TEXT' && (
                            <p>{msg.content}</p>
                          )}

                          {msg.messageType === 'ROOM_SHARE' && (
                            <div className="space-y-3">
                              <p className="font-bold underline text-[10px] uppercase tracking-wider mb-2">
                                {msg.content}
                              </p>
                              {/* Renders shared Airbnb Card */}
                              <div className="bg-[#FAF8F5] border border-[#EAE5D9] rounded-2xl overflow-hidden shadow-inner text-[#1E1E1E] max-w-xs">
                                <img 
                                  src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=300" 
                                  className="w-full h-32 object-cover" 
                                  alt="Shared Flat"
                                />
                                <div className="p-3">
                                  <h4 className="text-xs font-black truncate font-display">Premium Single flat near Pulchowk</h4>
                                  <span className="text-[10px] text-[#D9A25A] font-bold block mt-1">NPR 7,500 / month</span>
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
                              <div className="bg-[#FAF8F5] border border-[#EAE5D9] rounded-2xl p-4 shadow-inner text-[#1E1E1E] flex items-center gap-3 max-w-xs">
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#EAE5D9]">
                                  <img src={activeConversation.peerProfile.avatarUrl} alt="Student" className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-black truncate font-display">{activeConversation.peerProfile.fullName}</h4>
                                  <span className="text-[9px] text-[#8E8674] truncate block mt-0.5">{activeConversation.peerProfile.collegeName}</span>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>

                        {/* Timestamp + Read Receipts */}
                        <div className={`flex items-center gap-1.5 mt-1.5 text-[9px] text-[#A39E93] font-semibold ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}>
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            <CheckCheck size={11} className={msg.isRead ? 'text-[#D9A25A]' : 'text-[#A39E93]'} />
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}

                {/* Animated Typing Indicator bubble */}
                {isTyping && (
                  <div className="flex justify-start w-full">
                    <div className="bg-white border border-[#EAE5D9] px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1 text-[11px] text-[#8E8674] font-semibold">
                      <span className="w-1.5 h-1.5 bg-[#8E8674] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#8E8674] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#8E8674] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="ml-1 text-[10px]">{activeConversation.peerProfile.fullName.split(' ')[0]} is typing...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom toolbar & Message Input Area */}
              <div className="bg-white border-t border-[#EAE5D9] p-4 flex-shrink-0 space-y-3">
                
                {/* Sharing attachment row */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#A39E93] font-bold uppercase tracking-wider">Quick Share:</span>
                  <button 
                    onClick={() => handleShareResource('ROOM')}
                    className="bg-[#FAF8F5] border border-[#EAE5D9] hover:bg-[#FAF3E8] hover:border-[#D9A25A]/40 text-[#8E8674] hover:text-[#D9A25A] text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm transition"
                  >
                    <Home size={11} /> Share Room Flat
                  </button>
                  <button 
                    onClick={() => handleShareResource('PROFILE')}
                    className="bg-[#FAF8F5] border border-[#EAE5D9] hover:bg-[#FAF3E8] hover:border-[#D9A25A]/40 text-[#8E8674] hover:text-[#D9A25A] text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm transition"
                  >
                    <User size={11} /> Share Profile Vector
                  </button>
                </div>

                {/* Form Input row */}
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  <button 
                    type="button" 
                    className="w-11 h-11 bg-[#FAF8F5] border border-[#EAE5D9] hover:bg-[#FAF3E8] text-[#8E8674] rounded-xl flex items-center justify-center shadow-sm transition"
                  >
                    <Paperclip size={18} />
                  </button>

                  <input
                    type="text"
                    placeholder="Type a message or share coordinate maps..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 bg-[#FAF8F5] border border-[#EAE5D9] text-[#1E1E1E] rounded-xl px-5 py-3.5 focus:outline-none focus:border-[#D9A25A] text-sm font-semibold placeholder-[#A39E93]"
                  />

                  <button
                    type="submit"
                    className="w-11 h-11 bg-[#D9A25A] hover:bg-[#C9924A] text-white rounded-xl flex items-center justify-center shadow-md transition"
                  >
                    <Send size={16} />
                  </button>
                </form>

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#8E8674]">
              <Compass className="animate-spin text-[#D9A25A] mb-4" size={48} />
              <h3 className="text-lg font-black text-[#1E1E1E] font-display">Select a Chat</h3>
              <p className="text-xs max-w-xs leading-relaxed mt-2">
                Click on one of your roommate matches on the left to start coordinating housing search plans!
              </p>
            </div>
          )}
        </main>

      </div>

    </div>
  );
};

export default Chat;
