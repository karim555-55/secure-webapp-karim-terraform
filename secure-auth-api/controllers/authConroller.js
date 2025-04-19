// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Sample in-memory user store (replace with DB in production)
const users = [];

const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!email || !password || password.length < 8) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { username, email, password: hashedPassword, role };
  users.push(newUser);

  res.status(201).json({ message: 'User registered successfully' });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(user => user.email === email);

  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(200).json({ token });
};

module.exports = { register, login };
