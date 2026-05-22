const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins for dev simplicity
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const pagesRoutes = require('./routes/pages');
const mediaRoutes = require('./routes/media');
const categoriesRoutes = require('./routes/categories');
const analyticsRoutes = require('./routes/analytics');

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'ApexCMS API',
    version: '1.0.0',
    status: 'Running',
    database: process.env.DB_DIALECT || 'sqlite'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  res.status(500).json({ 
    message: err.message || 'Internal Server Error' 
  });
});

// Start Server and Connect DB
const startServer = async () => {
  await connectDB();
  
  // Seed database with premium default content
  try {
    const { seedDatabase } = require('./config/seeder');
    await seedDatabase();
  } catch (seederError) {
    console.error('Error during auto-seeding:', seederError.message);
  }

  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`ApexCMS Express Server running on Port ${PORT}`);
    console.log(`Local Access: http://localhost:${PORT}`);
    console.log(`=========================================`);
  });
};

startServer();
