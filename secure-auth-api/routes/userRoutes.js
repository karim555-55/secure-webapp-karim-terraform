// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updateUserRole } = require('../controllers/userController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

// GET user profile
router.get('/profile', authenticateJWT, getProfile);

// PUT update profile (email or password)
router.put('/profile', authenticateJWT, updateProfile);

// PUT admin-only update user role
router.put('/users/:id/role', authenticateJWT, authorizeRole('admin'), updateUserRole);

module.exports = router;
