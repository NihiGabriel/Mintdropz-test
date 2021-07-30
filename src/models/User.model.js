const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
		},

		email: {
			type: String,
			required: [true, 'email is required'],
			unique: [true, 'Email already exist'],
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				'a valid email is required',
			],
		},

		photo: {
			type: String,
			default: 'no-photo.jpg'
		},

		password: {
			type: String,
			required: [true, 'password is required'],
			minlength: 8,
			select: false,
			match: [
				/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/,
				'Password must contain at least 8 characters, 1 lowercase letter, 1 uppercase letter, 1 special character and 1 number',
			],
			
		},

		// many-to-many : required
		roles: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'Role',
				required: true,
			},
		],

		superUser: {
			type: Boolean,
			default: false
		},

		posts: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'Post', 
			}
		]

	},
	{
		timestamps: true,
	}
);

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
	if (!this.isModified('password')) {
		return next();
	}

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

// Match user password
UserSchema.methods.matchPassword = async function (pass) {
	return await bcrypt.compare(pass, this.password);
};

//Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
	// Generate token
	const resetToken = crypto.randomBytes(20).toString('hex');

	// Hash the token and set to resetPasswordToken field
	this.resetPasswordToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	// Set expire
	this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

	return resetToken;
};



// Find out if user has a role
UserSchema.methods.hasRole = (role, roles) => {
	let flag = false;
	for (let i = 0; i < roles.length; i++) {
		if (roles[i].toString() === role.toString()) {
			flag = true;
			break;
		}
	}

	return flag;
};

UserSchema.methods.findByEmail = (email) => {
	return this.findOne({ email: email });
};

module.exports = mongoose.model('User', UserSchema);
