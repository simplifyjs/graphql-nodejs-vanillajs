const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const graphqlExpress = require('express-graphql');
const graphResolver = require('./graphql/resolver');
const graphSchema = require('./graphql/schema');

const USER = '<MONGOOSE_USER>';
const PASSWORD = '<MONGOOSE_PASSWORD>';
const CLUSTER = '<MONGOOSE_CLUSTER>';
const DATABASE = '<DATABASE>';

app.use(cors());

app.use('/graphql', graphqlExpress({
	schema: graphSchema,
	rootValue: graphResolver,
	graphiql: true /** Set to TRUE to activate GraphQL debug */
}))

mongoose
	.connect(
		`mongodb+srv://${USER}:${PASSWORD}@${CLUSTER}/${DATABASE}`
		)
	.then(() => console.log('DB Connected'))
	.then(()=> {
		app.listen(4040, () => {
			console.log('Connected to 4040');
		});
	});
