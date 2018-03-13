"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interface_1 = require("./interface");
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
//# sourceMappingURL=middle-ware.js.map