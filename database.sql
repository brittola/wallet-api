CREATE DATABASE IF NOT EXISTS wallet_homolog;

CREATE USER 'wallet_api_homolog'@'%' IDENTIFIED BY 'api123';
GRANT SELECT, INSERT, UPDATE, DELETE ON wallet_homolog.* TO 'wallet_api_homolog'@'%';

FLUSH PRIVILEGES;

CREATE TABLE IF NOT EXISTS carteira(
	endereco_carteira VARCHAR(255) NOT NULL PRIMARY KEY,
	hash_chave_privada VARCHAR(255) NOT NULL,
	data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	status ENUM('ATIVA', 'BLOQUEADA') NOT NULL DEFAULT 'ATIVA'
);

CREATE TABLE IF NOT EXISTS moeda(
	id_moeda SMALLINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	codigo VARCHAR(6) NOT NULL,
	nome VARCHAR(50) NOT NULL,
	tipo ENUM('CRIPTOMOEDA', 'FIAT') NOT NULL
);

CREATE TABLE IF NOT EXISTS saldo_carteira(
	endereco_carteira VARCHAR(255) NOT NULL,
	id_moeda SMALLINT NOT NULL,
	saldo DECIMAL(20, 10) NOT NULL DEFAULT 0,
	data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (endereco_carteira, id_moeda),
	FOREIGN KEY (endereco_carteira) REFERENCES carteira(endereco_carteira) ON DELETE CASCADE,
	FOREIGN KEY (id_moeda) REFERENCES moeda(id_moeda) ON DELETE CASCADE
);

INSERT INTO moeda (codigo, nome, tipo) VALUES
	('BRL', 'Real', 'FIAT'),
	('USD', 'Dólar', 'FIAT'),
	('BTC', 'Bitcoin', 'CRIPTOMOEDA'),
	('SOL', 'Solana', 'CRIPTOMOEDA'),
	('ETH', 'Ethereum', 'CRIPTOMOEDA');
