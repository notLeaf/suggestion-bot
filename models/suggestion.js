const mongoose = require('mongoose');

const suggestions = mongoose.model(
    "suggestions",
    new mongoose.Schema({
        _id: String,
        messageId: String,
        votes: {
            up: {
                type: Number,
                default: 0
            },
            down: {
                type: Number,
                default: 0
            }
        },
        answers: Array,
        status: {
            mode: {
                type: String,
                default: 'Pending'
            },
            reason: {
                type: String,
                default: null
            }
        }
    })
)

module.exports = suggestions;