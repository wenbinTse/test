"use strict";
const interface_1 = require("../shared/interface");
const mongoose = require("mongoose");
const meetingSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
        ref: 'User'
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    detail: { type: String, trim: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    images: { type: [mongoose.Schema.Types.ObjectId] },
    files: { type: [{
                id: mongoose.Schema.Types.ObjectId,
                name: String,
                fileType: String,
                size: Number
            }] },
    location: {
        type: {
            province: String,
            city: String,
            address: String
        }
    },
    guests: {
        type: [{
                name: String,
                description: String
            }]
    },
    status: {
        type: interface_1.Status,
        default: interface_1.Status.ACTIVE
    },
    createdDate: { type: Date, default: new Date() },
    stayTypes: { type: [String], default: [] },
    checkedIn: { type: Boolean, default: false }
});
module.exports = mongoose.model('Meeting', meetingSchema);
//# sourceMappingURL=meeting.js.map