const express = require('express');
const app = express();
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const userRoutes = require('./routes/userRoutes');

app.use(express.json());  // Middleware to parse JSON

// Define route prefixes
app.use('/api/auth', authRoutes);  // Authentication routes
app.use('/api/protected', protectedRoutes);  // Protected routes
app.use('/api/users', userRoutes);  // User routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);  // Log the error
  res.status(500).json({ message: 'Something went wrong' });  // Send a generic error message
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
