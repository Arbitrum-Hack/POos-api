
const express = require('express');
const config = require("config");
const bodyparser = require('body-parser');

const mongoose = require('mongoose');

const conFig = require('./configure');

const app = express();

const cloudinary = require('cloudinary').v2;

const productRoutes = require('./routes/product');

const registerRoutes = require('./routes/register');

const loginRoutes = require('./routes/login');

const cors = require('cors');

app.use(bodyparser.json())

// Configure CORS middleware to allow specific headers
app.use(cors({
    origin: ['http://localhost:3000'],
    allowedHeaders: ['Content-Type', 'x-auth-token'] // Add x-auth-token to the allowed headers
  }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
    res.setHeader('Access-Control-Allow-Headers', 'content-type', 'authorization');
    next();
})

cloudinary.config({
    cloud_name: conFig.cloud_name,
    api_key: conFig.apiKey,
    api_secret: conFig.apiSecret
  });

app.use("/api/register-user", registerRoutes);

app.use("/api/login", loginRoutes);

app.use("/api/products", productRoutes);

app.use((error, req, res, next) => {
    console.log("Error:",error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({message : message});
})
console.log("key:",config.get('jwtPrivateKey'))
mongoose.connect(conFig.mongoUri.toString())
.then(result => {
    app.listen(5000)
    console.log("successfully started")
})
.catch(
    err => {
        console.log(err);
    }
)



