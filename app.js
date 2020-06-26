// Initiliazing express.js
const express = require("express");
const morgan = require("morgan");

const app = express();

// Bring in routes
const postRoutes = require('./routes/post');

// Middleware
app.use(morgan("dev"));

// Homepage Route
app.use('/', postRoutes);

// Listening to port
const port = 8080;
app.listen(port, () => {
    console.log(`A Node.js API is litening on port ${port}`)
});