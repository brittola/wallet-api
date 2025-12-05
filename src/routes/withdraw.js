const express = require('express');
const router = express.Router();

const sequelize = require('../config/database');

router.post('/', async (req, res) => {
	try {
		const { enderecoCarteira, valor, idMoeda, hashChavePrivada } = req.body;

		const queryValidacao = `
			SELECT endereco_carteira
			FROM carteira
			WHERE endereco_carteira = '${enderecoCarteira}'
			AND hash_chave_privada = '${hashChavePrivada}'
			AND status = 'ATIVA'
			LIMIT 1
		`;

		const [carteiraValidada] = await sequelize.query(queryValidacao);

		if (!carteiraValidada?.length) {
			return res.status(404).json({ error: 'Carteira não encontrada' });
		}

		const taxaPercentual = parseFloat(process.env.TAXA_SAQUE_PERCENTUAL || 0.01);
		const taxaValor = valor * taxaPercentual;

		const querySaque = `
			INSERT INTO deposito_saque (endereco_carteira, id_moeda, tipo, valor, taxa_valor)
			VALUES ('${enderecoCarteira}', ${idMoeda}, 'SAQUE', ${valor}, ${taxaValor})
		`;

		await sequelize.query(querySaque);

		const valorTotalDescontado = valor + taxaValor;
		const querySaldoCarteira = `
			UPDATE saldo_carteira
			SET saldo = saldo - ${valorTotalDescontado}
			WHERE endereco_carteira = '${enderecoCarteira}'
			AND id_moeda = ${idMoeda}
		`;

		await sequelize.query(querySaldoCarteira);

		res.status(201).json({ message: 'Saque realizado com sucesso' });
	} catch (error) {
		console.error(error);

		res.status(500).json({ error: 'Erro ao sacar' });
	}
});

module.exports = router;
