const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    author_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    content: { type: DataTypes.TEXT('long'), allowNull: false },
    cover_image_url: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM('draft', 'published'), defaultValue: 'draft' },
    published_at: { type: DataTypes.DATE },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'posts',
    timestamps: false // Tắt auto timestamps, quản lý thủ công
});

module.exports = Post;