const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Sample in-memory user store (replace with DB in production)
const users = require('../data/users');

// User Registration Route
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  // Validate email format and password strength (add custom validation as needed)
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Check if user already exists
  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save user to the "database"
  const newUser = { username, email, password: hashedPassword, role };
  users.push(newUser);

  res.status(201).json({ message: 'User registered successfully' });
});

// User Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Find the user in the "database"
  const user = users.find((user) => user.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Compare the password with the stored hash
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Generate a refresh token (valid for 7 days)
  const refreshToken = jwt.sign(
    { id: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(200).json({ token, refreshToken });
});

// Refresh Token Route (to generate new access token using the refresh token)
router.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(403).json({ message: 'Refresh token required' });
  }

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Create a new access token
    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // New access token expires in 1 hour
    );

    res.json({ accessToken: newAccessToken });
  });
});

// Password Reset Request Route (simulating an email with a reset link)
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  const user = users.find((user) => user.email === email);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Generate a password reset token (valid for 1 hour)
  const resetToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Simulating sending a reset email (you can replace this with an actual email service)
  res.status(200).json({ message: `Password reset link: /reset-password/${resetToken}` });
});

// Password Reset Confirmation Route (to reset the password using the token)
router.put('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = users.find((user) => user.email === decoded.email);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword; // Update the password
    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired reset token' });
  }
});

module.exports = router;
