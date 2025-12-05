const express = require('express');
const router = express.Router();

const axios = require('axios');

const sequelize = require('../config/database');

router.post('/', async (req, res) => {
	try {
		const { enderecoCarteira, hashChavePrivada, valorOrigem, idMoedaOrigem, idMoedaDestino } = req.body;

		const taxaPercentual = parseFloat(process.env.TAXA_CONVERSAO_PERCENTUAL || 0.02);
		const taxaValor = valorOrigem * taxaPercentual;

		const queryValidacao = `SELECT * FROM carteira WHERE endereco_carteira = '${enderecoCarteira}' AND hash_chave_privada = '${hashChavePrivada}' AND status = 'ATIVA' LIMIT 1`;

		const [carteira] = await sequelize.query(queryValidacao);

		if (!carteira) {
			return res.status(400).json({ error: 'Carteira não encontrada' });
		}

		const [moedaOrigem] = await sequelize.query(`SELECT codigo FROM moeda WHERE id_moeda = ${idMoedaOrigem} LIMIT 1`);
		const [moedaDestino] = await sequelize.query(`SELECT codigo FROM moeda WHERE id_moeda = ${idMoedaDestino} LIMIT 1`);

		const responseCotacao = await axios.get(`https://api.coinbase.com/v2/prices/${moedaOrigem[0].codigo}-${moedaDestino[0].codigo}/spot`);
		const cotacao = responseCotacao.data.data.amount;

		const valorDestino = (valorOrigem - taxaValor) * cotacao;

		const querySaldoAtual = `SELECT saldo FROM saldo_carteira WHERE endereco_carteira = '${enderecoCarteira}' AND id_moeda = ${idMoedaOrigem} LIMIT 1`;
		const [saldoAtual] = await sequelize.query(querySaldoAtual);

		if (saldoAtual[0].saldo < valorOrigem) {
			return res.status(400).json({ error: 'Saldo insuficiente' });
		}

		const queryConversion = `
			INSERT INTO conversao(endereco_carteira, id_moeda_origem, id_moeda_destino, valor_origem, valor_destino, taxa_percentual, taxa_valor, cotacao_utilizada)
			VALUES ('${enderecoCarteira}', ${idMoedaOrigem}, ${idMoedaDestino}, ${valorOrigem}, ${valorDestino}, ${taxaPercentual}, ${taxaValor}, ${cotacao})
		`;

		await sequelize.query(queryConversion);

		const querySaldoCarteira = `
			UPDATE saldo_carteira SET saldo = saldo - ${valorOrigem} WHERE endereco_carteira = '${enderecoCarteira}' AND id_moeda = ${idMoedaOrigem}
		`;

		await sequelize.query(querySaldoCarteira);

		const querySaldoCarteiraDestino = `
			UPDATE saldo_carteira SET saldo = saldo + ${valorDestino} WHERE endereco_carteira = '${enderecoCarteira}' AND id_moeda = ${idMoedaDestino}
		`;

		await sequelize.query(querySaldoCarteiraDestino);

		res.status(201).json({ message: 'Conversão realizada com sucesso' });
	} catch (error) {
		console.error(error);

		res.status(500).json({ error: 'Erro ao converter' });
	}
});

module.exports = router;