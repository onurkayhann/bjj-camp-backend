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

exports.remove = (req, res) => {
  let camp = req.camp;
  camp.remove((err) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.json({
      message: 'Camp is successfully deleted',
    });
  });
};

exports.update = (req, res) => {
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

    let camp = req.camp;
    camp = _.extend(camp, fields);

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

exports.list = (req, res) => {
  let order = req.query.order ? req.query.order : 'asc';
  let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  Camp.find()
    .select('-photo')
    .populate('category')
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, camps) => {
      if (err) {
        return res.status(400).json({
          error: 'Camp not found',
        });
      }
      res.json(camps);
    });
};

exports.listRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  Camp.find({ _id: { $ne: req.camp }, category: req.camp.category })
    .limit(limit)
    .populate('category', '_id name')
    .exec((err, camps) => {
      if (err) {
        return res.status(400).json({
          error: 'Camps not found',
        });
      }
      res.json(camps);
    });
};

exports.listCategories = (req, res) => {
  Camp.distinct('category', {}, (err, categories) => {
    if (err) {
      return res.status(400).json({
        error: 'Categories not found',
      });
    }
    res.json(categories);
  });
};
