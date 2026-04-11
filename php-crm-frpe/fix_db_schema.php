<?php
// fix_db_schema.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Ensure paths are correct based on file location in root
if (file_exists('api/core/Database.php')) {
    require_once 'api/core/Database.php';
} else {
    die('api/core/Database.php not found in ' . __DIR__);
}

try {
    $db = new Database();
    $pdo = $db->getConnection();

    echo "Database Connected.<br>";

    // Check/Add motivo_perda
    try {
        $pdo->query("SELECT motivo_perda FROM oportunidades LIMIT 1");
        echo "Column 'motivo_perda' already exists.<br>";
    } catch (Exception $e) {
        $pdo->exec("ALTER TABLE oportunidades ADD COLUMN motivo_perda VARCHAR(255) DEFAULT NULL");
        echo "Column 'motivo_perda' CREATED SUCCESSFULLY!<br>";
    }

    echo "<h1 style='color:green'>SUCESSO! Atualização de Banco de Dados Concluída.</h1>";
    echo "<p>Você pode fechar esta aba e tentar salvar a oportunidade novamente.</p>";

} catch (Exception $e) {
    echo "<h1 style='color:red'>Erro Fatal:</h1>";
    echo $e->getMessage();
}
?>