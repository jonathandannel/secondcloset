const router = require('express').Router();

const storage = require('./storage');
const pricing = require('./pricing');

router.use('/pricing', pricing);
router.use('/storage', storage);

module.exports = router;
