"use strict";
const mongoose = require("mongoose");
const meetingSchema = new mongoose.Schema({
    meeting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meeting',
        required: true
    }
});
module.exports = mongoose.model('FeaturedMeeting', meetingSchema);
//# sourceMappingURL=featured-meeting.js.map