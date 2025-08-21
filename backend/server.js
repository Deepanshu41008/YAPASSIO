const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoose = require('mongoose');

// Import service routers
const authRoutes = require('./services/auth');
const mentorMatchingRoutes = require('./services/mentor-matching');
const examPrepRoutes = require('./services/exam-prep');
const careerSimRoutes = require('./services/career-simulation');
const globalOppRoutes = require('./services/global-opportunities');
const dashboardRoutes = require('./services/career-dashboard');
const analyticsRoutes = require('./services/analytics');


dotenv.config();

// --- Database Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/career-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};
connectDB();
// -------------------------

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// Mount service routers
app.use('/api/auth', authRoutes);
app.use('/api/mentors', mentorMatchingRoutes);
app.use('/api/exams', examPrepRoutes);
app.use('/api/simulations', careerSimRoutes);
app.use('/api/opportunities', globalOppRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

module.exports = app;
