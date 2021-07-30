const express = require('express');

// routers
const authRoutes = require('./routers/auth.router');
const postRoutes = require('./routers/post.router');

// create router
const router = express.Router();

// define routes
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);


// for unmapped routes
router.get('/', (req, res, next) => {

    res.status(200).json({
        status: 'success',
        data: {
            name: 'mint test backend',
            version: '0.1.0'
        }
    });

});

module.exports = router;