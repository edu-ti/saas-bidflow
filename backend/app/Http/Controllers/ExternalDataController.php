<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ExternalDataController extends Controller
{
    public function searchCNPJ(Request $request, string $cnpj)
    {
        Log::info('CNPJ search started', ['cnpj' => $cnpj]);
        
        $cnpj = preg_replace('/\D/', '', $cnpj);
        
        if (strlen($cnpj) !== 14) {
            return response()->json(['error' => 'CNPJ inválido'], 400);
        }

        $cacheKey = "cnpj:{$cnpj}";
        
        if (Cache::has($cacheKey)) {
            $cached = Cache::get($cacheKey);
            Log::info('CNPJ from cache', ['cnpj' => $cnpj]);
            return response()->json($cached);
        }

        try {
            Log::info('Fetching CNPJ from external API', ['cnpj' => $cnpj, 'url' => "https://publica.cnpj.ws/cnpj/{$cnpj}"]);
            
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'User-Agent' => 'BidFlow/1.0 (contact@bidflow.com.br)',
            ])
            ->timeout(30)
            ->connectTimeout(10)
            ->get("https://publica.cnpj.ws/cnpj/{$cnpj}");

            Log::info('CNPJ API response', ['status' => $response->status(), 'successful' => $response->successful()]);

            if ($response->successful()) {
                $data = $response->json();
                
                $estabelecimento = $data['estabelecimento'] ?? [];
                
                $addressParts = [];
                if (!empty($estabelecimento['logradouro'])) {
                    $addressParts[] = $estabelecimento['logradouro'];
                }
                if (!empty($estabelecimento['numero'])) {
                    $addressParts[] = $estabelecimento['numero'];
                }
                if (!empty($estabelecimento['complemento'])) {
                    $addressParts[] = $estabelecimento['complemento'];
                }
                if (!empty($estabelecimento['bairro'])) {
                    $addressParts[] = $estabelecimento['bairro'];
                }
                if (!empty($estabelecimento['cidade']['nome'])) {
                    $addressParts[] = $estabelecimento['cidade']['nome'];
                }
                if (!empty($estabelecimento['estado']['sigla'])) {
                    $addressParts[] = $estabelecimento['estado']['sigla'];
                }
                if (!empty($estabelecimento['cep'])) {
                    $addressParts[] = 'CEP ' . $estabelecimento['cep'];
                }
                
                $result = [
                    'cnpj' => $cnpj,
                    'razao_social' => $data['razao_social'] ?? null,
                    'nome_fantasia' => $estabelecimento['nome_fantasia'] ?? null,
                    'endereco' => implode(', ', $addressParts),
                ];
                
                Log::info('CNPJ result', $result);
                
                Cache::put($cacheKey, $result, now()->addHours(24));
                
                return response()->json($result);
            }
            
            Log::warning('CNPJ not found', ['status' => $response->status()]);
            return response()->json(['error' => 'CNPJ não encontrado'], 404);
        } catch (\Exception $e) {
            Log::error('CNPJ search failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Erro ao buscar CNPJ: ' . $e->getMessage()], 500);
        }
    }

    public function searchCEP(Request $request, string $cep)
    {
        $cep = preg_replace('/\D/', '', $cep);
        
        if (strlen($cep) !== 8) {
            return response()->json(['error' => 'CEP inválido'], 400);
        }

        $cacheKey = "cep:{$cep}";
        
        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        try {
            $response = Http::timeout(30)->get("https://viacep.com.br/ws/{$cep}/json/");

            if ($response->successful() && !isset($response->json()['erro'])) {
                $data = $response->json();
                
                $result = [
                    'cep' => $data['cep'] ?? $cep,
                    'logradouro' => $data['logradouro'] ?? null,
                    'complemento' => $data['complemento'] ?? null,
                    'bairro' => $data['bairro'] ?? null,
                    'cidade' => $data['localidade'] ?? null,
                    'estado' => $data['uf'] ?? null,
                ];
                
                Cache::put($cacheKey, $result, now()->addDays(30));
                
                return response()->json($result);
            }
            
            return response()->json(['error' => 'CEP não encontrado'], 404);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro ao buscar CEP: ' . $e->getMessage()], 500);
        }
    }
}