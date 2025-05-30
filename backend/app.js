const express = require('express');
const path = require('path');
const app = express();
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { text } = require('body-parser');
const invoiceController = require('./controllers/invoiceController');

require('./models/user');
require('./models/booking');
require('./models/additionalService'); 


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api', invoiceController);

// Serve static files dari frontend
app.use(express.static(path.join(__dirname, '../frontend')));


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
sequelize.sync({alter : true}).then(() => {
  app.listen(8080, () => console.log('Server berjalan di Port [http://localhost:8080]'));
});
