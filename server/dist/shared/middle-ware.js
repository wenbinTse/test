"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interface_1 = require("./interface");
const meeting_1 = require("../models/meeting");
const mongoose = require("mongoose");
exports.checkObjectId = (req, res, next) => {
    const id = req.params.id;
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
        res.json({ code: interface_1.ResponseCode.FIND_NOTHING });
    }
    else {
        next();
    }
};
exports.checkLogin = (req, res, next) => {
    const session = req.session;
    if (!session || !session.user) {
        res.json({ code: interface_1.ResponseCode.UNLOGIN });
    }
    else {
        next();
    }
};
exports.checkAdmin = (req, res, next) => {
    const session = req.session;
    const user = session.user;
    if (user.userType !== interface_1.UserType.ADMIN) {
        res.json({ code: interface_1.ResponseCode.ACCESS_DENIED });
    }
    else {
        next();
    }
};
exports.checkMeetingAdmin = (req, res, next) => {
    const session = req.session;
    const user = session.user;
    meeting_1.Meeting.findById(req.params.id, 'owner').exec()
        .then((doc) => {
        if (doc.owner.toString() !== user._id.toString()) {
            res.json({ code: interface_1.ResponseCode.ACCESS_DENIED });
        }
        else {
            next();
        }
    });
};
//# sourceMappingURL=middle-ware.js.map