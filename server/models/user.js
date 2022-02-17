const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: Array, required: true},
    pin: {type: Array, required: true},
    buf: {type: Array, required: true},
    locked: {type: Boolean, default: false},
    verified: {type: Boolean, default: false},
    date: {type: Date, default: Date.now()}
});


const model = mongoose.model('User',UserSchema);

module.exports = model;