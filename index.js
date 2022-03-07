const mongoose = require("mongoose");
const express = require("express");
const config = require("./config")
var bodyParser = require('body-parser');
var app = express();


app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));
app.use('/api', require('./routes/api'))

var mongoDB = process.env.MONGODB_URL || `mongodb://${config.SECRETS.MONGODB_IP}/${config.SECRETS.MONGO_DB_NAME}`
var port = process.env.PORT|| 8000
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true},()=>{
    console.log("Connected to Database")
    app.listen((port), function () {
        console.log(`StockBroker app listening at http://localhost:${port}`)
    })
},(err)=>{
    console.log(err.message)
});
var db = mongoose.connection;
db.once("open", async function() {
    console.log("MongoDB database connection established successfully");
    
  });
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('success', console.error.bind(console, 'MongoDB connection success:'));

