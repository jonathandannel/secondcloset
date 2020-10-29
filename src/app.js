const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const logger = morgan('combined');
const routes = require('./routes');

require('dotenv').config();

// Create app instance
const app = express();

// Append middleware
app.use(logger);
app.use(bodyParser.json());
app.use(routes);

// Init DB connection
mongoose.connect(process.env.MONGO_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  autoIndex: true,
});

// Serve
app.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}`)
);
