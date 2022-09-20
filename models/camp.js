const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const campSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    description: {
      type: String,
      required: true,
      maxlength: 3000,
    },
    price: {
      type: Number,
      trim: true,
      required: true,
      maxlength: 32,
    },
    category: {
      type: ObjectId,
      ref: 'Category',
      required: true,
    },
    quantity: {
      type: Number,
    },
    photo: {
      data: Buffer,
      contentType: String,
    },
    destination: {
      country: String,
      city: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Camp', campSchema);