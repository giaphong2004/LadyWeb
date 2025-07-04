require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

const app = express();

// Middlewares
app.use(cors()); // Cho phép cross-origin requests
app.use(express.json()); // Parse JSON bodies

// Routes
const authRoutes = require('./routes/auth.routes');
const cycleRoutes = require('./routes/cycle.routes');

app.use('/api/auth', authRoutes);
app.use('/api/cycles', cycleRoutes);

// Route cơ bản để kiểm tra server
app.get('/', (req, res) => {
  res.send('Lady App API is running!');
});

// Kết nối database và khởi động server
const PORT = process.env.PORT || 3000;
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });