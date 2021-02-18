const mongoose = require('mongoose');

var imageSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('image', imageSchema);