require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const User = require('./models/User');
const Message = require('./models/Message');

// Connect to Database
connectDB().then(() => {
  // Seed Super Admins once DB is connected
  seedSuperAdmins();
});

const app = express();
const server = http.createServer(app);

// Configure CORS — allow Render frontend static site and local dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL // Render frontend static site URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. curl, mobile apps, Render health checks)
    if (!origin) return callback(null, true);
    // In development allow all localhost origins
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    // In production, allow if origin is in allowedOrigins OR if CLIENT_URL is not set yet (first deploy)
    if (allowedOrigins.includes(origin) || allowedOrigins.length === 0) {
      return callback(null, true);
    }
    // Render services: allow all *.onrender.com origins
    if (origin.endsWith('.onrender.com')) return callback(null, true);
    return callback(null, true); // Keep permissive for easy deployment testing
  },
  credentials: true
}));


// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads folder
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Mounting routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'TraceBack API is running successfully.' });
});

// Configure Socket.io
const io = socketio(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Seed Super Admins
async function seedSuperAdmins() {
  try {
    const admins = [
      {
        name: 'Super Admin Riya',
        email: 'riyagargofficial@gmail.com',
        password: 'Admin@123',
        role: 'Super Admin',
        contactNumber: '9999999999'
      },
      {
        name: 'Super Admin Deepak',
        email: 'deepakbawa004@gmail.com',
        password: 'Admin@123',
        role: 'Super Admin',
        contactNumber: '8888888888'
      }
    ];

    for (const adminData of admins) {
      const exists = await User.findOne({ email: adminData.email });
      if (!exists) {
        // Create user. The .pre('save') hook handles hashing.
        const admin = new User(adminData);
        // Explicitly set select: false password property
        await admin.save();
        console.log(`Seeded Super Admin: ${adminData.email}`);
      } else {
        // Enforce Super Admin role
        if (exists.role !== 'Super Admin') {
          exists.role = 'Super Admin';
          await exists.save();
          console.log(`Updated seeded user role to Super Admin: ${exists.email}`);
        }
      }
    }
  } catch (error) {
    console.error('Error seeding Super Admin accounts:', error);
  }
}

// Track online users mapping: userId -> socketId
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`New socket connection: ${socket.id}`);

  // User joins with their userId
  socket.on('join', (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`User ${userId} associated with socket ${socket.id}`);
      
      // Broadcast online status to everyone
      io.emit('online_users', Array.from(onlineUsers.keys()));
    }
  });

  // Handle single peer-to-peer message sending
  socket.on('send_message', async ({ senderId, receiverId, messageText }) => {
    try {
      if (!senderId || !receiverId || !messageText) return;

      // Save message to database
      const newMessage = await Message.create({
        sender: senderId,
        receiver: receiverId,
        message: messageText
      });

      // Target socket
      const receiverSocketId = onlineUsers.get(receiverId);

      // Prepare payload
      const messagePayload = {
        _id: newMessage._id,
        sender: senderId,
        receiver: receiverId,
        message: messageText,
        createdAt: newMessage.createdAt,
        read: false
      };

      // Forward to receiver if online
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', messagePayload);
      }

      // Confirm send back to sender
      socket.emit('message_sent', messagePayload);

    } catch (err) {
      console.error('Error handling socket send_message:', err);
    }
  });

  // Handle manual disconnect or connection loss
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      // Broadcast updated online list
      io.emit('online_users', Array.from(onlineUsers.keys()));
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
