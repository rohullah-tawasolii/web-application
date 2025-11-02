const express = require('express');
const sequelize = require('./database/sequelize-connect');
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const homeRoutes = require('./routes/home.route');
const cookieParser = require('cookie-parser');
const path = require('path');
const jwt = require('jsonwebtoken');

// ⚡ اینجا فقط یک فایل اضافه می‌کنیم:
require('./models/associations'); 

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'statics')));

// 🔥 پاس دادن user به تمام viewها
app.use((req, res, next) => {
  const token = req.cookies?.token;
  const secretKey = 'your-secret-key';

  if (token) {
    try {
      const decoded = jwt.verify(token, secretKey);
      res.locals.user = decoded;
    } catch (error) {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
});

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/', homeRoutes);

app.listen(port, async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // نگهداری داده‌ها
    console.log('✅ Database connected & synced');
    console.log(`🚀 Server running on port ${port}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
});