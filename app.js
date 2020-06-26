// Requiring npm packages
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose")
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const expressValidator = require('express-validator');

// Initilize packages
const app = express();
dotenv.config();

// DB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('DB Connected'));
mongoose.connection.on('error', err =>{
    console.log(`DB Connection Error: ${err.message}`);
});

// Bring in routes
const postRoutes = require('./routes/post');

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(expressValidator());
app.use('/', postRoutes);

// Listening to port
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`A Node.js API is litening on port ${port}`)
});