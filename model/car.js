const mongoose = require('mongoose');

var carSchema = new mongoose.Schema({
    email: String,
    name: String,
    reg_no: String,
    images: [String]
});

module.exports = mongoose.model('car', carSchema);