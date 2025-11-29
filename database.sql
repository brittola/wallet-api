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
	('USD', 'Dolar', 'FIAT'),
	('BTC', 'Bitcoin', 'CRIPTOMOEDA'),
	('SOL', 'Solana', 'CRIPTOMOEDA'),
	('ETH', 'Ethereum', 'CRIPTOMOEDA');

CREATE TABLE IF NOT EXISTS deposito_saque(
    id_movimento BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    endereco_carteira VARCHAR(255) NOT NULL,
    id_moeda SMALLINT NOT NULL,
    tipo ENUM('DEPOSITO', 'SAQUE') NOT NULL,
    valor DECIMAL(20, 10) NOT NULL,
    taxa_valor DECIMAL(20, 10) NOT NULL DEFAULT 0,
    data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (endereco_carteira) REFERENCES carteira(endereco_carteira) ON DELETE CASCADE,
    FOREIGN KEY (id_moeda) REFERENCES moeda(id_moeda) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conversao(
	id_conversao BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	endereco_carteira VARCHAR(255) NOT NULL,
	id_moeda_origem SMALLINT NOT NULL,
	id_moeda_destino SMALLINT NOT NULL,
	valor_origem DECIMAL(20, 10) NOT NULL,
	valor_destino DECIMAL(20, 10) NOT NULL,
	taxa_percentual DECIMAL(5, 2) NOT NULL,
	taxa_valor DECIMAL(20, 10) NOT NULL,
	cotacao_utilizada DECIMAL(20, 10) NOT NULL,
	data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (endereco_carteira) REFERENCES carteira(endereco_carteira) ON DELETE CASCADE,
	FOREIGN KEY (id_moeda_origem) REFERENCES moeda(id_moeda) ON DELETE CASCADE,
	FOREIGN KEY (id_moeda_destino) REFERENCES moeda(id_moeda) ON DELETE CASCADE
);
