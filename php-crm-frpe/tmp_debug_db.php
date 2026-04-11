<?php
include 'config.php';
header('Content-Type: text/plain');

echo "--- FUNNEILS ---\n";
$stmt = $pdo->query('SELECT id, nome FROM funis');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n--- KIP ACTIVE BIDS QUERY (Funil 9) ---\n";
$stmt = $pdo->query("SELECT COUNT(*) as total FROM oportunidades o JOIN etapas_funil ef ON o.etapa_id = ef.id WHERE ef.funil_id = 9");
print_r($stmt->fetch(PDO::FETCH_ASSOC));

echo "\n--- KIP ACTIVE BIDS QUERY (Funil 2) ---\n";
$stmt = $pdo->query("SELECT COUNT(*) as total FROM oportunidades o JOIN etapas_funil ef ON o.etapa_id = ef.id WHERE ef.funil_id = 2");
print_r($stmt->fetch(PDO::FETCH_ASSOC));

echo "\n--- TOTAL SALES 2026 ---\n";
$sqlSales = "SELECT SUM(total) as total FROM (
                SELECT COALESCE(SUM(valor_total), 0) as total FROM propostas 
                WHERE status = 'Aprovada' AND YEAR(data_criacao) = 2026
                UNION ALL
                SELECT COALESCE(SUM(valor_total), 0) FROM vendas_fornecedores 
                WHERE YEAR(data_venda) = 2026
             ) as sales";
$stmt = $pdo->query($sqlSales);
print_r($stmt->fetch(PDO::FETCH_ASSOC));

echo "\n--- SALES BY VENDOR 2026 ---\n";
$sqlByVendedor = "SELECT COALESCE(u.nome, 'Outros') as vendedor, SUM(total) as total FROM (
                    SELECT usuario_id, SUM(valor_total) as total FROM propostas 
                    WHERE status = 'Aprovada' AND YEAR(data_criacao) = 2026 GROUP BY usuario_id
                    UNION ALL
                    SELECT usuario_id, SUM(valor_total) FROM vendas_fornecedores 
                    WHERE YEAR(data_venda) = 2026 GROUP BY usuario_id
                 ) as vendedor_sales
                 LEFT JOIN usuarios u ON vendedor_sales.usuario_id = u.id
                 GROUP BY vendedor ORDER BY total DESC";
$stmt = $pdo->query($sqlByVendedor);
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n--- BY SUPPLIER 2026 ---\n";
$sql = "SELECT f.nome as label, COUNT(p.id) as count, COALESCE(SUM(p.valor_total), 0) as value
        FROM propostas p 
        JOIN oportunidades o ON p.oportunidade_id = o.id 
        LEFT JOIN fornecedores f ON o.fornecedor_id = f.id 
        WHERE YEAR(p.data_criacao) = 2026 
        AND p.status = 'Aprovada'
        AND f.nome IS NOT NULL
        GROUP BY f.nome";
$stmt = $pdo->query($sql);
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
