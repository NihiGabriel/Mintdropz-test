const mongoose = require('mongoose');
const ErrorResponse = require('../utils/errorResponse.util');
const slugify = require('slugify');

const RoleSchema = new mongoose.Schema(
	{
		//
		name: {
			type: String,
			required: [true, 'Please add a role name'],
		},

		description: {
			type: String,
			required: [true, 'Please add a description'],
			maxlength: [100, 'Description cannot be more than 100 characters'],
		},

		slug: String,

		// many-to-many
		users: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'User',
			},
		],
	},

	{
		timestamps: true,
	}
);

// Create role slug from the name
RoleSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

RoleSchema.statics.findByName = function (roleName) {
	return this.findOne({ name: roleName });
};

RoleSchema.statics.getRoleName = function (roleId) {
	return this.findOne({ _id: roleId });
};

RoleSchema.statics.getAllRoles = function () {
	return this.find();
};

module.exports = mongoose.model('Role', RoleSchema);
