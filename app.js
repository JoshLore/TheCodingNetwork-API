// Requiring npm packages
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose')
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const expressValidator = require('express-validator');
const fs = require('fs');

// Initilize packages
const app = express();
dotenv.config();

// DB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log('DB Connected'));
    
mongoose.connection.on('error', err =>{
    console.log(`DB Connection Error: ${err.message}`);
});

// Bring in routes
const postRoutes = require('./routes/post');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// apiDocs
app.get('/', (req, res) => {
    fs.readFile('docs/apiDocs.json', (err, data) => {

        // Error handling
        if(err) {
            res.status(400).json({
                error: err
            });
        }

        // Show API Documentation
        const docs = JSON.parse(data);
        res.json(docs);
    })
});

// Middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());
app.use('/', postRoutes);
app.use('/', authRoutes);
app.use('/', userRoutes);
app.use(function(err, req, res, next) {
    if(err.name === "UnauthorizedError") {
        res.status(401).json({ error: "Unauthorized user. Please login." });
    }
})

// Listening to port
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`TheCodingNetwork API is litening on port ${port}`)
});