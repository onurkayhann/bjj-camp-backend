const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;

const CartItemSchema = new mongoose.Schema(
  {
    camp: { type: ObjectId, ref: 'Camp' },
    name: String,
    price: Number,
    count: Number,
  },
  { timestamps: true }
);

const CartItem = mongoose.model('CartItem', CartItemSchema);

const OrderSchema = new mongoose.Schema(
  {
    camps: [CartItemSchema],
    transaction_id: {},
    amount: { type: Number },
    address: String,
    status: {
      type: String,
      default: 'Not processed',
      enum: ['Not processed', 'Processing', 'Booked', 'Confirmed', 'Cancelled'], // enum means string objects
    },
    updated: Date,
    user: { type: ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', OrderSchema);

module.exports = { Order, CartItem };
