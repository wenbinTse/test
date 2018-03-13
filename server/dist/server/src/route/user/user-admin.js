"use strict";
const express_1 = require("express");
const interface_1 = require("../../shared/interface");
const util_1 = require("../../shared/util");
const router = express_1.Router();
const User = require('../../models/user');
router.post('/add', (req, res) => {
    const name = req.body.name;
    const location = req.body.location;
    const gender = req.body.gender;
    if (!name || !location.address || !location.city || !location.province || !gender) {
        res.json({ code: interface_1.ResponseCode.INCOMPLETE_INPUT });
        return;
    }
    const user = new User({
        name,
        location,
        gender
    });
    user.save()
        .then((data) => res.json({
        code: interface_1.ResponseCode.SUCCESS,
        item: data
    }))
        .catch((err) => util_1.errHandler(err, res));
});
module.exports = router;
//# sourceMappingURL=user-admin.js.map