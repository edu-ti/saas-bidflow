<?php
// api/handlers/invoice_parser_handler.php

function handle_parse_invoice($pdo, $data)
{
    if (!isset($_FILES['invoice'])) {
        json_response(['success' => false, 'error' => 'Arquivo PDF não fornecido.'], 400);
    }

    $opportunityId = $_POST['opportunityId'] ?? null;
    if (!$opportunityId) {
        json_response(['success' => false, 'error' => 'ID da Oportunidade não fornecido.'], 400);
    }

    $file = $_FILES['invoice'];
    if ($file['type'] !== 'application/pdf') {
        json_response(['success' => false, 'error' => 'O arquivo deve ser um PDF.'], 400);
    }

    // Inicializar o parser
    if (!class_exists('\Smalot\PdfParser\Parser')) {
        json_response(['success' => false, 'error' => 'A biblioteca de parsing de PDF não está instalada (smalot/pdfparser). Por favor, instale usando o composer.'], 500);
    }

    try {
        $parser = new \Smalot\PdfParser\Parser();
        $pdf = $parser->parseFile($file['tmp_name']);
        $text = $pdf->getText();

        // Extração de Dados usando RegEx (Ajuste conforme os padrões da sua NFe)
        // 1. Valor Total da NFe
        $valorTotalNFe = 0;
        if (preg_match('/VALOR TOTAL DA NOTA[\r\n\s]+R?\$?[\s]*([\d\.,]+)/i', $text, $matches)) {
            $valStr = str_replace('.', '', $matches[1]);
            $valStr = str_replace(',', '.', $valStr);
            $valorTotalNFe = (float) $valStr;
        } elseif (preg_match('/VALOR TOTAL[\r\n\s]*([\d\.,]+)/i', $text, $matches)) {
            // Regra reserva
            $valStr = str_replace('.', '', $matches[1]);
            $valStr = str_replace(',', '.', $valStr);
            $valorTotalNFe = (float) $valStr;
        }

        // 2. Destinatário / Razão Social
        $destinatario = null;
        if (preg_match('/NOME\s*\/[\s\S]*?RAZÃO SOCIAL\s+([A-Za-z0-9\s.-]+?)\s+CNPJ/i', $text, $matches)) {
            $destinatario = trim($matches[1]);
        } elseif (preg_match('/DESTINATÁRIO[\s\S]*?RAZÃO SOCIAL[:\s]+([A-Za-z0-9\s.-]+)/i', $text, $matches)) {
            $destinatario = trim($matches[1]);
        }

        // 3. Produtos (Descrição Simplificada das linhas de detalhes)
        $produtosEncontrados = [];
        // Regex básica para produtos da NF (varia muito dependendo do layout da NF municipal ou estadual)
        // Vamos procurar blocos que parecem ser produtos (Código, Descrição, NCM/SH, CST, CFOP, Unid, Quant, Valor Unit)
        // Por exemplo, capturar a Descrição do Produto que geralmente está no meio da linha.
        if (preg_match_all('/([A-Z0-9\s.-]{5,50})[\s\r\n]+(?:UN|PC|CX|KG|M|LTS)[\s\r\n]+([\d.,]+)/i', $text, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $m) {
                // Acha a descrição antes da unidade
                $produtosEncontrados[] = [
                    'descricao' => trim($m[1]),
                    'quantidade' => (float) str_replace(',', '.', $m[2])
                ];
            }
        }

        // --- ATUALIZAR A OPORTUNIDADE (Opcional, ou apenas retornar os dados extraídos) ---
        // Se quisermos apenas anexar na nota ou atualizar o valor da Oportunidade
        $updateFields = [];
        $updateValues = [];

        if ($valorTotalNFe > 0) {
            $updateFields[] = "valor = ?";
            $updateValues[] = $valorTotalNFe;
        }

        // Podemos adicionar o texto extraído nas "notas" da oportunidade
        $notaAdicional = "--- DADOS DA NFE IDENTIFICADOS ---\n";
        if ($destinatario)
            $notaAdicional .= "Cliente da NFe: " . $destinatario . "\n";
        if ($valorTotalNFe > 0)
            $notaAdicional .= "Valor Total NFe: R$ " . number_format($valorTotalNFe, 2, ',', '.') . "\n";
        if (count($produtosEncontrados) > 0) {
            $notaAdicional .= "Produtos (NFe):\n";
            foreach ($produtosEncontrados as $p) {
                $notaAdicional .= "- " . $p['descricao'] . " (Qtd: " . $p['quantidade'] . ")\n";
            }
        }
        $notaAdicional .= "---------------------------------";

        $updateFields[] = "notas = CONCAT(IFNULL(notas, ''), ?)";
        $updateValues[] = "\n\n" . $notaAdicional;

        if (count($updateFields) > 0) {
            $updateValues[] = $opportunityId;
            $stmt = $pdo->prepare("UPDATE oportunidades SET " . implode(", ", $updateFields) . " WHERE id = ?");
            $stmt->execute($updateValues);
        }

        // Retorna a oportunidade atualizada
        $stmt_updated = $pdo->prepare("
            SELECT o.*, 
                   org.nome_fantasia as organizacao_nome, 
                   cpf.nome as cliente_pf_nome, 
                   c.nome as contato_nome, c.email as contato_email, c.telefone as contato_telefone,
                   u.nome as vendedor_nome
            FROM oportunidades o 
            LEFT JOIN organizacoes org ON o.organizacao_id = org.id
            LEFT JOIN clientes_pf cpf ON o.cliente_pf_id = cpf.id
            LEFT JOIN contatos c ON o.contato_id = c.id
            LEFT JOIN usuarios u ON o.usuario_id = u.id
            WHERE o.id = ?");
        $stmt_updated->execute([$opportunityId]);
        $updated_opp = $stmt_updated->fetch(PDO::FETCH_ASSOC);

        json_response([
            'success' => true,
            'message' => 'Nota fiscal lida com sucesso. Alguns dados foram atualizados.',
            'opportunity' => $updated_opp,
            'extracted_data' => [
                'valor_total' => $valorTotalNFe,
                'destinatario' => $destinatario,
                'produtos' => $produtosEncontrados
            ]
        ]);

    } catch (Exception $e) {
        error_log("Erro ao processar PDF: " . $e->getMessage());
        json_response(['success' => false, 'error' => 'Erro ao processar o PDF da Nota Fiscal: ' . $e->getMessage()], 500);
    }
}
