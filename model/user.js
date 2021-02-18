const mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    user_type: String,
});

module.exports = mongoose.model('user', userSchema);