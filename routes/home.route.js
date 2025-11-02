// routes/home.route.js
const express = require('express');
const router = express.Router();
const { Post, User } = require('../models/associations');

// صفحه اصلی
router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'profile_image', 'bio'] // فقط فیلدهای موجود
        }
      ],
      order: [['id', 'DESC']]
    });

    res.render('home', { title: 'Home - Shahrakesang.com', posts });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// صفحه نمایش پست کامل
router.get('/post/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    
    const post = await Post.findByPk(postId, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'profile_image', 'bio'] // فقط فیلدهای موجود
        }
      ]
    });

    if (!post) {
      return res.status(404).send('Post not found');
    }

    res.render('post', { 
      title: `${post.title} - Shahrakesang.com`,
      post: post 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;