<?php
// api/handlers/image_handler.php

/**
 * Lida com o upload de imagens especificamente para o editor TinyMCE.
 * Espera um arquivo enviado via POST com o nome 'file'.
 * Retorna um JSON no formato { "location": "URL_DA_IMAGEM_SALVA" } em caso de sucesso.
 */
function handle_upload_email_image() {
    // --- Validações ---
    if (empty($_FILES['file'])) {
        json_response(['error' => 'Nenhum arquivo enviado.'], 400);
        return;
    }

    $file = $_FILES['file'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        $upload_errors = [
            UPLOAD_ERR_INI_SIZE   => 'O arquivo excede a diretiva upload_max_filesize no php.ini.',
            UPLOAD_ERR_FORM_SIZE  => 'O arquivo excede a diretiva MAX_FILE_SIZE especificada no formulário HTML.',
            UPLOAD_ERR_PARTIAL    => 'O upload do arquivo foi feito parcialmente.',
            UPLOAD_ERR_NO_FILE    => 'Nenhum arquivo foi enviado.',
            UPLOAD_ERR_NO_TMP_DIR => 'Falta uma pasta temporária.',
            UPLOAD_ERR_CANT_WRITE => 'Falha ao escrever o arquivo no disco.',
            UPLOAD_ERR_EXTENSION  => 'Uma extensão do PHP interrompeu o upload do arquivo.',
        ];
        $error_message = $upload_errors[$file['error']] ?? 'Erro desconhecido no upload.';
        json_response(['error' => $error_message], 500);
        return;
    }

    // Verifica o tipo de arquivo (MIME type é mais seguro que extensão)
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime_type = $finfo->file($file['tmp_name']);
    $allowed_mime_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!in_array($mime_type, $allowed_mime_types)) {
        json_response(['error' => 'Tipo de arquivo inválido. Apenas JPG, PNG, GIF e WebP são permitidos.'], 400);
        return;
    }

    // Verifica o tamanho do arquivo (ex: máximo de 5MB)
    $max_size = 5 * 1024 * 1024; // 5 MB
    if ($file['size'] > $max_size) {
        json_response(['error' => 'O arquivo é muito grande. O tamanho máximo permitido é de 5MB.'], 400);
        return;
    }

    // --- Processamento e Salvamento ---
    $upload_dir = 'uploads/email_images/';
    $base_path = dirname(__DIR__, 2); // Vai para a raiz do projeto (onde está index.php, api.php, etc.)
    $destination_dir = $base_path . '/' . $upload_dir;

    // Cria o diretório se não existir
    if (!is_dir($destination_dir)) {
        if (!mkdir($destination_dir, 0775, true)) { // Usa 0775 que é mais seguro que 0777
            json_response(['error' => 'Falha ao criar o diretório de uploads. Verifique as permissões.'], 500);
            return;
        }
    }

    // Gera um nome de arquivo único
    $file_extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $new_filename = uniqid('img_', true) . '.' . strtolower($file_extension);
    $destination_path = $destination_dir . $new_filename;

    // Move o arquivo carregado
    if (move_uploaded_file($file['tmp_name'], $destination_path)) {
        // Constrói a URL pública
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
        // Obtém o diretório base do script atual (api.php) e remove o '/api.php' ou similar
        $script_dir = dirname($_SERVER['SCRIPT_NAME']);
         // Remove '/api' se existir para obter o caminho base do site
        $base_url_path = rtrim(str_replace('/api', '', $script_dir), '/');

        // Garante que não haja barras duplicadas
        $image_url = $protocol . $_SERVER['HTTP_HOST'] . $base_url_path . '/' . $upload_dir . $new_filename;

        // Retorna a URL no formato esperado pelo TinyMCE
        json_response(['location' => $image_url]);

    } else {
        json_response(['error' => 'Falha ao mover o arquivo carregado. Verifique as permissões do diretório.'], 500);
    }
}
