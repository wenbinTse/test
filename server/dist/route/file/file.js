"use strict";
const express_1 = require("express");
const middle_ware_1 = require("../../shared/middle-ware");
const router = express_1.Router();
const file_1 = require("../../shared/file");
router.get('/:root/:id', middle_ware_1.checkObjectId, (req, res) => {
    file_1.default.download(res, req.params.root, req.params.id);
});
router.get('/:root/:id/:fileName', middle_ware_1.checkObjectId, (req, res) => {
    file_1.default.download(res, req.params.root, req.params.id, req.params.fileName);
});
module.exports = router;
//# sourceMappingURL=file.js.map