<?php
// api/handlers/client_pf_handler.php

function handle_create_cliente_pf($pdo, $data)
{
    // Validação básica de campos obrigatórios
    if (empty($data['nome'])) {
        json_response(['success' => false, 'error' => 'Nome é obrigatório.'], 400);
        return;
    }

    // Tratamento dos dados para validação (remove máscaras)
    $cpf = isset($data['cpf']) ? preg_replace('/[^0-9]/', '', $data['cpf']) : null;
    $email = isset($data['email']) && filter_var(trim($data['email']), FILTER_VALIDATE_EMAIL) ? trim($data['email']) : null;
    $telefone = isset($data['telefone']) ? preg_replace('/[^\d+]/', '', $data['telefone']) : null;

    // --- VERIFICAÇÃO DE DUPLICIDADE (CPF) ---
    if ($cpf && strlen($cpf) === 11) {
        $stmt_check_cpf = $pdo->prepare("SELECT id FROM clientes_pf WHERE cpf = ? LIMIT 1");
        $stmt_check_cpf->execute([$cpf]);
        if ($stmt_check_cpf->fetchColumn()) {
            json_response(['success' => false, 'error' => 'Erro: Já existe um cliente Pessoa Física cadastrado com este CPF.'], 400);
            return;
        }
    }

    // --- VERIFICAÇÃO DE DUPLICIDADE (E-MAIL) ---
    if ($email) {
        $stmt_check_email = $pdo->prepare("SELECT id FROM clientes_pf WHERE email = ? LIMIT 1");
        $stmt_check_email->execute([$email]);
        if ($stmt_check_email->fetchColumn()) {
            json_response(['success' => false, 'error' => 'Erro: Já existe um cliente Pessoa Física cadastrado com este e-mail.'], 400);
            return;
        }
    }

    // Preparação da Query de Inserção
    $sql = "INSERT INTO clientes_pf (
                nome, cpf, email, telefone, 
                cep, logradouro, numero, complemento, bairro, cidade, estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $pdo->prepare($sql);

    try {
        $success = $stmt->execute([
            $data['nome'],
            $cpf,
            $email,
            $telefone,
            empty($data['cep']) ? null : $data['cep'],
            empty($data['logradouro']) ? null : $data['logradouro'],
            empty($data['numero']) ? null : $data['numero'],
            empty($data['complemento']) ? null : $data['complemento'],
            empty($data['bairro']) ? null : $data['bairro'],
            empty($data['cidade']) ? null : $data['cidade'],
            empty($data['estado']) ? null : $data['estado']
        ]);

        if ($success) {
            $lastId = $pdo->lastInsertId();
            $stmt_new = $pdo->prepare("SELECT * FROM clientes_pf WHERE id = ?");
            $stmt_new->execute([$lastId]);
            json_response(['success' => true, 'client' => $stmt_new->fetch(PDO::FETCH_ASSOC)]);
        } else {
            json_response(['success' => false, 'error' => 'Erro ao criar cliente PF (Falha na execução).'], 500);
        }

    } catch (PDOException $e) {
        // Captura erro de duplicidade SQL (caso passe pela validação manual por concorrência)
        if ($e->errorInfo[1] == 1062) {
            json_response(['success' => false, 'error' => 'Erro: Cliente duplicado (CPF ou E-mail já existe na base de dados).'], 400);
        } else {
            json_response(['success' => false, 'error' => 'Erro de banco de dados: ' . $e->getMessage()], 500);
        }
    }
}

function handle_update_cliente_pf($pdo, $data)
{
    if (empty($data['id'])) {
        json_response(['success' => false, 'error' => 'ID é obrigatório.'], 400);
        return;
    }
    if (empty($data['nome'])) {
        json_response(['success' => false, 'error' => 'Nome é obrigatório.'], 400);
        return;
    }

    $cpf = isset($data['cpf']) ? preg_replace('/[^0-9]/', '', $data['cpf']) : null;
    $email = isset($data['email']) && filter_var(trim($data['email']), FILTER_VALIDATE_EMAIL) ? trim($data['email']) : null;
    $telefone = isset($data['telefone']) ? preg_replace('/[^\d+]/', '', $data['telefone']) : null;

    $sql = "UPDATE clientes_pf 
            SET nome = ?, cpf = ?, email = ?, telefone = ?, 
                cep = ?, logradouro = ?, numero = ?, complemento = ?, bairro = ?, cidade = ?, estado = ? 
            WHERE id = ?";

    $stmt = $pdo->prepare($sql);

    try {
        $success = $stmt->execute([
            $data['nome'],
            $cpf,
            $email,
            $telefone,
            empty($data['cep']) ? null : $data['cep'],
            empty($data['logradouro']) ? null : $data['logradouro'],
            empty($data['numero']) ? null : $data['numero'],
            empty($data['complemento']) ? null : $data['complemento'],
            empty($data['bairro']) ? null : $data['bairro'],
            empty($data['cidade']) ? null : $data['cidade'],
            empty($data['estado']) ? null : $data['estado'],
            (int) $data['id']
        ]);

        if ($success) {
            $stmt_updated = $pdo->prepare("SELECT * FROM clientes_pf WHERE id = ?");
            $stmt_updated->execute([(int) $data['id']]);
            json_response(['success' => true, 'client' => $stmt_updated->fetch(PDO::FETCH_ASSOC)]);
        } else {
            json_response(['success' => false, 'error' => 'Erro ao atualizar cliente PF.'], 500);
        }
    } catch (PDOException $e) {
        if ($e->errorInfo[1] == 1062) {
            json_response(['success' => false, 'error' => 'Erro: Dados duplicados (CPF ou E-mail já pertencem a outro registro).'], 400);
        } else {
            json_response(['success' => false, 'error' => 'Erro de banco de dados: ' . $e->getMessage()], 500);
        }
    }
}

function handle_delete_cliente_pf($pdo, $data)
{
    $id = $data['id'] ?? null;

    if (empty($id)) {
        json_response(['success' => false, 'error' => 'ID do cliente é obrigatório.'], 400);
        return;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM clientes_pf WHERE id = ?");
        if ($stmt->execute([(int) $id])) {
            json_response(['success' => true, 'message' => 'Cliente PF excluído com sucesso.']);
        } else {
            json_response(['success' => false, 'error' => 'Erro ao excluir cliente PF.'], 500);
        }
    } catch (PDOException $e) {
        json_response(['success' => false, 'error' => 'Erro ao excluir: ' . $e->getMessage()], 500);
    }
}

function handle_import_clients($pdo, $data)
{
    if (empty($data['clients']) || !is_array($data['clients'])) {
        json_response(['success' => false, 'error' => 'Nenhum dado de cliente fornecido.'], 400);
        return;
    }

    $imported_pj_count = 0;
    $imported_pf_count = 0;
    $duplicate_pj_count = 0;
    $duplicate_pf_count = 0;
    $error_count = 0;

    $pdo->beginTransaction();

    try {
        foreach ($data['clients'] as $index => $client) {
            $nome_fantasia = isset($client['nome_fantasia']) ? trim($client['nome_fantasia']) : null;
            $nome_pf = isset($client['nome']) ? trim($client['nome']) : null; // Coluna "nome" para PF
            $cnpj = isset($client['cnpj']) ? preg_replace('/[^0-9]/', '', $client['cnpj']) : null;
            $cpf = isset($client['cpf']) ? preg_replace('/[^0-9]/', '', $client['cpf']) : null;
            $email = isset($client['email']) ? trim($client['email']) : null;

            // Tratamento genérico de campos
            $telefone = isset($client['telefone']) ? preg_replace('/[^\d+]/', '', $client['telefone']) : null;
            $cep = isset($client['cep']) ? preg_replace('/[^0-9]/', '', $client['cep']) : null;
            $logradouro = $client['logradouro'] ?? null;
            $numero = $client['numero'] ?? null;
            $complemento = $client['complemento'] ?? null;
            $bairro = $client['bairro'] ?? null;
            $cidade = $client['cidade'] ?? null;
            $estado = $client['estado'] ?? null;

            // Lógica de Importação PJ
            if ($cnpj && strlen($cnpj) === 14 && !empty($nome_fantasia)) {
                $stmt = $pdo->prepare("SELECT id FROM organizacoes WHERE cnpj = ?");
                $stmt->execute([$cnpj]);
                if ($stmt->fetch()) {
                    $duplicate_pj_count++;
                } else {
                    $stmt_insert = $pdo->prepare("INSERT INTO organizacoes (nome_fantasia, cnpj, email, telefone, cep, logradouro, numero, complemento, bairro, cidade, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    if ($stmt_insert->execute([$nome_fantasia, $cnpj, $email, $telefone, $cep, $logradouro, $numero, $complemento, $bairro, $cidade, $estado])) {
                        $imported_pj_count++;
                    } else {
                        $error_count++;
                    }
                }
            }
            // Lógica de Importação PF
            elseif ($cpf && strlen($cpf) === 11 && !empty($nome_pf)) {
                $stmt = $pdo->prepare("SELECT id FROM clientes_pf WHERE cpf = ?");
                $stmt->execute([$cpf]);
                if ($stmt->fetch()) {
                    $duplicate_pf_count++;
                } else {
                    $stmt_insert = $pdo->prepare("INSERT INTO clientes_pf (nome, cpf, email, telefone, cep, logradouro, numero, complemento, bairro, cidade, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    if ($stmt_insert->execute([$nome_pf, $cpf, $email, $telefone, $cep, $logradouro, $numero, $complemento, $bairro, $cidade, $estado])) {
                        $imported_pf_count++;
                    } else {
                        $error_count++;
                    }
                }
            } else {
                // Registro inválido ou incompleto
                $error_count++;
            }
        }

        $pdo->commit();

        json_response([
            'success' => true,
            'importedPj' => $imported_pj_count,
            'importedPf' => $imported_pf_count,
            'duplicatesPj' => $duplicate_pj_count,
            'duplicatesPf' => $duplicate_pf_count,
            'errors' => $error_count
        ]);

    } catch (Exception $e) {
        $pdo->rollBack();
        json_response(['success' => false, 'error' => 'Erro na importação: ' . $e->getMessage()], 500);
    }
}
?>