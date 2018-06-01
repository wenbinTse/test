"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const config_1 = require("./config");
const multer = require('multer');
const Grid = require('gridfs-stream');
const gfs = Grid(mongoose.connection.db, mongoose.mongo);
const GridFsStorage = require('multer-gridfs-storage');
const interface_1 = require("../shared/interface");
exports.default = {
    upload: (req, res, root, callback) => {
        const storage = new GridFsStorage({
            url: config_1.default.dbUrl,
            file: () => ({
                bucketName: root
            })
        });
        const upload = multer({ storage }).any();
        upload(req, res, (err) => {
            if (err) {
                callback(err, '');
                return;
            }
            if (!req.files) {
                callback('files not found', '');
                return;
            }
            const id = req.files[0].id.toString();
            callback(null, id);
        });
    },
    /**
     * Deletes an image from GridFS collection.
     * @params res HTML response
     * @params root collection name of GridFs
     * @params id ObjectId string of the file
     * @params callback callback function
     */
    delete: function (res, root, id, callback) {
        if (id === undefined || id === null || !mongoose.Types.ObjectId.isValid(id)) {
            callback('ObjectId not valid');
            return;
        }
        const _id = new mongoose.Types.ObjectId(id);
        gfs.remove({ _id: _id, root: root }, function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null);
        });
    },
    /**
     * Downloads a file from GridFS collection.
     * @params res HTML response
     * @params root collection name of GridFs
     * @params id ObjectId string of the file
     */
    download: function (res, root, id, fileName) {
        if (id === undefined || id === null || !mongoose.Types.ObjectId.isValid(id)) {
            res.json({
                code: interface_1.ResponseCode.ERROR,
                message: 'ObjectId not valid'
            });
            return;
        }
        const _id = new mongoose.Types.ObjectId(id);
        gfs.findOne({ _id: _id, root: root }, function (err, file) {
            if (err) {
                res.status(400).send(err);
                return;
            }
            if (!file) {
                res.status(404).send('');
                return;
            }
            res.set('Content-Type', file.contentType);
            res.set('Content-Disposition', 'attachment; filename="' + fileName ? fileName : file.filename + '"');
            const readstream = gfs.createReadStream({
                _id: file._id,
                root: root
            });
            readstream.on('error', function (err) {
                res.status(400).send(err);
                return;
            });
            readstream.pipe(res);
        });
    }
};
//# sourceMappingURL=file.js.map