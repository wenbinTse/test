"use strict";
const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    meeting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meeting'
    },
    content: { type: String, required: true },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    },
    createdDate: { type: Date, default: new Date() },
    admin: { type: Boolean, default: false },
    numOfReply: { type: Number, default: 0 }
});
module.exports = mongoose.model('Review', reviewSchema);
//# sourceMappingURL=review.js.map