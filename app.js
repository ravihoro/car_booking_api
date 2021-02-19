const express = require('express');
const fs = require('fs');
const mongodb = require('./connection');
const multer = require('multer');

var imageFileName;

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../uploads/')
    },
    filename: function(req, file, cb) {
        imageFileName = file.originalname;
        cb(null, file.originalname);
    },
});

const upload = multer({
    storage: storage,
});

const userModel = require('./model/user');
const carModel = require('./model/car');
const { response } = require('express');

const app = express();

app.use(express.json());

app.get("/", (req, res)=>{
    res.send("<h1>Connected</h1>");
});

app.post("/upload", upload.single('image') , (req, res, next) => {
    console.log(imageFileName);
    res.send("Image uploaded");
});

app.post("/login", (req, res) => {
    email = req.body.email;
    password = req.body.password;

    userModel.findOne({"email": email},(err, doc) => {
        if(err){
            res.status(500).send("Error getting user from database");
        }else{
            if(doc && doc.password == password) {
                res.status(200).json({"name": doc.name, "email" : doc.email, "password": doc.password, "user_type": doc.user_type});
            }else{
                res.status(401).send('Invalid Login');
            }
        }
    });
});

app.get("/getImage/:imageName", (req, res) => {
    var dir = __dirname.substr(0,40);
    var path = dir +"uploads\\" + req.params.imageName;
    res.sendFile(path);
    // fs.stat(path, (exists) => {
    //     if(exists){

    //     }else{
    //         response.status(400).send("File does not exist");
    //     }
    // });
});

app.get("/drivers/:name", (req, res) => {
    userModel.find({"name" : req.params.name, "user_type": "driver"}, (err, docs) => {
        if(err){
            res.send("Error fetching name");
        }else{
            res.send(docs);
        }
    });
});

app.get("/car_details/:email", (req, res) => {
    carModel.findOne({"email" : req.params.email}, (err, doc) => {
        if(err) {
            res.send("Error fetching name");
        }else{
            if(doc){
                res.status(200).send(doc);
            }else{
                res.status(204).send();
            }
            
        }
    });
});

app.post("/save_car_details", (req, res) => {
    email = req.body.email;
    carName = req.body.name;
    reg_no = req.body.reg_no;
    images = req.body.images;

    carModel.findOne({"email" : email}, (err, doc) => {
        if(err) {
            console.log(err);
            res.status(500).send("Error saving car details");
        }else{
            if(doc){
                console.log("Car details already exist for " + email);
                res.status(409).send("Car details already exist for " + email);
            }else{
                const car = new carModel();
                car.name = carName;
                car.email = email;
                car.reg_no = reg_no;
                car.images = images;
                car.save((err) => {
                    if(err){
                        console.log(err);
                        console.log("Car details saving failed.");
                        res.status(500).send("Car details saving failed.");
                    }else{
                        console.log("Car details saved.");
                        res.status(201).send("Car details saved.");
                    }
                });
            }
        }
    });

});

app.post("/signup",(req, res) => {
    username = req.body.name;
    user_type = req.body.user_type;
    email = req.body.email;
    password = req.body.password;

    userModel.findOne({"email" : email},(err, doc) => {
        if(err){
            res.status(500).send("Error signing up");
        }else{
            if(doc){
                res.status(409).send("User already exists");
            }else{
                const user = new userModel();
                user.name = username;
                user.email = email;
                user.user_type = user_type;
                user.password = password;
                user.save((err) => {
                    if(err){
                        res.status(500).send("Sign up unsuccessful.");
                    }else{
                        res.status(201).send("Sign up successful");
                    }
                }); 
            }
        }
    });

});

app.get("/users", (req, res) => {
    userModel.find((err, docs) => {
        if(err){
            res.send("Error getting users from database");
        }else{
            res.send(docs);
        }
    });
});

app.listen(3000,() => {
    console.log("Server listening at port: 3000");
});