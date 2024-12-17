const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const taskRoutes = require('./routes/taskRoutes');
const studyPlanRoutes = require('./routes/studyPlanRoutes');
const userRoutes = require('./routes/userRoutes');
const learningGoalRoutes = require('./routes/learningGoalRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const resourceSearchRoutes = require('./routes/resourceSearch.routes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enhanced logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  
  if (req.method === 'POST' && req.path === '/api/resources/search') {
    console.log('Resource Search Request Body:', req.body);
  }

  // Capture response
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] Response ${res.statusCode} - ${duration}ms`);
    
    if (res.statusCode !== 200) {
      console.error('Error Response:', body);
    }
    
    return originalSend.call(this, body);
  };

  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/tasks', taskRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/learning-goals', learningGoalRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/resources', resourceSearchRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to EduWise API');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server with port checking if port is already in use
const PORT = process.env.PORT || 50001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const newPort = PORT + 1;
    console.log(`Port ${PORT} is busy, trying ${newPort}`);
    app.listen(newPort, () => {
      console.log(`Server running on port ${newPort}`);
    });
  } else {
    console.error('Error starting server:', err);
  }
});
