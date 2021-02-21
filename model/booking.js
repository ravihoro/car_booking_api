const mongoose = require('mongoose');

var bookingSchema = new mongoose.Schema({
    email: String,
    customer_name: String,
    customer_email: String,
    origin: String,
    destination: String,
    status: String,
    date: Date,
});

module.exports = mongoose.model('booking', bookingSchema);