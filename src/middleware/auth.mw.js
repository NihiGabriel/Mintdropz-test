const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse.util');
const asyncHandler = require('./async.mw');
const User = require('../models/User.model');
const Role = require('../models/Role.model');
const { getRolesByName, getRoleNames } = require('../utils/role.util');

// protect routes
exports.protect = asyncHandler(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		// set token from bearer token in header
		token = req.headers.authorization.split(' ')[1]; //get the token
	}

	// set token from cookie
	// else if(req.cookies.token){
	//     token = req.cookies.token
	// }

	try {
		//make sure token exists
		if (!token) {
			return next(new ErrorResponse('Invalid token. Not authorized to access this route', 401));
		}	

		const jwtData = jwt.verify(token, process.env.JWT_SECRET);
		req.user = await User.findOne({_id: jwtData.id});

		if(req.user){
			return next();
		}else{
			return next(new ErrorResponse(`Error. Not authorized to access this route`, 401));
		}
	} catch (err) {
		return next(new ErrorResponse(`Error. Not authorized to access this route`, 401));
	}
});

// Grant access to specific roles
//roles are string array of roles (e.g. ['admin', 'superadmin'])
exports.authorize = (roles) => {
	let allRoles;
	let allRolesID;

	return asyncHandler(async (req, res, next) => {
		// get the authorized roles objects from db
		// this method returns a promise by default

		await getRolesByName(roles).then((r) => {
			allRoles = [...r]; // use the spread operator
		});

		// get authorized role IDs
		const ids = allRoles.map((e) => { return e._id });

		if (!req.user) {
			return next(
				new ErrorResponse(`Unauthorized. User is not signed in`, 401)
			);
		}

		// check if id exists
		const flag = await checkRole(ids, req.user.roles);

		if (!flag) {
			return next(
				new ErrorResponse(
					`User with role ${req.user.roles} is not authorized to access this route`,
					401
				)
			);
		} else {
			return next();
		}
	});
};

// use brute force to compare roleIDs
const checkRole = (roleIds, userRoles) => {
	let flag = false;

	for (let i = 0; i < roleIds.length; i++) {
		for (let j = 0; j < userRoles.length; j++) {
			if (roleIds[i].toString() === userRoles[j].toString()) {
				flag = true;
			}
		}
	}

	return flag;
};

// use ES6 some function to compare roleIDs
const checkRoleSome = (roleIds, userRoles) => {
	let flag;

	flag = roleIds.some((item) => userRoles.includes(item.toString()));
	return flag;
};
