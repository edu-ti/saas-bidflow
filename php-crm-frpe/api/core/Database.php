<?php
// api/core/database.php

/**
 * Classe de conexão com o banco de dados (PDO).
 */

// CORREÇÃO: O caminho para o config.php foi ajustado para apontar para a raiz do projeto.
require_once dirname(__DIR__, 2) . '/config.php';

class Database {
    private $pdo;

    public function __construct() {
        $this->connect();
    }

    /**
     * Cria e retorna a instância de conexão PDO.
     * @return PDO
     * @throws PDOException
     */
    private function connect() {
        if ($this->pdo === null) {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            $this->pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        }
    }
    
    /**
     * Retorna a conexão PDO estabelecida.
     * @return PDO
     */
    public function getConnection() {
        return $this->pdo;
    }
}

