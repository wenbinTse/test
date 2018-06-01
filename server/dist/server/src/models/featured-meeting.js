"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const meetingSchema = new mongoose.Schema({
    meeting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meeting',
        required: true
    }
});
exports.FeaturedMeeting = mongoose.model('FeaturedMeeting', meetingSchema);
//# sourceMappingURL=featured-meeting.js.map