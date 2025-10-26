const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const ResetPassword = require('../models/reset-password-model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const formData = require('form-data');
const { resolve } = require('path');
const { rejects } = require('assert');
const { emit } = require('process');

function generateResetToken(){
  return new Promise((resolve, reject) => {
    crypto.randomBytes(32, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        const token = buffer.toString('hex');
        resolve(token);
      }
    });
  });
}

router.get('/login', (req, res) => {
  res.render('login')
})

router.get('/register', (req, res) => {
  res.render('register')
})

router.get('/forget-password', (req, res) => {
  res.render('forget-password', { error: null, success: null });
})

router.get('/forget-password/:token', (req, res) => {
  res.render('password-change', {token: req.params.token, error: null, success: null})  
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const secretKey = 'your-secret-key';

  try {
    const user = await User.findOne({
      where: { email }
    })

    if (user) {
      if (user.password == password) {
        const payload = {
            "id" : user._id,
            "email" : user.email
        }
        const token = jwt.sign(payload, secretKey, { 
            expiresIn: '3h'
            });

        res.cookie('token', token,{
            maxAge: 3 * 60 * 60 * 1000,
            path: '/'
        });

        res.redirect("/user/profile")

      } else {
        res.render('login', {"error": "The password is incorrect!" })
      }
    } else {
      res.render('login', {"error": "User not found!" })
    }
  } catch (error) {
    console.error(error)
    res.render('login', {"error": "Login failed!" })
  }
})

router.post('/register', async (req, res) => {
  console.log('Request body:', req.body);
  
  const { email, password, firstName, lastName } = req.body;

  // validation
  if (!firstName || !lastName || !email || !password) {
    return res.render('register', { 
      "error": "All fields are required!"
    });
  }

  try {
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      res.render('register', { 
        "error": "User already exists!"
      });
    } else {
      await User.create({
        firstName,
        lastName,
        email, 
        password
      });
      res.render('register', { "success": "User registered successfully!" });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.render('register', { 
      "error": "Registration failed!"
    });
  }
}); 

router.post('/forget-password', async (req , res) => {
  const {email} = req.body

  const user = await User.findOne({
      where: {
        email 
      }
    })

  if (user){

    const token = await generateResetToken()

    await ResetPassword.create({
      email,
      token
    })

    console.log(token)

    res.send({"masseage" : "OK"})

  } else {
    res.redirect('/auth/login')
  }

})

router.post('/forget-password/:token', async (req , res) => {
  const { token } = req.params
  const { password } = req.body

  const reset_password = await ResetPassword.findOne({
      where: {
        token 
      }
    })

  if (reset_password){
    const user = await User.findOne({
      where:{
        email: reset_password.email
      }
    })

    if (user){
      user.password = password
      await user.save()

      res.redirect('/auth/login')
    } else {
      res.redirect('/auth/login')
    }

  } else {
    res.redirect('/auth/login')
  }

})

module.exports = router