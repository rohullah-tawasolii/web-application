const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('owasp', 'rohi', '1234', {
    host: 'localhost',
    dialect: 'mysql'
})

module.exports = sequelize;