const mongoose = require('mongoose');
const Item = require('./schemas/item');

const customerBaseOptions = {
  discriminatorKey: 'pricingPlan',
  collection: 'customers',
};

const CustomerBase = mongoose.model(
  'CustomerBase',
  new mongoose.Schema(
    {
      customerId: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
      },
      basePrice: {
        type: Number,
        default: 20,
      },
      items: [Item],
    },
    customerBaseOptions
  )
);

module.exports = CustomerBase;
