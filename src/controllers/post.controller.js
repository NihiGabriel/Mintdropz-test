const ErrorResponse = require('../utils/errorResponse.util');
const asyncHandler = require('../middleware/async.mw');

const { uploadImage } = require('../utils/imgbb.util');
const { uploadImageFile, uploadBase64ImageFile } = require('../utils/s3.util');
const { dateToWord, dateToWordRaw, convertUrlToBase64 } = require('../utils/functions.util');

const { strIncludesEs6 } = require('../utils/functions.util')

const Post = require('../models/Post.model');
const User = require('../models/User.model');

//  @desc   Get all Post
//  @routes GET api/v1/posts
//  @access Private
exports.getPosts = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

//  @desc   Get a single Post
//  @route  GET api/v1/post/:id
//  @access Private
exports.getPost = asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.id).populate([ { path: 'user', select: '_id email name'} ]);

    if(!post) {
        return next(
            new ErrorResponse(
                `post with ${re.params.id} not found`, 404
            )
        );
    }

    res.status(200).json({
        error: false,
        errors: [],
        data: post,
        message: `successful`,
        status: 200
    });
});

// @desc    Create A Post
// @route   POST /api/v1/posts
// @access  Private
exports.addPost = asyncHandler( async (req, res, next) => {

    const {title, description} = req.body;

	const user = await User.findById(req.user._id);

	if (!user) {
		return next(new ErrorResponse(`user is not authorized`, 401));
	}

		const p = await Post.create({ 
			title: title,
			description: description,
			user: user._id
		 });
	
	
	
	
		res.status(200).json({
			error: false,
			errors: [],
			message: 'post created successfully',
			data: p,
			status: 200
		});  

});

// @desc    Upload User Photo to s3
// @route   PUT /api/v1/auth/uploadFile/:id
// @access  Private/superadmin/admin
exports.uploadFile = asyncHandler(async (req, res, next) => {

    const post = await Post.findById(req.params.id);

	if(!post){
		return next(
            new ErrorResponse('Error', 400, ['cannot find post'])
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
 
        post.photo = ud.url;
        post.save();  

        res.status(200).json({
            data: ud,
            error: false, 
            errors: [],
            message: 'User photo uploaded successfully',
            status: 200
        });
    } catch (error) {
        return next( 
            new ErrorResponse
            ('Error. Cant upload file, please contact support', 500, ['internal server error']));
    }
});


// @desc    Update Post
// @route   PUT /api/v1/Post/:id
// @access  Private/Admin 
exports.updatePost = asyncHandler(async (req, res, next) => {
	

	const { title, description, user } = req.body;

	const post = await Post.findById(req.params.id);

	if(!post) {
		return next(
			new ErrorResponse(
				`Not found`, 404, ['not authorized to update this post']
			)
		);
	}

	const _user = await User.findById(user);

	if(!_user) {
		return next(
			new ErrorResponse(
				`Not found`, 404, ['not authorized to update this post']
			)
		); 
	}


	if(!strIncludesEs6(_user.posts, post._id)){

		return next(
			new ErrorResponse(
				`Not found`, 404, ['not authorized to update thsi post']
			)
		); 

	}

	post.title = title;
	post.description = description;
	await post.save();
	  
	res.status(200).json({
		error: false,
		errors: [], 
		message: ` post updated successful`, 
		data: post,
		status: 200
	});

});


// @desc    Delete All post
// @route   DELETE /api/v1/post/:id
// @access  Private/Admin
exports.deletePost = asyncHandler(async (req, res, next) => {

	const post = await Post.findById(req.params.id);
	
	if(!post){
		return next(
			new ErrorResponse(
				`Not found`, 400, ['cannot find post']
			)
		);
	}

	const user = await User.findById(post.user);

	if(!user){
		return next(
			new ErrorResponse(
				`Not found`, 400, ['cannot find user who owns the post']
			)
		);
	}

	await Post.findByIdAndDelete(post._id);

	res.status(200).json({
		error: false,
		errors: [],
		data: null,
		message: `posts deleted successfully`,
		status: 200,
	});
});

