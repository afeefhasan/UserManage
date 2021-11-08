const mongoose = require('mongoose');

let UsersSchemas = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: { 
        type: String,
        required: true
    },
});
module.exports = mongoose.model('users', UsersSchemas);