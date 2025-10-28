const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const posts = [
    { title: 'Modern Daily Podcast', image: '/images/img (1).jpg', content: 'This is the first post.' },
    { title: 'Top 10 - Shocking moments', image: '/images/img (2).jpg', content: 'This is the second post.' },
    { title: 'INDIA', image: '/images/img (3).jpg', content: 'This is the third post.' },
    { title: 'Mindset', image: '/images/img (4).jpg', content: 'This is the first post.' },
    { title: 'Live Streaming - Game', image: '/images/img (5).jpg', content: 'This is the second post.' },
    { title: 'Travel Vlog', image: '/images/img (6).jpg', content: 'This is the first post.' },
    { title: 'Daily Vlog', image: '/images/img (7).jpg', content: 'This is the second post.' },
    { title: 'Journey to the Heart', image: '/images/img (8).jpg', content: 'This is the first post.' },
    { title: 'Holi Sweets', image: '/images/img (9).jpg', content: 'This is the second post.' },
    { title: '1M Views', image: '/images/img (10).jpg', content: 'This is the first post.' },
    { title: 'PROFITABLE TRADING STRATEGY', image: '/images/img (11).jpg', content: 'This is the second post.' },
    { title: 'Top 10 - Shocking moments', image: '/images/img (12).jpg', content: 'This is the first post.' }
  ];

  res.render('home', { title: 'Shahrakesang.com', posts });
});

router.get('/about', (req, res) =>{
    res.render('about',{ title: 'About us'})
})

module.exports = router;
