<?php
// api/core/helpers.php

// --- Carregamento do PHPMailer ---
// Usa o autoload do Composer (recomendado)
require_once dirname(__DIR__, 2) . '/vendor/autoload.php';
// Se instalou manualmente, ajuste o require para os ficheiros do PHPMailer
// require_once dirname(__DIR__, 2) . '/lib/PHPMailer/src/Exception.php';
 //require_once dirname(__DIR__, 2) . '/lib/PHPMailer/src/PHPMailer.php';
// require_once dirname(__DIR__, 2) . '/lib/PHPMailer/src/SMTP.php';

// Importa as classes do PHPMailer para o namespace global
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

/**
 * Lida com erros PHP, regista-os e envia uma resposta JSON genérica.
 * (Função handle_php_error como estava antes)
 */
function handle_php_error($errno, $errstr, $errfile, $errline) {
    if (!(error_reporting() & $errno)) { return; }
    if (ob_get_level()) { ob_end_clean(); }
    error_log("PHP Error [$errno]: $errstr in $errfile on line $errline");
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Erro interno do servidor. Contacte o administrador.']);
    }
    exit;
}

/**
 * Envia uma resposta JSON padronizada e termina a execução.
 * (Função json_response como estava antes)
 */
function json_response($data, $status_code = 200) {
    if (!headers_sent()) {
        http_response_code($status_code);
        header('Content-Type: application/json');
    }
    echo json_encode($data);
    exit;
}

/**
 * Envia um e-mail de notificação usando PHPMailer via SMTP.
 *
 * @param array $recipients Array de endereços de e-mail para quem enviar.
 * @param string $subject Assunto do e-mail.
 * @param string $htmlBody Corpo do e-mail em HTML.
 * @return bool True em sucesso, False em falha.
 */
function send_email_notification(array $recipients, string $subject, string $htmlBody): bool {
    error_log("DEBUG: Iniciando send_email_notification via PHPMailer para: " . $subject);

    $mail = new PHPMailer(true); // Habilita exceções

    try {
        // --- Configuração do Servidor SMTP ---
        // $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      // Ativar saída de depuração detalhada (use apenas para testes)
        $mail->isSMTP();                                            // Enviar usando SMTP
        $mail->Host       = 'smtp.hostinger.com';                   // <<< DEFINA O HOST SMTP AQUI (ex: smtp.gmail.com, smtp.hostinger.com)
        $mail->SMTPAuth   = true;                                   // Habilitar autenticação SMTP
        $mail->Username   = 'agendamento@frpe.app.br';           // <<< SEU E-MAIL/UTILIZADOR SMTP
        $mail->Password   = 'Fr@34232022'; // <<< SUA SENHA SMTP OU SENHA DE APP
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            // Habilitar encriptação TLS implícita (use ENCRYPTION_STARTTLS para porta 587)
        $mail->Port       = 465;                                    // <<< Porta TCP para conectar (465 para SSL, 587 para TLS)
        $mail->CharSet    = 'UTF-8';                                // Define o charset para UTF-8

        // --- Remetente ---
        $mail->setFrom('agendamento@frpe.app.br', 'CRM FR - Notificações'); // <<< SEU E-MAIL e Nome Remetente

        // --- Destinatários ---
        $validRecipientCount = 0;
        foreach ($recipients as $recipientEmail) {
            if (filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
                $mail->addAddress($recipientEmail); // Adiciona cada destinatário
                $validRecipientCount++;
            } else {
                error_log("PHPMailer: Email de notificação inválido ignorado: " . $recipientEmail);
            }
        }

        if ($validRecipientCount === 0) {
            error_log("PHPMailer: Nenhum destinatário válido para a notificação: " . $subject);
            return false; // Não há para quem enviar
        }

        // --- Conteúdo ---
        $mail->isHTML(true);                                  // Definir formato do e-mail para HTML
        $mail->Subject = $subject;
        $mail->Body    = $htmlBody;
        $mail->AltBody = strip_tags($htmlBody); // Corpo alternativo para clientes de e-mail sem HTML

        // --- Envio ---
        $mail->send();
        error_log("PHPMailer: Notificação enviada com sucesso. Assunto: " . $subject . ". Destinatários: " . $validRecipientCount);
        return true;

    } catch (Exception $e) {
        error_log("PHPMailer: Falha ao enviar notificação. Erro: {$mail->ErrorInfo} | Exceção: {$e->getMessage()}");
        return false;
    }
}

/**
 * Normaliza uma data para o formato Y-m-d (MySQL).
 * Trata formatos DD/MM/YYYY (BR) e ISO.
 */
function crm_normalize_date($date, $endOfDay = false) {
    if (!$date) return null;
    
    // Tratamento para formato DD/MM/YYYY
    if (strpos($date, '/') !== false) {
        $parts = explode('/', $date);
        if (count($parts) === 3) {
            // Se o primeiro item tem 4 dígitos, assume YYYY/MM/DD
            if (strlen($parts[0]) === 4) {
                $date = $parts[0] . '-' . $parts[1] . '-' . $parts[2];
            } else {
                // Caso contrário assume DD/MM/YYYY
                $date = $parts[2] . '-' . $parts[1] . '-' . $parts[0];
            }
        }
    }
    
    $ts = strtotime($date);
    if ($ts === false) return null;
    
    return date('Y-m-d', $ts) . ($endOfDay ? ' 23:59:59' : ' 00:00:00');
}