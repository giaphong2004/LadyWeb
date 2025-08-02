const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PostTag = sequelize.define('PostTag', {
    post_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: { model: 'posts', key: 'id' }
    },
    tag_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: { model: 'tags', key: 'id' }
    }
}, {
    tableName: 'post_tags',
    timestamps: false // Bảng trung gian không cần timestamps
});

module.exports = PostTag;
