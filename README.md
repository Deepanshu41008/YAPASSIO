# Career Guidance Platform - Microservices Architecture

A comprehensive career guidance platform built with free LLMs and APIs, designed to help students and professionals navigate their career paths through AI-driven insights and community support.

## 🎯 Features Overview

### 1. **Mentor & Community Matching** (Feature 6)
- AI-powered mentor matching based on domains and location
- Verified mentors from various sectors
- Peer group formation based on interests

### 2. **Exam Preparation Assistant** (Feature 7)
- AI-curated resources for competitive exams
- Daily/weekly planners
- Practice questions with AI feedback
- Weak area detection & remedy plans

### 3. **Career Simulation & Project-Based Preview** (Feature 8)
- Simulated workplace challenges
- Virtual internship modules
- Performance feedback on various skills

### 4. **Global Opportunity Matching** (Feature 9)
- International job opportunities
- Visa & migration pathway information
- Global job board integration

### 5. **Career Progression Dashboard** (Feature 10)
- 12-18 month career tracking
- Milestone management
- AI-based SWOT analysis
- Goal setting & replanning

### 6. **Analytics & Motivation Engine** (Feature 11)
- Visual progress tracking
- Comparative analytics
- Success probability scoring
- Gamification & rewards

## 🛠️ Technology Stack

### Backend
- **Node.js** - Primary backend framework
- **Python** - AI/ML services and data processing
- **Express.js** - REST API framework
- **MongoDB** - Primary database
- **Redis** - Caching and session management

### AI/LLM Integration (Free)
- **Ollama** - Local LLM deployment
- **Hugging Face Inference API** - Various NLP models
- **Google's Gemini API** - Free tier for content generation
- **Together AI** - Free tier API
- **Groq** - Fast inference API

### Frontend
- **React.js** - UI framework
- **Node.js** - Server-side rendering
- **Material-UI** - Component library
- **Chart.js** - Data visualization

## 📁 Project Structure

```
career-guidance-platform/
├── backend/
│   ├── services/
│   │   ├── mentor-matching/      # Feature 6
│   │   ├── exam-prep/            # Feature 7
│   │   ├── career-simulation/    # Feature 8
│   │   ├── global-opportunities/ # Feature 9
│   │   ├── career-dashboard/     # Feature 10
│   │   └── analytics/            # Feature 11
│   └── shared/                   # Shared utilities
├── frontend/
│   └── src/                      # React components
├── docs/                         # API documentation
└── demos/                        # Feature demonstrations
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB
- Redis (optional but recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd career-guidance-platform
```

2. Install backend dependencies:
```bash
cd backend
npm install
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

5. Start the services:
```bash
# Backend
npm run dev

# Frontend
npm start
```

## 📖 Documentation

Each feature has detailed documentation in the `docs/` directory:
- [Mentor Matching API](docs/mentor-matching.md)
- [Exam Prep API](docs/exam-prep.md)
- [Career Simulation API](docs/career-simulation.md)
- [Global Opportunities API](docs/global-opportunities.md)
- [Career Dashboard API](docs/career-dashboard.md)
- [Analytics API](docs/analytics.md)

## 🔧 Configuration

See [Configuration Guide](docs/configuration.md) for detailed setup instructions.

## 📝 License

MIT License - feel free to use this in your projects!

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.
