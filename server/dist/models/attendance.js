"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const interface_1 = require("../shared/interface");
const attendanceSchema = new mongoose.Schema({
    meeting: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meeting',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    taxPayerId: {
        type: String
    },
    invoiceTitle: {
        type: String
    },
    phone: {
        type: String
    },
    forecastArriveTime: {
        type: String
    },
    stayType: { type: String },
    stayDates: { type: [Date] },
    remarks: { type: String },
    status: { type: interface_1.AttendanceStatus, default: interface_1.AttendanceStatus.PENDING },
    checkedIn: { type: Boolean, default: false },
    createdDate: { type: Date, default: new Date() }
});
attendanceSchema.index({ meeting: 1, user: 1 }, { unique: true });
exports.Attendance = mongoose.model('Attendance', attendanceSchema);
//# sourceMappingURL=attendance.js.map