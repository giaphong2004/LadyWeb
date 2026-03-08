require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const sequelize = require('./config/database');
const chatService = require('./services/chat.service');

const app = express();
const server = http.createServer(app);

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

// Chat Models - load from separate files
const Conversation = require('./models/conversation.model');
const Message = require('./models/message.model');

// Health Toolkit Models
const UserHealthProfile = require('./models/userHealthProfile.model');
const CycleHistory = require('./models/cycleHistory.model');
const DailyLog = require('./models/dailyLog.model');
const SymptomPattern = require('./models/symptomPattern.model');


// Thiết lập mối quan hệ
// User <-> ExpertProfile (One-to-One)
User.hasOne(ExpertProfile, { foreignKey: 'user_id', as: 'ExpertProfile' });
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

// ---- mối quan hệ cho Chat ----
Conversation.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
Conversation.belongsTo(User, { as: 'expert', foreignKey: 'expert_id' });
Conversation.hasMany(Message, { as: 'messages', foreignKey: 'conversation_id' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });
Message.belongsTo(User, { as: 'sender', foreignKey: 'sender_id' });

// ---- Health Toolkit Associations ----
User.hasOne(UserHealthProfile, { foreignKey: 'user_id', as: 'HealthProfile' });
UserHealthProfile.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(CycleHistory, { foreignKey: 'user_id', as: 'cycles' });
CycleHistory.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(DailyLog, { foreignKey: 'user_id', as: 'dailyLogs' });
DailyLog.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(SymptomPattern, { foreignKey: 'user_id', as: 'symptomPatterns' });
SymptomPattern.belongsTo(User, { foreignKey: 'user_id' });

// làm cho các model có sẵn trong routes và chat service
app.locals.models = { Conversation, Message, User };
global.models = { Conversation, Message, User, ExpertProfile };

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
const chatRoutes = require('./routes/chat.routes');
const aiRoutes = require('./routes/ai.routes');
const healthRoutes = require('./routes/health.routes');


app.use('/api/auth', authRoutes);
app.use('/api/cycles', cycleRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/imagekit', imagekitRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/public', publicRoutes); 
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/health', healthRoutes);


// Route cơ bản để kiểm tra server
app.get('/', (req, res) => {
  res.send('Lady App API is running!');
});

// Kết nối database và khởi động server
const PORT = process.env.PORT || 3000;

// Debug: kiểm tra biến DB đang dùng
console.log('=== DB CONFIG CHECK ===');
console.log('MYSQL_URL exists:', Boolean(process.env.MYSQL_URL));
console.log('DATABASE_URL exists:', Boolean(process.env.DATABASE_URL));
console.log('DB_HOST:', process.env.DB_HOST || '(not set)');
console.log('MYSQLHOST:', process.env.MYSQLHOST || '(not set)');
console.log('DB_PORT:', process.env.DB_PORT || '(not set)');
console.log('MYSQLPORT:', process.env.MYSQLPORT || '(not set)');
console.log('DB_NAME:', process.env.DB_NAME || '(not set)');
console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE || '(not set)');
console.log('DB_USER:', process.env.DB_USER || '(not set)');
console.log('MYSQLUSER:', process.env.MYSQLUSER || '(not set)');
console.log('DB_PASSWORD exists:', Boolean(process.env.DB_PASSWORD));
console.log('MYSQLPASSWORD exists:', Boolean(process.env.MYSQLPASSWORD));
console.log('========================');

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    
    // Initialize Chat Service with Socket.IO
    chatService.initialize(server);
    
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Chat Service is ready`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });