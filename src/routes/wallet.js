const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const crypto = require('crypto');

require('dotenv').config();

router.post('/', async (req, res) => {
	try {
		const hashChavePrivada = crypto.randomBytes(16).toString('hex');
		const enderecoCarteira = crypto.randomBytes(8).toString('hex');

		console.log(enderecoCarteira, 'ENDEREÇO CARTEIRA');
		console.log(hashChavePrivada, 'HASH CHAVE PRIVADA');

		const queryCarteira = `
			INSERT INTO carteira (endereco_carteira, hash_chave_privada) VALUES ('${enderecoCarteira}', '${hashChavePrivada}')
		`;

		await sequelize.query(queryCarteira);

		const idsMoedas = await sequelize.query(
			`SELECT id_moeda FROM moeda;`
		);

		let querySaldoCarteira = `
			INSERT INTO saldo_carteira (endereco_carteira, id_moeda, saldo) VALUES
		`;

		idsMoedas[0].forEach(moeda => {
			querySaldoCarteira += `('${enderecoCarteira}', ${moeda.id_moeda}, 0), `;
		});

		querySaldoCarteira = querySaldoCarteira.slice(0, -2) + ';'; // remover última vírgula da query

		await sequelize.query(querySaldoCarteira);

		res.status(201).json({ enderecoCarteira, hashChavePrivada });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Erro ao criar carteira' });
	}
});

router.get('/:enderecoCarteira', async (req, res) => {
	try {
		const { enderecoCarteira } = req.params;

		const query = `
			SELECT endereco_carteira, status FROM carteira WHERE endereco_carteira = '${enderecoCarteira}' LIMIT 1;
		`;

		console.log(query, 'QUERY CARTEIRA');

		const [carteira] = await sequelize.query(query);

		res.status(200).json(carteira);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Erro ao buscar carteira' });
	}
});

router.get('/:enderecoCarteira/saldo', async (req, res) => {
	try {
		const { enderecoCarteira } = req.params;

		const query = `
			SELECT s.saldo, m.nome, m.id_moeda
			FROM saldo_carteira s
			INNER JOIN moeda m ON s.id_moeda = m.id_moeda
			WHERE s.endereco_carteira = '${enderecoCarteira}';
		`;

		const [saldo] = await sequelize.query(query);

		res.status(200).json(saldo);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Erro ao buscar saldo' });
	}
});

module.exports = router;
