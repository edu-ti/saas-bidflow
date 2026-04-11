<?php
// api/handlers/email_handler.php
require_once dirname(__DIR__) . '/core/helpers.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;
use SendGrid\Mail\Mail;

/**
 * Lida com o envio de e-mails em massa para leads selecionados.
 * Suporta SendGrid e SMTP via PHPMailer, configurável via .env
 */
function handle_send_bulk_email_leads($pdo, $data)
{
    // --- Validação dos Dados Recebidos ---
    $recipientEmails = $data['emails'] ?? [];
    $subject = $data['subject'] ?? '';
    $body = $data['body'] ?? ''; // Corpo HTML vindo do TinyMCE

    if (empty($recipientEmails)) {
        json_response(['success' => false, 'error' => 'Nenhum destinatário fornecido.'], 400);
        return;
    }
    if (empty($subject) || empty($body)) {
        json_response(['success' => false, 'error' => 'Assunto e corpo do e-mail são obrigatórios.'], 400);
        return;
    }

    // --- Tratamento de Imagens (URLs Relativas -> Absolutas) ---
    // O TinyMCE muitas vezes salva caminhos relativos (ex: src="public/uploads...").
    // Emails precisam de URLs absolutas.

    $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http");
    $host = $_SERVER['HTTP_HOST'];

    // Tenta descobrir a base URL do CRM.
    // Se acessado via /crm/api.php, dirname será /crm
    $scriptDir = dirname($_SERVER['SCRIPT_NAME']);
    // Remove '/api' caso o script esteja rodando de dentro de /api (não é o caso do router, mas por segurança)
    // O router geralmente está na raiz ou pasta do projeto.
    $baseUrlPath = str_replace(['/api', '\\'], ['', '/'], $scriptDir);
    $baseUrlPath = rtrim($baseUrlPath, '/'); // Remove barra final

    $baseUrl = "$protocol://$host$baseUrlPath";

    // Substitui src="public/..." por src="https://dominio.com/crm/public/..."
    // Cobre variações com e sem barra inicial
    $body = str_replace('src="public/', 'src="' . $baseUrl . '/public/', $body);
    $body = str_replace('src="/public/', 'src="' . $baseUrl . '/public/', $body);
    $body = str_replace('src="../public/', 'src="' . $baseUrl . '/public/', $body);

    $validRecipientCount = 0;
    $errors = [];

    // Itera sobre os destinatários e envia um por um (para melhor controle e personalização futura)
    foreach ($recipientEmails as $recipient) {
        if (filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
            $result = send_email_internal($recipient, $subject, $body);
            if ($result['success']) {
                $validRecipientCount++;
            } else {
                $errors[] = "Falha para $recipient: " . $result['error'];
                error_log("Erro de envio para $recipient: " . $result['error']);
            }
        } else {
            error_log("Email inválido ignorado: " . $recipient);
        }
    }

    if ($validRecipientCount > 0) {
        json_response([
            'success' => true,
            'sentCount' => $validRecipientCount,
            'message' => "Enviados: $validRecipientCount. " . (count($errors) > 0 ? "Falhas: " . count($errors) : "")
        ]);
    } else {
        json_response([
            'success' => false,
            'error' => 'Falha no envio. Verifique logs.',
            'details' => $errors
        ], 500);
    }
}

/**
 * Função interna para despachar o envio baseado no driver configurado (SMTP ou SendGrid)
 */
function send_email_internal($to, $subject, $body)
{
    $driver = defined('MAIL_DRIVER') ? MAIL_DRIVER : 'sendgrid';
    $fromEmail = defined('MAIL_FROM_ADDRESS') && MAIL_FROM_ADDRESS ? MAIL_FROM_ADDRESS : 'marketing@frpe.app.br';
    $fromName = defined('MAIL_FROM_NAME') && MAIL_FROM_NAME ? MAIL_FROM_NAME : 'FR Produtos Médicos CRM';

    if ($driver === 'smtp') {
        return send_via_smtp($to, $subject, $body, $fromEmail, $fromName);
    } else {
        // Fallback or explicit SendGrid
        return send_via_sendgrid($to, $subject, $body, $fromEmail, $fromName);
    }
}

function send_via_smtp($to, $subject, $body, $fromEmail, $fromName)
{
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host = defined('SMTP_HOST') ? SMTP_HOST : '';
        $mail->SMTPAuth = true;
        $mail->Username = defined('SMTP_USER') ? SMTP_USER : '';
        $mail->Password = defined('SMTP_PASS') ? SMTP_PASS : '';
        $mail->SMTPSecure = defined('SMTP_SECURE') ? SMTP_SECURE : PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = defined('SMTP_PORT') ? SMTP_PORT : 465;
        $mail->CharSet = 'UTF-8';

        // Recipients
        $mail->setFrom($fromEmail, $fromName);
        $mail->addAddress($to);

        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->AltBody = strip_tags($body);

        $mail->send();
        return ['success' => true];
    } catch (PHPMailerException $e) {
        return ['success' => false, 'error' => "Mailer Error: {$mail->ErrorInfo}"];
    } catch (Exception $e) {
        return ['success' => false, 'error' => "General Error: {$e->getMessage()}"];
    }
}

function send_via_sendgrid($to, $subject, $body, $fromEmail, $fromName)
{
    // Carregamento manual de fallback se necessário (manteve-se a lógica de segurança anterior)
    if (!class_exists('\SendGrid')) {
        $fallbackPath = dirname(__DIR__, 2) . '/vendor/sendgrid/sendgrid/sendgrid-php.php';
        if (file_exists($fallbackPath)) {
            require_once $fallbackPath;
        }
    }

    if (!class_exists('\SendGrid\Mail\Mail')) {
        return ['success' => false, 'error' => 'Biblioteca SendGrid não encontrada.'];
    }

    $apiKey = defined('SENDGRID_API_KEY') ? SENDGRID_API_KEY : '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'; // Fallback hardcoded (não recomendado)

    $email = new \SendGrid\Mail\Mail();
    $email->setFrom($fromEmail, $fromName);
    $email->setSubject($subject);
    $email->addTo($to);
    $email->addContent("text/plain", strip_tags($body));
    $email->addContent("text/html", $body);

    $sendgrid = new \SendGrid($apiKey);
    try {
        $response = $sendgrid->send($email);
        if ($response->statusCode() >= 200 && $response->statusCode() < 300) {
            return ['success' => true];
        } else {
            return ['success' => false, 'error' => "SendGrid API Error: " . $response->statusCode() . " - " . $response->body()];
        }
    } catch (Exception $e) {
        return ['success' => false, 'error' => "SendGrid Exception: " . $e->getMessage()];
    }
}

/**
 * Lida com o upload de imagens do editor TinyMCE
 */
function handle_upload_email_image()
{
    // Verifica se há arquivo
    if (!isset($_FILES['file']) && !isset($_FILES['blobid0'])) {
        // Tenta pegar o primeiro arquivo enviado
        if (!empty($_FILES)) {
            $key = array_key_first($_FILES);
            $file = $_FILES[$key];
        } else {
            json_response(['error' => 'Nenhum arquivo enviado.'], 400);
            return;
        }
    } else {
        $file = $_FILES['file'] ?? $_FILES['blobid0'];
    }

    if ($file['error'] !== UPLOAD_ERR_OK) {
        json_response(['error' => 'Erro no upload: ' . $file['error']], 500);
        return;
    }

    // Validação de tipo
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        json_response(['error' => 'Tipo de arquivo inválido. Apenas JPG, PNG, GIF e WebP.'], 400);
        return;
    }

    // Diretório de destino
    $uploadDir = dirname(__DIR__, 2) . '/public/uploads/emails/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Gera nome único
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('img_') . '.' . $extension;
    $targetPath = $uploadDir . $filename;

    // Move o arquivo
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        // URL pública para acesso (ajuste conforme a estrutura do servidor)
        // Assumindo que o CRM roda na raiz ou subpasta configurável
        // O frontend espera { location: 'url' }
        $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http");
        $host = $_SERVER['HTTP_HOST'];

        // Pega o caminho relativo da pasta public
        // Correção de path: se api.php está em /crm/api.php, então a imagem deve ser /crm/public/uploads/emails/
        // O ideal é descobrir a base URL.

        // Tenta inferir o base path a partir do script name
        $scriptDir = dirname($_SERVER['SCRIPT_NAME']); // ex: /crm
        // scriptDir pode ser /crm ou / (se raiz)
        $basePath = str_replace('/api', '', $scriptDir); // remove /api de /crm/api ou /api

        // Se o base path ficou vazio e não é raiz, ajusta
        if ($basePath === '' || $basePath === '/') {
            $publicUrl = "$protocol://$host/public/uploads/emails/$filename";
        } else {
            $publicUrl = "$protocol://$host$basePath/public/uploads/emails/$filename";
        }

        // Retorna JSON esperado pelo TinyMCE
        echo json_encode(['location' => $publicUrl]);
    } else {
        json_response(['error' => 'Falha ao mover arquivo salvo.'], 500);
    }
}

