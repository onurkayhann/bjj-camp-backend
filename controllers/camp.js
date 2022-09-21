const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const Camp = require('../models/camp');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: 'Image could not be uploaded',
      });
    }
    let camp = new Camp(fields);

    if (files.photo) {
      console.log('FILES PHOTO: ', files.photo);

      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: 'Image should be less than 1MB in size',
        });
      }
      camp.photo.data = fs.readFileSync(files.photo.filepath);
      camp.photo.contentType = files.photo.mimetype;
    }

    camp.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(result);
    });
  });
};
