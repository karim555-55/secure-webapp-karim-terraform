const express = require('express');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Import users from the data folder
const users = require('../data/users');

// ==== ROUTES ==== //

// Public route
router.get('/public', (req, res) => {
  res.status(200).json({ message: 'Public route, no authentication required' });
});

// Protected route
router.get('/protected', authenticateJWT, (req, res) => {
  res.status(200).json({ message: 'Protected route, authenticated users only' });
});

// Moderator route
router.get('/moderator', authenticateJWT, authorizeRole('moderator'), (req, res) => {
  res.status(200).json({ message: 'Route for moderators and admins only' });
});

// Admin route
router.get('/admin', authenticateJWT, authorizeRole('admin'), (req, res) => {
  res.status(200).json({ message: 'Admin-only route' });
});

// STEP 4: GET /profile - View own profile
router.get('/profile', authenticateJWT, (req, res) => {
  const user = users.find((u) => u.email === req.user.id); // req.user.id = email
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { username, email, role } = user;
  res.status(200).json({
    message: 'User profile fetched successfully',
    user: { username, email, role },
  });
});

// STEP 4: PUT /profile - Update email and password
router.put('/profile', authenticateJWT, async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === req.user.id); // req.user.id = email

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (email) user.email = email;
  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
  }

  res.status(200).json({ message: 'Profile updated successfully' });
});

// STEP 4: PUT /users/:id/role - Admin updates user role
router.put('/users/:id/role', authenticateJWT, authorizeRole('admin'), (req, res) => {
  const { id } = req.params; // id = user email
  const { role } = req.body;

  const user = users.find((u) => u.email === id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.role = role;
  res.status(200).json({ message: `User role updated to ${role}` });
});

module.exports = router;
