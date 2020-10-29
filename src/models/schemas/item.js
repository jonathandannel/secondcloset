const mongoose = require('mongoose');

const Item = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  length: {
    type: String,
    required: true,
  },
  width: {
    type: String,
    required: true,
  },
  height: {
    type: String,
    required: true,
  },
  weight: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});

module.exports = Item;
