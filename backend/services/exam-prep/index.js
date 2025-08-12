const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cron = require('node-cron');

// Import routes
const examRoutes = require('./routes/examRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const plannerRoutes = require('./routes/plannerRoutes');
const analysisRoutes = require('./routes/analysisRoutes');

dotenv.config();

const app = express();
const PORT = process.env.EXAM_SERVICE_PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/exam_prep', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB - Exam Preparation Service');
});

// Routes
app.use('/api/exams', examRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/analysis', analysisRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'exam-preparation',
    timestamp: new Date().toISOString() 
  });
});

// Schedule daily tasks
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily exam prep tasks...');
  // Send daily study reminders
  // Update practice question pools
  // Generate daily tips
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Exam Preparation Service running on port ${PORT}`);
});

module.exports = app;
