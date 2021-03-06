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
const bookingModel = require('./model/booking');

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

app.get("/driver_bookings_date/:email/:date", (req, res) => {
    var date = new Date(req.params.date);
    bookingModel.find({"email": req.params.email,"date": {$gt:date}, "status":"accepted"},{'date' : 1}, (err,docs) => {
        if(err){
            res.send(err);
        }else{
            res.send(docs);
        }
    });
});



app.get("/driver_bookings/:email/:status/:date?", (req, res) => {
    if(req.params.date){
        var date = new Date(req.params.date);
        bookingModel.find({"email": req.params.email,"status" : req.params.status,"date": {$gt:date}}, (err,docs) => {
            if(err){
                res.send(err);
            }else{
                res.send(docs);
            }
        }).sort("date");
    }else{
        bookingModel.find({"email": req.params.email, "status" : req.params.status}, (err, docs) => {
            if(err){
                res.send(err);
            }else{
                res.send(docs);
            }
        }).sort("date").limit(10);
    }
    
});

app.get("/customer_bookings/:customerEmail/:status/:date?", (req, res) => {
    if(req.params.date){
        var date = new Date(req.params.date);
        bookingModel.find({"customer_email": req.params.customerEmail,"status" : req.params.status,"date": {$gt:date}}, (err,docs) => {
            if(err){
                res.send(err);
            }else{
                res.send(docs);
            }
        }).sort("date");
    }else{
        bookingModel.find({"customer_email": req.params.customerEmail, "status" : req.params.status}, (err, docs) => {
            if(err){
                res.send(err);
            }else{
                res.send(docs);
            }
        }).sort("date").limit(10);
    }
    
});

app.put('/update_booking_status', async (req, res) => {
    var email = req.body.email;
    var customer_email = req.body.customer_email;
    var date = req.body.date;
    var status = req.body.status;
    const booking = await bookingModel.findOne({'email': email, 'customer_email': customer_email, 'date': date});
    booking.status = status;
    booking.save((err) => {
        if(err) {
            res.send("Error updating value");
        }
    });
    if(status == 'accepted'){
        console.log("rejecting others");
        bookingModel.updateMany({'email': email,'date': date, 'status': 'unknown'},{'status':'rejected'},(err, docs) =>{
            if(err){
                res.send("Error");
            }
        });
    }
    res.status(200).send("Successful");
});

app.post("/driver_bookings", (req, res) => {
    const booking = new bookingModel();
    booking.email = req.body.email;
    booking.customer_name = req.body.customer_name;
    booking.customer_email = req.body.customer_email;
    booking.origin = req.body.origin;
    booking.destination = req.body.destination;
    booking.status = req.body.status;
    booking.date = req.body.date;
    booking.save((err) => {
        if(err){
            res.send(err);
        }else{
            res.send("Saved");
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

app.post("/make_booking", (req, res) => {
    console.log("Booking function called");
    var email = req.body.email;
    var name = req.body.name;
    var customer_email = req.body.customer_email;
    var customer_name = req.body.customer_name;
    var origin = req.body.origin;
    var destination = req.body.destination;
    var status = req.body.status;
    var date = req.body.date;
    var date1 = new Date(date);
    date1 = date1.toISOString();

    bookingModel.findOne({"email" : email, "customer_email": customer_email, "date" : date}, (err, doc) => {
        if(err) {
            console.log(err);
            res.status(500).send("Error saving car details");
        }else{
            if(doc){
                console.log("Duplicate booking for same date.");
                res.status(409).send("Duplicate booking for same date.");
            }else{
                const booking = new bookingModel();
                booking.email = email;
                booking.name = name;
                booking.customer_email = customer_email;
                booking.customer_name = customer_name;
                booking.origin = origin;
                booking.destination = destination;
                booking.status = status;
                booking.date = date;
                booking.save((err) => {
                    if(err){
                        console.log(err);
                        console.log("Booking failed.");
                        res.status(500).send("Booking failed.");
                    }else{
                        console.log("Booking made.");
                        res.status(201).send("Booking made.");
                    }
                });
            }
        }
    });

});

app.delete("/delete_booking/:email/:customerEmail/:date/:status", (req, res) => {
    bookingModel.deleteOne({'email': req.params.email, 'customer_email': req.params.customerEmail, 'date': req.params.date, 'status' : req.params.status}, (err) => {
        if(err){
            res.send('Error deleting');
        }else{
            res.status(200).send('Deletion successful');
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