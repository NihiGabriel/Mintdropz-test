const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse.util');
const { getRolesByName, hasRole } = require('../utils/role.util');
const { uploadImageFile, uploadBase64ImageFile } = require('../utils/s3.util');
const { dateToWord, dateToWordRaw, convertUrlToBase64 } = require('../utils/functions.util');

const asyncHandler = require('../middleware/async.mw');

const User = require('../models/User.model');
const Role = require('../models/Role.model');

// @desc    Register a User
// @route   POST /api/v1/auth/register 
// @access  Private/superAdmin/Admin
exports.register = asyncHandler(async (req, res, next) => {
    
    const { name, email, password} = req.body;

    // find the default role first
    const role = await Role.findByName('user'); 
    if(!role) {
        return next(
            new ErrorResponse(
                "Error", 400, ['an error occured. Please contact admin for support']
            )
        )
    }

    // validate email
    const isExisting = await User.findOne({ email: email });
    if(!isExisting){
        res.send('User created without a password')
    }

    // Create a new User
    const user = await User.create({
        name,
        email,
        password,
        isActive: true,
    });

    // attach the 'user' role by default
    const data = { roles: [role._id] }
    const upUser = await User.findByIdAndUpdate(user._id, data, {
        new: true,
        runValidators: false,
    });

        const d = await User.findOne({ email: user.email }).populate({
            path: 'roles',
            select: '_id name',
        });

        res.status(200).json({
            error: false,
            errors: [],
            message: `Successful`,
            data: d,
            status: 200
        });
      
});

// @desc    Upload User Photo to s3
// @route   PUT /api/v1/auth/uploadFile
// @access  Private/superadmin/admin
exports.uploadFile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    
    if(!user) {
        return next(
            new ErrorResponse('not found', 400, ['could not find user'])
        );
    }

    const { file, fileName } = req.body;


    if(!file) {
        return next(
            new ErrorResponse('Image is required', 400, ['Image is required'])
        );
    }

    if(typeof(file) !== 'string') {
        return next(
            new ErrorResponse('Error', 400, ['Image or photo data should be a string'])
        );
    }

    if(!fileName) {
        return next(
            new ErrorResponse('Error', 400, ['file name is required'])
        );
    }

    try {
        const mime = file.split(';base64')[0].split(':')[1];

        if(!file){
            return next(
                new ErrorResponse('Invalid format', 400, ['Image or photo data is expected to be a string'])
            );
        }

        // Generate new filename
        let newFileName = fileName;

        // Upload file
        const fileData = {
            file: file,
            filename: newFileName,
            mimeType: mime
        }

        req.setTimeout(0)
        const s3Data = await uploadBase64ImageFile(fileData);

        const ud = {
            url: s3Data.url,
            createdon: dateToWordRaw()
        }

        // return console.log(ud)

        user.photo = ud.url;
        user.save();

        res.status(200).json({
            data: ud,
            error: false,
            errors: [],
            message: 'User photo uploaded successfully',
            status: 200
        });
    } catch (error) {
        // return next(
        //     new ErrorResponse
        //     ('Error. Cant upload file, please contact support', 500, ['internal server error']));
        console.log(error)
    }
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Private
exports.login = asyncHandler(async(req, res, next) => {

    const { email, password } = req.body;

    // validate email and password
    if(!email && !password){
        return next(new ErrorResponse('Please provide an email and passsword', 400, ['Please provide an email and password']));
    }

    // check for use
    const user = await User.findOne({ email }).select('+password');
    if(!user){
        return next(new ErrorResponse('Invalid credentials', 401, ['Invalid credentials']));
    }

    // check password
    const isMatched = await user.matchPassword(password);
    if(!isMatched) {
        return next(
            new ErrorResponse('Invalid credentials', 401, ['Invalid credentials'])
        )
    }

    // send response
    const msg = `Login successful`;
    sendTokenResponse(user, msg, 200, res);
});

// @desc    Logout user / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async(req, res, next) => {

    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        error: false,
        errors: [],
        message: `Logout is successful`,
        status: 200,
        data: null

    });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/user
// @access  Private
exports.getUser = asyncHandler(async(req, res, next) => {

    const user = await User.findById(req.user.id);

    if(!user){
        return next(new ErrorResponse('Unable to find user', 401, ['Unable to find user']));
    }

    const u = await (await User.findOne({ _id: user._id })).populate([{
        path: 'roles',
        select: '_id name'
    }]);

    res.status(200).json({
        error: false,
        errors: [],
        message: 'successful',
        data: u,
        status: 200
    });
});

// @desc    Update current loggedin user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async(req, res, next) => {
    const update = { name, password, email } 

    const user = await User.findByIdAndUpdate(req.user.id, update, {
        new: true,
        runValidators: false,
    });

    res.status(200).json({
        error: error,
        errors: [],
        message: 'user details updated successfully',
        data: user
    });
});  


// @desc    Helper function: get token from model, create cookie and send response
// @route   None
// @access  public
exports.sendRouteTokenResponse = (user, message, statusCode, res) => {
	// create token
	const token = user.getSignedJwtToken();

	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};

	// make cookie work for https
	if (process.env.NODE_ENV === 'production') {
		options.secure = true;
	}

	//data
	const userData = {
		_id: user._id,
		name: user.name || 'Nil',
	};

	res.status(statusCode).cookie('token', token, options).json({
		status: true,
		message: message,
		token: token,
		user: userData,
	});
};

// Helper function: get token from model, create cookie and send response
const sendTokenResponse = (user, message, statusCode, res) => {

	// create token
	const token = user.getSignedJwtToken();

	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};

	// make cookie work for https
	if (process.env.NODE_ENV === 'production') {
		options.secure = true;
	}

	//data
	const userData = {
		_id: user._id,
		is_admin: user.is_admin,
	};

	res.status(statusCode).cookie('token', token, options).json({
		status: true,
		message: message,
		token: token,
		user: userData
	});
}
