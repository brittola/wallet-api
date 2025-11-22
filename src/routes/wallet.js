const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

router.post('/', async (req, res) => {
	const { userId } = req.body;

	const query = `
		INSERT INTO wallets (user_id) VALUES (:userId)
	`;

	const wallet = await sequelize.query(query, {
		replacements: { userId },
	});

	res.status(201).json(wallet);
});

module.exports = router;
