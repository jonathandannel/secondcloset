const mongoose = require('mongoose');
const CustomerBase = require('../customer');

// Override the base Customer object when a discriminator key/value pair is added to it
const flatDiscountSchema = {
  pricingDetails: {
    discountPercentage: {
      type: String,
      default: '10',
    },
  },
};

const largeItemSchema = {
  pricingDetails: {
    pricePerUnitVolume: {
      type: String,
      default: '1',
    },
  },
};

const valuableItemSchema = {
  pricingDetails: {
    percentOfTotalValue: {
      type: String,
      default: '5',
    },
  },
};

const bulkItemSchema = {
  pricingDetails: {
    discountFirstHundredItems: {
      type: String,
      default: '5',
    },
    discountNextHundredItems: {
      type: String,
      default: '5',
    },
    unitVolumeCharge: {
      type: String,
      default: '2',
    },
  },
};

const FlatDiscountCustomer = CustomerBase.discriminator(
  'flat_discount_plan',
  new mongoose.Schema(flatDiscountSchema)
);

const LargeItemCustomer = CustomerBase.discriminator(
  'large_item_plan',
  new mongoose.Schema(largeItemSchema)
);

const ValuableItemCustomer = CustomerBase.discriminator(
  'valuable_item_plan',
  new mongoose.Schema(valuableItemSchema)
);

const BulkItemCustomer = CustomerBase.discriminator(
  'bulk_item_plan',
  new mongoose.Schema(bulkItemSchema)
);

module.exports = {
  FlatDiscountCustomer,
  LargeItemCustomer,
  ValuableItemCustomer,
  BulkItemCustomer,
};
