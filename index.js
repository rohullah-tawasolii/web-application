const express = require('express')
const sequelize = require('./database/sequelize-connect')
const authRoutes = require('./routes/auth.route')
const userRoutes = require('./routes/user.route')
const homeRoutes = require('./routes/home.route')
const cookieParser = require('cookie-parser')
const path = require('path')
const jwt = require('jsonwebtoken') // اضافه کردن jwt

const app = express()
const port = 3000
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'images')));
app.use(express.static(path.join(__dirname, 'statics')));

// 🔥 MIDDLEWARE全局 برای پاس دادن user به تمام viewها
app.use((req, res, next) => {
    const token = req.cookies?.token;
    const secretKey = 'your-secret-key'; // همان secretKey که در auth استفاده کردی
    
    if (token) {
        try {
            const decoded = jwt.verify(token, secretKey);
            res.locals.user = decoded; // اطلاعات کاربر را در res.locals قرار بده
        } catch (error) {
            res.locals.user = null; // اگر token نامعتبر است
        }
    } else {
        res.locals.user = null; // اگر token وجود ندارد
    }
    next();
});

app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/', homeRoutes)

app.listen(port, async() => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({force: false});
        console.log('Connection has been established successfully.');
        console.log(`Example app listening on port ${port}`);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})