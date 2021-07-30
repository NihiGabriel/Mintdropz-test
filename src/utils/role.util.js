const asyncHandler = require('../middleware/async.mw');
const { isObject, isString, isArray, strIncludeEs6, strToArrayEs6 } = require('./functions.util');

const User = require('../models/User.model');
const Role = require('../models/Role.model');

exports.getRolesByName = async (roles) => {
	const result = roles.map(async (r) => await Role.findByName(r));
	const authorized = Promise.all(result);
	return authorized;
};

exports.getRoleNames = async (roleIDs) => {
	const result = roleIDs.map(async (r) => await Role.getRoleName(r));
	const rIds = Promise.all(result);
	return rIds;
};