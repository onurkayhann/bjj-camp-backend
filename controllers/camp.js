const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const Camp = require('../models/camp');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.campById = (req, res, next, id) => {
  Camp.findById(id).exec((err, camp) => {
    if (err || !camp) {
      return res.status(400).json({
        error: 'Camp not found',
      });
    }
    req.camp = camp;
    next();
  });
};

// photo is set to undefined because it can cause loading problems
// photo request will be later on, in a different way
exports.read = (req, res) => {
  req.camp.photo = undefined;
  return res.json(req.camp);
};

exports.create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: 'Image could not be uploaded',
      });
    }

    // check for all fields
    const { name, description, price, category, beltcolor, quantity } = fields;

    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !beltcolor ||
      !quantity
    ) {
      return res.status(400).json({
        error: 'All fields are required',
      });
    }

    let camp = new Camp(fields);

    // 1kb = 1000
    // 1mb = 1000000

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
