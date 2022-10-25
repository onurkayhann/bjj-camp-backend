const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const Camp = require('../models/camp');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.campById = (req, res, next, id) => {
  Camp.findById(id)
    .populate('category')
    .exec((err, camp) => {
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

exports.listBySearch = (req, res) => {
  let order = req.body.order ? req.body.order : 'desc';
  let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === 'price') {
        // gte -  greater than price [0-10]
        // lte - less than
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  Camp.find(findArgs)
    .select('-photo')
    .populate('category')
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: 'Camps not found',
        });
      }
      res.json({
        size: data.length,
        data,
      });
    });
};

exports.photo = (req, res, next) => {
  if (req.camp.photo.data) {
    res.set('Content-Type', req.camp.photo.contentType);
    return res.send(req.camp.photo.data);
  }
  next();
};

exports.listSearch = (req, res) => {
  const query = {};
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' };
    if (req.query.category && req.query.category != 'All') {
      query.category = req.query.category;
    }
    Camp.find(query, (err, camps) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(camps);
    }).select('-photo');
  }
};

exports.decreaseQuantity = (req, res, next) => {
  let bulkOptions = req.body.order.camps.map((item) => {
    return {
      updateOne: {
        filter: { _id: item._id },
        update: { $inc: { quantity: -item.count, booked: +item.count } },
      },
    };
  });

  Camp.bulkWrite(bulkOptions, {}, (error, camps) => {
    if (error) {
      return res.status(400).json({
        error: 'Could not update camp',
      });
    }
    next();
  });
};
