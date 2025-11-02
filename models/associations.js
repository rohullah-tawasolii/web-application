const User = require('./user.model');
const Post = require('./post.model');

// تعریف ارتباط‌ها
User.hasMany(Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'userId' });

module.exports = { User, Post };