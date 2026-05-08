<?php
require_once __DIR__ . '/../../fpdf/fpdf.php';
require_once __DIR__ . '/report_handler.php';

class PDFReport extends FPDF {
    function Header() {
        if(file_exists(__DIR__ . '/../../imagens/LOGO-FR.png')) {
            $this->Image(__DIR__ . '/../../imagens/LOGO-FR.png', 10, 8, 33);
        }
        $this->SetFont('Arial', 'B', 15);
        $this->Cell(80);
        $this->Cell(30, 10, utf8_decode('Resumo Executivo - Relatório de BI'), 0, 0, 'C');
        $this->Ln(20);
    }

    function Footer() {
        $this->SetY(-15);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(0, 10, utf8_decode('Página ') . $this->PageNo() . '/{nb}', 0, 0, 'C');
    }
    
    function BasicTable($header, $data) {
        $this->SetFillColor(79, 70, 229); // Indigo 600
        $this->SetTextColor(255);
        $this->SetDrawColor(229, 231, 235);
        $this->SetLineWidth(.1);
        $this->SetFont('Arial', 'B', 10);
        
        // Count columns and dynamically set width to sum ~ 190 (A4 with 10mm margins = 210-20=190)
        $cols = count($header);
        $w = [];
        for ($i=0; $i<$cols; $i++) {
            $w[] = 190 / $cols; // Evenly distributed columns
        }
        
        for($i=0; $i<$cols; $i++)
            $this->Cell($w[$i], 7, utf8_decode($header[$i]), 1, 0, 'C', true);
        $this->Ln();
        
        // Data
        $this->SetFillColor(249, 250, 251); // Zebra color
        $this->SetTextColor(0);
        $this->SetFont('Arial', '', 9);
        
        $fill = false;
        foreach($data as $row) {
            $i = 0;
            foreach($row as $col) {
                if ($i >= count($w)) break;
                // Encode and truncate if too long
                $text = utf8_decode(is_string($col) ? substr($col, 0, 50) : $col);
                $this->Cell($w[$i], 6, $text, 'LR', 0, 'L', $fill);
                $i++;
            }
            $this->Ln();
            $fill = !$fill;
        }
        $this->Cell(array_sum($w), 0, '', 'T');
        $this->Ln(10);
    }
}

function handle_export_pdf($pdo, $request_data) {
    if (ob_get_length()) {
        ob_clean(); // Limpa saídas ou avisos anteriores
    }

    $type = $_GET['report_type'] ?? ($_GET['type'] ?? 'sales');

    // Interceptamos o endpoint original do handler para pegar os mesmos JSON arrays e renderizar
    ob_start();
    handle_get_report_data($pdo); 
    $jsonResponse = ob_get_clean();

    $response = json_decode($jsonResponse, true);
    $data = [];
    if (isset($response['report_data'])) {
        $data = $response['report_data'];
    } elseif (is_array($response)) {
        // Para casos como by_vendor que retornavam um array simples
        $data = $response; 
    }

    $pdf = new PDFReport();
    $pdf->AliasNbPages();
    $pdf->AddPage();
    $pdf->SetFont('Arial', '', 12);

    // Resumo Executivo
    $pdf->SetFillColor(243, 244, 246);
    $pdf->Rect(10, 30, 190, 25, 'F');

    $pdf->SetFont('Arial', 'B', 12);
    $pdf->SetY(32);
    $pdf->Cell(0, 8, utf8_decode('Parâmetros do Filtro'), 0, 1);
    $pdf->SetFont('Arial', '', 10);
    $pdf->Cell(0, 6, utf8_decode('Data: ' . ($_GET['start_date'] ?? 'N/D') . ' a ' . ($_GET['end_date'] ?? 'N/D') . '     |     Tipo: ' . strtoupper($type)), 0, 1);
    $pdf->Ln(15);

    if (empty($data) && $type !== 'sales') {
        $pdf->SetFont('Arial', 'I', 12);
        $pdf->Cell(0, 10, utf8_decode('Nenhum registro correspondente ao filtro foi encontrado.'), 0, 1, 'C');
    } else {
        // Dynamic Table Generation based on Type
        if ($type === 'clients') {
            $header = ['Cliente/Orgao', 'Qtd Vendas', 'Faturamento Bruto'];
            $tableData = [];
            foreach ($data as $r) {
                $tableData[] = [
                    $r['cliente_nome'], 
                    $r['qtd_vendas'], 
                    'R$ ' . number_format($r['valor_total'], 2, ',', '.')
                ];
            }
            $pdf->BasicTable($header, $tableData);
        } elseif ($type === 'funnel') {
            $header = ['Etapa do Funil', 'Qtd Oportunidades', 'Valor Estimado'];
            $tableData = [];
            foreach ($data as $r) {
                $tableData[] = [
                    $r['etapa_nome'], 
                    $r['qtd_oportunidades'], 
                    'R$ ' . number_format($r['valor_total'] ?? 0, 2, ',', '.')
                ];
            }
            $pdf->BasicTable($header, $tableData);
        } elseif ($type === 'licitacoes_funnel') {
            $header = ['Fabrica (Fornecedor)', 'Etapa', 'Qtd Oport.', 'Valor Estimado'];
            $tableData = [];
            foreach ($data as $r) {
                $tableData[] = [
                    $r['fornecedor_nome'], 
                    $r['etapa_nome'], 
                    $r['qtd_oportunidades'], 
                    'R$ ' . number_format($r['valor_total'] ?? 0, 2, ',', '.')
                ];
            }
            $pdf->BasicTable($header, $tableData);
        } elseif ($type === 'supplier_funnel') {
            $header = ['Fabrica (Fornecedor)', 'Qtd Oportunidades', 'Valor Estimado'];
            $tableData = [];
            foreach ($data as $r) {
                $tableData[] = [
                    $r['fornecedor_nome'], 
                    $r['qtd_oportunidades'], 
                    'R$ ' . number_format($r['valor_total'] ?? 0, 2, ',', '.')
                ];
            }
            $pdf->BasicTable($header, $tableData);
        } elseif ($type === 'contratos') {
            $header = ['Cliente', 'Etapa', 'Valor Contrato', 'Faturado', 'Saldo'];
            $tableData = [];
            foreach ($data as $r) {
                if (isset($r['contratos']) && is_array($r['contratos'])) {
                    foreach($r['contratos'] as $c) {
                        $tableData[] = [
                            $c['cliente_nome'], 
                            $r['etapa_nome'], 
                            'R$ ' . number_format($c['valor_contrato'] ?? 0, 2, ',', '.'),
                            'R$ ' . number_format($c['valor_faturado'] ?? 0, 2, ',', '.'),
                            'R$ ' . number_format($c['saldo'] ?? 0, 2, ',', '.')
                        ];
                    }
                }
            }
            $pdf->BasicTable($header, $tableData);
        } elseif ($type === 'products') {
            $header = ['Fornecedor', 'Produto', 'Qtd', 'Total'];
            $tableData = [];
            foreach ($data as $r) {
                $tableData[] = [
                    $r['fornecedor_nome'] ?? '-', 
                    $r['produto_nome'] ?? '-', 
                    $r['quantidade'] ?? 0, 
                    'R$ ' . number_format($r['valor_total'] ?? 0, 2, ',', '.')
                ];
            }
            $pdf->BasicTable($header, $tableData);
        } elseif ($type === 'sales') {
            $start_date = $_GET['start_date'] ?? date('Y-m-01');
            $end_date = $_GET['end_date'] ?? date('Y-m-t');
            // Flat query for PDF grouping 'Vendedor, Fornecedor, UF'
            $sql = "SELECT COALESCE(u.nome, 'N/A') as vendedor, COALESCE(f.nome_fantasia, f.razao_social, 'Outros') as fornecedor, COALESCE(e.estado, 'N/I') as uf, SUM(p.valor_total) as total
                    FROM propostas p
                    JOIN oportunidades o ON p.oportunidade_id = o.id
                    LEFT JOIN usuarios u ON p.usuario_id = u.id
                    LEFT JOIN organizacoes f ON o.fornecedor_id = f.id
                    LEFT JOIN enderecos e ON o.organizacao_id = e.entidade_id AND e.tipo_entidade = 'organizacao'
                    WHERE p.status = 'Aprovada' AND p.data_criacao BETWEEN ? AND ?
                    GROUP BY vendedor, fornecedor, uf
                    ORDER BY total DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$start_date . ' 00:00:00', $end_date . ' 23:59:59']);
            $salesFlat = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (empty($salesFlat)) {
                $pdf->SetFont('Arial', 'I', 12);
                $pdf->Cell(0, 10, utf8_decode('Nenhum registro correspondente ao filtro foi encontrado.'), 0, 1, 'C');
            } else {
                $header = ['Vendedor', 'Fornecedor', 'Estado (UF)', 'Valor Bruto'];
                $tableData = [];
                foreach ($salesFlat as $r) {
                    $tableData[] = [
                        $r['vendedor'], 
                        $r['fornecedor'], 
                        $r['uf'], 
                        'R$ ' . number_format($r['total'] ?? 0, 2, ',', '.')
                    ];
                }
                $pdf->BasicTable($header, $tableData);
            }
            $pdf->BasicTable($header, $tableData);
        } elseif ($type === 'performance') {
            $month = $_GET['month'] ?? date('Y-m');
            $header = ['Colaborador', 'Fixo', 'Meta', 'Vendas', '% At.', 'Comiss.', 'Total'];
            
            // Get data from handler directly to ensure consistency
            $start = $month . '-01';
            $lastDay = date('t', strtotime($start));
            $end = $month . '-' . $lastDay;
            
            // Correct class instantiation and call
            $handler = new ReportHandler();
            $response = $handler->getCommissionAnalysis($start, $end, true);
            
            if ($response['success']) {
                $tableData = [];
                foreach ($response['data'] as $r) {
                    $tableData[] = [
                        $r['nome'],
                        'R$ ' . number_format($r['valor_fixo'], 0, ',', '.'),
                        'R$ ' . number_format($r['meta_mensal'], 0, ',', '.'),
                        'R$ ' . number_format($r['total_vendas'], 0, ',', '.'),
                        number_format($r['atingimento'], 1) . '%',
                        'R$ ' . number_format($r['comissao_valor'], 0, ',', '.'),
                        'R$ ' . number_format($r['total_periodo'], 0, ',', '.')
                    ];
                }
                $pdf->BasicTable($header, $tableData);
            } else {
                 $pdf->SetFont('Arial', 'I', 12);
                 $pdf->Cell(0, 10, utf8_decode('Erro ao carregar dados de performance.'), 0, 1, 'C');
            }
        } else {
            $pdf->Cell(0, 10, utf8_decode('Este formato de relatório ainda não possui template PDF detalhado.'), 0, 1);
        }
    }

    // Force PDF Output Content Type
    header('Content-Type: application/pdf');
    header('Cache-Control: private, max-age=0, must-revalidate');
    header('Pragma: public');
    $pdf->Output('I', 'Relatorio_BI_FRPE.pdf');
    exit;
}
