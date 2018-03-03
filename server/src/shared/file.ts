import * as mongoose from 'mongoose';
import { Request, Response } from 'express';
import Config from './config';
const multer = require('multer');
const Grid = require('gridfs-stream');
const gfs = Grid(mongoose.connection.db, mongoose.mongo);
const GridFsStorage = require('multer-gridfs-storage');

import * as path from 'path';
import { ResponseCode } from '../shared/interface';

export default {
  upload: (req: any, res: Response, root: string, callback: (err: any, id: string) => void) => {

    const storage = new GridFsStorage ({
      url: Config.dbUrl,
      file: () => ({
        bucketName: root
      })
    });

    const upload = multer({storage}).any();

    upload(req, res, (err: any) => {
      if (err) {
        callback(err, '');
        return;
      }
      if (!req.files) {
        callback('files not found', '');
        return;
      }
      const id: string = req.files[0].id.toString();
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
  delete: function(
    res: Response, root: string, id: string, callback: (err: any) => void) {
    if (id === undefined || id === null || !mongoose.Types.ObjectId.isValid(id)) {
      callback('ObjectId not valid');
      return;
    }
    const _id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(id);
    gfs.remove({ _id: _id, root: root }, function(err: any) {
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
  download: function(res: Response, root: string, id: string, fileName?: string) {
    if (id === undefined || id === null || !mongoose.Types.ObjectId.isValid(id)) {
      res.json({
        code: ResponseCode.ERROR,
        message: 'ObjectId not valid'
      });
      return;
    }
    const _id: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(id);
    gfs.findOne({ _id: _id, root: root }, function(err: any, file: any) {
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
      readstream.on('error', function(err: any) {
        res.status(400).send(err);
        return;
      });
      readstream.pipe(res);
    });
  }
};
