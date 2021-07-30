const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const { config } = require('dotenv');

// load env vars and make it load the files
config();

// load models
const Role = require('./src/models/Role.model');
const User = require('./src/models/User.model');

const options = {
	useNewUrlParser: true,
	useCreateIndex: true,
	autoIndex: true,
	keepAlive: true,
	poolSize: 10,
	bufferMaxEntries: 0,
	connectTimeoutMS: 10000,
	socketTimeoutMS: 45000,
	family: 4, // Use IPv4, skip trying IPv6
	useFindAndModify: false,
	useUnifiedTopology: true,
};

// connect to DB
mongoose.connect(process.env.MONGODB_URI, options);

//Delete the data
const deleteData = async () => {
	try {
		await User.deleteMany();
		await Role.deleteMany();

		console.log('Data destroyed successfully...'.red.inverse);
		process.exit();
	} catch (err) {
		console.log(err);
	}
};

if (process.argv[2] === '-d') {
	deleteData();
}
