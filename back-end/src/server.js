require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

const app = express();

// Middlewares
app.use(cors()); // Cho phép cross-origin requests
app.use(express.json()); // Parse JSON bodies

// Define Models & Associations
const User = require('./models/user.model');
const ExpertProfile = require('./models/expertProfile.model');
const MenstrualCycle = require('./models/menstrualCycle.model');

// Thiết lập mối quan hệ
// User <-> ExpertProfile (One-to-One)
User.hasOne(ExpertProfile, { foreignKey: 'user_id' });
ExpertProfile.belongsTo(User, { foreignKey: 'user_id' });

// User <-> MenstrualCycle (One-to-Many)
User.hasMany(MenstrualCycle, { foreignKey: 'user_id' });
MenstrualCycle.belongsTo(User, { foreignKey: 'user_id' });

// Routes
const authRoutes = require('./routes/auth.routes');
const cycleRoutes = require('./routes/cycle.routes');
const expertRoutes = require('./routes/expert.routes');
const imagekitRoutes = require('./routes/imagekit.routes');

app.use('/api/auth', authRoutes);
app.use('/api/cycles', cycleRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/imagekit', imagekitRoutes);

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