const express = require('express');
const path = require('path');
const app = express();
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files dari frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
app.use('/api/auth', authRoutes);

// Fallback route: selain API dan file yang ada, balikin index.html
app.use((req, res, next) => {
  const accept = req.headers.accept || '';
  
  if (accept.includes('html')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  } else {
    next();
  }
});

// Database & Server
sequelize.sync().then(() => {
  app.listen(8080, () => console.log('Server jalan di http://localhost:8080'));
});
