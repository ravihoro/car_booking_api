const express = require('express');

const mongodb = require('./connection');
const user = require('./model/user');

const userModel = require('./model/user');

const app = express();

app.use(express.json());

app.get("/", (req, res)=>{
    res.send("<h1>Connected</h1>");
});

app.post("/login", (req, res) => {
    email = req.body.email;
    password = req.body.password;

    userModel.findOne({"email": email},(err, doc) => {
        if(err){
            res.status(500).send("Error getting user from database");
        }else{
            if(doc && doc.password == password) {
                res.status(200).json({"name": doc.name, "email" : doc.email, "password": doc.password});
            }else{
                res.status(401).send('Invalid Login');
            }
        }
    });
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

app.post("/signup",(req, res) => {
    username = req.body.name;
    email = req.body.email;
    password = req.body.password;

    // console.log(username);
    // console.log(email);
    // console.log(password);

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