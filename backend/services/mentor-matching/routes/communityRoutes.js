const express = require('express');
const router = express.Router();
const { Community, Student, Mentor } = require('../models');
const axios = require('axios');

// Get all communities with filters
router.get('/', async (req, res) => {
  try {
    const {
      domain,
      location,
      type,
      isOnline,
      page = 1,
      limit = 10,
      sortBy = 'members'
    } = req.query;

    // Build query
    let query = { active: true };

    if (domain) {
      query['category.domain'] = domain;
    }

    if (location) {
      query['$or'] = [
        { 'location.city': new RegExp(location, 'i') },
        { 'location.state': new RegExp(location, 'i') },
        { 'location.country': new RegExp(location, 'i') },
        { 'location.isOnline': true }
      ];
    }

    if (type) {
      query.type = type;
    }

    if (isOnline === 'true') {
      query['location.isOnline'] = true;
    }

    // Sorting options
    let sortOptions = {};
    switch (sortBy) {
      case 'members':
        sortOptions = { 'stats.totalMembers': -1 };
        break;
      case 'activity':
        sortOptions = { 'stats.engagementRate': -1 };
        break;
      case 'newest':
        sortOptions = { createdDate: -1 };
        break;
      default:
        sortOptions = { 'stats.totalMembers': -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    const communities = await Community.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-members -__v');

    const total = await Community.countDocuments(query);

    res.json({
      success: true,
      communities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCommunities: total,
        hasMore: skip + communities.length < total
      }
    });

  } catch (error) {
    console.error('Get communities error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch communities',
      message: error.message 
    });
  }
});

// Get single community by ID
router.get('/:id', async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('members.userId', 'profile.name profile.profilePicture')
      .populate('createdBy', 'profile.name');

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    res.json({
      success: true,
      community
    });

  } catch (error) {
    console.error('Get community error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch community',
      message: error.message 
    });
  }
});

// Create new community
router.post('/create', async (req, res) => {
  try {
    const communityData = req.body;

    // Create new community
    const community = new Community({
      ...communityData,
      members: [{
        userId: communityData.createdBy,
        userType: 'student', // or determine from user
        role: 'admin',
        joinedDate: new Date(),
        isActive: true
      }],
      'stats.totalMembers': 1,
      'stats.activeMembers': 1
    });

    await community.save();

    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      communityId: community._id
    });

  } catch (error) {
    console.error('Community creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create community',
      message: error.message 
    });
  }
});

// Join community
router.post('/:id/join', async (req, res) => {
  try {
    const { userId, userType } = req.body;
    const communityId = req.params.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if user is already a member
    const isMember = community.members.some(m => 
      m.userId.toString() === userId
    );

    if (isMember) {
      return res.status(400).json({ 
        error: 'Already a member of this community' 
      });
    }

    // Check if community is full
    if (community.members.length >= community.settings.maxMembers) {
      return res.status(400).json({ 
        error: 'Community is full' 
      });
    }

    // Add member
    community.members.push({
      userId,
      userType,
      role: 'member',
      joinedDate: new Date(),
      isActive: true
    });

    // Update stats
    community.stats.totalMembers += 1;
    community.stats.activeMembers += 1;

    await community.save();

    // Update user's community list
    if (userType === 'student') {
      await Student.findByIdAndUpdate(userId, {
        $push: {
          communityGroups: {
            groupId: communityId,
            joinedDate: new Date(),
            role: 'member'
          }
        }
      });
    }

    res.json({
      success: true,
      message: 'Successfully joined community'
    });

  } catch (error) {
    console.error('Join community error:', error);
    res.status(500).json({ 
      error: 'Failed to join community',
      message: error.message 
    });
  }
});

// Leave community
router.post('/:id/leave', async (req, res) => {
  try {
    const { userId } = req.body;
    const communityId = req.params.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Remove member
    const memberIndex = community.members.findIndex(m => 
      m.userId.toString() === userId
    );

    if (memberIndex === -1) {
      return res.status(400).json({ 
        error: 'Not a member of this community' 
      });
    }

    // Check if user is the only admin
    const member = community.members[memberIndex];
    if (member.role === 'admin') {
      const otherAdmins = community.members.filter(m => 
        m.role === 'admin' && m.userId.toString() !== userId
      );
      
      if (otherAdmins.length === 0) {
        return res.status(400).json({ 
          error: 'Cannot leave - you are the only admin. Please assign another admin first.' 
        });
      }
    }

    // Remove member
    community.members.splice(memberIndex, 1);

    // Update stats
    community.stats.totalMembers -= 1;
    if (member.isActive) {
      community.stats.activeMembers -= 1;
    }

    await community.save();

    // Update user's community list
    await Student.findByIdAndUpdate(userId, {
      $pull: { communityGroups: { groupId: communityId } }
    });

    res.json({
      success: true,
      message: 'Successfully left community'
    });

  } catch (error) {
    console.error('Leave community error:', error);
    res.status(500).json({ 
      error: 'Failed to leave community',
      message: error.message 
    });
  }
});

// Get recommended communities using AI
router.post('/recommendations', async (req, res) => {
  try {
    const { userId, userType } = req.body;

    let user;
    if (userType === 'student') {
      user = await Student.findById(userId);
    } else {
      user = await Mentor.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build recommendation query based on user profile
    const query = {
      active: true,
      'settings.isPublic': true
    };

    // Match based on domains/interests
    if (userType === 'student' && user.career?.targetDomains) {
      query['category.domain'] = { $in: user.career.targetDomains };
    } else if (userType === 'mentor' && user.expertise?.domains) {
      query['category.domain'] = { $in: user.expertise.domains };
    }

    // Match based on location
    if (user.location?.city) {
      query['$or'] = [
        { 'location.city': user.location.city },
        { 'location.isOnline': true }
      ];
    }

    // Get communities user is not already a member of
    const userCommunities = userType === 'student' 
      ? user.communityGroups?.map(c => c.groupId) || []
      : [];

    if (userCommunities.length > 0) {
      query._id = { $nin: userCommunities };
    }

    // Find recommended communities
    const communities = await Community.find(query)
      .sort({ 'stats.engagementRate': -1, 'stats.totalMembers': -1 })
      .limit(10)
      .select('-members -__v');

    // Use AI to provide personalized recommendations if available
    let aiRecommendations = [];
    if (process.env.HUGGINGFACE_API_KEY && communities.length > 0) {
      try {
        // Create user profile text
        const userProfile = userType === 'student' 
          ? `Interests: ${user.career?.interests?.join(', ')}, Goals: ${user.goals?.shortTerm?.join(', ')}`
          : `Expertise: ${user.expertise?.domains?.join(', ')}, Specializations: ${user.mentorship?.style?.specializations?.join(', ')}`;

        // Score each community
        for (const community of communities) {
          const communityProfile = `${community.name}: ${community.description}. Domain: ${community.category.domain}`;
          
          // Simple keyword matching as fallback
          const userKeywords = userProfile.toLowerCase().split(/\s+/);
          const communityKeywords = communityProfile.toLowerCase().split(/\s+/);
          
          const matches = userKeywords.filter(keyword => 
            communityKeywords.some(ck => ck.includes(keyword) || keyword.includes(ck))
          );
          
          const score = (matches.length / userKeywords.length) * 100;
          
          aiRecommendations.push({
            community,
            relevanceScore: Math.round(score),
            reason: matches.length > 0 
              ? `Matches your interests in: ${matches.slice(0, 3).join(', ')}`
              : 'Recommended based on your profile'
          });
        }

        // Sort by relevance score
        aiRecommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
      } catch (aiError) {
        console.error('AI recommendation error:', aiError);
        // Fallback to basic recommendations
        aiRecommendations = communities.map(c => ({
          community: c,
          relevanceScore: 50,
          reason: 'Recommended based on your profile'
        }));
      }
    } else {
      aiRecommendations = communities.map(c => ({
        community: c,
        relevanceScore: 50,
        reason: 'Recommended based on your profile'
      }));
    }

    res.json({
      success: true,
      recommendations: aiRecommendations.slice(0, 5)
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ 
      error: 'Failed to get recommendations',
      message: error.message 
    });
  }
});

// Create event in community
router.post('/:id/events', async (req, res) => {
  try {
    const { title, description, date, type, userId } = req.body;
    const communityId = req.params.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if user is a member and has permission
    const member = community.members.find(m => 
      m.userId.toString() === userId
    );

    if (!member || (member.role !== 'admin' && member.role !== 'moderator')) {
      return res.status(403).json({ 
        error: 'Permission denied. Only admins and moderators can create events.' 
      });
    }

    // Add event
    community.activities.upcomingEvents.push({
      title,
      description,
      date: new Date(date),
      type,
      attendees: []
    });

    community.stats.totalEvents += 1;
    await community.save();

    res.json({
      success: true,
      message: 'Event created successfully'
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ 
      error: 'Failed to create event',
      message: error.message 
    });
  }
});

// Upload resource to community
router.post('/:id/resources', async (req, res) => {
  try {
    const { title, type, url, userId } = req.body;
    const communityId = req.params.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if user is a member
    const member = community.members.find(m => 
      m.userId.toString() === userId
    );

    if (!member) {
      return res.status(403).json({ 
        error: 'Only members can upload resources' 
      });
    }

    // Add resource
    community.resources.push({
      title,
      type,
      url,
      uploadedBy: userId,
      uploadedDate: new Date()
    });

    await community.save();

    res.json({
      success: true,
      message: 'Resource uploaded successfully'
    });

  } catch (error) {
    console.error('Upload resource error:', error);
    res.status(500).json({ 
      error: 'Failed to upload resource',
      message: error.message 
    });
  }
});

// Update community settings (admin only)
router.put('/:id/settings', async (req, res) => {
  try {
    const { settings, userId } = req.body;
    const communityId = req.params.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if user is an admin
    const member = community.members.find(m => 
      m.userId.toString() === userId && m.role === 'admin'
    );

    if (!member) {
      return res.status(403).json({ 
        error: 'Only admins can update settings' 
      });
    }

    // Update settings
    community.settings = { ...community.settings, ...settings };
    await community.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: community.settings
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ 
      error: 'Failed to update settings',
      message: error.message 
    });
  }
});

module.exports = router;
