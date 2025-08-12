# Mentor Matching API Documentation

## Overview
The Mentor Matching service provides AI-powered mentor-student pairing, community formation, and peer group management. It uses free LLMs and intelligent algorithms to match students with the most suitable mentors based on multiple factors.

## Base URL
```
http://localhost:5001/api
```

## Key Features
- 🤖 AI-powered matching algorithm
- 📍 Location-based and remote matching
- 👥 Community and peer group formation
- ✅ Mentor verification system
- 📊 Performance analytics
- 🌐 Global mentor network

## Authentication
All endpoints require JWT authentication token in the header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Mentor Endpoints

### 1.1 Get All Mentors
**GET** `/mentors`

Query Parameters:
- `domain` (string) - Filter by expertise domain
- `location` (string) - Filter by city/state/country
- `verified` (boolean) - Show only verified mentors
- `free` (boolean) - Show only free mentors
- `minRating` (number) - Minimum rating filter
- `experience` (number) - Minimum years of experience
- `page` (number) - Page number (default: 1)
- `limit` (number) - Results per page (default: 10)
- `sortBy` (string) - Sort by: rating, experience, reviews, newest

**Response:**
```json
{
  "success": true,
  "mentors": [
    {
      "_id": "mentor_id",
      "profile": {
        "name": "Dr. Sarah Johnson",
        "email": "sarah@example.com",
        "bio": "15+ years in AI/ML...",
        "profilePicture": "url"
      },
      "expertise": {
        "domains": ["technology", "entrepreneurship"],
        "skills": ["Machine Learning", "Python", "Leadership"],
        "yearsOfExperience": 15
      },
      "location": {
        "country": "USA",
        "city": "San Francisco",
        "willingToMentorRemotely": true
      },
      "stats": {
        "averageRating": 4.8,
        "totalReviews": 45,
        "totalMentees": 120
      },
      "verification": {
        "isVerified": true
      },
      "pricing": {
        "isFree": true
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalMentors": 50,
    "hasMore": true
  }
}
```

### 1.2 Get Single Mentor
**GET** `/mentors/:id`

**Response:**
```json
{
  "success": true,
  "mentor": {
    "_id": "mentor_id",
    "profile": { ... },
    "expertise": { ... },
    "background": {
      "currentRole": "Senior AI Engineer",
      "company": "TechCorp",
      "education": [
        {
          "degree": "PhD in Computer Science",
          "institution": "MIT",
          "year": 2010
        }
      ],
      "certifications": ["AWS Solutions Architect", "Google ML Engineer"],
      "achievements": ["Published 20+ research papers", "3x startup founder"]
    },
    "mentorship": {
      "availability": {
        "hoursPerWeek": 4,
        "preferredDays": ["Saturday", "Sunday"],
        "timezone": "PST"
      },
      "preferences": {
        "menteeLevel": ["student", "junior"],
        "communicationModes": ["video", "chat"]
      }
    }
  },
  "recentReviews": [
    {
      "studentId": {
        "profile": {
          "name": "John Doe"
        }
      },
      "rating": 5,
      "feedback": "Excellent mentor!"
    }
  ]
}
```

### 1.3 Register as Mentor
**POST** `/mentors/register`

**Request Body (multipart/form-data):**
```json
{
  "userId": "user_id",
  "profile": {
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+1234567890",
    "bio": "Experienced software engineer...",
    "linkedIn": "https://linkedin.com/in/johnsmith"
  },
  "expertise": {
    "domains": ["technology", "business"],
    "skills": ["JavaScript", "React", "Node.js"],
    "industries": ["FinTech", "EdTech"],
    "yearsOfExperience": 8
  },
  "location": {
    "country": "USA",
    "state": "California",
    "city": "Los Angeles",
    "willingToMentorRemotely": true
  },
  "mentorship": {
    "availability": {
      "hoursPerWeek": 3,
      "preferredDays": ["Monday", "Wednesday"],
      "timezone": "PST"
    },
    "preferences": {
      "menteeLevel": ["student", "fresher"],
      "communicationModes": ["video", "chat"],
      "languages": ["English", "Spanish"]
    }
  }
}
```

Files:
- `profilePicture` - Profile photo (JPEG/PNG, max 5MB)
- `verificationDocuments` - Verification documents (PDF, max 3 files)

**Response:**
```json
{
  "success": true,
  "message": "Mentor profile created successfully",
  "mentorId": "new_mentor_id"
}
```

---

## 2. Matching Engine Endpoints

### 2.1 Find Best Mentor Matches
**POST** `/matching/find-mentors`

**Request Body:**
```json
{
  "studentId": "student_id",
  "filters": {
    "domains": ["technology", "business"],
    "location": {
      "country": "USA"
    },
    "verified": true,
    "free": true
  },
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "matches": [
    {
      "mentor": {
        "id": "mentor_id",
        "name": "Dr. Sarah Johnson",
        "bio": "AI/ML expert...",
        "expertise": { ... },
        "stats": { ... }
      },
      "matchScore": 92,
      "matchBreakdown": {
        "domainMatch": 95,
        "locationMatch": 100,
        "availabilityMatch": 85,
        "experienceMatch": 90,
        "goalAlignment": 88
      },
      "explanations": [
        "Strong domain alignment in technology, business",
        "Located in the same area or offers remote mentoring",
        "15+ years of relevant experience",
        "Highly rated mentor (4.8/5)",
        "Verified mentor credentials"
      ]
    }
  ],
  "totalFound": 25
}
```

### 2.2 Request Mentor Connection
**POST** `/matching/request-connection`

**Request Body:**
```json
{
  "studentId": "student_id",
  "mentorId": "mentor_id",
  "message": "Hi, I'm interested in learning about AI/ML..."
}
```

**Response:**
```json
{
  "success": true,
  "requestId": "request_id",
  "message": "Connection request sent successfully"
}
```

### 2.3 Get AI Suggestions
**POST** `/matching/ai-suggestions`

**Request Body:**
```json
{
  "studentId": "student_id"
}
```

**Response:**
```json
{
  "success": true,
  "suggestions": {
    "recommendedDomains": ["technology", "data science", "entrepreneurship"],
    "skillsToLearn": [
      "Python programming",
      "Machine Learning basics",
      "Data analysis",
      "Communication skills",
      "Project management"
    ],
    "mentorTypes": ["industry", "entrepreneur"],
    "tips": [
      "Be clear about your goals and expectations",
      "Come prepared with questions to each session",
      "Follow up on action items between sessions"
    ]
  }
}
```

---

## 3. Community Endpoints

### 3.1 Get All Communities
**GET** `/community`

Query Parameters:
- `domain` (string) - Filter by domain
- `location` (string) - Filter by location
- `type` (string) - Community type
- `isOnline` (boolean) - Online communities only
- `page` (number) - Page number
- `limit` (number) - Results per page
- `sortBy` (string) - Sort by: members, activity, newest

**Response:**
```json
{
  "success": true,
  "communities": [
    {
      "_id": "community_id",
      "name": "AI/ML Study Group",
      "description": "Weekly discussions on AI/ML topics",
      "type": "study-group",
      "category": {
        "domain": "technology",
        "tags": ["AI", "Machine Learning", "Deep Learning"]
      },
      "location": {
        "isOnline": true,
        "country": "Global"
      },
      "stats": {
        "totalMembers": 150,
        "activeMembers": 120,
        "engagementRate": 80
      }
    }
  ],
  "pagination": { ... }
}
```

### 3.2 Create Community
**POST** `/community/create`

**Request Body:**
```json
{
  "name": "Web Development Beginners",
  "description": "A supportive community for web dev beginners",
  "type": "study-group",
  "category": {
    "domain": "technology",
    "subDomains": ["frontend", "backend"],
    "tags": ["HTML", "CSS", "JavaScript", "React"]
  },
  "location": {
    "isOnline": true,
    "country": "Global"
  },
  "settings": {
    "maxMembers": 100,
    "isPublic": true,
    "requireApproval": false
  },
  "createdBy": "user_id"
}
```

### 3.3 Join Community
**POST** `/community/:id/join`

**Request Body:**
```json
{
  "userId": "user_id",
  "userType": "student"
}
```

### 3.4 Get Community Recommendations
**POST** `/community/recommendations`

**Request Body:**
```json
{
  "userId": "user_id",
  "userType": "student"
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "community": {
        "_id": "community_id",
        "name": "Data Science Enthusiasts",
        "description": "Learn and share data science knowledge"
      },
      "relevanceScore": 85,
      "reason": "Matches your interests in: data, analysis, python"
    }
  ]
}
```

---

## 4. Error Responses

All endpoints may return the following error formats:

### 400 Bad Request
```json
{
  "error": "Validation error message",
  "message": "Detailed error description"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "message": "The requested resource does not exist"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Something went wrong on our end"
}
```

---

## 5. Matching Algorithm Details

The AI-powered matching engine considers the following factors:

### Weight Distribution:
- **Domain Match (35%)**: Expertise alignment, skill overlap
- **Location Match (15%)**: Geographic proximity, remote availability
- **Availability Match (15%)**: Schedule compatibility, communication preferences
- **Experience Match (20%)**: Years of experience, achievement relevance
- **Goal Alignment (15%)**: AI-analyzed goal compatibility

### Scoring System:
- **90-100**: Excellent match - Highly recommended
- **75-89**: Good match - Strong compatibility
- **60-74**: Fair match - Some compatibility
- **Below 60**: Poor match - Limited compatibility

---

## 6. Free LLM Integration

The service integrates with multiple free LLM providers:

### Supported Providers:
1. **Hugging Face** - Text similarity, embeddings
2. **Google Gemini** - Natural language understanding
3. **Together AI** - Inference and analysis
4. **Groq** - Fast inference
5. **Ollama** - Local LLM deployment

### Configuration:
Add API keys to `.env` file:
```env
HUGGINGFACE_API_KEY=your_key
GEMINI_API_KEY=your_key
TOGETHER_API_KEY=your_key
GROQ_API_KEY=your_key
```

---

## 7. WebSocket Events (Real-time Updates)

Connect to WebSocket for real-time updates:
```javascript
const socket = io('http://localhost:5001');

// Listen for events
socket.on('connectionAccepted', (data) => {
  console.log('Mentor accepted your request:', data);
});

socket.on('newMessage', (data) => {
  console.log('New message from mentor:', data);
});

socket.on('communityUpdate', (data) => {
  console.log('Community update:', data);
});
```

---

## 8. Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Authenticated**: 500 requests per 15 minutes per user
- **File uploads**: 10 uploads per hour per user

---

## 9. Best Practices

1. **Profile Completion**: Encourage users to complete profiles for better matching
2. **Regular Updates**: Keep availability and preferences updated
3. **Verification**: Get verified for increased trust and visibility
4. **Engagement**: Active participation improves matching accuracy
5. **Feedback**: Provide ratings and reviews after mentorship sessions

---

## 10. Testing Endpoints

Use these endpoints for testing:

### Health Check
**GET** `/health`
```json
{
  "status": "healthy",
  "service": "mentor-matching",
  "timestamp": "2024-12-08T12:00:00Z"
}
```

### Generate Test Data
**POST** `/test/generate-data` (Development only)
```json
{
  "mentors": 10,
  "students": 20,
  "communities": 5
}
```

---

## Support

For issues or questions:
- Email: support@careerplatform.com
- Documentation: https://docs.careerplatform.com
- GitHub: https://github.com/careerplatform/api
