// data/users.js
const users = [
    {
      username: 'adminuser',
      email: 'admin@example.com',
      password: '$2a$10$abc...', // hashed password (optional for testing)
      role: 'admin'
    },
    {
      username: 'moduser',
      email: 'moderator@example.com',
      password: '$2a$10$xyz...', // hashed password
      role: 'moderator'
    },
    {
      username: 'regularuser',
      email: 'user@example.com',
      password: '$2a$10$123...', // hashed password
      role: 'user'
    }
  ];
  
  module.exports = users;
  