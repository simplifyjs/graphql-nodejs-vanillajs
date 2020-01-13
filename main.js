/**
 *  Onload query fetch users and posts values
 */ 
let select = document.getElementById('user-select');
queryFetch(`
	query {
		users {
			_id
			name
			posts
		}
		posts {
			_id
			title
		}
	}
`)
.then(data => {
	if(!data.users) return;
	data.users.forEach(user => {
		const option = document.createElement('option');
		option.setAttribute('value', user._id);
		option.textContent = user.name;
		select.appendChild(option);
	});
	
	if(data.users && data.posts) {

		data.posts.forEach(post => {
			const option = document.createElement('option');
			option.setAttribute('value', post._id);
			option.textContent = post.title;
			postSelect.appendChild(option);
		})
	}
})

/**
 *  Add user
 */ 
let addUserBtn = document.getElementById('add-user-btn');
let addUserInput = document.getElementById('add-user');

addUserBtn.addEventListener('click', e => {
	const userName = addUserInput.value;
	queryFetch(`
		mutation addUser($userInput: UserInputType!){
			createUser(userInput: $userInput ) {
				name
			}
		}
	`, {userInput: {name: userName}})
	.then(res => alert(`New user created: ${userName}`))
})

/**
 *  Add post and update user post data
 */ 
let addPostBtn = document.getElementById('add-post-btn');
let addPostInput = document.getElementById('add-post');

addPostBtn.addEventListener('click', e => {
	const selectedUserId = select.value;
	const newPost = addPostInput.value;
	if(!selectedUserId || !newPost) {
		alert('Please select user and add post title');
	}

	queryFetch(`
		mutation addPostToUser($userId: ID!, $postInput: PostInputType!){
			createPost(userId: $userId, postInput: $postInput) {
				title
				author {
					name
				}
			}
		}
	`, {
		"userId": selectedUserId,
		"postInput": {
			"title": newPost,
			"author": selectedUserId 
		}
	})
	.then(data =>  alert('data have been updated', data));
})

/**
 *  Fetch author per post selection
 */ 
let postSelect = document.getElementById('get-post');
let authorDiv = document.getElementById('user-result');

postSelect.addEventListener('change', e => {
	queryFetch(`
		query getAuthor($id: String!){
			postAuthor(id: $id) {
				_id
				title
				author {
					_id
					name
				}
			}
		}
	`, {"id": e.target.value})
	.then(data => {
		authorDiv.innerHTML = '';
		if(!data && !data.author) return;

		let innerDiv = document.createElement('div');
		innerDiv.textContent = data.postAuthor.author.name;
		authorDiv.appendChild(innerDiv);
	})
})	


/**
 *  Fetch graphql endpoint
 */ 
function queryFetch(query, variables) {
	return fetch('<BACKEND_ENDPONT>', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			query: query, 
			variables: variables
		})
	})
	.then(data => data.json())
	.then(res => res.data)
	.catch(err => console.log('Error: ', err))
}
