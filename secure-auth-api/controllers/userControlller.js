// controllers/userController.js
const bcrypt = require('bcryptjs');
const users = require('../data/users');

// GET user profile
const getProfile = (req, res) => {
  const user = users.find(user => user.email === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.status(200).json({ username: user.username, email: user.email, role: user.role });
};

// PUT update profile (email + password)
const updateProfile = async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(user => user.email === req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (email) user.email = email;
  if (password) {
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password too short' });
    }
    user.password = await bcrypt.hash(password, 10);
  }

  res.status(200).json({ message: 'Profile updated successfully' });
};

// Admin only: update user role
const updateUserRole = (req, res) => {
  const { id } = req.params; // email as ID
  const { role } = req.body;

  const user = users.find(u => u.email === id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.role = role;
  res.status(200).json({ message: 'User role updated' });
};

module.exports = {
  getProfile,
  updateProfile,
  updateUserRole
};
