const express = require('express');
const router = express.Router();
const { Mentor, Student, MatchingRequest } = require('../models');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/mentors/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
  }
});

// Get all mentors with filters
router.get('/', async (req, res) => {
  try {
    const {
      domain,
      location,
      verified,
      free,
      minRating,
      experience,
      page = 1,
      limit = 10,
      sortBy = 'rating'
    } = req.query;

    // Build query
    let query = { active: true };

    if (domain) {
      query['expertise.domains'] = domain;
    }

    if (location) {
      query['$or'] = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.state': new RegExp(location, 'i') },
        { 'location.country': new RegExp(location, 'i') },
        { 'location.willingToMentorRemotely': true }
      ];
    }

    if (verified === 'true') {
      query['verification.isVerified'] = true;
    }

    if (free === 'true') {
      query['pricing.isFree'] = true;
    }

    if (minRating) {
      query['stats.averageRating'] = { $gte: parseFloat(minRating) };
    }

    if (experience) {
      query['expertise.yearsOfExperience'] = { $gte: parseInt(experience) };
    }

    // Sorting options
    let sortOptions = {};
    switch (sortBy) {
      case 'rating':
        sortOptions = { 'stats.averageRating': -1 };
        break;
      case 'experience':
        sortOptions = { 'expertise.yearsOfExperience': -1 };
        break;
      case 'reviews':
        sortOptions = { 'stats.totalReviews': -1 };
        break;
      case 'newest':
        sortOptions = { joinedDate: -1 };
        break;
      default:
        sortOptions = { 'stats.averageRating': -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    const mentors = await Mentor.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Mentor.countDocuments(query);

    res.json({
      success: true,
      mentors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalMentors: total,
        hasMore: skip + mentors.length < total
      }
    });

  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch mentors',
      message: error.message 
    });
  }
});

// Get single mentor by ID
router.get('/:id', async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id)
      .select('-__v');

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    // Get recent reviews
    const reviews = await MatchingRequest.find({
      mentorId: req.params.id,
      status: 'completed',
      rating: { $exists: true }
    })
    .populate('studentId', 'profile.name profile.profilePicture')
    .sort('-respondedAt')
    .limit(5);

    res.json({
      success: true,
      mentor,
      recentReviews: reviews
    });

  } catch (error) {
    console.error('Get mentor error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch mentor',
      message: error.message 
    });
  }
});

// Create new mentor profile
router.post('/register', upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'verificationDocuments', maxCount: 3 }
]), async (req, res) => {
  try {
    const mentorData = req.body;

    // Handle file uploads
    if (req.files) {
      if (req.files.profilePicture) {
        mentorData.profile.profilePicture = req.files.profilePicture[0].path;
      }
      if (req.files.verificationDocuments) {
        mentorData.verification.verificationDocuments = req.files.verificationDocuments.map(f => f.path);
      }
    }

    // Check if email already exists
    const existingMentor = await Mentor.findOne({ 
      'profile.email': mentorData.profile.email 
    });

    if (existingMentor) {
      return res.status(400).json({ 
        error: 'Email already registered as mentor' 
      });
    }

    // Create new mentor
    const mentor = new Mentor(mentorData);
    await mentor.save();

    res.status(201).json({
      success: true,
      message: 'Mentor profile created successfully',
      mentorId: mentor._id
    });

  } catch (error) {
    console.error('Mentor registration error:', error);
    res.status(500).json({ 
      error: 'Failed to register mentor',
      message: error.message 
    });
  }
});

// Update mentor profile
router.put('/:id', upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'verificationDocuments', maxCount: 3 }
]), async (req, res) => {
  try {
    const updateData = req.body;

    // Handle file uploads
    if (req.files) {
      if (req.files.profilePicture) {
        updateData.profile.profilePicture = req.files.profilePicture[0].path;
      }
      if (req.files.verificationDocuments) {
        updateData.verification.verificationDocuments = req.files.verificationDocuments.map(f => f.path);
      }
    }

    // Update last active
    updateData.lastActive = new Date();

    const mentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    res.json({
      success: true,
      message: 'Mentor profile updated successfully',
      mentor
    });

  } catch (error) {
    console.error('Mentor update error:', error);
    res.status(500).json({ 
      error: 'Failed to update mentor',
      message: error.message 
    });
  }
});

// Update mentor availability
router.patch('/:id/availability', async (req, res) => {
  try {
    const { availability } = req.body;

    const mentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      { 
        'mentorship.availability': availability,
        lastActive: new Date()
      },
      { new: true }
    );

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    res.json({
      success: true,
      message: 'Availability updated successfully',
      availability: mentor.mentorship.availability
    });

  } catch (error) {
    console.error('Availability update error:', error);
    res.status(500).json({ 
      error: 'Failed to update availability',
      message: error.message 
    });
  }
});

// Verify mentor (admin only - in production, add auth middleware)
router.post('/:id/verify', async (req, res) => {
  try {
    const { verificationMethod } = req.body;

    const mentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      {
        'verification.isVerified': true,
        'verification.verificationDate': new Date(),
        'verification.verificationMethod': verificationMethod
      },
      { new: true }
    );

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    res.json({
      success: true,
      message: 'Mentor verified successfully',
      verification: mentor.verification
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      error: 'Failed to verify mentor',
      message: error.message 
    });
  }
});

// Get mentor statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const mentorId = req.params.id;

    // Get mentor
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    // Get matching statistics
    const totalRequests = await MatchingRequest.countDocuments({ mentorId });
    const acceptedRequests = await MatchingRequest.countDocuments({ 
      mentorId, 
      status: 'accepted' 
    });
    const completedSessions = await MatchingRequest.countDocuments({ 
      mentorId, 
      status: 'completed' 
    });

    // Calculate acceptance rate
    const acceptanceRate = totalRequests > 0 
      ? (acceptedRequests / totalRequests) * 100 
      : 0;

    // Get average response time
    const requests = await MatchingRequest.find({ 
      mentorId,
      respondedAt: { $exists: true }
    });

    let avgResponseTime = 0;
    if (requests.length > 0) {
      const totalResponseTime = requests.reduce((sum, req) => {
        return sum + (req.respondedAt - req.createdAt);
      }, 0);
      avgResponseTime = totalResponseTime / requests.length / (1000 * 60 * 60); // Convert to hours
    }

    res.json({
      success: true,
      stats: {
        ...mentor.stats.toObject(),
        totalRequests,
        acceptedRequests,
        completedSessions,
        acceptanceRate: Math.round(acceptanceRate),
        avgResponseTimeHours: Math.round(avgResponseTime)
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      message: error.message 
    });
  }
});

// Deactivate mentor profile
router.delete('/:id', async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    res.json({
      success: true,
      message: 'Mentor profile deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivation error:', error);
    res.status(500).json({ 
      error: 'Failed to deactivate mentor',
      message: error.message 
    });
  }
});

module.exports = router;
