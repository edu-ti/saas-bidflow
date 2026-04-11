<?php
// api/handlers/external_api_handler.php

function handle_fetch_cnpj($cnpj) {
    $cnpj = preg_replace('/[^0-9]/', '', $cnpj);
    if (strlen($cnpj) !== 14) {
        json_response(['success' => false, 'error' => 'CNPJ inválido.'], 400);
    }
    $url = "https://www.receitaws.com.br/v1/cnpj/{$cnpj}";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Importante para ambientes locais
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($http_code === 200) {
        json_response(['success' => true, 'data' => json_decode($response, true)]);
    }
    json_response(['success' => false, 'error' => 'Não foi possível consultar o CNPJ.'], 503);
}

function handle_fetch_cep($cep) {
    $cep = preg_replace('/[^0-9]/', '', $cep);
    if (strlen($cep) !== 8) {
        json_response(['success' => false, 'error' => 'CEP inválido.'], 400);
    }
    $url = "https://viacep.com.br/ws/{$cep}/json/";
    $response = @file_get_contents($url);
    if ($response) {
        $data = json_decode($response, true);
        if (!isset($data['erro'])) {
            json_response(['success' => true, 'data' => $data]);
        }
    }
    json_response(['success' => false, 'error' => 'Não foi possível consultar o CEP.'], 503);
}
