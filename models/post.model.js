const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../database/sequelize-connect')

const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT, // تغییر از STRING به TEXT برای محتوای طولانی
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    image: { // اضافه کردن فیلد image اگر می‌خواهی
        type: DataTypes.STRING,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {});

  module.exports = Post