const express = require('express');

//Controller methods
const {
	register,
	uploadFile,
	login,
	logout,
	getUser,
	updateDetails
} = require('../../../controllers/auth.controller');

// router
const router = express.Router();

const { protect, authorize } = require('../../../middleware/auth.mw');
const roles = ['superadmin', 'admin']
const allRoles = ['superadmin', 'admin', 'user']


router.post('/register', register);
router.put('/upload', protect, authorize(allRoles), uploadFile);
router.post('/login', login);
router.get('/user', protect, authorize(allRoles), getUser);
router.put('/', protect, authorize(allRoles), updateDetails);
router.get('/logout', logout);

module.exports = router;
