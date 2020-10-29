# secondcloset

https://damp-oasis-84167.herokuapp.com/api/

# API

All endpoints expect JSON input in the request body.

# /pricing

> https://damp-oasis-84167.herokuapp.com/api/pricing

## POST /create

Create a customer pricing plan. By default, a `pricingDetails` field will be appended to the customer object containing modifiable values pertinent to that pricing plan based on the string passed as a `pricingPlan`.

```javascript
customerId: String(required);
pricingPlan: String(required);
basePrice: String(optional);
pricingPlan: Object(optional);
```

Note: For purposes of this project, if customerId is 'A' , the pricing plan will automatically be set to flat_discount_plan, if it's 'B', it will be set to large_item_plan, and so on.

The pricing plans are defined by default as follows:

### flat_discount_plan

Applies a fixed discount to the overall total value of items. Adds a `pricingDetails` field to the customer that contains `discountPercentage`, which can be set explicitly using the `/modify` endpoint.

```json
{
  "customerId": "amazon",
  "pricingPlan": "flat_pricing_plan",
  "pricingDetails": {
    "discountPercentage": "10"
  }
}
```

### large_item_plan:

Applies a pricing plan that calculates the total based on the volume of storage items. Adds a `pricingDetails` field to the customer that contains `pricePerUnitVolume`.

```json
{
  "customerId": "google",
  "pricingPlan": "large_item_plan",
  "pricingDetails": {
    "pricePerUnitVolume": "10"
  }
}
```

### valuable_item_plan

Applies a pricing plan that calculates total based on a percentage of the value of items being stored. Adds a `pricingDetails` field to the customer object that includes `percentOfTotalValue`.

```json
{
  "customerId": "facebook",
  "pricingPlan": "valuable_item_plan",
  "pricingDetails": {
    "percentOfTotalValue": "5"
  }
}
```

### bulk_item_plan

Applies a pricing plan that discounts the first 100 items at a certain rate, the next 100 items at a certain rate, and charges a certain amount per unit of volume for all items. Ex:

```json
{
  "customerId": "netflix",
  "pricingPlan": "bulk_item_plan",
  "pricingDetails": {
    "discountFirstHundredItems": "5",
    "discountNextHundredItems": "5",
    "unitVolumeCharge": "2"
  }
}
```

### You may explicitly specify a `pricingDetails` object with your request if you choose to. If you do not, the above defaults will be set depending on the value of the pricing plan field. For example, sending the following:

```json
{
  "customerId": "instagram",
  "pricingPlan": "flat_discount_plan"
}
```

Will create:

```json
{
  "customerId": "instagram",
  "pricingPlan": "flat_discount_plan",
  "pricingDetails": {
    "discountPercentage": "10"
  }
}
```

And sending the following:

```json
{
  "customerId": "pinterest",
  "pricingPlan": "bulk_item_plan",
  "pricingDetails": {
    "discountNextHundredItems": "45"
  }
}
```

Will create:

```json
{
  "customerId": "pinterest",
  "pricingPlan": "bulk_item_plan",
  "pricingDetails": {
    "discountFirstHundredItems": "5",
    "discountNextHundredItems": "45",
    "unitVolumeCharge": "2"
  }
}
```

## GET /find

Takes a `customerId`. Returns the customer pricing object that matches that ID.

```json
{
  "customerId": "abc123"
}
```

```json
{
  "success": true,
  "message": "Customer found",
  "result": {
    "pricingDetails": {
      "discountFirstHundredItems": "5",
      "discountNextHundredItems": "5",
      "unitVolumeCharge": "33"
    },
    "basePrice": 20,
    "pricingPlan": "bulk_item_plan",
    "items": [],
    "customerId": "abc123"
  }
}
```

## PATCH /modify

Similar to create, you may change `pricingPlan`, `pricingDetails`, or `basePrice` here. By sending an object mapping.

```json
{
  "customerId": "pinterest",
  "pricingDetails": {
    "discountFirstHundredItems": "45",
    "discountNextHundredItems": "45",
    "unitVolumeCharge": "2"
  },
  "basePrice": "60"
}
```

Change pricing plan:

```json
{
  "customerId": "pinterest",
  "pricingPlan": "flat_discount_plan"
}
```

## POST /remove

Remove a customer.

```json
{
  "customerId": "pinterest"
}
```

# /storage

> https://damp-oasis-84167.herokuapp.com/api/storage

## POST /add

Add items to a customer's `items` collection. Requires a valid `customerId`.

You may send an array of items with the following shape:

```javascript
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
```

Duplicate values are allowed. For instance, the following request:

```json
{
  "customerId": "LL",
  "items": [
    {
      "name": "chair",
      "height": "3",
      "width": "3",
      "weight": "3",
      "length": "4",
      "value": "33"
    },
    {
      "name": "chair",
      "height": "3",
      "width": "3",
      "weight": "3",
      "length": "4",
      "value": "800"
    }
  ]
}
```

Will return:

```json
{
  "success": true,
  "message": "2 items added successfully",
  "result": [
    {
      "name": "chair",
      "height": "3",
      "width": "3",
      "weight": "3",
      "length": "4",
      "value": "33"
    },
    {
      "name": "chair",
      "height": "3",
      "width": "3",
      "weight": "3",
      "length": "4",
      "value": "800"
    }
  ]
}
```

## POST /remove

Similar to `/add`, takes an array of items. Multiple items can be removed in this way. Only one item matching an identical set of values will be removed at a time. To remove multiple items with the same value, add them to the array multiple times.

Returns the updated `items` array after items are removed.

Consider the following list of items:

```json
[
  {
    "name": "chair",
    "height": "3",
    "width": "3",
    "weight": "3",
    "length": "4",
    "value": "33"
  },
  {
    "name": "chair",
    "height": "3",
    "width": "3",
    "weight": "3",
    "length": "4",
    "value": "800"
  },
  {
    "name": "chair",
    "height": "3",
    "width": "3",
    "weight": "3",
    "length": "4",
    "value": "800"
  },
  {
    "name": "fridge",
    "height": "80",
    "width": "30",
    "weight": "120",
    "length": "30",
    "value": "300"
  }
]
```

Sending this:

```json
{
  "customerId": "LLS",
  "items": [
    {
      "name": "chair",
      "height": "3",
      "width": "3",
      "weight": "3",
      "length": "4",
      "value": "800"
    },
    {
      "name": "fridge",
      "height": "80",
      "width": "30",
      "weight": "120",
      "length": "30",
      "value": "300"
    }
  ]
}
```

Returns this:

```json
{
  "success": true,
  "message": "2 items removed",
  "result": [
    {
      "name": "chair",
      "height": "3",
      "width": "3",
      "weight": "3",
      "length": "4",
      "value": "33"
    },
    {
      "name": "chair",
      "height": "3",
      "width": "3",
      "weight": "3",
      "length": "4",
      "value": "800"
    }
  ]
}
```

## GET /quote

Returns a total pricing quote based on the customer's items, pricing plan, and pricing details.

```json
{
  "customerId": "LLS"
}
```

```json
{
  "success": true,
  "message": "Quote calculated successfully",
  "result": 769.7
}
```

### Run locally

- Run npm install
- Create .env file with PORT and MONGO_CONNECTION keys, set PORT to a port you want your local server listening on
- Create a Mongo Atlas cluster and set the value of MONGO_CONNECTION to your connection URI in the following format: `mongodb+srv://<user>:<pw>@<cluster>/<dbname>?retryWrites=true&w=majority`
- Run `npm run dev`

```

```
