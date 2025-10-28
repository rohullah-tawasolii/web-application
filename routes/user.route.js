const express = require('express')
const router = express.Router()
const User = require('../models/user.model')
const jwt = require('jsonwebtoken');
const {requireAuth} = require('../middlewares/auth.middleware')
const multer = require('multer')
const path = require('path');
const { where } = require('sequelize');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'statics/user_profile')
    },
    filename: function (req, file, cb){
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });

router.get('/profile', requireAuth, async (req, res) => {

    const user = await User.findOne({
        where: {
            email: res.locals.decoded.email
        }
    })
                
    if (user){
        res.render('profile', {user})
    } else {
        res.redirect("/auth/login")
    }
})

router.post('/profile', requireAuth, upload.single('profile_image'), async (req, res) => {
    const profile_image = req.file?.originalname
    const { current_password, new_password, confirm_new_password } = req.body

    if (profile_image) {
        const static_path = `/user_profile/${profile_image}`
        await User.update(
            {
                profile_image: static_path
            },
        {
            where: {
                email: res.locals.decoded.email
            }
        }
        )
    } else if ( current_password && new_password && confirm_new_password ) {

        const user = await User.findOne({
            where: {
                email: res.locals.decoded.email
            }
        })

        console.log(user)

        if (current_password == user.password){
            if (new_password == confirm_new_password){
                await User.update(
                    {
                        password: new_password
                    },
                    {
                        where: {
                            email: res.locals.decoded.email
                        }
                    }
                )
                res.redirect('/user/logout')
            } else {
                res.redirect('/user/profile')
            }
        } else {
            res.redirect('/user/profile')
        }

    } else {
        await User.update(
        req.body,
        {
            where: {
                email: res.locals.decoded.email
            }
        }
    )
    res.redirect('/user/profile')
}
})

router.get('/logout', requireAuth, (req, res) => {
    res.clearCookie('token').redirect('/auth/login')
})

module.exports = router