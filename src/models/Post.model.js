const mongoose = require('mongoose');
const slugify = require('slugify');

const PostSchema = new mongoose.Schema(
    {
        photo: {
			type: String,
            default: 'no-photo.jpg'
		},

        title: {
            type: String,
            required: false
        },

        description: {
            type: String,
            required: false
        },

        slug: String, 

        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User', 
        }
    },

    {
        timestamps: true
    }
);

PostSchema.methods.findByUser = (id) => {
	return this.findOne({ user: id });
};

module.exports = mongoose.model('Post', PostSchema);