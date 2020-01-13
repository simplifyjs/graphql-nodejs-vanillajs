const Post = require("../models/post");
const User = require("../models/user");

module.exports = {
	/**
	 * Query all users
	 */
	users: async () => {
		const users = await User.find();
		return users.map(user => {
			return {
				...user._doc,
				_id: user._id.toString()
			};
		});
	},

	/**
	 * Get specific user
	 */
	user: async data => {
		const newUserInfo = {
			name: data.name,
			posts: data.posts
		};
		const user = await User.findOneAndUpdate({ _id: data._id }, newUserInfo);

		return {
			...user._doc,
			_id: user._id.toString()
		};
	},

	/**
	 * Query all posts
	 */
	posts: async () => {
		const posts = await Post.find();
		if (!posts.length) {
			return [];
		}

		return posts.map(post => {
			return {
				...post._doc,
				_id: post._id.toString()
			};
		});
	},

	/**
	 * Get post author
	 */
	postAuthor: async data => {
		const post = await Post.findById(data.id).populate("author");
		if (!post) {
			throw new Error("Author does not exist");
		}
		return {
			...post._doc,
			_id: post._id.toString()
		};
	},

	/**
	 * Create new user
	 */
	createUser: async ({ userInput }, req) => {
		const existingUser = User.findOne({ name: userInput.name });
		if (!existingUser) {
			const err = new Error("User already exist");
			throw err;
		}

		const user = new User({ name: userInput.name, posts: [] });
		const newUser = await user.save();
		return { ...newUser._doc, _id: newUser._id.toString() };
	},

	/**
	 * Create new post and update user post list
	 */
	createPost: async ({ userId, postInput }, req) => {
		const existingUser = await User.findById(userId);

		const isAuthorExist = existingUser.posts.includes(postInput.title);
		if (isAuthorExist) {
			const err = new Error("User already exist");
			throw err;
		}
		existingUser.posts.push(postInput.title);
		await existingUser.save();

		let newPost = new Post({
			title: postInput.title,
			author: existingUser._id
		});

		await newPost.save();
		const newPostPopulate = await Post.findById(
			newPost._id.toString()
		).populate("author");

		return { 
			...newPostPopulate._doc, 
			_id: newPostPopulate._id.toString() 
		};
	}
};
