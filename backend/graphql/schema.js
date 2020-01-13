const { buildSchema } = require('graphql');

module.exports = buildSchema(`
		type User {
			_id: String!
			name: String!
			posts: [String]
		}

		type Post {
			_id: String!
			title: String!
			author: User!
		}

    type RootQuery {
			users: [User!]!
			user(_id: String!): User!
			posts: [Post!]!
			postAuthor(id: String!): Post!
		}

		input UserInputType {
			name: String!
		}

		input PostInputType {
			title: String!
			author: ID!
		}

		type RootMutation {
			createUser(userInput: UserInputType): User!
			createPost(userId: ID!, postInput: PostInputType): Post!
		}
		
    schema {
			query: RootQuery
			mutation: RootMutation
    }
`);