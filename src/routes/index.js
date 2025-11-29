const express = require('express');
const router = express.Router();
const walletRouter = require('./wallet');
const depositRouter = require('./deposit');
const withdrawRouter = require('./withdraw');
const conversionRouter = require('./conversion');

router.use('/carteiras', walletRouter);
router.use('/depositos', depositRouter);
router.use('/saques', withdrawRouter);
router.use('/conversao', conversionRouter);

module.exports = router;
