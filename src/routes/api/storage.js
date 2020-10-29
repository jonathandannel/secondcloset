const router = require('express').Router();
const CustomerBase = require('../../models/customer');
const {
  clean,
  cleanResponse,
  sumPrice,
  sumByVolume,
  sumBulkItems,
} = require('../../util');

router.post('/add', async (req, res) => {
  const { customerId, items } = req.body;
  if (items.length) {
    try {
      const customer = await CustomerBase.findOne({
        customerId: clean(customerId),
      });

      const newItems = items.map((v) => ({
        customer: customer.customerId,
        ...v,
      }));
      customer.items = [...customer.items].concat(newItems);

      await customer.save();

      return res.json({
        success: true,
        message: `${Object.entries(items).length} items added successfully`,
        result: customer.items.map(cleanResponse),
      });
    } catch (err) {
      return res.json({
        success: false,
        message: err,
        result: null,
      });
    }
  }
});

router.post('/remove', async (req, res) => {
  const { customerId, items } = req.body;
  const customer = await CustomerBase.findOne({
    customerId: clean(customerId),
  });

  if (!customer) {
    return res.send({
      success: false,
      message: 'Customer ID does not exist or is invalid',
      result: null,
    });
  }

  if (!customer.items || customer.items.length < 1) {
    return res.send({
      success: false,
      message: 'Customer does not have any items to remove',
      result: null,
    });
  }

  let removedCount = 0;

  for await (const item of items) {
    // Find the first index that matches the current item, because we allow duplicates
    const indexToRemove = customer.items.findIndex((ci) => {
      const match =
        ci.name === item.name &&
        ci.value == item.value &&
        ci.weight === item.weight &&
        ci.length === item.length &&
        ci.width === item.width;
      return match;
    });

    // Remove that item from the array
    customer.items = customer.items.reduce((a, e, i) => {
      if (i !== indexToRemove) {
        a.push(e);
      } else {
        removedCount++;
      }
      return a;
    }, []);

    try {
      await customer.save();
    } catch (err) {
      return res.json({
        success: false,
        message: 'Failed to save customer.',
        result: null,
      });
    }
  }

  return res.json({
    success: true,
    message: `${removedCount} items removed`,
    result: customer.items.map(cleanResponse),
  });
});

router.get('/items', async (req, res) => {
  const { customerId } = req.body;
  try {
    const customer = await CustomerBase.findOne({
      customerId: clean(customerId),
    });

    return res.json({
      success: true,
      message: `Fetched all ${customer.items.length} items successfully`,
      result: customer.items.map(cleanResponse),
    });
  } catch (err) {
    return res.json({
      success: false,
      message: err,
      result: null,
    });
  }
});

router.get('/quote', async (req, res) => {
  const { customerId } = req.body;
  const {
    items,
    basePrice,
    pricingPlan,
    pricingDetails,
  } = await CustomerBase.findOne({
    customerId: clean(customerId),
  });

  if (!items || !basePrice || !pricingPlan || !pricingDetails) {
    return res.json({
      success: false,
      error:
        'Quotes need non-empty item lists, a base price, pricing plan, and valid pricing details',
      result: null,
    });
  }
  let quote = basePrice;
  switch (pricingPlan) {
    case 'flat_discount_plan': {
      const sum = sumPrice(items);
      const decimalDiscount = pricingDetails.discountPercentage / 100;
      quote += sum - sum * decimalDiscount;
      break;
    }
    case 'large_item_plan': {
      quote += sumByVolume(items, pricingDetails.pricePerUnitVolume);
      break;
    }
    case 'valuable_item_plan': {
      const sum = sumPrice(items);
      const decimalDiscount = pricingDetails.percentOfTotalValue / 100;
      quote += sum - sum * decimalDiscount;
    }
    case 'bulk_item_plan': {
      quote += sumBulkItems(items, pricingDetails);
      break;
    }
    default: {
      break;
    }
  }

  return res.json({
    success: true,
    message: 'Quote calculated successfully',
    result: quote.toString(),
  });
});

module.exports = router;
