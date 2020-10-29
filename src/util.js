const defaultCustomerPricing = {
  a: 'flat_discount_plan',
  b: 'large_item_plan',
  c: 'valuable_item_plan',
  d: 'bulk_item_plan',
};

const isValidPlan = (p) => Object.values(defaultCustomerPricing).includes(p);

const clean = (s) => s.trim().toLowerCase();

const sumPrice = (items) => {
  return items.reduce((a, e) => {
    const price = Number(e.value);
    return (a += price);
  }, 0);
};

const sumByVolume = (items, pricePerVolume) => {
  return items.reduce((a, e) => {
    const dimensions = [e.length, e.width, e.height].map((v) => Number(v));
    const volume = dimensions.reduce((a, e) => a * e);
    const price = volume * pricePerVolume;
    return (a += price);
  }, 0);
};

const sumBulkItems = (items, pricingDetails) => {
  const {
    discountFirstHundredItems,
    discountNextHundredItems,
    unitVolumeCharge,
  } = pricingDetails;

  const first = sumPrice(items.slice(0, 100));
  const second = sumPrice(items.slice(100, 200));
  const last = items.slice(200);
  const firstWithDiscount = Math.ceil(
    first - first * (discountFirstHundredItems / 100)
  );
  const secondWithDiscount = Math.ceil(
    second - second * (discountNextHundredItems / 100)
  );
  const priceLast = sumByVolume(last, unitVolumeCharge);
  return firstWithDiscount + secondWithDiscount + priceLast;
};

const cleanResponse = (r) => {
  const clean = r.toObject();
  if (clean._id) {
    delete clean._id;
  }

  if (clean.__v) {
    delete clean.__v;
  }
  return clean;
};

module.exports = {
  defaultCustomerPricing,
  isValidPlan,
  cleanResponse,
  clean,
  sumPrice,
  sumByVolume,
  sumBulkItems,
};
