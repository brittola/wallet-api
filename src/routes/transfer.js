const express = require('express');
const router = express.Router();

const sequelize = require('../config/database');

router.post('/', async (req, res) => {
	try {
		const { enderecoCarteiraOrigem, hashChavePrivada, enderecoCarteiraDestino, idMoeda, valor } = req.body;

		if (enderecoCarteiraOrigem === enderecoCarteiraDestino) {
			return res.status(400).json({ error: 'Endereço de origem e destino não podem ser o mesmo' });
		}

		const percentualTaxa = parseFloat(process.env.TAXA_TRANSFERENCIA_PERCENTUAL || 0.01);
		const valorTaxa = valor * percentualTaxa;

		const queryValidacaoOrigem = `
				SELECT * FROM carteira
				WHERE endereco_carteira = '${enderecoCarteiraOrigem}'
				AND hash_chave_privada = '${hashChavePrivada}'
				AND status = 'ATIVA'
				LIMIT 1
			`;

		const [carteira] = await sequelize.query(queryValidacaoOrigem);

		if (!carteira?.length) {
			return res.status(400).json({ error: 'Carteira não encontrada' });
		}

		const queryValidacaoDestino = `
				SELECT * FROM carteira
				WHERE endereco_carteira = '${enderecoCarteiraDestino}'
				AND status = 'ATIVA'
				LIMIT 1
			`;

		const [carteiraDestino] = await sequelize.query(queryValidacaoDestino);

		if (!carteiraDestino?.length) {
			return res.status(400).json({ error: 'Carteira de destino não encontrada' });
		}

		const queryValidacaoSaldo = `
			SELECT saldo FROM saldo_carteira
			WHERE endereco_carteira = '${enderecoCarteiraOrigem}'
			AND id_moeda = ${idMoeda} LIMIT 1
		`;

		const [saldo] = await sequelize.query(queryValidacaoSaldo);

		if (saldo[0].saldo < valor) {
			return res.status(400).json({ error: 'Saldo insuficiente' });
		}

		const queryTransferencia = `
				INSERT INTO transferencia (endereco_origem, endereco_destino, id_moeda, valor, taxa_valor)
				VALUES ('${enderecoCarteiraOrigem}', '${enderecoCarteiraDestino}', ${idMoeda}, ${valor}, ${valorTaxa})
			`;

		await sequelize.query(queryTransferencia);

		const querySaldoCarteiraOrigem = `
				UPDATE saldo_carteira
				SET saldo = saldo - ${valor + valorTaxa}
				WHERE endereco_carteira = '${enderecoCarteiraOrigem}'
				AND id_moeda = ${idMoeda}
			`;

		await sequelize.query(querySaldoCarteiraOrigem);

		const querySaldoCarteiraDestino = `
				UPDATE saldo_carteira
				SET saldo = saldo + ${valor}
				WHERE endereco_carteira = '${enderecoCarteiraDestino}'
				AND id_moeda = ${idMoeda}
			`;

		await sequelize.query(querySaldoCarteiraDestino);

		res.status(201).json({ message: 'Transferência realizada com sucesso' });
	} catch (error) {
		console.error(error);

		res.status(500).json({ error: 'Erro ao transferir' });
	}
});

module.exports = router;
