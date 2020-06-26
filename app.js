// Initiliazing express.js
const express = require("express");

const app = express();

// Homepage Route
app.get('/', (req, res) => {
    res.send("Welcome to the start.");
});

app.listen(3000);