# EduWise - Intelligent Learning Management System

## Overview
EduWise is a comprehensive learning management system designed to help students manage their educational journey effectively. The application combines task management, study planning, and learning analytics to provide a personalized learning experience.

## System Architecture

### Frontend (client/)
The frontend is built using React.js with modern web technologies:
- **State Management**: Context API for user, task, and learning state management
- **Routing**: React Router for navigation
- **UI Framework**: Material-UI and TailwindCSS for styling
- **HTTP Client**: Axios for API communication

Key Frontend Components:
- `components/`
  - `AI/`: AI-powered learning assistance components
  - `activities/`: Task and activity management components
  - `auth/`: Authentication-related components
  - `calendar/`: Calendar and scheduling components
  - `dashboard/`: Main dashboard views
  - `learning/`: Learning-related components
  - `messages/`: Messaging and notification components
  - `profile/`: User profile management
  - `visualization/`: Data visualization components

### Backend (server/)
The backend is built with Node.js and Express, following a modular architecture:
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with refresh tokens
- **API Structure**: RESTful API design

Key Backend Components:
- `models/`: Database schemas
  - `User.js`: User profile and authentication
  - `Task.js`: Task and event management
  - `Subject.js`: Subject and assessment tracking
  - `LearningGoal.js`: Learning objectives and progress
  - `StudyPlan.js`: Study session planning and analytics

### Machine Learning (ml/)
The ML component includes:
- `data/`: Training data and datasets
- `models/`: Machine learning model definitions
- `training_scripts/`: Model training scripts

## Core Features

### 1. User Management
- User registration and authentication
- Profile management with personal details
- Secure password handling with bcrypt

### 2. Task Management
- Create, update, and delete tasks
- Task scheduling with due dates
- Progress tracking and completion status

### 3. Study Planning
- Create personalized study plans
- Session scheduling and management
- Progress tracking and analytics
- Preferred time slots and restrictions

### 4. Subject Management
- Subject creation and tracking
- Assessment management
  - Multiple assessment types (exam, coursework, participation)
  - Grade calculation and progress tracking
  - Due date management

### 5. Learning Goals
- Set and track learning objectives
- Progress monitoring
- Target date management

### 6. Analytics and Visualization
- Study session completion rates
- Learning velocity tracking
- Topic difficulty assessment
- Time slot optimization

## Technical Details

### API Endpoints
- `/api/auth`: Authentication routes
- `/api/user`: User management
- `/api/tasks`: Task operations
- `/api/study-plans`: Study plan management
- `/api/learning-goals`: Learning goal tracking
- `/api/subjects`: Subject management

### Security Features
- JWT-based authentication
- Token refresh mechanism
- Password hashing
- CORS protection

### Data Models

#### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  profilePicture: String,
  firstName: String,
  lastName: String,
  birthday: Date
}
```

#### Task Model
```javascript
{
  title: String,
  description: String,
  dueDate: Date,
  start: Date,
  end: Date,
  allDay: Boolean,
  completed: Boolean,
  user: ObjectId
}
```

#### Subject Model
```javascript
{
  name: String,
  code: String,
  user: ObjectId,
  assessments: [{
    name: String,
    type: String,
    weight: Number,
    dueDate: Date,
    score: Number,
    status: String
  }],
  progress: Number
}
```

#### Learning Goal Model
```javascript
{
  user: ObjectId,
  title: String,
  description: String,
  targetDate: Date,
  completed: Boolean,
  progress: Number
}
```

#### Study Plan Model
```javascript
{
  user: ObjectId,
  subject: String,
  goal: String,
  deadline: Date,
  preferredTimes: [String],
  restrictions: [String],
  progress: Number,
  sessions: [{
    day: String,
    time: String,
    duration: String,
    topic: String,
    completed: Boolean
  }],
  metrics: {
    sessionCompletionRate: Number,
    averageSessionDuration: Number,
    topicDifficulty: Number,
    learningVelocity: Number
  }
}
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd server && npm install
```

3. Environment Setup
Create a `.env` file in the server directory with:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=50001
```

4. Start the application
```bash
# Start both client and server
npm start
```

## Development

### Client Development
```bash
cd client
npm start
```

### Server Development
```bash
cd server
npm start
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License
[License Information]
