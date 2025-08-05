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
const Post = require('./models/post.model');
const Tag = require('./models/tag.model');
const PostTag = require('./models/postTag.model');

// Thiết lập mối quan hệ
// User <-> ExpertProfile (One-to-One)
User.hasOne(ExpertProfile, { foreignKey: 'user_id' });
ExpertProfile.belongsTo(User, { foreignKey: 'user_id' });

// User <-> MenstrualCycle (One-to-Many)
User.hasMany(MenstrualCycle, { foreignKey: 'user_id' });
MenstrualCycle.belongsTo(User, { foreignKey: 'user_id' });

// Một User (tác giả) có thể có nhiều Post
User.hasMany(Post, { foreignKey: 'author_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// Mối quan hệ nhiều-nhiều giữa Post và Tag
Post.belongsToMany(Tag, { through: PostTag, foreignKey: 'post_id' });
Tag.belongsToMany(Post, { through: PostTag, foreignKey: 'tag_id' });

// Routes
const authRoutes = require('./routes/auth.routes');
const cycleRoutes = require('./routes/cycle.routes');
const expertRoutes = require('./routes/expert.routes');
const imagekitRoutes = require('./routes/imagekit.routes');
const userRoutes = require('./routes/user.routes');
const dashboardRoutes = require('./routes/dashboard.routes'); 
const postRoutes = require('./routes/post.routes');
const tagRoutes = require('./routes/tag.routes');
const publicRoutes = require('./routes/public.routes');

app.use('/api/auth', authRoutes);
app.use('/api/cycles', cycleRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/imagekit', imagekitRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/public', publicRoutes); 


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