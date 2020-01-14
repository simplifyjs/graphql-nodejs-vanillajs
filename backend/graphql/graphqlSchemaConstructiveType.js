const {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLNonNull,
	GraphQLString,
	GraphQLList,
	GraphQLInputObjectType,
	GraphQLID
} = require("graphql");

const Post = require("../models/post");
const User = require("../models/user");

const UserType = new GraphQLObjectType({
	name: "UserType",
	fields: () => ({
		_id: { type: new GraphQLNonNull(GraphQLString) },
		name: { type: GraphQLString },
		posts: { type: new GraphQLList(GraphQLString) }
	})
});

const PostType = new GraphQLObjectType({
	name: "PostType",
	fields: () => ({
		_id: { type: new GraphQLNonNull(GraphQLString) },
		title: { type: new GraphQLNonNull(GraphQLString) },
		author: { type: new GraphQLNonNull(UserType) }
	})
});

const rootQuery = new GraphQLObjectType({
	name: "RootQuery",
	fields: {
		users: {
			type: new GraphQLList(new GraphQLNonNull(UserType)),
			resolve: async () => {
				const users = await User.find();
				return users.map(user => {
					return {
						...user._doc,
						_id: user._id.toString()
					};
				});
			}
		},
		user: {
			type: new GraphQLNonNull(UserType),
			args: {
				_id: { type: GraphQLString }
			},
			resolve: async (data, { input }) => {
				const newUserInfo = {
					name: data.name,
					posts: data.posts
				};
				const user = await User.findOneAndUpdate(
					{ _id: data._id },
					newUserInfo
				);

				return {
					...user._doc,
					_id: user._id.toString()
				};
			}
		},
		posts: {
			type: new GraphQLList(new GraphQLNonNull(PostType)),
			resolve: async () => {
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
			}
		},
		postAuthor: {
			type: PostType,
			args: {
				id: { type: GraphQLString }
			},
			resolve: async (parent, data) => {
				const post = await Post.findById(data.id).populate("author");
				if (!post) {
					throw new Error("Author does not exist");
				}

				return {
					...post._doc,
					_id: post._id.toString()
				};
			}
		}
	}
});

const userInput = new GraphQLInputObjectType({
	name: "UserInputType",
	fields: {
		name: { type: new GraphQLNonNull(GraphQLString) }
	}
});

const postInput = new GraphQLInputObjectType({
	name: "PostInputType",
	fields: {
		title: { type: new GraphQLNonNull(GraphQLString) },
		author: { type: new GraphQLNonNull(GraphQLID) }
	}
});

const rootMutation = new GraphQLObjectType({
	name: "Mutation",
	fields: () => ({
		createUser: {
			type: UserType,
			args: {
				userInput: { type: userInput }
			},
			resolve: async(parent, { userInput }) => {
				const existingUser = User.findOne({name: userInput.name});
				if(!existingUser) {
					const err = new Error('User already exist');
					throw err;
				}
		
				const user = new User({name: userInput.name, posts: []});
				const newUser = await user.save();

				return { ...newUser._doc, _id: newUser._id.toString()}
			}
		},
		createPost: {
			type: PostType,
			args: {
				userId: { type: GraphQLID },
				postInput: { type: postInput }
			},
			resolve: async(parent, {userId, postInput}) => {
				const existingUser = await User.findById(userId);

				const isAuthorExist = existingUser.posts.includes(postInput.title);
				if(isAuthorExist) {
					const err = new Error('User already exist');
					throw err;
				}
				existingUser.posts.push(postInput.title);
				await existingUser.save();
		
				let newPost = new Post({
					title: postInput.title,
					author: existingUser._id,
				});
			
				await newPost.save();
				const newPostPopulate = await Post.findById(newPost._id.toString()).populate('author')
		
				return {...newPostPopulate._doc, _id: newPostPopulate._id.toString()}
			}
		}
	})
});

const schemaType = new GraphQLSchema({
	query: rootQuery,
	mutation: rootMutation
});

module.exports = schemaType;
