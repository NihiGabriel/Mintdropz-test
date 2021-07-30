const imgBb = require('imgbb-uploader');
const { join, resolve } = require('path');
const appRootUrl = require('app-root-path');
const ErrorResponse = require('./errorResponse.util');

// async..await is not allowed in global scope, must use a wrapper
exports.uploadImage = async (options) => {
	const { filePath } = options;
	let uResp = null;

	// upload image
	await imgBb(process.env.IMGBB_API_KEY, filePath).then((resp) => {
		uResp = resp;
	}).catch((err) => {
		uResp = null;
	});

	return uResp;

};
