const express = require('express');
const router = express.Router();

const sequelize = require('../config/database');

router.post('/', async (req, res) => {
	try {
		const { enderecoCarteira, valor, idMoeda } = req.body;

		const taxaPercentual = parseFloat(process.env.TAXA_SAQUE_PERCENTUAL || 0);
		const taxaValor = valor * (taxaPercentual / 100);

		const querySaque = `
			INSERT INTO deposito_saque (endereco_carteira, id_moeda, tipo, valor, taxa_valor) VALUES ('${enderecoCarteira}', ${idMoeda}, 'SAQUE', ${valor}, ${taxaValor})
		`;

		await sequelize.query(querySaque);

		const valorTotalDescontado = valor + taxaValor;
		const querySaldoCarteira = `
			UPDATE saldo_carteira SET saldo = saldo - ${valorTotalDescontado} WHERE endereco_carteira = '${enderecoCarteira}' AND id_moeda = ${idMoeda}
		`;

		await sequelize.query(querySaldoCarteira);

		res.status(201).json({ message: 'Saque realizado com sucesso' });
	} catch (error) {
		console.error(error);

		res.status(500).json({ error: 'Erro ao sacar' });
	}
});

module.exports = router;
