const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/developer', {useNewUrlParser: true}, (err) => {
    if(!err){
        console.log("Connected to database");
    }else{
        console.log("Error connecting to database");
    }
});