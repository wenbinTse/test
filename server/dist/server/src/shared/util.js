"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const interface_1 = require("./interface");
exports.errHandler = (err, res, msg) => {
    console.error(err);
    res.json({
        code: interface_1.ResponseCode.ERROR,
        msg
    });
};
//# sourceMappingURL=util.js.map