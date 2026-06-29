import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Determine target URL for backend connections
    const backendUrl = import.meta.env.VITE_API_URL || window.location.origin;
    console.log(`Socket connecting to: ${backendUrl}`);

    const newSocket = io(backendUrl, {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    // Join room with userId
    newSocket.emit('join', user.id || user._id);

    // Listen for online users updates
    newSocket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    // Clean up
    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // General sendMessage helper
  const sendMessage = (senderId, receiverId, messageText) => {
    if (socket) {
      socket.emit('send_message', { senderId, receiverId, messageText });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        sendMessage,
        chatMessages,
        setChatMessages
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
