import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { getImageUrl } from '../utils/imageHelper';
import {  MessageSquare,
  Send,
  User,
  Search,
  Circle,
  Loader2
} from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const { socket, onlineUsers, sendMessage } = useSocket();
  const { showToast } = useToast();

  const [activeUsersList, setActiveUsersList] = useState([]);
  const [allUsersList, setAllUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [chatSearch, setChatSearch] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);

  const messagesEndRef = useRef(null);

  // Load chat contacts
  const fetchContacts = async () => {
    try {
      setLoadingContacts(true);
      const res = await axios.get('/api/chat/users');
      if (res.data.success) {
        setActiveUsersList(res.data.activeUsers);
        setAllUsersList(res.data.allUsers);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading chat contacts', 'error');
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [user]);

  // Load selected user chat history
  const fetchChatHistory = async (targetUserId) => {
    try {
      setLoadingHistory(true);
      const res = await axios.get(`/api/chat/history/${targetUserId}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading chat history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      fetchChatHistory(selectedUser._id);
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  // Socket listener for real-time messages
  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages from peer
    const handleReceiveMessage = (msg) => {
      // Append if message belongs to current open chat
      if (selectedUser && msg.sender === selectedUser._id) {
        setMessages((prev) => [...prev, msg]);
        // Send read confirmation to database (optional health check)
        axios.get(`/api/chat/history/${selectedUser._id}`);
      } else {
        // If chat is not open, refresh contacts list to show unread status
        fetchContacts();
      }
    };

    // Listen for message sent confirmations
    const handleMessageSent = (msg) => {
      if (selectedUser && msg.receiver === selectedUser._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleMessageSent);
    };
  }, [socket, selectedUser]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUser) return;

    sendMessage(user.id || user._id, selectedUser._id, messageInput.trim());
    setMessageInput('');
  };

  // Filter users based on search
  const filteredUsers = allUsersList.filter((u) =>
    u.name.toLowerCase().includes(chatSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(chatSearch.toLowerCase())
  );

  const isOnline = (userId) => onlineUsers.includes(userId);

  return (
    <div className="h-[75vh] flex rounded-3xl overflow-hidden glass-panel border border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
      {/* Left Contacts Sidebar */}
      <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between bg-white/20 dark:bg-slate-950/20">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> Chats</h2>
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4.5 h-4.5 text-slate-405 pointer-events-none" />
            <input
              type="text"
              placeholder="Search user..."
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Contacts list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingContacts ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              {chatSearch ? (
                // Filtered search results
                filteredUsers.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => setSelectedUser(item)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
                      selectedUser?._id === item._id
                        ? 'bg-sky-50 dark:bg-sky-950/30'
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/10'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {item.profilePic ? (
                          <img src={item.profilePic} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          item.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <Circle className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-950 ${
                        isOnline(item._id) ? 'fill-emerald-500 text-emerald-500' : 'fill-slate-400 text-slate-400'
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{item.role}</p>
                    </div>
                  </button>
                ))
              ) : activeUsersList.length === 0 ? (
                <div className="py-12 text-center text-[10px] text-slate-400 space-y-2">
                  <p>No active chats yet.</p>
                  <p className="text-[9px]">Use the search bar above to start a conversation with any user.</p>
                </div>
              ) : (
                // Active chat list
                activeUsersList.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => setSelectedUser(item)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                      selectedUser?._id === item._id
                        ? 'bg-sky-50 text-slate-800 dark:bg-sky-950/30 dark:text-slate-100'
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/10'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-200 dark:border-slate-850 bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                        {item.profilePic ? (
                          <img src={item.profilePic} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          item.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <Circle className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-950 ${
                        isOnline(item._id) ? 'fill-emerald-500 text-emerald-500' : 'fill-slate-400 text-slate-400'
                      }`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-450 truncate">{item.role}</p>
                    </div>
                  </button>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Messages Canvas */}
      <div className="flex-1 flex flex-col justify-between bg-white/10 dark:bg-slate-950/10">
        {selectedUser ? (
          <>
            {/* Header info */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/20 dark:bg-slate-950/20 flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                {selectedUser.profilePic ? (
                  <img src={selectedUser.profilePic} alt={selectedUser.name} className="h-full w-full object-cover" />
                ) : (
                  selectedUser.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold">{selectedUser.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`h-2 w-2 rounded-full ${
                    isOnline(selectedUser._id) ? 'bg-emerald-500' : 'bg-slate-400'
                  }`} />
                  <span className="text-[10px] text-slate-400">
                    {isOnline(selectedUser._id) ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingHistory ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Say Hello to start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isSentByMe = msg.sender === (user.id || user._id);
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md px-4 py-2.5 rounded-2xl text-xs space-y-1 shadow-sm leading-relaxed ${
                          isSentByMe
                            ? 'bg-sky-500 text-white rounded-br-none'
                            : 'bg-white dark:bg-slate-800 rounded-bl-none border border-slate-100 dark:border-slate-800'
                        }`}
                      >
                        <p>{msg.message}</p>
                        <span className={`block text-[9px] text-right ${
                          isSentByMe ? 'text-sky-100' : 'text-slate-400'
                        }`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Send panel */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/20 dark:bg-slate-950/20 flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="px-4 py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-500/50 text-white rounded-xl shadow shadow-sky-500/10 cursor-pointer active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
            <div className="text-5xl">💬</div>
            <h3 className="font-semibold text-sm">No conversation selected</h3>
            <p className="text-xs text-[10px] text-slate-500">Pick a user from the contact sidebar or search to chat in real-time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
