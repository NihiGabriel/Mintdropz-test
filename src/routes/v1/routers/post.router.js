const express = require('express');
const asyncify = require('express-asyncify'); // use this to get async functions to work in router.use()

const {
	getPosts,
	getPost,
	addPost,
	updatePost,
	uploadFile,
	deletePost,
} = require('../../../controllers/post.controller');

const advancedResults = require('../../../middleware/advancedResults.mw');
const Post = require('../../../models/Post.model');

// router
const router = express.Router({ mergeParams: true });
const { protect, authorize } = require('../../../middleware/auth.mw');

//variables
const roles = ['superadmin', 'admin']
const allRoles = ['superadmin', 'admin', 'user']

router.use(protect); // protect all routes
router.use(authorize(roles)); // authorize only admin

router.get('/', protect, authorize(allRoles), advancedResults(Post), getPosts);
router.get('/:id', protect, authorize(allRoles), getPost);
router.post('/', protect, authorize(allRoles), addPost);
router.put('/upload/:id', protect, authorize(allRoles), uploadFile);
router.put('/:id', protect, authorize(allRoles), updatePost);
router.delete('/delete/:id', protect, authorize(allRoles),  deletePost);

module.exports = router; 