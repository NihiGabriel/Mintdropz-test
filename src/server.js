const path = require('path');
const express = require('express');
const { config } = require('dotenv');
const colors = require('colors');
const asyncify = require('express-asyncify');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const expressSanitize = require('express-mongo-sanitize');
const bodyParser = require('body-parser');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

// seeder 
const { seedData } = require('./config/seeds/seeder.seed');

// files
const errorHandler = require('./middleware/error.mw');
const connectDB = require('./config/db');

//load the config file
// dotenv.config({ path: './config/.env' });
config();

// connect to db
connectDB();


// route files
const v1Routers = require('./routes/v1/routes.router');


const app = express();

//set the view engine
app.set('view engine', 'ejs');

// cookie parser
app.use(cookieParser());

// body parser
app.use(express.json({limit: '65mb'}));
app.use(express.urlencoded({limit: '65mb', extended: false }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// parse various different custom JSON types as JSON
app.use(bodyParser.json({ type: 'application/*+json' }));


// File upload  :set the options
app.use(fileupload({useTempFiles: true, tempFileDir: path.join(__dirname,'tmp')}));

const upload = multer({ dest: 'tmp/csv/' });

// Sanitize data
// Secure db against SQL injection
app.use(expressSanitize());

// Prevent cross-site scripting attacks
app.use(xss());


// Prevent http parameter pollution
app.use(hpp());

// Enable CORS
// Communicate with API on multiple domains
app.use(cors());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));


//Mount Routers
app.get('/', (req, res, next) => {

	res.status(200).json({
		status: 'success',
		data: {
			name: 'hwcn api',
			version: '0.1.0'
		}
	})
	
})
app.use(`/api/v1`, v1Routers);


// error handler must be after you mount routers
app.use(errorHandler);

// seed data
seedData();

const PORT = process.env.PORT || 5000;

const server = app.listen(
	PORT,
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
	)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.message}`.red.bold);
	server.close(() => process.exit(1));
});