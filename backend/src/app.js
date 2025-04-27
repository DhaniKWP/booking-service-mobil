const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Database connection
const sequelize = require('./config/database');

// Import routes
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

// Sync database and start server
sequelize.sync({ alter: true }) // Gunakan { force: true } hanya untuk development
  .then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to sync database:', err);
  });