const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	name: {
		type: String,
		required: true,
		posts: [{
			type: Schema.Types.ObjectId,
			ref: 'Post'
		}]
	},
	posts: [String]
});

module.exports = mongoose.model('User', userSchema);