const mongoose = require('mongoose');

const server = mongoose.model(
    "config",
    new mongoose.Schema({
        _id: String,
        channel: {
            suggestions: {
                type: String,
                default: null
            }
        },
    })
)

module.exports = server;