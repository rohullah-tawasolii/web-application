const express = require('express')
const router = express.Router()
const User = require('../models/user.model')
const jwt = require('jsonwebtoken');
const {requireAuth} = require('../middlewares/auth.middleware')
const multer = require('multer')
const path = require('path');
const { where } = require('sequelize');
const Post = require('../models/post.model');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'statics/user_profile')
    },
    filename: function (req, file, cb){
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });

const postStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'statics/post_images')
    },
    filename: function (req, file, cb){
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const postUpload = multer({ storage: postStorage });

router.get('/profile', requireAuth, async (req, res) => {
    const user = await User.findOne({
        where: {
            email: res.locals.decoded.email
        }
    });
                
    if (user){
        // پارامترهای صفحه‌بندی
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // تعداد پست در هر صفحه
        const offset = (page - 1) * limit;

        // گرفتن پست‌های کاربر با صفحه‌بندی
        const { count, rows: posts } = await Post.findAndCountAll({
            where: {
                userId: user.id
            },
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset
        });

        // محاسبه تعداد صفحات
        const totalPages = Math.ceil(count / limit);

        res.render('profile', {
            user,
            posts: posts || [],
            currentPage: page,
            totalPages: totalPages,
            error: req.query.error,
            success: req.query.success
        });
    } else {
        res.redirect("/auth/login");
    }
});

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

router.get('/posts/create', (req, res) => {
    res.render('create_post')
})

router.post('/posts/create', requireAuth, postUpload.single('image'), async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        
        const title = req.body.title;
        const description = req.body.description;
        const content = req.body.content;
        const image = req.file ? `/post_images/${req.file.filename}` : null;
        
        if (!title || !content) {
            return res.redirect('/user/posts/create?error=Title and content are required');
        }

        const user = await User.findOne({
            where: {
                email: res.locals.decoded.email
            }
        });

        if (!user) {
            return res.redirect('/user/posts/create?error=User not found');
        }
        
        await Post.create({
            title: title,
            description: description || '',
            content: content,
            image: image,
            userId: user.id
        });
        
        res.redirect('/user/profile?success=Post created successfully');
    } catch (error) {
        console.error('Error creating post:', error);
        res.redirect('/user/posts/create?error=Error creating post');
    }
});

// Route برای حذف پست با AJAX
// Route برای حذف پست با AJAX - باید قبل از module.exports باشه
router.delete('/posts/delete/:id', requireAuth, async (req, res) => {
    try {
        const postId = req.params.id;
        console.log('Deleting post ID:', postId); // برای دیباگ
        
        // پیدا کردن کاربر
        const user = await User.findOne({
            where: {
                email: res.locals.decoded.email
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // پیدا کردن پست و چک کردن مالکیت
        const post = await Post.findOne({
            where: {
                id: postId,
                userId: user.id  // چک کردن مالکیت
            }
        });
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found or access denied' });
        }
        
        // حذف پست
        await Post.destroy({
            where: {
                id: postId
            }
        });
        
        console.log('Post deleted successfully'); // برای دیباگ
        res.json({ 
            success: true, 
            message: 'Post deleted successfully' 
        });
        
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ 
            error: 'Error deleting post: ' + error.message 
        });
    }
});

// Route برای صفحه ویرایش پست
router.get('/posts/edit/:id', requireAuth, async (req, res) => {
    try {
        const postId = req.params.id;
        
        // پیدا کردن کاربر
        const user = await User.findOne({
            where: {
                email: res.locals.decoded.email
            }
        });

        if (!user) {
            return res.redirect('/user/profile?error=User not found');
        }
        
        // پیدا کردن پست و چک کردن مالکیت
        const post = await Post.findOne({
            where: {
                id: postId,
                userId: user.id  // چک کردن مالکیت
            }
        });
        
        if (!post) {
            return res.redirect('/user/profile?error=Post not found or access denied');
        }
        
        // رندر کردن صفحه ویرایش با اطلاعات پست
        res.render('edit_post', {
            post: post,
            error: req.query.error,
            success: req.query.success
        });
        
    } catch (error) {
        console.error('Error loading edit post:', error);
        res.redirect('/user/profile?error=Error loading post');
    }
});

// Route برای آپدیت پست
router.post('/posts/edit/:id', requireAuth, postUpload.single('image'), async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, description, content } = req.body;
        const image = req.file ? `/post_images/${req.file.filename}` : undefined;
        
        if (!title || !content) {
            return res.redirect(`/user/posts/edit/${postId}?error=Title and content are required`);
        }

        // پیدا کردن کاربر
        const user = await User.findOne({
            where: {
                email: res.locals.decoded.email
            }
        });

        if (!user) {
            return res.redirect('/user/profile?error=User not found');
        }
        
        // پیدا کردن پست و چک کردن مالکیت
        const post = await Post.findOne({
            where: {
                id: postId,
                userId: user.id
            }
        });
        
        if (!post) {
            return res.redirect('/user/profile?error=Post not found or access denied');
        }
        
        // آپدیت پست
        const updateData = {
            title: title,
            description: description || '',
            content: content
        };
        
        // اگر عکس جدید آپلود شده، آن را اضافه کن
        if (image) {
            updateData.image = image;
        }
        
        await Post.update(updateData, {
            where: {
                id: postId
            }
        });
        
        res.redirect('/user/profile?success=Post updated successfully');
    } catch (error) {
        console.error('Error updating post:', error);
        res.redirect(`/user/posts/edit/${postId}?error=Error updating post`);
    }
});

module.exports = router