const express = require('express');
const router = express.Router();

const sequelize = require('../config/database');

router.post('/', async (req, res) => {
	try {
		const { enderecoCarteira, valor, idMoeda } = req.body;

		const queryDeposito = `
			INSERT INTO deposito_saque (endereco_carteira, id_moeda, tipo, valor, taxa_valor) VALUES ('${enderecoCarteira}', ${idMoeda}, 'DEPOSITO', ${valor}, 0)
		`;

		await sequelize.query(queryDeposito);

		const querySaldoCarteira = `
			UPDATE saldo_carteira SET saldo = saldo + ${valor} WHERE endereco_carteira = '${enderecoCarteira}' AND id_moeda = ${idMoeda}
		`;

		await sequelize.query(querySaldoCarteira);

		res.status(201).json({ message: 'Depósito realizado com sucesso' });
	} catch (error) {
		console.error(error);

		res.status(500).json({ error: 'Erro ao depositar' });
	}
});

module.exports = router;
