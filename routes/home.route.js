const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const posts = [
    { title: 'First Post', image: '/images/1.jpg', content: 'This is the first post.' },
    { title: 'Second Post', image: '/images/2.jpg', content: 'This is the second post.' },
    { title: 'Third Post', image: '/images/3.jpg', content: 'This is the third post.' }
  ];

  res.render('home', { title: 'Shahrakesang.com', posts });
});

router.get('/about', (req, res) =>{
    res.render('about',{ title: 'About us'})
})

module.exports = router;
