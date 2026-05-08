<?php
require_once __DIR__ . '/../core/Database.php';
require_once __DIR__ . '/../core/helpers.php';

// --- NEW CLASS (Requested by User) ---
class ReportHandler
{
    private $db;

    public function __construct()
    {
        $db = new Database();
        $this->db = $db->getConnection();
    }

    private function getDates($start, $end)
    {
        return [
            crm_normalize_date($start),
            crm_normalize_date($end, true)
        ];
    }

    public function handleRequest($method, $action)
    {
        if ($method !== 'GET') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }

        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-t');

        switch ($action) {
            case 'dashboard_summary':
                $this->getDashboardSummary($startDate, $endDate);
                break;
            case 'by_vendor':
                $this->getSalesByVendor($startDate, $endDate);
                break;
            case 'by_supplier':
                $this->getPurchasesBySupplier($startDate, $endDate);
                break;
            case 'by_item':
                $this->getItemsSold($startDate, $endDate);
                break;
            case 'by_proposal_status':
                $this->getProposalsByStatus($startDate, $endDate);
                break;
            case 'by_bidding_funnel':
            case 'licitacoes_funnel':
            case 'licitacoes':
                $this->getBiddingFunnel($startDate, $endDate);
                break;
            case 'clients':
                $this->getClientsReport($startDate, $endDate);
                break;
            case 'forecast':
                $this->getForecastReport($startDate, $endDate);
                break;
            case 'bi_kpis':
                $this->getKPISummary($startDate, $endDate);
                break;
            case 'sales_vs_goals':
                $this->getSalesVsGoalsData($startDate, $endDate);
                break;
            case 'commission_analysis':
                $supplier_ids = isset($_GET['supplier_id']) && $_GET['supplier_id'] !== '' ? explode(',', $_GET['supplier_id']) : [];
                $this->getCommissionAnalysis($startDate, $endDate, false, $supplier_ids);
                break;
            case 'vendor_evolution':
                $this->getVendorEvolution($startDate, $endDate);
                break;
            default:
                http_response_code(400);
                echo json_encode(['error' => 'Invalid action']);
        }
    }

    private function applyFilters(&$sql, &$params, $table_alias = 'o') {
        $supplier_ids = isset($_GET['supplier_id']) && $_GET['supplier_id'] !== '' ? explode(',', $_GET['supplier_id']) : [];
        $user_ids = isset($_GET['user_id']) && $_GET['user_id'] !== '' ? explode(',', $_GET['user_id']) : [];
        $cliente_ids = isset($_GET['cliente_id']) && $_GET['cliente_id'] !== '' ? explode(',', $_GET['cliente_id']) : [];
        $uf_ids = isset($_GET['uf']) && $_GET['uf'] !== '' ? explode(',', $_GET['uf']) : [];

        $buildIn = function($ids) {
            return implode(',', array_fill(0, count($ids), '?'));
        };

        if (!empty($supplier_ids)) {
            $sql .= " AND $table_alias.fornecedor_id IN (" . $buildIn($supplier_ids) . ")";
            $params = array_merge($params, $supplier_ids);
        }
        if (!empty($user_ids)) {
            $sql .= " AND $table_alias.usuario_id IN (" . $buildIn($user_ids) . ")";
            $params = array_merge($params, $user_ids);
        }
        if (!empty($cliente_ids)) {
            $tablePrefix = $table_alias === 'p' ? 'p' : ($table_alias === 'vf' ? 'vf' : ($table_alias === 'o' ? 'o' : ''));
            if ($tablePrefix === 'p' || $tablePrefix === 'vf') {
                $sql .= " AND ($tablePrefix.organizacao_id IN (" . $buildIn($cliente_ids) . ") OR $tablePrefix.cliente_pf_id IN (" . $buildIn($cliente_ids) . "))";
                $params = array_merge($params, $cliente_ids);
                $params = array_merge($params, $cliente_ids); // twice for OR
            }
        }
        if (!empty($uf_ids)) {
            $prefixForOrg = ($table_alias === 'p' || $table_alias === 'vf') ? $table_alias : ($table_alias === 'o' ? 'p' : ''); // se for 'o', precisa join org, ignora para simplificar ou usa org id da prop.
            if ($prefixForOrg === 'p' || $prefixForOrg === 'vf') {
                $sql .= " AND ($prefixForOrg.organizacao_id IN (SELECT id FROM organizacoes WHERE estado IN (" . $buildIn($uf_ids) . ")))";
                $params = array_merge($params, $uf_ids);
            }
        }
    }

    private function getDashboardSummary($start, $end)
    {
        try {
            list($dtStart, $dtEnd) = $this->getDates($start, $end);

            // Total Sales: Sum of 'valor_total' from 'propostas' with status 'Aprovada'
            $sqlSales = "SELECT SUM(total) as total FROM (
                            SELECT COALESCE(SUM(valor_total), 0) as total FROM propostas 
                            WHERE data_criacao BETWEEN ? AND ? AND status = 'Aprovada'
                            UNION ALL
                            SELECT COALESCE(SUM(valor_total), 0) FROM vendas_fornecedores 
                            WHERE data_venda BETWEEN ? AND ?
                            AND (proposta_ref_id IS NULL OR titulo NOT LIKE 'Venda via Proposta #%')
                         ) as total_sales";
            $params = [$dtStart, $dtEnd, $dtStart, $dtEnd];

            $stmtSales = $this->db->prepare($sqlSales);
            $stmtSales->execute($params);
            $totalSales = $stmtSales->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            // Open Opportunities: Count of 'oportunidades' created in period
            $sqlOpps = "SELECT COUNT(*) as total FROM oportunidades WHERE data_criacao BETWEEN ? AND ?";
            $stmtOpps = $this->db->prepare($sqlOpps);
            $stmtOpps->execute([$dtStart, $dtEnd]);
            $openOpps = $stmtOpps->fetch(PDO::FETCH_ASSOC)['total'];

            // Active Proposals: Count of 'propostas' with status 'Enviada'
            $sqlProps = "SELECT COUNT(*) as total FROM propostas 
                         WHERE data_criacao BETWEEN ? AND ? AND status = 'Enviada'";
            $stmtProps = $this->db->prepare($sqlProps);
            $stmtProps->execute([$dtStart, $dtEnd]);
            $activeProps = $stmtProps->fetch(PDO::FETCH_ASSOC)['total'];

            // Conversion Rate: (Aprovada / (Aprovada + Recusada)) * 100
            $sqlConv = "SELECT 
                            SUM(CASE WHEN status = 'Aprovada' THEN 1 ELSE 0 END) as won,
                            SUM(CASE WHEN status IN ('Aprovada', 'Recusada') THEN 1 ELSE 0 END) as total_closed
                        FROM propostas 
                        WHERE data_criacao BETWEEN ? AND ?";
            $stmtConv = $this->db->prepare($sqlConv);
            $stmtConv->execute([$dtStart, $dtEnd]);
            $convData = $stmtConv->fetch(PDO::FETCH_ASSOC);

            $conversionRate = ($convData['total_closed'] > 0) ?
                round(($convData['won'] / $convData['total_closed']) * 100, 1) : 0;

            echo json_encode([
                'total_sales' => $totalSales,
                'open_opportunities' => $openOpps,
                'active_proposals' => $activeProps,
                'conversion_rate' => $conversionRate
            ]);
        } catch (Exception $e) {
            $this->sendError($e);
        }
    }

    private function getSalesByVendor($start, $end)
    {
        try {
            // Using 'propostas' LEFT JOIN 'usuarios'
            $sql = "SELECT vendedor as label, COUNT(*) as count, SUM(total) as value FROM (
                        SELECT u.nome as vendedor, p.id, p.valor_total as total 
                        FROM propostas p 
                        LEFT JOIN usuarios u ON p.usuario_id = u.id
                        WHERE p.data_criacao BETWEEN ? AND ? AND p.status = 'Aprovada'
                        UNION ALL
                        SELECT u.nome as vendedor, vf.id, vf.valor_total as total 
                        FROM vendas_fornecedores vf 
                        LEFT JOIN usuarios u ON vf.usuario_id = u.id
                        WHERE vf.data_venda BETWEEN ? AND ?
                        AND (vf.proposta_ref_id IS NULL OR vf.titulo NOT LIKE 'Venda via Proposta #%')
                    ) as combined_sales
                    GROUP BY vendedor ORDER BY value DESC";
            
            list($dtStart, $dtEnd) = $this->getDates($start, $end);
            $this->executeQuery($sql, [$dtStart, $dtEnd, $dtStart, $dtEnd]);
        } catch (Exception $e) {
            $this->sendError($e);
        }
    }

    private function getPurchasesBySupplier($start, $end)
    {
        try {
            // Using 'propostas' -> 'oportunidades' -> 'fornecedores'
            $sql = "SELECT fornecedor as label, COUNT(*) as count, SUM(total) as value FROM (
                        SELECT f.nome as fornecedor, p.id, p.valor_total as total
                        FROM propostas p 
                        JOIN oportunidades o ON p.oportunidade_id = o.id 
                        LEFT JOIN fornecedores f ON o.fornecedor_id = f.id 
                        WHERE p.data_criacao BETWEEN ? AND ? AND p.status = 'Aprovada'
                        UNION ALL
                        SELECT f.nome as fornecedor, vf.id, vf.valor_total as total
                        FROM vendas_fornecedores vf
                        LEFT JOIN fornecedores f ON vf.fornecedor_id = f.id
                        WHERE vf.data_venda BETWEEN ? AND ?
                        AND (vf.proposta_ref_id IS NULL OR vf.titulo NOT LIKE 'Venda via Proposta #%')
                    ) as combined_suppliers
                    WHERE fornecedor IS NOT NULL
                    GROUP BY fornecedor ORDER BY value DESC LIMIT 15";
            
            list($dtStart, $dtEnd) = $this->getDates($start, $end);
            $this->executeQuery($sql, [$dtStart, $dtEnd, $dtStart, $dtEnd]);
        } catch (Exception $e) {
            echo json_encode([]);
        }
    }

    private function getItemsSold($start, $end)
    {
        try {
            // Using 'proposta_itens' -> 'propostas' -> 'produtos'
            $sql = "SELECT pr.nome_produto as label, SUM(pi.quantidade) as count, COALESCE(SUM(pi.quantidade * pi.valor_unitario), 0) as value
                    FROM proposta_itens pi 
                    JOIN propostas p ON pi.proposta_id = p.id 
                    LEFT JOIN produtos pr ON pi.produto_id = pr.id
                    WHERE p.data_criacao BETWEEN ? AND ? 
                    AND p.status = 'Aprovada'
                    GROUP BY pr.nome_produto 
                    ORDER BY count DESC 
                    LIMIT 20";
            
            list($dtStart, $dtEnd) = $this->getDates($start, $end);
            $this->executeQuery($sql, [$dtStart, $dtEnd]);
        } catch (Exception $e) {
            $this->sendError($e);
        }
    }

    private function getProposalsByStatus($start, $end)
    {
        try {
            $sql = "SELECT status as label, COUNT(*) as count, COALESCE(SUM(valor_total), 0) as value
                    FROM propostas 
                    WHERE data_criacao BETWEEN ? AND ? 
                    GROUP BY status";
            $this->executeQuery($sql, [$start . ' 00:00:00', $end . ' 23:59:59']);
        } catch (Exception $e) {
            $this->sendError($e);
        }
    }

    private function getBiddingFunnel($start, $end)
    {
        try {
            $sql = "SELECT ef.nome as label, COUNT(o.id) as count, COALESCE(SUM(p.valor_total), SUM(o.valor), 0) as value
                    FROM oportunidades o
                    JOIN etapas_funil ef ON o.etapa_id = ef.id
                    LEFT JOIN propostas p ON o.id = p.oportunidade_id AND p.status = 'Aprovada'
                    WHERE o.data_criacao BETWEEN ? AND ?
                    AND (o.numero_edital IS NOT NULL AND o.numero_edital != '')
                    AND ef.funil_id = 2";
            
            $params = [$start . ' 00:00:00', $end . ' 23:59:59'];
            
            if (empty($_GET['supplier_id'])) {
                $fixedSuppliers = ['BRASIL MEDICA', 'HEALTH', 'INSTRAMED', 'LIVANOVA', 'MASIMO', 'MERIL', 'MICROMED', 'NIPRO', 'SIGMAFIX'];
                $ph = implode(',', array_fill(0, count($fixedSuppliers), '?'));
                $sql .= " AND o.fornecedor_id IN (SELECT id FROM fornecedores WHERE nome IN ($ph))";
                $params = array_merge($params, $fixedSuppliers);
            }

            $currentType = $_GET['report_type'] ?? '';
            if ($currentType === 'licitacoes_funnel' || $currentType === 'licitacoes') {
                $this->applyFilters($sql, $params, 'o');
            }

            $sql .= " GROUP BY ef.nome, ef.ordem ORDER BY ef.ordem ASC";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            $rawData = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $steps = [
                'Captação de Edital', 'Acolhimento de propostas', 'Em análise Técnica', 
                'Homologado', 'Ata/Carona', 'Empenhado', 'Contrato', 'Desclassificado', 
                'Fracassado', 'Revogado', 'Anulado', 'Suspenso'
            ];
            
            $result = [];
            foreach ($steps as $step) {
                $found = array_filter($rawData, function($r) use ($step) { return stripos($r['label'], $step) !== false; });
                if ($found) {
                    $first = reset($found);
                    $result[] = ['label' => $step, 'count' => $first['count'], 'value' => $first['value']];
                } else {
                    $result[] = ['label' => $step, 'count' => 0, 'value' => 0];
                }
            }

            echo json_encode([
                'success' => true,
                'report_data' => $result,
                'type' => 'funnel' // Return as funnel for frontend format compat
            ]);

        } catch (Exception $e) {
            $this->sendError($e);
        }
    }

    private function getClientsReport($start, $end)
    {
        try {
            list($dtStart, $dtEnd) = $this->getDates($start, $end);
            $params = [$dtStart, $dtEnd];
            
            $sqlInnerP = "SELECT p.id, p.organizacao_id, p.cliente_pf_id, p.valor_total FROM propostas p JOIN oportunidades o ON p.oportunidade_id = o.id WHERE p.data_criacao BETWEEN ? AND ? AND p.status = 'Aprovada'";
            $paramsP = $params;
            $this->applyFilters($sqlInnerP, $paramsP, 'p');
            
            $sqlInnerVF = "SELECT vf.id, vf.organizacao_id, vf.cliente_pf_id, vf.valor_total FROM vendas_fornecedores vf WHERE vf.data_venda BETWEEN ? AND ? AND (vf.proposta_ref_id IS NULL OR vf.titulo NOT LIKE 'Venda via Proposta #%')";
            $paramsVF = $params;
            $this->applyFilters($sqlInnerVF, $paramsVF, 'vf');
            
            $sql = "
                SELECT 
                    COALESCE(org.nome_fantasia, cli.nome, 'Cliente Desconhecido') as cliente_nome,
                    SUM(t.valor_total) as valor_total,
                    COUNT(t.id) as qtd_vendas
                FROM (
                    $sqlInnerP
                    UNION ALL
                    $sqlInnerVF
                ) t
                LEFT JOIN organizacoes org ON t.organizacao_id = org.id
                LEFT JOIN clientes_pf cli ON t.cliente_pf_id = cli.id
                GROUP BY cliente_nome
                ORDER BY valor_total DESC
            ";

            $stmt = $this->db->prepare($sql);
            $finalParams = array_merge($paramsP, $paramsVF);
            $stmt->execute($finalParams);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Calcula Curva ABC
            $totalGeral = array_sum(array_column($data, 'valor_total'));
            $accum = 0;
            foreach ($data as &$row) {
                $accum += $row['valor_total'];
                $percAcumulado = $totalGeral > 0 ? ($accum / $totalGeral) * 100 : 0;
                $row['percentual_acumulado'] = round($percAcumulado, 2);
                if ($percAcumulado <= 80) $row['classe'] = 'A';
                elseif ($percAcumulado <= 95) $row['classe'] = 'B';
                else $row['classe'] = 'C';
            }

            echo json_encode([
                'success' => true,
                'report_data' => $data,
                'type' => 'clients'
            ]);

        } catch (Exception $e) {
            $this->sendError($e);
        }
    }

    private function getKPISummary($start, $end)
    {
        try {
            $year = date('Y', strtotime($start));
            
            // Total Vendido (Aprovado) - Propostas Aprovadas + Vendas Fornecedores
            $sqlSales = "SELECT SUM(total) as total FROM (
                            SELECT COALESCE(SUM(valor_total), 0) as total FROM propostas 
                            WHERE status = 'Aprovada' AND YEAR(data_criacao) = ?
                            UNION ALL
                            SELECT COALESCE(SUM(valor_total), 0) FROM vendas_fornecedores 
                            WHERE YEAR(data_venda) = ?
                            AND (proposta_ref_id IS NULL OR titulo NOT LIKE 'Venda via Proposta #%')
                         ) as sales";
            $stmtSales = $this->db->prepare($sqlSales);
            $stmtSales->execute([$year, $year]);
            $totalSales = $stmtSales->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            // Vendas Perdidas (Propostas Recusadas)
            $sqlLost = "SELECT COALESCE(SUM(valor_total), 0) as total FROM propostas 
                        WHERE status = 'Recusada' AND YEAR(data_criacao) = ?";
            $stmtLost = $this->db->prepare($sqlLost);
            $stmtLost->execute([$year]);
            $lostSales = $stmtLost->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            // Licitações Ativas (Funil ID 2 e status não final)
            $sqlBids = "SELECT COUNT(*) as total FROM oportunidades o
                        JOIN etapas_funil ef ON o.etapa_id = ef.id
                        WHERE ef.funil_id = 2 AND ef.nome NOT IN ('Perdido', 'Fracassado', 'Concluído', 'Aprovado')";
            $stmtBids = $this->db->prepare($sqlBids);
            $stmtBids->execute();
            $activeBids = $stmtBids->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            // Vendas do Mês Atual (Aprovadas)
            list($dtStart, $dtEnd) = $this->getDates($start, $end);
            $month = date('m', strtotime($dtStart));
            $sqlMonth = "SELECT SUM(total) as total FROM (
                            SELECT COALESCE(SUM(valor_total), 0) as total FROM propostas 
                            WHERE status = 'Aprovada' AND MONTH(data_criacao) = ? AND YEAR(data_criacao) = ?
                            UNION ALL
                            SELECT COALESCE(SUM(valor_total), 0) FROM vendas_fornecedores 
                            WHERE MONTH(data_venda) = ? AND YEAR(data_venda) = ?
                            AND (proposta_ref_id IS NULL OR titulo NOT LIKE 'Venda via Proposta #%')
                         ) as month_sales";
            $stmtMonth = $this->db->prepare($sqlMonth);
            $stmtMonth->execute([$month, $year, $month, $year]);
            $monthSales = $stmtMonth->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

            // Vendas por Vendedor (Ano Atual - Top 5)
            $sqlByVendedor = "SELECT COALESCE(u.nome, 'Outros') as vendedor, SUM(total) as total FROM (
                                SELECT usuario_id, SUM(valor_total) as total FROM propostas 
                                WHERE status = 'Aprovada' AND YEAR(data_criacao) = ? GROUP BY usuario_id
                                UNION ALL
                                SELECT usuario_id, SUM(valor_total) FROM vendas_fornecedores 
                                WHERE YEAR(data_venda) = ? 
                                AND (proposta_ref_id IS NULL OR titulo NOT LIKE 'Venda via Proposta #%')
                                GROUP BY usuario_id
                             ) as vendedor_sales
                             LEFT JOIN usuarios u ON vendedor_sales.usuario_id = u.id
                             GROUP BY vendedor ORDER BY total DESC LIMIT 5";
            $stmtByVel = $this->db->prepare($sqlByVendedor);
            $stmtByVel->execute([$year, $year]);
            $salesByVendedor = $stmtByVel->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'total_sales' => (float)$totalSales,
                'lost_sales' => (float)$lostSales,
                'active_bids' => (int)$activeBids,
                'month_sales' => (float)$monthSales,
                'sales_by_vendedor' => $salesByVendedor,
                'year' => $year
            ]);
        } catch (Exception $e) {
            $this->sendError($e);
        }
    }

    private function getSalesVsGoalsData($start, $end)
    {
        try {
            list($dtStart, $dtEnd) = $this->getDates($start, $end);
            $year = date('Y', strtotime($dtStart));
            
            // Monthly Sales
            $sqlSales = "SELECT MONTH(dt) as mes, SUM(val) as total FROM (
                            SELECT data_criacao as dt, valor_total as val FROM propostas WHERE status = 'Aprovada' AND YEAR(data_criacao) = ?
                            UNION ALL
                            SELECT data_venda as dt, valor_total as val FROM vendas_fornecedores WHERE YEAR(data_venda) = ? AND (proposta_ref_id IS NULL OR titulo NOT LIKE 'Venda via Proposta #%')
                         ) as combined GROUP BY mes";
            $stmtSales = $this->db->prepare($sqlSales);
            $stmtSales->execute([$year, $year]);
            $sales = $stmtSales->fetchAll(PDO::FETCH_KEY_PAIR);

            // Monthly Goals (Sum of all supplier goals for that year)
            // Note: Simplification here, we take meta_mensal_json if exists, or meta_mensal
            $sqlGoals = "SELECT meta_mensal, meta_mensal_json FROM fornecedor_metas WHERE ano = ?";
            $stmtGoals = $this->db->prepare($sqlGoals);
            $stmtGoals->execute([$year]);
            $goalsRaw = $stmtGoals->fetchAll(PDO::FETCH_ASSOC);

            $monthlyGoals = array_fill(1, 12, 0);
            foreach ($goalsRaw as $g) {
                if (!empty($g['meta_mensal_json'])) {
                    $json = json_decode($g['meta_mensal_json'], true);
                    for ($m = 1; $m <= 12; $m++) {
                        $monthlyGoals[$m] += (float)($json[$m] ?? 0);
                    }
                } else {
                    for ($m = 1; $m <= 12; $m++) {
                        $monthlyGoals[$m] += (float)($g['meta_mensal'] ?? 0);
                    }
                }
            }

            $labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            $salesData = [];
            $goalsData = [];

            for ($m = 1; $m <= 12; $m++) {
                $salesData[] = (float)($sales[$m] ?? 0);
                $goalsData[] = (float)($monthlyGoals[$m] ?? 0);
            }

            echo json_encode([
                'success' => true,
                'labels' => $labels,
                'sales' => $salesData,
                'goals' => $goalsData
            ]);
        } catch (Exception $e) {
            $this->sendError($e);
        }
    }

    private function getCommissionAnalysis($start, $end, $return = false, $suppliers = [])
    {
        try {
            list($dtStart, $dtEnd) = $this->getDates($start, $end);

            $salesSupplierFilter = "";
            $metaSupplierFilter = "";
            $supplierParams = [];

            if (!empty($suppliers)) {
                $placeholders = implode(',', array_fill(0, count($suppliers), '?'));
                $salesSupplierFilter = " AND fornecedor_id IN ($placeholders)";
                $metaSupplierFilter = " AND fornecedor_id IN ($placeholders)";
                $supplierParams = $suppliers;
            }

            // Fetch users with their financial settings
            $sql = "SELECT 
                        u.id as usuario_id, 
                        u.nome,
                        COALESCE(uf.valor_fixo, 0) as valor_fixo,
                        COALESCE(uf.percentual_comissao, 1.00) as percentual_comissao,
                        COALESCE(uf.valor_trimestre, 0) as valor_trimestre,
                        -- Approved Sales (From Log source - includes items from proposals)
                        (SELECT COALESCE(SUM(valor_total), 0) 
                         FROM vendas_fornecedores 
                         WHERE usuario_id = u.id 
                           AND data_venda BETWEEN ? AND ? 
                           $salesSupplierFilter
                        ) as total_vendas,
                        -- Goals: Sum of all monthly goals within the period (including month 0 as annual/default)
                        (SELECT COALESCE(SUM(valor_meta), 0) 
                         FROM vendas_objetivos 
                         WHERE usuario_id = u.id 
                           AND (
                             ((ano * 100 + mes) >= (YEAR(?) * 100 + MONTH(?)) AND (ano * 100 + mes) <= (YEAR(?) * 100 + MONTH(?)))
                             OR (mes = 0 AND ano BETWEEN YEAR(?) AND YEAR(?))
                           )
                           $metaSupplierFilter
                        ) as meta_mensal
                    FROM usuarios u
                    LEFT JOIN usuarios_financas uf ON u.id = uf.usuario_id
                    WHERE u.role IN ('Vendedor', 'Analista', 'Gestor', 'Representante', 'Comercial', 'Especialista') 
                      AND u.deleted_at IS NULL";
            
            $stmt = $this->db->prepare($sql);
            
            // Build parameters in order: 
            // 2 (sales dates) + S (suppliers) + 4 (meta range) + 2 (meta years) + S (suppliers)
            $params = array_merge(
                [$dtStart, $dtEnd],         // Sales subquery dates
                $supplierParams,            // Sales subquery suppliers
                [$dtStart, $dtStart],       // Meta range start (YEAR, MONTH)
                [$dtEnd, $dtEnd],           // Meta range end (YEAR, MONTH)
                [$dtStart, $dtEnd],         // Meta years for mes=0
                $supplierParams             // Meta subquery suppliers
            );

            $stmt->execute($params);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($data as &$row) {
                $row['total_vendas'] = (float)$row['total_vendas'];
                $row['comissao_valor'] = ($row['total_vendas'] * ($row['percentual_comissao'] / 100));
                $row['total_periodo'] = (float)$row['valor_fixo'] + $row['comissao_valor'];
                $row['atingimento'] = $row['meta_mensal'] > 0 ? ($row['total_vendas'] / $row['meta_mensal']) * 100 : 0;
            }

            $result = [
                'success' => true,
                'data' => $data
            ];

            if ($return) return $result;
            echo json_encode($result);
        } catch (Exception $e) {
            if ($return) return ['success' => false, 'error' => $e->getMessage()];
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    private function getVendorEvolution($start, $end)
    {
        try {
            list($dtStart, $dtEnd) = $this->getDates($start, $end);
            $year = date('Y', strtotime($dtStart));

            // Monthly sales per vendor for the full year
            $sql = "SELECT 
                        u.id as usuario_id,
                        u.nome,
                        MONTH(vf.data_venda) as mes,
                        SUM(vf.valor_total) as total_vendas
                    FROM vendas_fornecedores vf
                    JOIN usuarios u ON vf.usuario_id = u.id
                    WHERE YEAR(vf.data_venda) = ?
                      AND u.role IN ('Vendedor','Analista','Gestor','Representante','Comercial','Especialista')
                      AND u.deleted_at IS NULL
                    GROUP BY u.id, u.nome, MONTH(vf.data_venda)
                    ORDER BY u.nome, mes";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$year]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Group by user
            $evolution = [];
            foreach ($rows as $row) {
                $uid = $row['usuario_id'];
                if (!isset($evolution[$uid])) {
                    $evolution[$uid] = [
                        'usuario_id' => $uid,
                        'nome' => $row['nome'],
                        'meses' => array_fill(1, 12, 0)
                    ];
                }
                $evolution[$uid]['meses'][(int)$row['mes']] = (float)$row['total_vendas'];
            }

            echo json_encode([
                'success' => true,
                'year' => $year,
                'data' => array_values($evolution)
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    private function getForecastReport($start, $end)
    {
        try {
            list($dtStart, $dtEnd) = $this->getDates($start, $end);
            $params = [$dtStart, $dtEnd];
            
            $sql = "
            SELECT 
                DATE_FORMAT(COALESCE(o.data_abertura, o.data_criacao), '%Y-%m') as mes,
                SUM(o.valor * (COALESCE(ef.probabilidade, 0) / 100)) as forecast_ponderado,
                SUM(o.valor) as pipeline_total
            FROM oportunidades o
            LEFT JOIN etapas_funil ef ON o.etapa_id = ef.id
            WHERE COALESCE(o.data_abertura, o.data_criacao) BETWEEN ? AND ?
            ";
            
            $this->applyFilters($sql, $params, 'o');
            
            $sql .= " GROUP BY mes ORDER BY mes ASC";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode([
                'success' => true,
                'report_data' => $stmt->fetchAll(PDO::FETCH_ASSOC),
                'type' => 'forecast'
            ]);
        } catch (Exception $e) {
            $this->sendError($e);
        }
    }

    private function executeQuery($sql, $params = [])
    {
        $stmt = $this->db->prepare($sql);
        $stmt->execute(is_array($params) ? $params : [$params]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private function sendError($e)
    {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// --- LEGACY COMPATIBILITY FUNCTIONS ---
// Ensures existing frontend continues to work while new functions are available.

function handle_get_report_data($pdo)
{
    // BRIDGE to New Class if action matches new logic keys
    $type = $_GET['report_type'] ?? ($_GET['type'] ?? '');

    // DEBUG: Logging Removed

    $newActions = [
        'dashboard_summary', 'by_vendor', 'by_supplier', 'by_item', 
        'by_proposal_status', 'by_bidding_funnel', 'clients', 'forecast', 
        'bi_kpis', 'sales_vs_goals', 'licitacoes_funnel', 'licitacoes',
        'commission_analysis', 'vendor_evolution'
    ];

    if (in_array($type, $newActions)) {
        $handler = new ReportHandler();
        $handler->handleRequest('GET', $type);
        return;
    }

    // --- OLD LOGIC ---

    $start_date = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-01-01');
    $end_date = isset($_GET['end_date']) ? $_GET['end_date'] : date('Y-12-31');

    // Fix Month Format (YYYY-MM to YYYY-MM-DD)
    if (preg_match('/^\d{4}-\d{2}$/', $start_date)) {
        $start_date .= '-01';
    }
    if (preg_match('/^\d{4}-\d{2}$/', $end_date)) {
        $end_date = date('Y-m-t', strtotime($end_date . '-01'));
    }

    $supplier_id_input = isset($_GET['supplier_id']) ? $_GET['supplier_id'] : null;
    $user_id_input = isset($_GET['user_id']) ? $_GET['user_id'] : null;

    $parseSupplierIds = function ($input) {
        if (is_array($input)) return $input;
        if (is_string($input) && strlen($input) > 0) return explode(',', $input);
        if ($input) return [$input];
        return [];
    };

    $parseIds = function ($input) {
        if (is_array($input))
            return array_map(function($v) { return is_numeric($v) ? (int)$v : $v; }, $input);
        if (is_string($input) && strlen($input) > 0)
            return array_map(function($v) { return is_numeric($v) ? (int)$v : $v; }, explode(',', $input));
        if (is_numeric($input))
            return [(int) $input];
        if (is_string($input) && strlen($input) > 0)
            return [$input];
        return [];
    };

    $supplier_ids = $parseIds($supplier_id_input);
    $supplier_ids_raw = $parseSupplierIds($supplier_id_input);
    $user_ids = $parseIds($user_id_input);
    $cliente_ids_input = isset($_GET['cliente_id']) ? $_GET['cliente_id'] : null;
    $cliente_ids = [];
    if (!empty($cliente_ids_input)) {
        $cliente_ids = explode(',', $cliente_ids_input);
    }
    $etapa_ids = $parseIds($_GET['etapa_id'] ?? null);
    $origem_ids = [];
    if (isset($_GET['origem']) && !empty($_GET['origem'])) {
        $origem_ids = explode(',', $_GET['origem']);
    }

    $uf_ids = [];
    if (isset($_GET['uf']) && !empty($_GET['uf'])) {
        $uf_ids = explode(',', $_GET['uf']);
    }

    $status_ids = [];
    if (isset($_GET['status']) && !empty($_GET['status'])) {
        $status_ids = explode(',', $_GET['status']);
    }

    try {
        $data = [];

        if ($type === 'products') {
            $data = get_products_report($pdo, $start_date, $end_date, $supplier_ids, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);
        } elseif ($type === 'clients') {
            $data = get_clients_report($pdo, $start_date, $end_date, $supplier_ids, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);
        } elseif ($type === 'forecast') {
            $sql = "
            SELECT 
                DATE_FORMAT(COALESCE(o.data_abertura, o.data_criacao), '%Y-%m') as mes,
                SUM(
                    COALESCE(
                        (SELECT SUM(p.valor_total) FROM propostas p WHERE p.oportunidade_id = o.id AND p.status = 'Aprovada'),
                        (SELECT SUM(pi.quantidade * pi.valor_unitario) FROM proposta_itens pi JOIN propostas p ON p.id = pi.proposta_id WHERE p.oportunidade_id = o.id AND p.status = 'Aprovada'),
                        o.valor,
                        0
                    ) * (COALESCE(ef.probabilidade, 0) / 100)
                ) as forecast_ponderado,
                SUM(
                    COALESCE(
                        (SELECT SUM(p.valor_total) FROM propostas p WHERE p.oportunidade_id = o.id AND p.status = 'Aprovada'),
                        (SELECT SUM(pi.quantidade * pi.valor_unitario) FROM proposta_itens pi JOIN propostas p ON p.id = pi.proposta_id WHERE p.oportunidade_id = o.id AND p.status = 'Aprovada'),
                        o.valor,
                        0
                    )
                ) as pipeline_total
            FROM oportunidades o
            LEFT JOIN etapas_funil ef ON o.etapa_id = ef.id
            WHERE COALESCE(o.data_abertura, o.data_criacao) BETWEEN ? AND ?
        ";
            $params = [$start_date, $end_date];
            apply_report_filters_helper($sql, $params, 'o', $supplier_ids, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);
            $sql .= " GROUP BY mes ORDER BY mes ASC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        } elseif ($type === 'lost_reasons') {
            $sql = "
            SELECT 
                COALESCE(NULLIF(TRIM(p.motivo_status), ''), 'Não Informado') as motivo,
                COUNT(p.id) as qtd,
                COALESCE(SUM(p.valor_total), 0) as valor_total
            FROM propostas p
            LEFT JOIN oportunidades o ON p.oportunidade_id = o.id
            WHERE p.data_criacao BETWEEN ? AND ?
              AND (
                  p.status LIKE 'Recusad%'
              )
        ";
            $params = [$start_date . ' 00:00:00', $end_date . ' 23:59:59'];

            // Apply filters to Opportunity (o)
            apply_report_filters_helper($sql, $params, 'o', $supplier_ids, [], $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);

            // Apply User Filter to Proposal (p) manually if needed
            if (!empty($user_ids)) {
                $in_params = trim(str_repeat('?,', count($user_ids)), ',');
                $sql .= " AND p.usuario_id IN ($in_params)";
                foreach ($user_ids as $uid) {
                    $params[] = $uid;
                }
            }

            $sql .= " GROUP BY motivo ORDER BY qtd DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        } elseif ($type === 'funnel') {
            $sql = "
            SELECT 
                ef.nome as etapa_nome, ef.ordem as etapa_ordem,
                COUNT(o.id) as qtd_oportunidades, SUM(o.valor) as valor_total
            FROM oportunidades o
            JOIN etapas_funil ef ON o.etapa_id = ef.id
            WHERE o.data_criacao BETWEEN ? AND ?
              AND ef.funil_id = 1
        ";
            $params = [$start_date, $end_date];
            apply_report_filters_helper($sql, $params, 'o', $supplier_ids, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);
            $sql .= " GROUP BY ef.id, ef.nome, ef.ordem ORDER BY ef.ordem ASC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Hardcode 8 fixed steps for funnel
            $etapas_rigidas = ['Prospectando', 'Contato', 'Negociação', 'Proposta', 'Fechado', 'Controle de Entrega', 'Pós-venda', 'Recusado'];
            
            $structured_funnel = [];
            foreach ($etapas_rigidas as $idx => $nome) {
                $structured_funnel[$nome] = [
                    'label' => $nome,
                    'etapa_nome' => $nome,
                    'etapa_ordem' => $idx + 1,
                    'count' => 0,
                    'value' => 0,
                    'qtd_oportunidades' => 0,
                    'valor_total' => 0
                ];
            }

            foreach($results as $r) {
                $matched = false;
                foreach($etapas_rigidas as $nr) {
                     if (strcasecmp(trim($r['etapa_nome']), $nr) === 0) {
                         $structured_funnel[$nr]['count'] += $r['qtd_oportunidades'];
                         $structured_funnel[$nr]['value'] += $r['valor_total'];
                         $structured_funnel[$nr]['qtd_oportunidades'] += $r['qtd_oportunidades'];
                         $structured_funnel[$nr]['valor_total'] += $r['valor_total'];
                         $matched = true;
                         break;
                     }
                }
                if (!$matched) {
                     $structured_funnel[$r['etapa_nome']] = [
                          'label' => $r['etapa_nome'],
                          'etapa_nome' => $r['etapa_nome'],
                          'etapa_ordem' => $r['etapa_ordem'],
                          'count' => $r['qtd_oportunidades'],
                          'value' => $r['valor_total'],
                          'qtd_oportunidades' => $r['qtd_oportunidades'],
                          'valor_total' => $r['valor_total']
                     ];
                }
            }
            $data = array_values($structured_funnel);

        } elseif ($type === 'supplier_funnel') {
            $data = get_supplier_meta_performance($pdo, $start_date, $end_date, $supplier_ids_raw);
        } elseif ($type === 'licitacoes_funnel') {
            $data = get_licitacoes_funnel_report($pdo, $start_date, $end_date, $supplier_ids, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);
        } elseif ($type === 'licitacoes') {
            $data = get_licitacoes_report($pdo, $start_date, $end_date, $supplier_ids, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);
        } elseif ($type === 'contratos') {
            $data = get_contracts_report($pdo, $start_date, $end_date, $supplier_ids, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);

        } elseif ($type === 'vendor_detail') {
            $data = get_vendor_detail_report($pdo, $start_date, $end_date, $supplier_ids, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);

        } elseif ($type === 'billing') {
            $data = get_billing_report($pdo, $start_date, $end_date, $supplier_ids, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);
            
        } elseif ($type === 'products') {
            $data = get_products_report($pdo, $start_date, $end_date, $supplier_ids, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);

        } elseif ($type === 'bi_kpis') {
            $data = get_bi_kpis($pdo, $start_date, $end_date, $supplier_ids, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);
            echo json_encode(array_merge(['success' => true, 'type' => $type], $data));
            return;

        } elseif ($type === 'sales_vs_goals') {
            $data = get_sales_vs_goals($pdo, $start_date, $end_date, $supplier_ids, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);
            echo json_encode(array_merge(['success' => true, 'type' => $type], $data));
            return;

        } else {
            $data = get_sales_report($pdo, $start_date, $end_date, $supplier_ids_raw, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);
        }

        echo json_encode(['success' => true, 'report_data' => $data, 'type' => $type]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function handle_get_report_kpis($pdo)
{
    try {
        $stmt_sales = $pdo->query("SELECT SUM(valor_total) FROM vendas_fornecedores WHERE YEAR(data_venda) = YEAR(CURDATE()) AND (proposta_ref_id IS NULL OR titulo NOT LIKE 'Venda via Proposta #%')");
        $total_sales = $stmt_sales->fetchColumn() ?: 0;

        $stmt_lost = $pdo->query("SELECT SUM(valor_total) FROM propostas WHERE status LIKE 'Recusada%' AND YEAR(data_criacao) = YEAR(CURDATE())");
        $lost_sales = $stmt_lost->fetchColumn() ?: 0;

        $stmt_bids = $pdo->query("
            SELECT COUNT(*) FROM oportunidades o 
            LEFT JOIN etapas_funil ef ON o.etapa_id = ef.id
            WHERE o.numero_edital IS NOT NULL AND o.numero_edital != '' 
            AND ef.nome NOT IN ('Fechado', 'Perdido', 'Fracassado')
        ");
        $active_bids = $stmt_bids->fetchColumn() ?: 0;

        json_response([
            'success' => true,
            'kpis' => [
                'total_sales_year' => (float) $total_sales,
                'lost_sales_year' => (float) $lost_sales,
                'active_bids' => (int) $active_bids
            ]
        ]);
    } catch (Exception $e) {
        // file_put_contents(__DIR__ . '/../../api_debug_log.txt', date('[Y-m-d H:i:s] ') . "Error fetching KPIs: " . $e->getMessage() . PHP_EOL, FILE_APPEND);
        json_response(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

function handle_get_supplier_targets($pdo)
{
    $supplier_id = isset($_GET['supplier_id']) ? (int) $_GET['supplier_id'] : null;
    $year = isset($_GET['year']) ? (int) $_GET['year'] : date('Y');

    if (!$supplier_id) {
        json_response(['success' => false, 'error' => 'Fornecedor não informado.'], 400);
        return;
    }

    try {
        $stmt_sup = $pdo->prepare("SELECT meta_anual, meta_mensal, meta_mensal_json, user_targets_enabled FROM fornecedor_metas WHERE fornecedor_id = ? AND ano = ?");
        $stmt_sup->execute([$supplier_id, $year]);
        $sup_meta = $stmt_sup->fetch(PDO::FETCH_ASSOC);

        $result = [
            'meta_anual' => $sup_meta ? (float) $sup_meta['meta_anual'] : 0,
            'meta_mensal' => $sup_meta ? (float) $sup_meta['meta_mensal'] : 0,
            'meta_mensal_detailed' => ($sup_meta && !empty($sup_meta['meta_mensal_json'])) ? json_decode($sup_meta['meta_mensal_json'], true) : [],
            'user_targets_enabled' => $sup_meta ? (int) ($sup_meta['user_targets_enabled'] ?? 1) : 1,
            'state_targets' => [],
            'targets' => []
        ];

        try {
            $stmt_states = $pdo->prepare("SELECT estado, meta_anual, meta_mensal_json FROM fornecedor_metas_estados WHERE fornecedor_id = ? AND ano = ?");
            $stmt_states->execute([$supplier_id, $year]);
            foreach ($stmt_states->fetchAll(PDO::FETCH_ASSOC) as $sr) {
                $result['state_targets'][$sr['estado']] = [
                    'meta_anual' => (float) $sr['meta_anual'],
                    'meta_mensal' => json_decode($sr['meta_mensal_json'] ?? '[]', true)
                ];
            }
        } catch (Exception $ex) {
        }

        $stmt_users = $pdo->prepare("SELECT usuario_id, mes, valor_meta FROM vendas_objetivos WHERE fornecedor_id = ? AND ano = ?");
        $stmt_users->execute([$supplier_id, $year]);
        foreach ($stmt_users->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $result['targets'][$row['usuario_id']][$row['mes']] = (float) $row['valor_meta'];
        }

        json_response(['success' => true, 'data' => $result]);

    } catch (Exception $e) {
        json_response(['success' => true, 'data' => ['meta_anual' => 0, 'meta_mensal' => 0, 'targets' => [], 'state_targets' => [], 'user_targets_enabled' => 1]]);
    }
}

function handle_save_targets($pdo)
{
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !isset($data['year']) || !isset($data['targets'])) {
        json_response(['success' => false, 'error' => 'Dados inválidos.'], 400);
        return;
    }

    $year = (int) $data['year'];
    $targets = $data['targets'];
    $supplier_id = isset($data['supplier_id']) ? (int) $data['supplier_id'] : ($targets[0]['fornecedor_id'] ?? 0);
    $supGoals = $data['supplier_goals'] ?? ['annual' => 0, 'monthly' => 0];
    $stateTargets = $data['state_targets'] ?? [];
    $userTargetsEnabled = isset($data['user_targets_enabled']) ? (int) $data['user_targets_enabled'] : 1;

    try {
        $pdo->beginTransaction();
        $monthlyDetailedJson = isset($supGoals['monthly_detailed']) ? json_encode($supGoals['monthly_detailed']) : null;

        $stmt = $pdo->prepare("INSERT INTO fornecedor_metas (fornecedor_id, ano, meta_anual, meta_mensal, meta_mensal_json, user_targets_enabled) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE meta_anual = VALUES(meta_anual), meta_mensal = VALUES(meta_mensal), meta_mensal_json = VALUES(meta_mensal_json), user_targets_enabled = VALUES(user_targets_enabled)");
        $stmt->execute([$supplier_id, $year, $supGoals['annual'], $supGoals['monthly'], $monthlyDetailedJson, $userTargetsEnabled]);

        $stmtState = $pdo->prepare("INSERT INTO fornecedor_metas_estados (fornecedor_id, ano, estado, meta_anual, meta_mensal_json) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE meta_anual = VALUES(meta_anual), meta_mensal_json = VALUES(meta_mensal_json)");
        $savedStates = [];
        foreach ($stateTargets as $state => $sData) {
            $stmtState->execute([$supplier_id, $year, $state, $sData['annual'], json_encode($sData['monthly'])]);
            $savedStates[] = $state;
        }

        // Remove old states that were deleted from the UI
        if (!empty($savedStates)) {
            $placeholders = implode(',', array_fill(0, count($savedStates), '?'));
            $deleteParams = array_merge([$supplier_id, $year], $savedStates);
            $stmtDeleteStates = $pdo->prepare("DELETE FROM fornecedor_metas_estados WHERE fornecedor_id = ? AND ano = ? AND estado NOT IN ($placeholders)");
            $stmtDeleteStates->execute($deleteParams);
        } else {
            // If mapping is entirely empty, delete all states for this supplier and year
            $stmtDeleteStates = $pdo->prepare("DELETE FROM fornecedor_metas_estados WHERE fornecedor_id = ? AND ano = ?");
            $stmtDeleteStates->execute([$supplier_id, $year]);
        }

        $stmtUser = $pdo->prepare("INSERT INTO vendas_objetivos (fornecedor_id, usuario_id, ano, mes, valor_meta, created_at) VALUES (?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE valor_meta = VALUES(valor_meta), updated_at = NOW()");
        foreach ($targets as $t) {
            $stmtUser->execute([$t['fornecedor_id'], $t['usuario_id'], $year, $t['mes'], $t['valor']]);
        }

        $pdo->commit();
        json_response(['success' => true]);
    } catch (Exception $e) {
        if ($pdo->inTransaction())
            $pdo->rollBack();
        json_response(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// --- HELPER FUNCTIONS ---

function get_sales_report($pdo, $start_date, $end_date, $supplier_ids = [], $user_ids = [], $etapa_ids = [], $origem_ids = [], $uf_ids = [], $status_ids = [], $cliente_ids = [])
{
    $buildIn = function ($ids) {
        if (empty($ids))
            return [null, []];
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        return [$placeholders, $ids];
    };

    // Build supplier lookup map (Nome -> ID)
    $stmt_sup = $pdo->query("SELECT id, nome FROM fornecedores");
    $suppliers_map = [];
    while ($s = $stmt_sup->fetch(PDO::FETCH_ASSOC)) {
        $suppliers_map[strtoupper(trim($s['nome'] ?? ''))] = (int) $s['id'];
    }

    // RESOLVE SUPPLIER NAMES TO IDs
    $resolved_supplier_ids = [];
    foreach ($supplier_ids as $sid) {
        if (is_numeric($sid)) {
            $resolved_supplier_ids[] = (int) $sid;
        } else {
            $sname = strtoupper(trim($sid));
            if (isset($suppliers_map[$sname])) {
                $resolved_supplier_ids[] = $suppliers_map[$sname];
            }
        }
    }
    $supplier_ids = $resolved_supplier_ids; // Now they are all integers

    $sql = "SELECT vf.id, vf.fornecedor_id, f.nome as fornecedor_nome, vf.usuario_id, u.nome as vendedor_nome, vf.titulo, vf.fabricante_marca, vf.descricao_produto, YEAR(vf.data_venda) as ano, MONTH(vf.data_venda) as mes, SUM(vf.valor_total) as total_vendido 
            FROM vendas_fornecedores vf 
            LEFT JOIN fornecedores f ON vf.fornecedor_id = f.id 
            LEFT JOIN usuarios u ON vf.usuario_id = u.id 
            WHERE vf.data_venda BETWEEN ? AND ?
            AND (vf.proposta_ref_id IS NULL OR vf.titulo NOT LIKE 'Venda via Proposta #%')";
    $params = [$start_date, $end_date];
    apply_report_filters_helper($sql, $params, 'vf', [], $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);
    $sql .= " GROUP BY vf.id, vf.fornecedor_id, vf.usuario_id, YEAR(vf.data_venda), MONTH(vf.data_venda)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $vendas_raw = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $vendas_data = [];
    foreach ($vendas_raw as $vr) {
        $fid = (int)$vr['fornecedor_id'];
        $fname = $vr['fornecedor_nome'];

        if (!$fid) {
            $mfr = strtoupper(trim($vr['fabricante_marca'] ?? ''));
            if ($mfr && isset($suppliers_map[$mfr])) {
                $fid = $suppliers_map[$mfr];
                $fname = $mfr;
            } else {
                // Tenta buscar no título ou descrição
                $desc = strtoupper($vr['titulo'] . ' ' . $vr['descricao_produto']);
                foreach ($suppliers_map as $name => $id) {
                    if (strpos($desc, $name) !== false) {
                        $fid = $id;
                        $fname = $name;
                        break;
                    }
                }
            }
        }
        
        // CUIDADO: Filtra apenas depois da recuperação
        if (!empty($supplier_ids) && !in_array($fid, $supplier_ids)) continue;

        $vr['fornecedor_id'] = $fid;
        $vr['fornecedor_nome'] = $fname;
        $vendas_data[] = $vr;
    }

    // ADICIONADO: Propostas Aprovadas como Venda
    $sql_prop = "SELECT p.id, o.fornecedor_id, f.nome as fornecedor_nome, p.usuario_id, u.nome as vendedor_nome, YEAR(p.data_criacao) as ano, MONTH(p.data_criacao) as mes, SUM(p.valor_total) as total_vendido
                 FROM propostas p
                 JOIN oportunidades o ON p.oportunidade_id = o.id
                 LEFT JOIN fornecedores f ON o.fornecedor_id = f.id
                 LEFT JOIN usuarios u ON p.usuario_id = u.id
                 WHERE p.status = 'Aprovada' AND p.data_criacao BETWEEN ? AND ?";
    $params_prop = [$start_date . ' 00:00:00', $end_date . ' 23:59:59'];
    apply_report_filters_helper($sql_prop, $params_prop, 'o', [], $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);
    $sql_prop .= " GROUP BY p.id, o.fornecedor_id, p.usuario_id, YEAR(p.data_criacao), MONTH(p.data_criacao)";
    $stmt_prop = $pdo->prepare($sql_prop);
    $stmt_prop->execute($params_prop);
    $propostas_raw = $stmt_prop->fetchAll(PDO::FETCH_ASSOC);

    // Busca itens para recuperação de fornecedor se necessário
    $prop_ids = array_column($propostas_raw, 'id');
    $items_by_prop = [];
    if (!empty($prop_ids)) {
        $ph_items = implode(',', array_fill(0, count($prop_ids), '?'));
        $stmt_items = $pdo->prepare("SELECT proposta_id, fabricante FROM proposta_itens WHERE proposta_id IN ($ph_items)");
        $stmt_items->execute($prop_ids);
        while ($item = $stmt_items->fetch(PDO::FETCH_ASSOC)) {
            $items_by_prop[$item['proposta_id']][] = $item['fabricante'];
        }
    }

    $propostas_aprovadas = [];
    foreach ($propostas_raw as $pr) {
        $fid = (int)$pr['fornecedor_id'];
        $fname = $pr['fornecedor_nome'];
        
        // RECUPERAÇÃO DE FORNECEDOR: Se não informado, tenta buscar nos itens
        if (!$fid) {
            $prop_items = $items_by_prop[$pr['id']] ?? [];
            foreach ($prop_items as $mfr_raw) {
                $mfr = strtoupper(trim($mfr_raw ?? ''));
                if ($mfr && isset($suppliers_map[$mfr])) {
                    $fid = $suppliers_map[$mfr];
                    $fname = $mfr;
                    break;
                }
            }
        }
        
        $pr['fornecedor_id'] = $fid;
        $pr['fornecedor_nome'] = $fname;

        // CUIDADO: Filtra apenas depois da recuperação
        if (!empty($supplier_ids) && !in_array($fid, $supplier_ids)) continue;

        $propostas_aprovadas[] = $pr;
    }

    // Merge propostas_aprovadas into vendas_data
    $vendas_data = array_merge($vendas_data, $propostas_aprovadas);

    // Notas Fiscais (Faturado) Fetching Logic
    // We fetch individual NFs and their items to attribute values correctly to suppliers
    $sql_nf = "SELECT nf.id, nf.itens, nf.valor as total_nf, o.fornecedor_id, f.nome as fornecedor_nome, o.usuario_id, u.nome as vendedor_nome, YEAR(nf.data_faturamento) as ano, MONTH(nf.data_faturamento) as mes
               FROM notas_fiscais nf 
               JOIN oportunidades o ON nf.oportunidade_id = o.id 
               LEFT JOIN fornecedores f ON o.fornecedor_id = f.id 
               LEFT JOIN usuarios u ON o.usuario_id = u.id 
               WHERE nf.data_faturamento BETWEEN ? AND ?";
    $params_nf = [$start_date, $end_date];

    // Important: We do NOT filter by supplier_ids in the SQL for NFs here if we want to catch items from other suppliers inside mixed opportunities.
    // However, we still filter by other criteria (Client, User, etc.)
    apply_report_filters_helper($sql_nf, $params_nf, 'o', [], $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);

    $stmt_nf = $pdo->prepare($sql_nf);
    $stmt_nf->execute($params_nf);
    $raw_nf_data = $stmt_nf->fetchAll(PDO::FETCH_ASSOC);

    $nf_data = []; // Aggregated results for report_data

    foreach ($raw_nf_data as $nf) {
        $items = !empty($nf['itens']) ? json_decode($nf['itens'], true) : [];
        $has_item_supplier = false;
        $attributed_by_supplier = [];

        if (is_array($items) && !empty($items)) {
            foreach ($items as $item) {
                $item_val = (float) ($item['valor_total'] ?? (($item['quantidade'] ?? 0) * ($item['valor_unitario'] ?? 0)));
                if ($item_val <= 0) continue;

                $item_sup_name = strtoupper(trim($item['fornecedor'] ?? $item['fabricante'] ?? ''));
                $item_sup_id = ($item_sup_name && isset($suppliers_map[$item_sup_name])) ? $suppliers_map[$item_sup_name] : null;

                $target_fid = $item_sup_id ?: $nf['fornecedor_id'];
                $target_fname = $item_sup_id ? $item['fornecedor'] : $nf['fornecedor_nome'];

                $key = "{$target_fid}|{$nf['usuario_id']}|{$nf['ano']}|{$nf['mes']}";
                if (!isset($attributed_by_supplier[$key])) {
                    $attributed_by_supplier[$key] = [
                        'fornecedor_id' => $target_fid,
                        'fornecedor_nome' => $target_fname,
                        'usuario_id' => $nf['usuario_id'],
                        'vendedor_nome' => $nf['vendedor_nome'],
                        'ano' => $nf['ano'],
                        'mes' => $nf['mes'],
                        'total_faturado' => 0
                    ];
                }
                $attributed_by_supplier[$key]['total_faturado'] += $item_val;
            }
        }

        if (empty($attributed_by_supplier)) {
            // Fallback to opportunity supplier if no items or items have no value
            $key = "{$nf['fornecedor_id']}|{$nf['usuario_id']}|{$nf['ano']}|{$nf['mes']}";
            $attributed_by_supplier[$key] = [
                'fornecedor_id' => $nf['fornecedor_id'],
                'fornecedor_nome' => $nf['fornecedor_nome'],
                'usuario_id' => $nf['usuario_id'],
                'vendedor_nome' => $nf['vendedor_nome'],
                'ano' => $nf['ano'],
                'mes' => $nf['mes'],
                'total_faturado' => (float) $nf['total_nf']
            ];
        }
        foreach ($attributed_by_supplier as $attr) {
            // Filter by supplier_ids manually in PHP if SQL filter was removed
            if (!empty($supplier_ids) && !in_array($attr['fornecedor_id'], $supplier_ids)) continue;
            $nf_data[] = $attr;
        }
    }

    // --- NEW GOAL SYSTEM (Replacing vendas_objetivos) ---
    $metas_vendedores = [];
    $stmt_cc = $pdo->query("SELECT usuario_id, meta_mensal FROM commission_config WHERE ativo = 1");
    while($cc = $stmt_cc->fetch(PDO::FETCH_ASSOC)) {
        $metas_vendedores[$cc['usuario_id']] = (float)$cc['meta_mensal'];
    }

    $metas_fornecedores = [];
    $stmt_st = $pdo->prepare("SELECT fornecedor_nome, month, meta_mensal FROM supplier_monthly_targets WHERE year = ?");
    $stmt_st->execute([date('Y', strtotime($start_date))]);
    while($st = $stmt_st->fetch(PDO::FETCH_ASSOC)) {
        $fname = strtoupper(trim($st['fornecedor_nome']));
        $fid = $suppliers_map[$fname] ?? 0;
        if ($fid) {
            $metas_fornecedores[$fid][$st['month']] = (float)$st['meta_mensal'];
        }
    }

    $report_data = [];
    $initStructure = function (&$array, $fid, $fname, $uid, $uname) {
        $fid = $fid ?: 0;
        $uid = $uid ?: 0;
        $fname = $fname ?: "Fornecedor não informado";
        $uname = $uname ?: "Não informado";

        if (!isset($array[$fid]))
            $array[$fid] = ['fornecedor_id' => $fid, 'fornecedor_nome' => $fname, 'rows' => []];
        if (!isset($array[$fid]['rows_map'][$uid]))
            $array[$fid]['rows_map'][$uid] = ['usuario_id' => $uid, 'vendedor_nome' => $uname, 'dados_mes' => []];
    };

    foreach ($vendas_data as $row) {
        $initStructure($report_data, $row['fornecedor_id'], $row['fornecedor_nome'], $row['usuario_id'], $row['vendedor_nome']);
        $fid = $row['fornecedor_id'] ?: 0;
        $uid = $row['usuario_id'] ?: 0;
        // Initialize if not set
        if (!isset($report_data[$fid]['rows_map'][$uid]['dados_mes'][$row['ano'] . '-' . $row['mes']]['venda'])) {
            $report_data[$fid]['rows_map'][$uid]['dados_mes'][$row['ano'] . '-' . $row['mes']]['venda'] = 0;
        }
        $report_data[$fid]['rows_map'][$uid]['dados_mes'][$row['ano'] . '-' . $row['mes']]['venda'] += (float) $row['total_vendido'];
    }
    foreach ($nf_data as $row) {
        $initStructure($report_data, $row['fornecedor_id'], $row['fornecedor_nome'], $row['usuario_id'], $row['vendedor_nome']);
        $fid = $row['fornecedor_id'] ?: 0;
        $uid = $row['usuario_id'] ?: 0;
        if (!isset($report_data[$fid]['rows_map'][$uid]['dados_mes'][$row['ano'] . '-' . $row['mes']]['faturado'])) {
            $report_data[$fid]['rows_map'][$uid]['dados_mes'][$row['ano'] . '-' . $row['mes']]['faturado'] = 0;
        }
        $report_data[$fid]['rows_map'][$uid]['dados_mes'][$row['ano'] . '-' . $row['mes']]['faturado'] += (float) $row['total_faturado'];
    }
    // Omit metas_data loop and handle metas inside sales loops or after to use new seller goals
    // We already have $report_data correctly initialized by vendas and invoices.
    // Let's apply seller goals (commission_config) to every row that has sales.
    // And apply supplier goals (supplier_monthly_targets) to global_metas_map.
    foreach ($report_data as $fid => &$supplier) {
        // Se houver filtro de fornecedor, remove o que não bater (segurança extra)
        if (!empty($supplier_ids) && !in_array($fid, $supplier_ids)) {
            unset($report_data[$fid]);
            continue;
        }
        foreach ($supplier['rows_map'] as $uid => &$row) {
            foreach ($row['dados_mes'] as $moKey => &$monthData) {
                // If this is the "new" meta system, use the seller's global monthly goal
                // but only in the main supplier or spread it? 
                // User screenshot suggests they want the flat value (e.g. 80.500)
                $monthData['meta'] = $metas_vendedores[$uid] ?? 0;
            }
        }
    }

    // Updated Global Suppier Metas using supplier_monthly_targets
    $global_metas_map = [];
    foreach ($metas_fornecedores as $fid => $months) {
        $global_metas_map[$fid] = [
            'anual' => array_sum($months),
            'mensal' => ($months[(int)date('m', strtotime($start_date))] ?? array_sum($months)/12)
        ];
    }

    foreach ($report_data as &$supplier) {
        if (isset($supplier['rows_map'])) {
            $supplier['rows'] = array_values($supplier['rows_map']);
            unset($supplier['rows_map']);
        }

        // Incluir a meta global do fornecedor na resposta
        $fid = $supplier['fornecedor_id'];
        $supplier['meta_global_anual'] = $global_metas_map[$fid]['anual'] ?? 0;
        $supplier['meta_global_mensal'] = $global_metas_map[$fid]['mensal'] ?? 0;

        // Restore State Report Data
        $fid = $supplier['fornecedor_id'];

        // 1. State Sales (aggregated for this supplier in the period)
        $sql_state_sales = "
            SELECT o.estado, SUM(vf.valor_total) as total 
            FROM vendas_fornecedores vf
            LEFT JOIN organizacoes o ON vf.organizacao_id = o.id
            WHERE vf.fornecedor_id = ? 
            AND vf.data_venda BETWEEN ? AND ?
            AND (vf.proposta_ref_id IS NULL OR vf.titulo NOT LIKE 'Venda via Proposta #%')";
        $params_ss = [$fid, $start_date, $end_date];
        apply_report_filters_helper($sql_state_sales, $params_ss, 'vf', [], $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);
        $sql_state_sales .= " AND o.estado IS NOT NULL GROUP BY o.estado";
        $stmt_ss = $pdo->prepare($sql_state_sales);
        $stmt_ss->execute($params_ss);
        $ss_data = $stmt_ss->fetchAll(PDO::FETCH_KEY_PAIR);

        // ADICIONADO: Vendas por estado de propostas aprovadas
        $sql_prop_state = "
            SELECT org.estado, SUM(p.valor_total) as total
            FROM propostas p
            JOIN oportunidades o ON p.oportunidade_id = o.id
            LEFT JOIN organizacoes org ON p.organizacao_id = org.id
            WHERE o.fornecedor_id = ? AND p.status = 'Aprovada'
            AND p.data_criacao BETWEEN ? AND ?";
        $params_ps = [$fid, $start_date . ' 00:00:00', $end_date . ' 23:59:59'];
        apply_report_filters_helper($sql_prop_state, $params_ps, 'o', [], $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);
        $sql_prop_state .= " AND org.estado IS NOT NULL GROUP BY org.estado";
        $stmt_ps = $pdo->prepare($sql_prop_state);
        $stmt_ps->execute($params_ps);
        $ps_data = $stmt_ps->fetchAll(PDO::FETCH_KEY_PAIR);

        // Merge state sales
        $combined_states = $ss_data;
        foreach ($ps_data as $uf => $val) {
            $combined_states[$uf] = ($combined_states[$uf] ?? 0) + $val;
        }
        $supplier['state_sales'] = $combined_states;

        // Add NF state sales (Item-aware logic)
        $sql_state_nf = "
            SELECT org.estado, nf.itens, nf.valor as total_nf, o.fornecedor_id
            FROM notas_fiscais nf
            JOIN oportunidades o ON nf.oportunidade_id = o.id 
            LEFT JOIN organizacoes org ON o.organizacao_id = org.id
            WHERE nf.data_faturamento BETWEEN ? AND ?";
        $params_snf = [$start_date, $end_date];

        // Apply filters to NF state sales (except supplier_id to be item-aware)
        apply_report_filters_helper($sql_state_nf, $params_snf, 'o', [], $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);

        $stmt_snf = $pdo->prepare($sql_state_nf);
        $stmt_snf->execute($params_snf);
        $raw_snf_data = $stmt_snf->fetchAll(PDO::FETCH_ASSOC);

        foreach ($raw_snf_data as $nf) {
            $items = !empty($nf['itens']) ? json_decode($nf['itens'], true) : [];
            $attributed_val = 0;
            $uf = $nf['estado'];
            if (!$uf) continue;

            if (is_array($items) && !empty($items)) {
                foreach ($items as $item) {
                    $item_sup_name = strtoupper(trim($item['fornecedor'] ?? $item['fabricante'] ?? ''));
                    $item_sup_id = ($item_sup_name && isset($suppliers_map[$item_sup_name])) ? $suppliers_map[$item_sup_name] : null;

                    $target_fid = $item_sup_id ?: $nf['fornecedor_id'];

                    if ($target_fid == $fid) {
                        $attributed_val += (float) ($item['valor_total'] ?? (($item['quantidade'] ?? 0) * ($item['valor_unitario'] ?? 0)));
                    }
                }
            } else {
                // No items or no supplier specified in items, fall back to opportunity supplier
                if ($nf['fornecedor_id'] == $fid) {
                    $attributed_val = (float) $nf['total_nf'];
                }
            }

            if ($attributed_val > 0) {
                if (isset($supplier['state_sales'][$uf])) {
                    $supplier['state_sales'][$uf] += $attributed_val;
                } else {
                    $supplier['state_sales'][$uf] = $attributed_val;
                }
            }
        }

        // 2. State Goals (Annual/Monthly for the year of start_date)
        // Assuming we want the Annual Goal for the state for the year of the start_date
        $year = date('Y', strtotime($start_date));
        $sql_state_goals = "
            SELECT estado, meta_anual 
            FROM fornecedor_metas_estados
            WHERE fornecedor_id = ? AND ano = ?
        ";
        $stmt_sg = $pdo->prepare($sql_state_goals);
        $stmt_sg->execute([$fid, $year]);
        $supplier['state_goals'] = $stmt_sg->fetchAll(PDO::FETCH_KEY_PAIR); // [PE => 5000, PB => 2000]
    }

    // Simplification: Skipping state sales/goals detailed fetch to keep file size manageable if not strictly requested by user issue (501 error).
    // The previous code had them. If I drop them, "State Report" might be empty.
    // I should include apply_report_filters_helper usage though.

    return $report_data;
}

function get_contracts_report($pdo, $start_date, $end_date, $supplier_ids = [], $user_ids = [], $etapa_ids = [], $origem_ids = [], $uf_ids = [], $status_ids = [], $cliente_ids = [])
{
    // Find the Finance/Contracts funnel ID. Usually it's the highest or named 'Financeiro'/'Contratos'
    $funnel_query = $pdo->query("SELECT id FROM funis WHERE nome LIKE '%Financeiro%' OR nome LIKE '%Contrato%' LIMIT 1");
    $funnel_id = $funnel_query->fetchColumn();

    if (!$funnel_id) {
        // Fallback to highest funil_id like frontend does
        $funnel_query = $pdo->query("SELECT MAX(funil_id) FROM etapas_funil");
        $funnel_id = $funnel_query->fetchColumn();
    }

    $sql = "
        SELECT 
            ef.id as etapa_id,
            ef.nome as etapa_nome, 
            ef.ordem as etapa_ordem,
            o.id as oportunidade_id,
            COALESCE(org.nome_fantasia, pf.nome, 'Cliente Desconhecido') as cliente_nome,
            o.valor as valor_contrato,
            (SELECT SUM(valor) FROM empenhos e WHERE e.oportunidade_id = o.id) as valor_empenhado,
            (SELECT SUM(valor) FROM notas_fiscais nf WHERE nf.oportunidade_id = o.id) as valor_faturado
        FROM oportunidades o
        JOIN etapas_funil ef ON o.etapa_id = ef.id
        LEFT JOIN organizacoes org ON o.organizacao_id = org.id
        LEFT JOIN clientes_pf pf ON o.cliente_pf_id = pf.id
        WHERE o.data_criacao BETWEEN ? AND ?
          AND ef.funil_id = ?
    ";

    $params = [$start_date . ' 00:00:00', $end_date . ' 23:59:59', $funnel_id];

    // Apply filters
    apply_report_filters_helper($sql, $params, 'o', $supplier_ids, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);

    $sql .= " ORDER BY ef.ordem ASC, cliente_nome ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Group the data by stage to match the funnel logic structure in JS, but containing rows
    $grouped_data = [];
    foreach ($data as $row) {
        $etapa_id = $row['etapa_id'];
        if (!isset($grouped_data[$etapa_id])) {
            $grouped_data[$etapa_id] = [
                'etapa_nome' => $row['etapa_nome'],
                'etapa_ordem' => $row['etapa_ordem'],
                'qtd_oportunidades' => 0,
                'valor_total' => 0, // This is for the chart
                'contratos' => []
            ];
        }

        $val_fat = (float) $row['valor_faturado'];
        $val_emp = (float) $row['valor_empenhado'];
        $val_base = (float) $row['valor_contrato'];

        // Logic for total value chart: Faturado > Empenhado > Base
        $val_considerado = 0;
        if ($val_fat > 0)
            $val_considerado = $val_fat;
        else if ($val_emp > 0)
            $val_considerado = $val_emp;
        else
            $val_considerado = $val_base;

        $grouped_data[$etapa_id]['qtd_oportunidades']++;
        $grouped_data[$etapa_id]['valor_total'] += $val_considerado;
        $grouped_data[$etapa_id]['contratos'][] = [
            'cliente_nome' => $row['cliente_nome'],
            'valor_contrato' => $val_base,
            'valor_empenhado' => $val_emp,
            'valor_faturado' => $val_fat,
            'saldo' => max(0, $val_base - $val_fat), // Valor do contrato - Valor faturado
            'valor_considerado' => $val_considerado // To calculate the percentage later
        ];
    }

    // Convert back to index array sorting by step order
    $final_data = array_values($grouped_data);
    usort($final_data, function ($a, $b) {
        return $a['etapa_ordem'] <=> $b['etapa_ordem'];
    });

    return $final_data;
}

function get_products_report($pdo, $start_date, $end_date, $supplier_ids, $user_ids = [], $etapa_ids = [], $origem_ids = [], $uf_ids = [], $status_ids = [], $cliente_ids = [])
{
    $buildIn = function ($ids) {
        if (empty($ids)) return [null, []];
        return [implode(',', array_fill(0, count($ids), '?')), $ids];
    };

    // 1. Buscar nomes para filtro inteligente
    $supplier_names = [];
    $numeric_supplier_ids = [];
    foreach ($supplier_ids as $sid) {
        if (is_numeric($sid)) $numeric_supplier_ids[] = (int)$sid;
        else $supplier_names[] = $sid;
    }
    if (!empty($numeric_supplier_ids)) {
        list($ph, $vals) = $buildIn($numeric_supplier_ids);
        $stmt_s = $pdo->prepare("SELECT nome FROM fornecedores WHERE id IN ($ph)");
        $stmt_s->execute($vals);
        $supplier_names = array_merge($supplier_names, $stmt_s->fetchAll(PDO::FETCH_COLUMN));
    }
    $supplier_names = array_unique(array_filter($supplier_names));

    // 2. Buscar Propostas Aprovadas
    $sql = "
        SELECT 
            p.id as proposta_id,
            o.fornecedor_id,
            f.nome as fornecedor_nome
        FROM propostas p
        JOIN oportunidades o ON p.oportunidade_id = o.id
        LEFT JOIN fornecedores f ON o.fornecedor_id = f.id
        WHERE p.status = 'Aprovada'
        AND p.data_criacao BETWEEN ? AND ?
    ";
    
    $dtStart = crm_normalize_date($start_date);
    $dtEnd = crm_normalize_date($end_date, true);
    $params = [$dtStart, $dtEnd];

    if (!empty($user_ids)) {
        list($ph, $vals) = $buildIn($user_ids);
        $sql .= " AND p.usuario_id IN ($ph)";
        $params = array_merge($params, $vals);
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $all_proposals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Buscar Itens e Filtrar
    $proposal_ids = array_column($all_proposals, 'proposta_id');
    $items = [];
    if (!empty($proposal_ids)) {
        $ph_ids = implode(',', array_fill(0, count($proposal_ids), '?'));
        $sql_items = "SELECT pi.proposta_id, pi.descricao as produto_nome, pi.fabricante, pi.quantidade, pi.valor_unitario, (pi.quantidade * pi.valor_unitario) as valor_total 
                      FROM proposta_itens pi WHERE pi.proposta_id IN ($ph_ids)";
        $stmt_items = $pdo->prepare($sql_items);
        $stmt_items->execute($proposal_ids);
        $all_items = $stmt_items->fetchAll(PDO::FETCH_ASSOC);

        $prop_meta = [];
        foreach ($all_proposals as $p) $prop_meta[$p['proposta_id']] = $p;

        foreach ($all_items as $it) {
            $p = $prop_meta[$it['proposta_id']];
            $match = false;
            if (empty($supplier_names)) {
                $match = true;
            } else {
                foreach ($supplier_names as $sn) {
                    if (stripos($p['fornecedor_nome'] ?? '', $sn) !== false || stripos($it['fabricante'] ?? '', $sn) !== false) {
                        $match = true; break;
                    }
                }
            }
            if ($match) {
                $it['fornecedor_nome'] = $p['fornecedor_nome'] ?: ($it['fabricante'] ?: 'OUTROS');
                $items[] = $it;
            }
        }
    }

    // 4. Buscar Vendas Diretas (vendas_fornecedores)
    $sql_vf = "
        SELECT 
            fabricante_marca as fornecedor_nome,
            titulo as produto_nome,
            1 as quantidade,
            valor_total as valor_unitario,
            valor_total
        FROM vendas_fornecedores
        WHERE data_venda BETWEEN ? AND ?
        AND (proposta_ref_id IS NULL OR titulo NOT LIKE 'Venda via Proposta #%')
    ";
    $params_vf = [$dtStart, $dtEnd];

    if (!empty($user_ids)) {
        list($ph, $vals) = $buildIn($user_ids);
        $sql_vf .= " AND usuario_id IN ($ph)";
        $params_vf = array_merge($params_vf, $vals);
    }

    if (!empty($supplier_names)) {
        $sql_vf .= " AND (1=0 ";
        foreach ($supplier_names as $sn) {
            $sql_vf .= " OR fabricante_marca LIKE ? OR titulo LIKE ? ";
            $params_vf[] = "%$sn%";
            $params_vf[] = "%$sn%";
        }
        $sql_vf .= ")";
    }

    $stmt_vf = $pdo->prepare($sql_vf);
    $stmt_vf->execute($params_vf);
    $items = array_merge($items, $stmt_vf->fetchAll(PDO::FETCH_ASSOC));

    // 5. Agrupar por Fornecedor (como o frontend espera)
    $grouped = [];
    foreach ($items as $it) {
        $fn = $it['fornecedor_nome'] ?: 'OUTROS';
        if (!empty($supplier_names)) {
            foreach($supplier_names as $sn) {
                if (stripos($fn, $sn) !== false) { $fn = strtoupper($sn); break; }
            }
        }
        if (!isset($grouped[$fn])) $grouped[$fn] = ['fornecedor_nome' => $fn, 'rows' => []];
        $grouped[$fn]['rows'][] = $it;
    }

    return array_values($grouped);
}


function get_licitacoes_report($pdo, $start_date, $end_date, $supplier_ids, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids = [])
{
    // Updated to use 'propostas' and 'proposta_itens' for value calculation if available, 
    // falling back to opportunity items if no proposal or just counting on opportunity value?
    // Actually, Licitacoes might not have proposals yet? But user wants "No Data" fixed.
    // If Licitacoes are Opportunities with Edital, their value might be estimated.
    // However, the original query used SUM(oi.quantidade * oi.valor_unitario).
    // Let's try to get value from linked Proposal if exists (Approved preferably), or Opportunity value column if exists.
    // Since we don't know if 'valor' exists on Opportunity (legacy code didn't use it here), 
    // let's Assume we should check Proposals linked to this opportunity.

    $sql = "SELECT o.id, o.fornecedor_id, f.nome as fornecedor_nome, o.numero_edital, o.uasg, o.objeto, 
            COALESCE(SUM(pi.quantidade * pi.valor_unitario), o.valor, 0) as valor_total, 
            o.data_criacao as created_at, o.etapa_id, ef.nome as fase_nome 
            FROM oportunidades o 
            LEFT JOIN propostas p ON o.id = p.oportunidade_id AND p.status = 'Aprovada'
            LEFT JOIN proposta_itens pi ON p.id = pi.proposta_id
            JOIN fornecedores f ON o.fornecedor_id = f.id 
            LEFT JOIN etapas_funil ef ON o.etapa_id = ef.id 
            WHERE (o.numero_edital IS NOT NULL AND o.numero_edital != '') 
            AND o.data_criacao BETWEEN ? AND ?";

    $dtStart = crm_normalize_date($start_date);
    $dtEnd = crm_normalize_date($end_date, true);
    $params = [$dtStart, $dtEnd];

    if (!empty($supplier_ids)) {
        $in_params = trim(str_repeat('?,', count($supplier_ids)), ',');
        $sql .= " AND o.fornecedor_id IN ($in_params)";
        foreach ($supplier_ids as $id)
            $params[] = $id;
    }
    apply_report_filters_helper($sql, $params, 'o', [], $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids, 'fornecedor_id', 'p.usuario_id');
    $sql .= " GROUP BY o.id, o.fornecedor_id ORDER BY f.nome, o.data_criacao DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $report_data = [];
    foreach ($data as $row) {
        $fid = $row['fornecedor_id'];
        if (!isset($report_data[$fid]))
            $report_data[$fid] = ['fornecedor_id' => $fid, 'fornecedor_nome' => $row['fornecedor_nome'], 'rows' => []];
        $row['fase_id'] = $row['fase_nome'] ?? 'Ativo';
        $report_data[$fid]['rows'][] = $row;
    }
    return $report_data;
}

function apply_report_filters_helper(&$sql, &$params, $table_alias, $supplier_ids, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids = [], $supplier_col = 'fornecedor_id', $user_col = 'usuario_id')
{
    $buildIn = function ($ids) {
        if (empty($ids))
            return [null, []];
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        return [$placeholders, $ids];
    };

    if (!empty($supplier_ids)) {
        list($ph, $vals) = $buildIn($supplier_ids);
        $sql .= " AND $table_alias.$supplier_col IN ($ph)";
        $params = array_merge($params, $vals);
    }
    if (!empty($user_ids)) {
        list($ph, $vals) = $buildIn($user_ids);
        $u_alias = (strpos($user_col, '.') !== false) ? $user_col : "$table_alias.$user_col";
        $sql .= " AND $u_alias IN ($ph)";
        $params = array_merge($params, $vals);
    }
    // Skip etapa_id for 'vf' (vendas_fornecedores) as it does not exist there
    if (!empty($etapa_ids) && $table_alias !== 'vf') {
        list($ph, $vals) = $buildIn($etapa_ids);
        $sql .= " AND $table_alias.etapa_id IN ($ph)";
        $params = array_merge($params, $vals);
    }
    if (!empty($origem_ids)) {
        $in_params = trim(str_repeat('?,', count($origem_ids)), ',');
        $sql .= " AND $table_alias.origem IN ($in_params)";
        foreach ($origem_ids as $id)
            $params[] = $id;
    }
    if (!empty($status_ids)) {
        $status_conditions = [];
        foreach ($status_ids as $st) {
            if ($table_alias === 'vf') {
                // 'vendas_fornecedores' only contains won/approved items.
                // If filter is 'Ganho', it matches. If 'Perdido' or 'Aberto', it doesn't.
                if ($st === 'Ganho' || $st === 'Won') {
                    $status_conditions[] = "1=1"; // Always true for this table
                } else {
                    $status_conditions[] = "1=0"; // Always false for Open/Lost in this table
                }
            } else {
                if ($st === 'Ganho' || $st === 'Won') {
                    $status_conditions[] = "$table_alias.etapa_id IN (SELECT id FROM etapas_funil WHERE nome LIKE '%Ganho%' OR nome LIKE '%Fechado%' OR nome LIKE '%Vendido%' OR nome LIKE '%Empenhado%' OR nome LIKE '%Contrato%' OR nome LIKE '%Homologado%' OR nome LIKE '%Faturado%' OR nome LIKE '%Entrega%')";
                } elseif ($st === 'Perdido' || $st === 'Lost') {
                    $status_conditions[] = "$table_alias.etapa_id IN (SELECT id FROM etapas_funil WHERE nome LIKE '%Perdido%' OR nome LIKE '%Recusada%' OR nome LIKE '%Lost%' OR nome LIKE '%Desclassificado%' OR nome LIKE '%Fracassado%')";
                } elseif ($st === 'Aberto' || $st === 'Open') {
                    $status_conditions[] = "$table_alias.etapa_id NOT IN (SELECT id FROM etapas_funil WHERE nome LIKE '%Ganho%' OR nome LIKE '%Fechado%' OR nome LIKE '%Vendido%' OR nome LIKE '%Empenhado%' OR nome LIKE '%Contrato%' OR nome LIKE '%Homologado%' OR nome LIKE '%Faturado%' OR nome LIKE '%Entrega%' OR nome LIKE '%Perdido%' OR nome LIKE '%Recusada%' OR nome LIKE '%Lost%' OR nome LIKE '%Desclassificado%' OR nome LIKE '%Fracassado%')";
                }
            }
        }
        if (!empty($status_conditions))
            $sql .= " AND (" . implode(' OR ', $status_conditions) . ")";
    }
    if (!empty($uf_ids)) {
        $in_params = trim(str_repeat('?,', count($uf_ids)), ',');
        // Assume for state filter we check either organization (PJ) or client_pf (PF)
        $sql .= " AND (
            ($table_alias.organizacao_id IN (SELECT id FROM organizacoes WHERE estado IN ($in_params)))
            OR
            ($table_alias.cliente_pf_id IN (SELECT id FROM clientes_pf WHERE estado IN ($in_params)))
        )";
        foreach ($uf_ids as $id)
            $params[] = $id;
        foreach ($uf_ids as $id)
            $params[] = $id; // Double for OR condition
    }
    if (!empty($cliente_ids)) {
        $org_ids = [];
        $pf_ids = [];
        foreach ($cliente_ids as $cid) {
            if (strpos($cid, 'org-') === 0) {
                $org_ids[] = (int) substr($cid, 4);
            } elseif (strpos($cid, 'pf-') === 0) {
                $pf_ids[] = (int) substr($cid, 3);
            }
        }
        $cliente_conditions = [];
        if (!empty($org_ids)) {
            list($ph_org, $vals_org) = $buildIn($org_ids);
            $cliente_conditions[] = "$table_alias.organizacao_id IN ($ph_org)";
            $params = array_merge($params, $vals_org);
        }
        if (!empty($pf_ids)) {
            list($ph_pf, $vals_pf) = $buildIn($pf_ids);
            $cliente_conditions[] = "$table_alias.cliente_pf_id IN ($ph_pf)";
            $params = array_merge($params, $vals_pf);
        }
        if (!empty($cliente_conditions)) {
            $sql .= " AND (" . implode(' OR ', $cliente_conditions) . ")";
        }
    }
}

function get_clients_report($pdo, $start_date, $end_date, $supplier_ids, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids = [])
{
    $dtStart = crm_normalize_date($start_date);
    $dtEnd = crm_normalize_date($end_date, true);

    // Source A: Propostas Aprovadas
    $sql_prop = "SELECT 
                    p.organizacao_id, 
                    p.cliente_pf_id, 
                    COALESCE(org.nome_fantasia, pf.nome, 'Cliente Desconhecido') as cliente_nome,
                    COUNT(p.id) as qtd, 
                    SUM(p.valor_total) as total
                 FROM propostas p
                 LEFT JOIN organizacoes org ON p.organizacao_id = org.id
                 LEFT JOIN clientes_pf pf ON p.cliente_pf_id = pf.id
                 LEFT JOIN oportunidades o ON p.oportunidade_id = o.id
                 WHERE p.data_criacao BETWEEN ? AND ? 
                 AND p.status = 'Aprovada'";

    $params_prop = [$dtStart, $dtEnd];

    // Apply filters to Propostas
    apply_report_filters_helper($sql_prop, $params_prop, 'o', [], $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids, 'fornecedor_id', 'p.usuario_id');

    $sql_prop .= " GROUP BY p.organizacao_id, p.cliente_pf_id, cliente_nome";

    $stmt_prop = $pdo->prepare($sql_prop);
    $stmt_prop->execute($params_prop);
    $results_prop = $stmt_prop->fetchAll(PDO::FETCH_ASSOC);

    // Source B: Vendas Fornecedores
    $sql_vendas = "SELECT 
                    vf.organizacao_id, 
                    vf.cliente_pf_id, 
                    COALESCE(org.nome_fantasia, pf.nome, 'Cliente Desconhecido') as cliente_nome,
                    COUNT(vf.id) as qtd, 
                    SUM(vf.valor_total) as total
                   FROM vendas_fornecedores vf
                   LEFT JOIN organizacoes org ON vf.organizacao_id = org.id
                   LEFT JOIN clientes_pf pf ON vf.cliente_pf_id = pf.id
                   WHERE vf.data_venda BETWEEN ? AND ?
                   AND (vf.proposta_ref_id IS NULL OR vf.titulo NOT LIKE 'Venda via Proposta #%')";

    $params_vendas = [$dtStart, $dtEnd];

    apply_report_filters_helper($sql_vendas, $params_vendas, 'vf', $supplier_ids, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);

    $sql_vendas .= " GROUP BY vf.organizacao_id, vf.cliente_pf_id, cliente_nome";

    $stmt_vendas = $pdo->prepare($sql_vendas);
    $stmt_vendas->execute($params_vendas);
    $results_vendas = $stmt_vendas->fetchAll(PDO::FETCH_ASSOC);

    // Merge Logic
    $clients = [];

    $process_row = function ($row) use (&$clients) {
        // Create a unique key. Prefer OrgID/PfID. If both null, assume generic name or skip.
        if (!empty($row['organizacao_id'])) {
            $key = 'pj_' . $row['organizacao_id'];
        } elseif (!empty($row['cliente_pf_id'])) {
            $key = 'pf_' . $row['cliente_pf_id'];
        } else {
            // Fallback: Normalize name
            $name = trim($row['cliente_nome']);
            if (empty($name) || $name === 'Cliente Desconhecido')
                return; // Skip invalid
            $key = 'name_' . md5(strtoupper($name));
        }

        if (!isset($clients[$key])) {
            $clients[$key] = [
                'cliente_nome' => $row['cliente_nome'],
                'qtd_vendas' => 0,
                'valor_total' => 0.0
            ];
        }

        $clients[$key]['qtd_vendas'] += (int) $row['qtd'];
        $clients[$key]['valor_total'] += (float) $row['total'];
    };

    foreach ($results_prop as $row)
        $process_row($row);
    foreach ($results_vendas as $row)
        $process_row($row);

    // Convert to array and sort
    $final_data = array_values($clients);

    usort($final_data, function ($a, $b) {
        return $b['valor_total'] <=> $a['valor_total'];
    });

    return $final_data;
}

function get_licitacoes_funnel_report($pdo, $start_date, $end_date, $supplier_ids, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids = [])
{
    $buildIn = function ($ids) {
        if (empty($ids)) return [null, []];
        return [implode(',', array_fill(0, count($ids), '?')), $ids];
    };

    // 1. Buscar nomes para filtro inteligente
    $supplier_names = [];
    $numeric_supplier_ids = [];
    foreach ($supplier_ids as $sid) {
        if (is_numeric($sid)) $numeric_supplier_ids[] = (int)$sid;
        else $supplier_names[] = $sid;
    }
    if (!empty($numeric_supplier_ids)) {
        list($ph, $vals) = $buildIn($numeric_supplier_ids);
        $stmt_s = $pdo->prepare("SELECT nome FROM fornecedores WHERE id IN ($ph)");
        $stmt_s->execute($vals);
        $supplier_names = array_merge($supplier_names, $stmt_s->fetchAll(PDO::FETCH_COLUMN));
    }
    $supplier_names = array_unique(array_filter($supplier_names));

    // Funnel ID 2 = Licitações
    $sql = "
        SELECT 
            COALESCE(org.nome_fantasia, org.razao_social, f.nome, 'Fornecedor Não Informado') as fornecedor_nome_full,
            ef.id as etapa_id,
            ef.nome as etapa_nome, 
            ef.ordem as etapa_ordem,
            COUNT(DISTINCT o.id) as qtd_oportunidades,
            SUM(
                COALESCE(
                    (SELECT SUM(pi.quantidade * pi.valor_unitario) 
                     FROM propostas p 
                     JOIN proposta_itens pi ON p.id = pi.proposta_id 
                     WHERE p.oportunidade_id = o.id AND p.status = 'Aprovada'), 
                    o.valor, 
                    0
                )
            ) as valor_total
        FROM oportunidades o
        JOIN etapas_funil ef ON o.etapa_id = ef.id
        LEFT JOIN organizacoes org ON o.fornecedor_id = org.id
        LEFT JOIN fornecedores f ON o.fornecedor_id = f.id
        WHERE o.data_criacao BETWEEN ? AND ?
          AND (o.numero_edital IS NOT NULL AND o.numero_edital != '')
          AND ef.funil_id = 2
    ";

    $params = [$start_date . ' 00:00:00', $end_date . ' 23:59:59'];

    // Para o Funil de Licitações, o apply_report_filters_helper já cuida de fornecedor_id se for INT.
    // Mas se for brand name, precisamos de algo especial.
    // Vamos filtrar manualmente depois se houver Brand Names.
    
    apply_report_filters_helper($sql, $params, 'o', array_filter($supplier_ids, 'is_numeric'), $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids);

    $sql .= " GROUP BY fornecedor_nome_full, ef.id, ef.nome, ef.ordem ORDER BY fornecedor_nome_full, ef.ordem ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $etapas_rigidas = [
        'Captação de Edital', 'Acolhimento de propostas', 'Em análise Técnica', 
        'Homologado', 'Ata/Carona', 'Empenhado', 'Contrato', 'Desclassificado', 
        'Fracassado', 'Revogado', 'Anulado', 'Suspenso'
    ];
    // Fornecedores fixos para a matriz
    $fornecedores_rigidos = ['BRASIL MEDICA', 'HEALTH', 'INSTRAMED', 'LIVANOVA', 'MASIMO', 'MERIL', 'MICROMED', 'NIPRO', 'SIGMAFIX'];

    // Se o usuário selecionou marcas específicas, filtramos a matriz para mostrar apenas elas
    if (!empty($supplier_names)) {
        $allowed = [];
        foreach ($fornecedores_rigidos as $fr) {
            foreach ($supplier_names as $sn) {
                if (stripos($fr, $sn) !== false) { $allowed[] = $fr; break; }
            }
        }
        if (!empty($allowed)) $fornecedores_rigidos = $allowed;
    }

    $matrix = [];
    foreach ($fornecedores_rigidos as $fj) {
        $matrix[$fj] = [];
        foreach ($etapas_rigidas as $idx => $nome_etapa) {
            $matrix[$fj][$nome_etapa] = [
                'label' => $nome_etapa, // Adicionado label para o frontend
                'etapa_nome' => $nome_etapa,
                'count' => 0,          // Adicionado count para o frontend
                'value' => 0,          // Adicionado value para o frontend
                'fornecedor_nome' => $fj,
                'etapa_ordem' => $idx + 1,
                'qtd_oportunidades' => 0,
                'valor_total' => 0
            ];
        }
    }

    foreach ($results as $row) {
        $matched_ff = false;
        foreach($fornecedores_rigidos as $fj) {
            if (stripos(trim($row['fornecedor_nome_full']), $fj) !== false) {
                $matched_ff = $fj;
                break;
            }
        }
        if (!$matched_ff) continue; 

        $matched_et = false;
        foreach ($etapas_rigidas as $nome_rigido) {
            if (strcasecmp(trim($row['etapa_nome']), $nome_rigido) == 0) {
                $matched_et = $nome_rigido;
                break;
            }
        }
        
        $etapa_to_use = $matched_et;
        if (!$etapa_to_use) continue;

        $matrix[$matched_ff][$etapa_to_use]['count'] += $row['qtd_oportunidades'];
        $matrix[$matched_ff][$etapa_to_use]['value'] += $row['valor_total'];
        $matrix[$matched_ff][$etapa_to_use]['qtd_oportunidades'] += $row['qtd_oportunidades'];
        $matrix[$matched_ff][$etapa_to_use]['valor_total'] += $row['valor_total'];
    }

    // Se houver filtro de marcas, retornamos apenas o funil somado?
    // O frontend espera um array plano para renderFunnelTable.
    // Se o usuário selecionou apenas 1 fornecedor (INSTRAMED), retornamos as etapas desse fornecedor.
    // Se selecionou vários ou nenhum, talvez devêssemos consolidar?
    
    // Decisão: Se houver apenas 1 fornecedor selecionado, retorna o funil dele.
    // Se houver mais, retorna a soma de todos para cada etapa.
    
    $consolidated = [];
    foreach ($etapas_rigidas as $idx => $et) {
        $consolidated[$et] = [
            'label' => $et,
            'count' => 0,
            'value' => 0
        ];
        foreach ($fornecedores_rigidos as $fj) {
            $consolidated[$et]['count'] += $matrix[$fj][$et]['count'];
            $consolidated[$et]['value'] += $matrix[$fj][$et]['value'];
        }
    }

    return array_values($consolidated);
}

// ── GET COMMISSION CONFIG ─────────────────────────────────────────────────────
function handle_get_commission_config($pdo, $data = []) {
    try {
        $stmt = $pdo->query("
            SELECT cc.*, u.nome 
            FROM commission_config cc 
            JOIN usuarios u ON u.id = cc.usuario_id 
            ORDER BY u.nome
        ");
        echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

// ── SAVE COMMISSION CONFIG ────────────────────────────────────────────────────
function handle_save_commission_config($pdo, $data = []) {
    try {
        $configs = $data['configs']          ?? [];
        $fornMet = $data['fornecedor_metas'] ?? [];
        $year    = intval($data['year']      ?? date('Y'));

        $pdo->beginTransaction();

        // Salva config de vendedores usando REPLACE INTO (evita duplicate key)
        $pdo->exec("DELETE FROM commission_config");
        
        if (!empty($configs)) {
            $stmt = $pdo->prepare("
                INSERT INTO commission_config 
                    (usuario_id, meta_mensal, salario_fixo, percentual_comissao, ativo) 
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    meta_mensal          = VALUES(meta_mensal),
                    salario_fixo         = VALUES(salario_fixo),
                    percentual_comissao  = VALUES(percentual_comissao),
                    ativo                = VALUES(ativo)
            ");
            foreach ($configs as $c) {
                if (empty($c['usuario_id'])) continue;
                $stmt->execute([
                    intval($c['usuario_id']),
                    floatval($c['meta_mensal']        ?? 0),
                    floatval($c['salario_fixo']       ?? 0),
                    floatval($c['percentual_comissao'] ?? 1),
                    intval($c['ativo']                ?? 1),
                ]);
            }
        }

        // Salva metas de fornecedores por estado
        if (!empty($fornMet)) {
            $stmtDel = $pdo->prepare("DELETE FROM supplier_monthly_targets WHERE year = ? AND fornecedor_nome = ?");
            $stmtIns = $pdo->prepare("
                INSERT INTO supplier_monthly_targets (fornecedor_nome, year, month, uf, meta_mensal) 
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE meta_mensal = VALUES(meta_mensal)
            ");
            foreach ($fornMet as $forn => $meses) {
                $stmtDel->execute([$year, $forn]);
                foreach ($meses as $m => $ufs) {
                    if (is_array($ufs)) {
                        foreach ($ufs as $uf => $val) {
                            if (floatval($val) > 0) {
                                $stmtIns->execute([$forn, $year, intval($m), $uf, floatval($val)]);
                            }
                        }
                    } else {
                        if (floatval($ufs) > 0) {
                            $stmtIns->execute([$forn, $year, intval($m), 'GERAL', floatval($ufs)]);
                        }
                    }
                }
            }
        }

        $pdo->commit();
        echo json_encode(['success' => true]);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

// ── GET SUPPLIER TARGETS ALL ──────────────────────────────────────────────────
function handle_get_supplier_targets_all($pdo, $data = []) {
    try {
        $year = intval($data['year'] ?? date('Y'));
        $stmt = $pdo->prepare("SELECT fornecedor_nome, month, meta_mensal FROM supplier_monthly_targets WHERE year = ?");
        $stmt->execute([$year]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $result = [];
        foreach ($rows as $r) {
            $result[$r['fornecedor_nome']][$r['month']] = floatval($r['meta_mensal']);
        }
        echo json_encode(['success' => true, 'data' => $result]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

// ── RELATÓRIO: VENDAS POR VENDEDOR (vendor_detail) ──────────────────────────
function get_vendor_detail_report($pdo, $start_date, $end_date, $supplier_ids = [], $user_ids = [], $etapa_ids = [], $origem_ids = [], $uf_ids = [], $status_ids = [], $cliente_ids = [])
{
    $buildIn = function ($ids) {
        if (empty($ids)) return [null, []];
        return [implode(',', array_fill(0, count($ids), '?')), $ids];
    };

    // 1. Propostas com itens, agrupadas por vendedor
    $sql = "
        SELECT 
            p.id as proposta_id,
            p.numero_proposta,
            p.valor_total as proposta_valor,
            p.status,
            p.data_criacao,
            p.motivo_status,
            u.id as vendedor_id,
            u.nome as vendedor_nome,
            COALESCE(org.nome_fantasia, cpf.nome, 'N/D') as cliente_nome,
            pi.descricao as produto,
            pi.fabricante,
            pi.modelo,
            pi.quantidade,
            pi.valor_unitario,
            (pi.quantidade * pi.valor_unitario) as item_total
        FROM propostas p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN organizacoes org ON p.organizacao_id = org.id
        LEFT JOIN clientes_pf cpf ON p.cliente_pf_id = cpf.id
        LEFT JOIN proposta_itens pi ON pi.proposta_id = p.id
        WHERE p.data_criacao BETWEEN ? AND ?
    ";
    
    $dtStart = crm_normalize_date($start_date);
    $dtEnd = crm_normalize_date($end_date, true);
    $params = [$dtStart, $dtEnd];

    // Filters
    if (!empty($supplier_ids)) {
        list($ph, $vals) = $buildIn($supplier_ids);
        $sql .= " AND p.oportunidade_id IN (SELECT id FROM oportunidades WHERE fornecedor_id IN ($ph))";
        $params = array_merge($params, $vals);
    }
    if (!empty($user_ids)) {
        list($ph, $vals) = $buildIn($user_ids);
        $sql .= " AND p.usuario_id IN ($ph)";
        $params = array_merge($params, $vals);
    }
    if (!empty($cliente_ids)) {
        $org_ids = []; $pf_ids = [];
        foreach ($cliente_ids as $cid) {
            if (strpos($cid, 'org-') === 0) $org_ids[] = str_replace('org-', '', $cid);
            elseif (strpos($cid, 'pf-') === 0) $pf_ids[] = str_replace('pf-', '', $cid);
            else $org_ids[] = $cid;
        }
        $conds = [];
        if (!empty($org_ids)) {
            list($ph, $vals) = $buildIn($org_ids);
            $conds[] = "p.organizacao_id IN ($ph)";
            $params = array_merge($params, $vals);
        }
        if (!empty($pf_ids)) {
            list($ph, $vals) = $buildIn($pf_ids);
            $conds[] = "p.cliente_pf_id IN ($ph)";
            $params = array_merge($params, $vals);
        }
        if (!empty($conds)) $sql .= " AND (" . implode(' OR ', $conds) . ")";
    }
    if (!empty($uf_ids)) {
        list($ph, $vals) = $buildIn($uf_ids);
        $sql .= " AND p.organizacao_id IN (SELECT id FROM organizacoes WHERE estado IN ($ph))";
        $params = array_merge($params, $vals);
    }

    $sql .= " ORDER BY u.nome, p.data_criacao DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Atividade de prospecção por vendedor no período
    $sql_activity = "
        SELECT 
            u.id as vendedor_id,
            u.nome as vendedor_nome,
            COUNT(DISTINCT o.id) as oportunidades_criadas,
            COUNT(DISTINCT p.id) as propostas_total,
            SUM(CASE WHEN p.status = 'Aprovada' THEN 1 ELSE 0 END) as propostas_aprovadas,
            SUM(CASE WHEN p.status LIKE 'Recusad%' THEN 1 ELSE 0 END) as propostas_recusadas,
            SUM(CASE WHEN p.status = 'Enviada' THEN 1 ELSE 0 END) as propostas_enviadas,
            SUM(CASE WHEN p.status = 'Aprovada' THEN p.valor_total ELSE 0 END) as total_aprovado,
            SUM(CASE WHEN p.status LIKE 'Recusad%' THEN p.valor_total ELSE 0 END) as total_recusado,
            (SELECT COUNT(*) FROM agendamentos a 
             JOIN agendamento_usuarios au ON a.id = au.agendamento_id 
             WHERE au.usuario_id = u.id AND a.data_inicio BETWEEN ? AND ?) as agendamentos_periodo
        FROM usuarios u
        LEFT JOIN oportunidades o ON o.usuario_id = u.id AND o.data_criacao BETWEEN ? AND ?
        LEFT JOIN propostas p ON p.usuario_id = u.id AND p.data_criacao BETWEEN ? AND ?
        WHERE u.role IN ('Vendedor', 'Representante', 'Comercial', 'Gestor', 'Analista', 'Especialista')
        AND u.status = 'Ativo'
    ";
    $params_act = [
        $start_date . ' 00:00:00', $end_date . ' 23:59:59',
        $start_date . ' 00:00:00', $end_date . ' 23:59:59',
        $start_date . ' 00:00:00', $end_date . ' 23:59:59'
    ];

    if (!empty($user_ids)) {
        list($ph, $vals) = $buildIn($user_ids);
        $sql_activity .= " AND u.id IN ($ph)";
        $params_act = array_merge($params_act, $vals);
    }

    $sql_activity .= " GROUP BY u.id, u.nome ORDER BY total_aprovado DESC";

    $stmt_act = $pdo->prepare($sql_activity);
    $stmt_act->execute($params_act);
    $activity = $stmt_act->fetchAll(PDO::FETCH_ASSOC);

    // 3. Metas por vendedor (soma de commission_config mensal x 12 para ter o anual)
    $sql_meta = "SELECT usuario_id, (meta_mensal * 12) as meta_total FROM commission_config WHERE ativo = 1";
    $stmt_meta = $pdo->prepare($sql_meta);
    $stmt_meta->execute();
    $metas_raw = $stmt_meta->fetchAll(PDO::FETCH_ASSOC);
    $metas_map = [];
    foreach ($metas_raw as $m) {
        $metas_map[$m['usuario_id']] = (float)$m['meta_total'];
    }

    // Vendas diretas (vendas_fornecedores) para adicionar ao total do vendedor
    $sql_vf = "SELECT usuario_id, SUM(valor_total) as total_vf FROM vendas_fornecedores WHERE data_venda BETWEEN ? AND ? AND (proposta_ref_id IS NULL OR titulo NOT LIKE 'Venda via Proposta #%')";
    $params_vf = [$start_date, $end_date];
    if (!empty($user_ids)) {
        list($ph, $vals) = $buildIn($user_ids);
        $sql_vf .= " AND usuario_id IN ($ph)";
        $params_vf = array_merge($params_vf, $vals);
    }
    $sql_vf .= " GROUP BY usuario_id";
    $stmt_vf = $pdo->prepare($sql_vf);
    $stmt_vf->execute($params_vf);
    $vf_map = [];
    foreach ($stmt_vf->fetchAll(PDO::FETCH_ASSOC) as $v) {
        $vf_map[$v['usuario_id']] = (float)$v['total_vf'];
    }

    // Enriquece activity com meta e vendas diretas
    foreach ($activity as &$a) {
        $uid = $a['vendedor_id'];
        $a['meta_anual'] = $metas_map[$uid] ?? 0;
        $a['vendas_diretas'] = $vf_map[$uid] ?? 0;
        $a['total_vendido'] = (float)$a['total_aprovado'] + ($vf_map[$uid] ?? 0);
        $a['atingimento'] = $a['meta_anual'] > 0 ? round(($a['total_vendido'] / $a['meta_anual']) * 100, 1) : 0;
        $total_decididas = (int)$a['propostas_aprovadas'] + (int)$a['propostas_recusadas'];
        $a['taxa_conversao'] = $total_decididas > 0 ? round(((int)$a['propostas_aprovadas'] / $total_decididas) * 100, 1) : 0;
    }

    return [
        'items' => $rows,
        'activity' => $activity
    ];
}

// ── RELATÓRIO: FATURAMENTO (billing) ────────────────────────────────────────
function get_billing_report($pdo, $start_date, $end_date, $supplier_ids = [], $user_ids = [], $etapa_ids = [], $origem_ids = [], $uf_ids = [], $status_ids = [], $cliente_ids = [])
{
    $buildIn = function ($ids) {
        if (empty($ids)) return [null, []];
        return [implode(',', array_fill(0, count($ids), '?')), $ids];
    };

    // 1. Buscar nomes para filtro inteligente (Separa ID numérico de Nome da Marca)
    $supplier_names = [];
    $numeric_supplier_ids = [];
    foreach ($supplier_ids as $sid) {
        if (is_numeric($sid)) $numeric_supplier_ids[] = (int)$sid;
        else $supplier_names[] = $sid;
    }
    if (!empty($numeric_supplier_ids)) {
        list($ph, $vals) = $buildIn($numeric_supplier_ids);
        $stmt_s = $pdo->prepare("SELECT nome FROM fornecedores WHERE id IN ($ph)");
        $stmt_s->execute($vals);
        $supplier_names = array_merge($supplier_names, $stmt_s->fetchAll(PDO::FETCH_COLUMN));
    }
    $supplier_names = array_unique(array_filter($supplier_names));

    // 2. Query Principal: Propostas
    $sql = "
        SELECT 
            p.id as proposta_id,
            p.numero_proposta,
            p.valor_total,
            p.status,
            p.data_criacao,
            p.motivo_status,
            p.condicoes_pagamento,
            u.id as vendedor_id,
            u.nome as vendedor_nome,
            COALESCE(org.nome_fantasia, cpf.nome, 'N/D') as cliente_nome,
            org.estado as uf,
            org.cidade,
            p.oportunidade_id
        FROM propostas p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN organizacoes org ON p.organizacao_id = org.id
        LEFT JOIN clientes_pf cpf ON p.cliente_pf_id = cpf.id
        WHERE (p.data_criacao BETWEEN ? AND ?)
        AND p.status IN ('Aprovada', 'Recusada')
    ";
    
    $dtStart = crm_normalize_date($start_date);
    $dtEnd = crm_normalize_date($end_date, true);
    $params = [$dtStart, $dtEnd];

    if (!empty($user_ids)) {
        list($ph, $vals) = $buildIn($user_ids);
        $sql .= " AND p.usuario_id IN ($ph)";
        $params = array_merge($params, $vals);
    }
    
    if (!empty($cliente_ids)) {
        $org_ids = []; $pf_ids = [];
        foreach ($cliente_ids as $cid) {
            if (strpos($cid, 'org-') === 0) $org_ids[] = str_replace('org-', '', $cid);
            elseif (strpos($cid, 'pf-') === 0) $pf_ids[] = str_replace('pf-', '', $cid);
            else $org_ids[] = $cid;
        }
        $conds = [];
        if (!empty($org_ids)) {
            list($ph, $vals) = $buildIn($org_ids);
            $conds[] = "p.organizacao_id IN ($ph)";
            $params = array_merge($params, $vals);
        }
        if (!empty($pf_ids)) {
            list($ph, $vals) = $buildIn($pf_ids);
            $conds[] = "p.cliente_pf_id IN ($ph)";
            $params = array_merge($params, $vals);
        }
        if (!empty($conds)) $sql .= " AND (" . implode(' OR ', $conds) . ")";
    }
    if (!empty($uf_ids)) {
        list($ph, $vals) = $buildIn($uf_ids);
        $sql .= " AND (org.estado IN ($ph))";
        $params = array_merge($params, $vals);
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $all_proposals = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 3. Buscar Itens e Filtrar por Fornecedor (Inteligente)
    $proposal_ids = array_column($all_proposals, 'proposta_id');
    $items_map = [];
    if (!empty($proposal_ids)) {
        $ph_ids = implode(',', array_fill(0, count($proposal_ids), '?'));
        $sql_items = "SELECT proposta_id, descricao, fabricante, modelo, quantidade, valor_unitario FROM proposta_itens WHERE proposta_id IN ($ph_ids)";
        $stmt_items = $pdo->prepare($sql_items);
        $stmt_items->execute($proposal_ids);
        foreach ($stmt_items->fetchAll(PDO::FETCH_ASSOC) as $item) {
            $items_map[$item['proposta_id']][] = $item;
        }
    }

    $filtered_proposals = [];
    foreach ($all_proposals as $p) {
        $p_items = $items_map[$p['proposta_id']] ?? [];
        $p['itens'] = $p_items;
        $p['produtos_resumo'] = implode(', ', array_unique(array_column($p_items, 'descricao')));
        $p['fabricantes_resumo'] = implode(', ', array_unique(array_filter(array_column($p_items, 'fabricante'))));
        
        // Lógica de filtro por fornecedor
        if (!empty($supplier_ids)) {
            $match = false;
            // 1. Checa ID numérico se disponível na oportunidade
            $stmt_opp = $pdo->prepare("SELECT fornecedor_id, (SELECT nome FROM fornecedores WHERE id = o.fornecedor_id) as forn_nome FROM oportunidades o WHERE o.id = ?");
            $stmt_opp->execute([$p['oportunidade_id']]);
            $o_data = $stmt_opp->fetch(PDO::FETCH_ASSOC);
            $o_fid = $o_data['fornecedor_id'] ?? null;
            $o_fname = $o_data['forn_nome'] ?? '';

            if ($o_fid && in_array($o_fid, $numeric_supplier_ids)) {
                $match = true;
            } else {
                // 2. Busca por Nome nos metadados ou nos itens
                foreach ($supplier_names as $sn) {
                    if (stripos($o_fname, $sn) !== false || stripos($p['fabricantes_resumo'], $sn) !== false) {
                        $match = true; break;
                    }
                }
            }
            if (!$match) continue;
        }
        $filtered_proposals[] = $p;
    }

    // 4. Buscar Vendas Diretas (vendas_fornecedores)
    $direct_sales = [];
    $sql_vf = "
        SELECT 
            NULL as proposta_id,
            titulo as numero_proposta,
            valor_total,
            'Aprovada' as status,
            data_venda as data_criacao,
            'Venda Direta / Importação' as motivo_status,
            '' as condicoes_pagamento,
            u.id as vendedor_id,
            u.nome as vendedor_nome,
            'DIRETO' as cliente_nome,
            '' as uf,
            '' as cidade,
            fabricante_marca as fabricantes_resumo,
            descricao_produto as produtos_resumo
        FROM vendas_fornecedores vf
        LEFT JOIN usuarios u ON vf.usuario_id = u.id
        WHERE data_venda BETWEEN ? AND ?
        AND (proposta_ref_id IS NULL OR titulo NOT LIKE 'Venda via Proposta #%')
    ";
    $params_vf = [$start_date, $end_date];

    if (!empty($user_ids)) {
        list($ph, $vals) = $buildIn($user_ids);
        $sql_vf .= " AND vf.usuario_id IN ($ph)";
        $params_vf = array_merge($params_vf, $vals);
    }
    
    if (!empty($supplier_ids)) {
        $sql_vf .= " AND (1=0 ";
        // Filtro por IDs Numéricos
        if (!empty($numeric_supplier_ids)) {
            $sql_vf .= " OR vf.fornecedor_id IN (" . implode(',', array_fill(0, count($numeric_supplier_ids), '?')) . ")";
            $params_vf = array_merge($params_vf, $numeric_supplier_ids);
        }
        // Filtro por Nomes de Marcas
        foreach ($supplier_names as $sn) {
            $sql_vf .= " OR vf.fabricante_marca LIKE ? OR vf.titulo LIKE ?";
            $params_vf[] = "%$sn%";
            $params_vf[] = "%$sn%";
        }
        $sql_vf .= ")";
    }

    $stmt_vf = $pdo->prepare($sql_vf);
    $stmt_vf->execute($params_vf);
    $direct_sales = $stmt_vf->fetchAll(PDO::FETCH_ASSOC);

    // Unifica tudo
    $all_billing = array_merge($filtered_proposals, $direct_sales);
    
    // Sort por data decrescente
    usort($all_billing, function($a, $b) {
        return strtotime($b['data_criacao']) <=> strtotime($a['data_criacao']);
    });

    // Calcula KPIs
    $total_aprovado = 0;
    $total_recusado = 0;
    $qtd_aprovado = 0;
    $qtd_recusado = 0;

    foreach ($all_billing as $item) {
        if ($item['status'] === 'Aprovada') {
            $total_aprovado += (float)$item['valor_total'];
            $qtd_aprovado++;
        } else {
            $total_recusado += (float)$item['valor_total'];
            $qtd_recusado++;
        }
    }

    $total_decididas = $qtd_aprovado + $qtd_recusado;
    $taxa_conversao = $total_decididas > 0 ? round(($qtd_aprovado / $total_decididas) * 100, 1) : 0;

    return [
        'proposals' => $all_billing,
        'kpis' => [
            'total_aprovado' => $total_aprovado,
            'total_recusado' => $total_recusado,
            'qtd_aprovado' => $qtd_aprovado,
            'qtd_recusado' => $qtd_recusado,
            'taxa_conversao' => $taxa_conversao
        ]
    ];
}

// ── DASHBOARD BI: KPIs ───────────────────────────────────────────────────
function get_bi_kpis($pdo, $start_date, $end_date, $supplier_ids, $user_ids, $etapa_ids, $origem_ids, $uf_ids, $status_ids, $cliente_ids)
{
    // Filter helper
    $buildIn = function($ids) { return empty($ids) ? [null,[]] : [implode(',', array_fill(0, count($ids), '?')), $ids]; };
    
    $dtNormalized = crm_normalize_date($start_date);
    $year_start = date('Y-01-01', strtotime($dtNormalized));
    $year_end   = date('Y-12-31', strtotime($dtNormalized));
    $month_start = date('Y-m-01', strtotime($dtNormalized));
    $month_end   = date('Y-m-t', strtotime($dtNormalized));

    // 1. Total Vendido (Ano) - Aprovadas
    $sqlA = "SELECT SUM(valor_total) as total FROM propostas WHERE status = 'Aprovada' AND data_criacao BETWEEN ? AND ?";
    $stmtA = $pdo->prepare($sqlA);
    $stmtA->execute([$year_start . ' 00:00:00', $year_end . ' 23:59:59']);
    $total_pd = (float)($stmtA->fetchColumn());

    $sqlAVF = "SELECT SUM(valor_total) as total FROM vendas_fornecedores WHERE data_venda BETWEEN ? AND ? AND (proposta_ref_id IS NULL OR titulo NOT LIKE 'Venda via Proposta #%')";
    $stmtAVF = $pdo->prepare($sqlAVF);
    $stmtAVF->execute([$year_start, $year_end]);
    $total_vf = (float)($stmtAVF->fetchColumn());
    $total_sales = $total_pd + $total_vf;

    // 2. Vendido no Mês - Aprovadas
    $stmtM = $pdo->prepare("SELECT SUM(valor_total) as total FROM propostas WHERE status = 'Aprovada' AND data_criacao BETWEEN ? AND ?");
    $stmtM->execute([$month_start . ' 00:00:00', $month_end . ' 23:59:59']);
    $month_pd = (float)($stmtM->fetchColumn());

    $stmtMVF = $pdo->prepare("SELECT SUM(valor_total) as total FROM vendas_fornecedores WHERE data_venda BETWEEN ? AND ?");
    $stmtMVF->execute([$month_start, $month_end]);
    $month_vf = (float)($stmtMVF->fetchColumn());
    $month_sales = $month_pd + $month_vf;

    // 3. Perdas Acumuladas
    $stmtL = $pdo->prepare("SELECT SUM(valor_total) as total FROM propostas WHERE status LIKE 'Recusad%' AND data_criacao BETWEEN ? AND ?");
    $stmtL->execute([$year_start . ' 00:00:00', $year_end . ' 23:59:59']);
    $lost_sales = (float)($stmtL->fetchColumn());

    // 4. Licitações Ativas (oportunidades em andamento: não-ganha / não-perdida)
    $stmtO = $pdo->prepare("SELECT COUNT(*) FROM oportunidades WHERE etapa_id NOT IN (4, 6, 8, 12, 13, 14)"); // ex: 6,8 = won/lost
    $stmtO->execute();
    $active_bids = (int)($stmtO->fetchColumn());

    // 5. Vendas por Vendedor (performance)
    $sqlVS = "
        SELECT u.nome as vendedor, SUM(p.valor_total) as total 
        FROM propostas p 
        JOIN usuarios u ON p.usuario_id = u.id 
        WHERE p.status = 'Aprovada' AND p.data_criacao BETWEEN ? AND ?
        GROUP BY u.nome ORDER BY total DESC LIMIT 5
    ";
    $stmtVS = $pdo->prepare($sqlVS);
    $stmtVS->execute([$month_start . ' 00:00:00', $month_end . ' 23:59:59']);
    $sales_by_vendedor = $stmtVS->fetchAll(PDO::FETCH_ASSOC);

    return [
        'total_sales' => $total_sales,
        'month_sales' => $month_sales,
        'lost_sales'  => $lost_sales,
        'active_bids' => $active_bids,
        'sales_by_vendedor' => $sales_by_vendedor
    ];
}

// ── DASHBOARD BI: CHARTS ─────────────────────────────────────────────────
function get_sales_vs_goals($pdo, $start_date, $end_date, $supplier_ids = [], $user_ids = [], $etapa_ids = [], $origem_ids = [], $uf_ids = [], $status_ids = [], $cliente_ids = [])
{
    $year = date('Y', strtotime($start_date));
    $labels = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    $sales = array_fill(0, 12, 0);
    $goals = array_fill(0, 12, 0);

    // Vendas Reais Mes a Mes
    $sqlSales = "
        SELECT MONTH(data_criacao) as m, SUM(valor_total) as t 
        FROM propostas WHERE status = 'Aprovada' AND YEAR(data_criacao) = ?
        GROUP BY MONTH(data_criacao)
    ";
    $stmtS = $pdo->prepare($sqlSales);
    $stmtS->execute([$year]);
    foreach ($stmtS->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $sales[(int)$row['m'] - 1] += (float)$row['t'];
    }

    $sqlVF = "SELECT MONTH(data_venda) as m, SUM(valor_total) as t FROM vendas_fornecedores WHERE YEAR(data_venda) = ? AND (proposta_ref_id IS NULL OR titulo NOT LIKE 'Venda via Proposta #%') GROUP BY MONTH(data_venda)";
    $stmtV = $pdo->prepare($sqlVF);
    $stmtV->execute([$year]);
    foreach ($stmtV->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $sales[(int)$row['m'] - 1] += (float)$row['t'];
    }

    // Metas Mes a Mes (Soma das metas unificadas dos vendedores vezes cada mês)
    $stmtG = $pdo->prepare("SELECT SUM(meta_mensal) FROM commission_config WHERE ativo = 1");
    $stmtG->execute();
    $monthlyGoal = (float)$stmtG->fetchColumn();
    for ($i = 0; $i < 12; $i++) {
        $goals[$i] = $monthlyGoal;
    }

    return [
        'labels' => $labels,
        'sales'  => $sales,
        'goals'  => $goals
    ];
}

/**
 * NOVO RELATÓRIO: Meta Fornecedores (Performance Real vs Metas)
 */
function get_supplier_meta_performance($pdo, $start_date, $end_date, $filter_supplier_names = []) {
    $end_dt = date('Y-m-d', strtotime($end_date));
    $year = date('Y', strtotime($end_dt));
    $ytd_start = $year . '-01-01'; // Faturamento do ano inteiro até a data final
    
    // Período filtrado original (para comparação)
    $p_start = date('Y-m-d', strtotime($start_date));
    $p_end = $end_dt;

    // 1. Carrega Mapa de Fornecedores
    $suppliers_map = [];
    $stmt_sup = $pdo->query("SELECT id, nome FROM fornecedores");
    while ($s = $stmt_sup->fetch(PDO::FETCH_ASSOC)) {
        $suppliers_map[strtoupper(trim($s['nome'] ?? ''))] = (int) $s['id'];
    }

    // 2. Carrega Metas do Ano Inteiro (Soma dos 12 meses)
    $metas_anuais = [];
    $stmt_st = $pdo->prepare("SELECT fornecedor_nome, SUM(meta_mensal) as meta_anual FROM supplier_monthly_targets WHERE year = ? GROUP BY fornecedor_nome");
    $stmt_st->execute([$year]);
    while($st = $stmt_st->fetch(PDO::FETCH_ASSOC)) {
        $fname = strtoupper(trim($st['fornecedor_nome']));
        $metas_anuais[$fname] = (float)$st['meta_anual'];
    }

    // 3. Fornecedores Fixos
    $fornecedores_fixos = ['BRASIL MEDICA', 'HEALTH', 'INSTRAMED', 'LIVANOVA', 'MASIMO', 'MERIL', 'MICROMED', 'NIPRO', 'SIGMAFIX'];
    $performance = [];
    foreach ($fornecedores_fixos as $f) {
        $performance[$f] = [
            'name' => $f,
            'annual_total' => 0,
            'period_total' => 0,
            'annual_goal' => $metas_anuais[$f] ?? 0
        ];
    }

    // 4. Busca Vendas Diretas (Ano Inteiro)
    $sql_v = "SELECT fabricante_marca, titulo, descricao_produto, data_venda, SUM(valor_total) as total 
              FROM vendas_fornecedores 
              WHERE data_venda BETWEEN ? AND ? 
              GROUP BY fabricante_marca, titulo, descricao_produto, data_venda";
    $stmt_v = $pdo->prepare($sql_v);
    $stmt_v->execute([$ytd_start, $p_end]);
    while($v = $stmt_v->fetch(PDO::FETCH_ASSOC)) {
        $fname = 'OUTROS';
        foreach($fornecedores_fixos as $target) {
            if (stripos($v['fabricante_marca'] ?? '', $target) !== false || 
                stripos($v['titulo'] ?? '', $target) !== false || 
                stripos($v['descricao_produto'] ?? '', $target) !== false) {
                $fname = $target; break;
            }
        }
        if ($fname !== 'OUTROS') {
            $performance[$fname]['annual_total'] += (float)$v['total'];
            if ($v['data_venda'] >= $p_start) {
                $performance[$fname]['period_total'] += (float)$v['total'];
            }
        }
    }

    // 5. Busca Propostas Aprovadas (Ano Inteiro)
    $sql_p = "SELECT p.id, p.valor_total, p.data_criacao, f.nome as fornecedor_nome
              FROM propostas p
              JOIN oportunidades o ON p.oportunidade_id = o.id
              LEFT JOIN fornecedores f ON o.fornecedor_id = f.id
              WHERE p.status = 'Aprovada' AND p.data_criacao BETWEEN ? AND ?";
    $stmt_p = $pdo->prepare($sql_p);
    $stmt_p->execute([$ytd_start . ' 00:00:00', $p_end . ' 23:59:59']);
    $props = $stmt_p->fetchAll(PDO::FETCH_ASSOC);

    $prop_ids = array_column($props, 'id');
    $items_by_prop = [];
    if (!empty($prop_ids)) {
        $placeholders = implode(',', array_fill(0, count($prop_ids), '?'));
        $stmt_i = $pdo->prepare("SELECT proposta_id, fabricante FROM proposta_itens WHERE proposta_id IN ($placeholders)");
        $stmt_i->execute($prop_ids);
        while($i = $stmt_i->fetch(PDO::FETCH_ASSOC)) { $items_by_prop[$i['proposta_id']][] = $i['fabricante']; }
    }

    foreach ($props as $p) {
        $fname = 'OUTROS';
        foreach($fornecedores_fixos as $target) { if (stripos($p['fornecedor_nome'] ?? '', $target) !== false) { $fname = $target; break; } }
        if ($fname === 'OUTROS' && isset($items_by_prop[$p['id']])) {
            foreach($items_by_prop[$p['id']] as $mfr) {
                foreach($fornecedores_fixos as $target) { if (stripos($mfr ?? '', $target) !== false) { $fname = $target; break 2; } }
            }
        }
        if ($fname !== 'OUTROS') {
            $performance[$fname]['annual_total'] += (float)$p['valor_total'];
            $p_dt = date('Y-m-d', strtotime($p['data_criacao']));
            if ($p_dt >= $p_start) { $performance[$fname]['period_total'] += (float)$p['valor_total']; }
        }
    }

    // 6. Notas Fiscais (Ano Inteiro)
    $sql_nf = "SELECT nf.itens, nf.valor as total_nf, nf.data_faturamento, f.nome as fornecedor_nome
               FROM notas_fiscais nf
               JOIN oportunidades o ON nf.oportunidade_id = o.id
               LEFT JOIN fornecedores f ON o.fornecedor_id = f.id
               WHERE nf.data_faturamento BETWEEN ? AND ?";
    $stmt_nf = $pdo->prepare($sql_nf);
    $stmt_nf->execute([$ytd_start, $p_end]);
    while($nf = $stmt_nf->fetch(PDO::FETCH_ASSOC)) {
        $items = !empty($nf['itens']) ? json_decode($nf['itens'], true) : [];
        $nf_dt = date('Y-m-d', strtotime($nf['data_faturamento']));
        if (is_array($items) && !empty($items)) {
            foreach($items as $it) {
                $mfr = strtoupper(trim($it['fornecedor'] ?? $it['fabricante'] ?? ''));
                $fname = 'OUTROS';
                foreach($fornecedores_fixos as $target) { if (stripos($mfr, $target) !== false) { $fname = $target; break; } }
                if ($fname !== 'OUTROS') {
                    $performance[$fname]['annual_total'] += (float)($it['valor_total'] ?? 0);
                    if ($nf_dt >= $p_start) { $performance[$fname]['period_total'] += (float)($it['valor_total'] ?? 0); }
                }
            }
        } else {
            $fname = 'OUTROS';
            foreach($fornecedores_fixos as $target) { if (stripos($nf['fornecedor_nome'] ?? '', $target) !== false) { $fname = $target; break; } }
            if ($fname !== 'OUTROS') {
                $performance[$fname]['annual_total'] += (float)$nf['total_nf'];
                if ($nf_dt >= $p_start) { $performance[$fname]['period_total'] += (float)$nf['total_nf']; }
            }
        }
    }

    // 7. Formatação Final
    $results = [];
    foreach ($performance as $p) {
        if (!empty($filter_supplier_names)) {
             $match = false;
             foreach($filter_supplier_names as $fsn) { if (stripos($p['name'], (string)$fsn) !== false) { $match = true; break; } }
             if (!$match) continue;
        }

        $p['progress'] = $p['annual_goal'] > 0 ? round(($p['annual_total'] / $p['annual_goal']) * 100, 1) : ($p['annual_total'] > 0 ? 100 : 0);
        $p['diff'] = $p['annual_total'] - $p['annual_goal'];
        $results[] = $p;
    }
    return $results;
}