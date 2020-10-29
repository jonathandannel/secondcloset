const router = require('express').Router();
const CustomerBase = require('../../models/customer');
require('../../models/schemas/pricing');
const {
  clean,
  defaultCustomerPricing,
  isValidPlan,
  cleanResponse,
} = require('../../util');

// Create a new customer/pricing object
router.post('/create', async (req, res) => {
  const { customerId, basePrice, pricingPlan, pricingDetails } = req.body;
  const cleanId = clean(customerId);

  if (!cleanId) {
    return res.json({ error: 'A customer ID must be provided' });
  }
  // A non-default pricing plan can be specified
  // If not, just use the default A -> Flat pricing, B -> Large item, etc
  const newCustomer = new CustomerBase({
    customerId: cleanId,
    basePrice,
    pricingPlan: pricingPlan || defaultCustomerPricing[cleanId],
    pricingDetails,
  });

  if (!Object.keys(defaultCustomerPricing).includes(cleanId) && !pricingPlan) {
    return res.json({
      success: false,
      message:
        'A pricing plan must be supplied if customerId is not A, B, C, or D',
      result: null,
    });
  }

  if (pricingPlan && !isValidPlan(pricingPlan)) {
    return res.json({
      success: false,
      message: 'Specified pricing plan does not exist.',
      result: null,
    });
  }

  try {
    await newCustomer.save();
    res.json({
      success: true,
      message: 'Customer pricing created successfully',
      result: cleanResponse(newCustomer),
    });
  } catch (err) {
    if (CustomerBase.findOne({ customerId: cleanId })) {
      return res.status(500).json({
        success: false,
        message:
          'Customer pricing already exists. Try the /modify route instead.',
        result: null,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'An error occurred while saving new customer.',
        result: err,
      });
    }
  }
});

router.patch('/modify', async (req, res) => {
  const { customerId, basePrice, pricingPlan, pricingDetails } = req.body;
  const cleanId = clean(customerId);

  // Get non-empty fields
  const inputs = Object.entries({ basePrice, pricingPlan, pricingDetails })
    .filter((v) => v)
    .reduce((a, [k, v]) => {
      if (v && v !== {}) {
        a[k] = v;
      }
      return a;
    }, {});

  if (!cleanId) {
    return res.json({
      success: false,
      message: 'A customer ID must be provided',
      result: null,
    });
  }

  if (!Object.keys(inputs).length) {
    return res.json({
      success: false,
      message:
        'At least one modified input must be set. Which field(s) are you trying to change?',
      result: null,
    });
  }

  try {
    const query = { customerId: cleanId };
    if (inputs.pricingPlan && !isValidPlan(inputs.pricingPlan)) {
      return res.json({
        success: false,
        message: 'Specified pricing plan does not exist.',
        result: null,
      });
    }

    const customer =
      inputs.pricingPlan && isValidPlan(inputs.pricingPlan)
        ? await CustomerBase.findOneAndUpdate(
            query,
            {
              // Need to set pricing plan first so the discriminator works correctly
              $set: { pricingPlan: inputs.pricingPlan },
            },
            { new: true }
          )
        : await CustomerBase.findOne(query);

    // Set the rest of the fields
    for (const key in inputs) {
      customer[key] = inputs[key];
    }

    await customer.save();

    if (customer) {
      return res.json({
        success: true,
        message: 'Customer pricing plan updated successfully.',
        result: cleanResponse(customer),
      });
    } else {
      const existingCustomer = await CustomerBase.findOne(query);
      if (!existingCustomer) {
        return res.json({
          success: false,
          message: `Customer ${customerId} does not exist.`,
          result: null,
        });
      }
    }
  } catch (err) {
    return res.json({
      success: false,
      message: 'Customer update failed.',
      result: err,
    });
  }
});

router.get('/find', async (req, res) => {
  const { customerId } = req.body;
  if (!customerId) {
    return res.json({
      success: false,
      message: 'A customer ID must be provided',
      result: null,
    });
  }
  const cleanId = clean(customerId);
  try {
    const customer = await CustomerBase.findOne({ customerId: cleanId });
    if (customer) {
      return res.json({
        success: true,
        message: 'Customer found',
        result: cleanResponse(customer),
      });
    } else {
      return res.json({
        success: false,
        message: 'Customer not found',
        result: null,
      });
    }
  } catch (err) {
    return res.json({
      success: false,
      message: 'A customer ID must be provided',
      result: err,
    });
  }
});

module.exports = router;
