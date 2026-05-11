<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Proposta Comercial - {{ $proposal->numero_proposta ?? $proposal->id }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', 'Helvetica', sans-serif;
            font-size: 10px;
            color: #1f2937;
            line-height: 1.4;
            margin: 0;
            padding: 20px;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            border-bottom: 2px solid #1e3a5f;
            padding-bottom: 10px;
        }
        .header-table td {
            vertical-align: top;
            padding: 4px 0;
        }
        .company-name {
            font-size: 12px;
            font-weight: bold;
            color: #1e3a5f;
            text-transform: uppercase;
        }
        .company-info {
            font-size: 8px;
            color: #64748b;
        }
        .proposal-title {
            font-size: 14px;
            font-weight: 900;
            color: #1e3a5f;
            text-transform: uppercase;
            text-align: right;
        }
        .proposal-number {
            font-size: 10px;
            font-weight: bold;
            color: #94a3b8;
            text-align: right;
        }
        .proposal-dates {
            font-size: 8px;
            color: #475569;
            text-align: right;
        }
        .client-box {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 10px;
            margin-bottom: 10px;
            font-size: 9px;
        }
        .client-box td {
            padding: 2px 4px;
            vertical-align: top;
        }
        .client-label {
            font-weight: bold;
            color: #475569;
            white-space: nowrap;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .items-table th {
            background-color: #1e3a5f;
            color: #ffffff;
            font-weight: 600;
            font-size: 8px;
            padding: 6px 8px;
            text-align: left;
            text-transform: uppercase;
        }
        .items-table th:first-child {
            border-top-left-radius: 6px;
            border-bottom-left-radius: 6px;
        }
        .items-table th:last-child {
            border-top-right-radius: 6px;
            border-bottom-right-radius: 6px;
        }
        .items-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: middle;
            font-size: 8px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-primary { color: #1e3a5f; }
        .text-success { color: #16a34a; }
        .text-red { color: #dc2626; }
        .font-bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
        .whitespace-nowrap { white-space: nowrap; }
        .img-cell {
            width: 40px;
            height: 40px;
            background-color: #f1f5f9;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 7px;
            color: #94a3b8;
            font-weight: bold;
        }
        .params-header {
            background-color: #eff6ff !important;
        }
        .params-header td {
            font-size: 8px;
            font-weight: bold;
            color: #1e3a5f;
            text-transform: uppercase;
        }
        .params-footer {
            background-color: #f3f4f6 !important;
        }
        .params-footer td {
            font-size: 9px;
            font-weight: 900;
        }
        .total-section td {
            padding: 6px 8px;
            font-size: 9px;
        }
        .grand-total {
            background-color: #d1d5db !important;
        }
        .grand-total td {
            font-weight: 900;
            font-size: 11px;
            color: #1e3a5f;
        }
        .conditions {
            font-size: 8px;
            margin-bottom: 15px;
        }
        .conditions h3 {
            font-size: 10px;
            color: #1e3a5f;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
        }
        .conditions ol {
            padding-left: 18px;
            margin: 4px 0;
        }
        .conditions li {
            margin-bottom: 2px;
        }
        .signature {
            font-size: 8px;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
        }
        .footer {
            text-align: center;
            font-size: 7px;
            color: #94a3b8;
            margin-top: 20px;
            border-top: 1px solid #eee;
            padding-top: 8px;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <table class="header-table">
        <tr>
            <td width="65%">
                <div class="company-name">{{ $company['name'] ?? 'Empresa' }}</div>
                <div class="company-info">
                    CNPJ: {{ $company['cnpj'] ?? 'N/A' }}<br>
                    {{ $company['address'] ?? '' }}<br>
                    {{ $company['phone'] ?? '' }} | {{ $company['email'] ?? '' }}
                </div>
            </td>
            <td width="35%">
                <div class="proposal-title">Proposta Comercial</div>
                <div class="proposal-number">Nº {{ $proposal->numero_proposta ?? $proposal->id }}</div>
                <div class="proposal-dates">
                    @if($proposal->created_at)
                    Data de Emissão: <strong>{{ \Carbon\Carbon::parse($proposal->created_at)->format('d/m/Y') }}</strong><br>
                    @endif
                    @if($proposal->data_validade)
                    <span style="color: #dc2626; font-weight: bold;">Validade: {{ \Carbon\Carbon::parse($proposal->data_validade)->format('d/m/Y') }}</span>
                    @endif
                </div>
            </td>
        </tr>
    </table>

    <!-- Client Info -->
    @php
        $clientName = $organization->name ?? $organization->nome_fantasia ?? 'N/A';
        $clientDoc = $organization->document_number ?? $organization->cnpj ?? 'N/A';
        $clientAddress = ($organization->address ?? '') ?: (($organization->logradouro ?? '') . ', ' . ($organization->numero ?? ''));
    @endphp
    <table class="client-box" width="100%">
        <tr>
            <td width="50%">
                <span class="client-label">Cliente:</span> {{ $clientName }}<br>
                <span class="client-label">CNPJ/CPF:</span> {{ $clientDoc }}<br>
                @if($clientAddress)
                <span class="client-label">Endereço:</span> {{ $clientAddress }}
                @if($organization->cidade ?? false) - {{ $organization->cidade }} / {{ $organization->estado ?? '' }}@endif
                <br>
                @endif
                @if($organization->cep ?? false)
                <span class="client-label">CEP:</span> {{ $organization->cep }}<br>
                @endif
            </td>
            <td width="50%">
                <span class="client-label">Contato:</span> {{ $organization->contact_name ?? 'N/A' }}<br>
                <span class="client-label">Telefone:</span> {{ $organization->phone ?? 'N/A' }}<br>
                <span class="client-label">E-mail:</span> {{ $organization->email ?? 'N/A' }}
            </td>
        </tr>
    </table>

    <!-- Intro -->
    <p style="font-size: 8px; color: #64748b; margin-bottom: 10px; text-align: justify;">
        Prezados (as),<br><br>
        A <strong>{{ $company['name'] ?? 'nossa empresa' }}</strong> agradece seu interesse em nossos produtos e serviços.
        Sabemos da sua importância em sempre oferecer a mais alta tecnologia para a melhor e mais rápida recuperação
        do paciente e também em oferecer segurança aos profissionais da saúde.
    </p>

    <!-- Items Table -->
    <table class="items-table" width="100%">
        <thead>
            <tr>
                <th width="50" class="text-center">Imagem</th>
                <th>Descrição</th>
                <th class="text-center" width="55">Tipo</th>
                <th class="text-center" width="50">Unid.</th>
                <th class="text-center" width="35">Qtd</th>
                <th class="text-right" width="75">Vlr. Unit.</th>
                @if($hasDiscount)
                <th class="text-right" width="75">Vlr. c/ Desc.</th>
                @endif
                @if($hasLocacao)
                <th class="text-right" width="75">Vlr. Mensal</th>
                @endif
                <th class="text-right" width="80">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @php
                $colspanBase = 6; // Imagem, Descrição, Tipo, Unid, Qtd, Vlr Unit
                if ($hasDiscount) $colspanBase++;
                if ($hasLocacao) $colspanBase++;
            @endphp

            @foreach($items as $item)
                @php
                    $itemStatus = strtoupper($item->status ?? 'VENDA');
                    $isLocacao = $itemStatus === 'LOCAÇÃO';
                    $isServico = $itemStatus === 'SERVIÇO';
                    $mesesLocacao = $isLocacao ? ((int)($item->meses_locacao ?? 12)) : 1;
                    $multiplicador = $isLocacao ? $mesesLocacao : 1;

                    $quantidade = (float) ($item->quantity ?? 1);
                    $valorUnitario = (float) ($item->unit_price ?? 0);
                    $descontoPercent = (float) ($item->desconto_percent ?? 0);
                    $unidadeMedida = $isLocacao ? 'Mês' : ($item->unidade_medida ?? 'Unidade');

                    $subtotalSemDesconto = $valorUnitario * $quantidade * $multiplicador;
                    $valorDescontoItem = $subtotalSemDesconto * ($descontoPercent / 100);
                    $subtotal = $subtotalSemDesconto - $valorDescontoItem;

                    // Parâmetros
                    $parametros = $item->parametros ?? [];
                    if (is_string($parametros)) $parametros = json_decode($parametros, true) ?? [];
                    $visibleParams = [];
                    $valorParametros = 0;
                    if (is_array($parametros)) {
                        foreach ($parametros as $p) {
                            if (($p['nome'] ?? '') === '__meses_locacao') continue;
                            $visibleParams[] = $p;
                            $valNum = (float) ($p['valor'] ?? 0);
                            $valorParametros += $valNum;
                        }
                    }

                    $valorUnitarioTotal = $valorUnitario + $valorParametros;
                @endphp

                <!-- Main Item Row -->
                <tr>
                    <td class="text-center">
                        <div class="img-cell" style="margin: 0 auto;">
                            @if($item->imagem_url)
                                <img src="{{ $item->imagem_url }}" style="width: 100%; height: 100%; object-fit: contain;">
                            @else
                                IMG
                            @endif
                        </div>
                    </td>
                    <td>
                        <div style="font-weight: bold; color: #1e3a5f; text-transform: uppercase; font-size: 9px;">
                            {{ $item->description }}
                        </div>
                        <div style="font-size: 7px; text-transform: uppercase; color: #64748b;">
                            {{ ($item->brand ?? '') . ($item->brand && $item->model ? ' - ' : '') . ($item->model ?? '') }}
                        </div>
                        @if($item->descricao_detalhada)
                        <div style="font-size: 7px; color: #94a3b8; font-style: italic; margin-top: 2px;">
                            {{ $item->descricao_detalhada }}
                        </div>
                        @endif
                    </td>
                    <td class="text-center">
                        <div style="font-size: 7px; font-weight: 600; text-transform: uppercase;">
                            {{ $isServico ? 'SERVIÇO' : ($isLocacao ? 'LOCAÇÃO' : 'VENDA') }}
                        </div>
                        @if($isLocacao)
                        <div style="font-size: 6px; color: #94a3b8;">{{ $mesesLocacao }} MESES</div>
                        @endif
                    </td>
                    <td class="text-center">{{ $unidadeMedida }}</td>
                    <td class="text-center font-bold">{{ (int)$quantidade }}</td>
                    <td class="text-right whitespace-nowrap">R$ {{ number_format($valorUnitario, 2, ',', '.') }}</td>
                    @if($hasDiscount)
                    <td class="text-right whitespace-nowrap" style="font-weight: 600;">
                        @if($descontoPercent > 0)
                            R$ {{ number_format($valorUnitario * (1 - ($descontoPercent / 100)), 2, ',', '.') }}
                        @endif
                    </td>
                    @endif
                    @if($hasLocacao)
                    <td class="text-right whitespace-nowrap" style="font-weight: 600;">
                        R$ {{ number_format($valorUnitario * $quantidade, 2, ',', '.') }}
                    </td>
                    @endif
                    <td class="text-right font-bold whitespace-nowrap">
                        R$ {{ number_format($valorUnitario * $quantidade * $multiplicador * (1 - ($descontoPercent / 100)), 2, ',', '.') }}
                    </td>
                </tr>

                <!-- Parameters Sub-rows -->
                @if(!empty($visibleParams))
                    <!-- Params Header -->
                    <tr class="params-header">
                        <td></td>
                        <td colspan="{{ $colspanBase - 1 }}" style="font-size: 8px; font-weight: bold; text-transform: uppercase; border-radius: 4px 0 0 0;">
                            PARÂMETROS ADICIONAIS
                        </td>
                        <td style="border-radius: 0 4px 0 0;"></td>
                    </tr>

                    @foreach($visibleParams as $param)
                        @php
                            $valParam = (float) ($param['valor'] ?? 0);
                            $paramSubtotal = $valParam * $quantidade * $multiplicador;
                        @endphp
                        <tr>
                            <td></td>
                            <td colspan="{{ $colspanBase - 1 }}">
                                <span style="font-weight: 600; text-transform: uppercase; font-size: 7px;">
                                    {{ $param['nome'] ?? '' }}
                                </span>
                                <span style="border-bottom: 1.5px dotted #94a3b8; flex: 1; display: inline-block; width: 60%; margin-bottom: 2px;"></span>
                            </td>
                            <td class="text-right whitespace-nowrap" style="font-size: 8px; color: #dc2626; font-weight: bold;">
                                R$ {{ number_format($paramSubtotal * (1 - ($descontoPercent / 100)), 2, ',', '.') }}
                            </td>
                        </tr>
                    @endforeach

                    <!-- Params Footer -->
                    <tr class="params-footer">
                        <td></td>
                        <td colspan="{{ $colspanBase - 1 }}" style="text-align: right; text-transform: uppercase; border-radius: 0 0 0 4px;">
                            VALOR UNITÁRIO FINAL (Base + Adicionais):
                        </td>
                        <td style="font-weight: 900; color: #1e3a5f; border-radius: 0 0 4px 0;">
                            R$ {{ number_format($valorUnitarioTotal, 2, ',', '.') }}
                        </td>
                    </tr>

                    <!-- Final Subtotal Row -->
                    <tr style="background-color: #f8fafc;">
                        <td></td>
                        <td colspan="{{ $colspanBase - 1 }}" style="text-align: right; font-weight: 700; font-size: 9px;">
                            Subtotal Final:
                        </td>
                        <td style="font-weight: 900; color: #dc2626; font-size: 9px;">
                            @php
                                $finalSubtotal = $valorUnitarioTotal * $quantidade * $multiplicador;
                                $finalDesconto = $finalSubtotal * ($descontoPercent / 100);
                            @endphp
                            R$ {{ number_format($finalSubtotal - $finalDesconto, 2, ',', '.') }}
                        </td>
                    </tr>

                    <!-- Spacer -->
                    <tr><td colspan="{{ $colspanBase + 1 }}" style="height: 8px;"></td></tr>
                @endif
            @endforeach

            <!-- Totals Section -->
            @if($hasLocacao)
                <!-- Valor Total Mensal -->
                <tr style="background-color: #f9fafb;">
                    <td colspan="{{ $colspanBase }}" style="text-align: right; font-weight: 900; text-transform: uppercase; font-size: 10px;">
                        Valor Total Mensal
                    </td>
                    <td class="text-right whitespace-nowrap" style="font-weight: 900; color: #dc2626; font-size: 10px;">
                        R$ {{ number_format($totalMensalLocacao, 2, ',', '.') }}
                    </td>
                </tr>

                <!-- Freight Row -->
                <tr style="border-top: 1px solid #d1d5db; border-bottom: 1px solid #d1d5db;">
                    <td colspan="{{ $colspanBase }}" style="text-align: right; font-weight: bold; text-transform: uppercase; font-size: 8px;">
                        Frete ({{ $proposal->frete_tipo ?? 'CIF' }})
                    </td>
                    <td class="text-right whitespace-nowrap" style="font-weight: bold; font-size: 9px;">
                        R$ {{ number_format($freteValor, 2, ',', '.') }}
                    </td>
                </tr>

                <!-- Total Contrato -->
                <tr class="grand-total">
                    <td colspan="{{ $colspanBase }}" style="text-align: right; text-transform: uppercase; border-radius: 4px 0 0 4px;">
                        Valor Total do Contrato em {{ $maxMesesLocacao }} Meses
                    </td>
                    <td class="text-right whitespace-nowrap" style="border-radius: 0 4px 4px 0;">
                        R$ {{ number_format($totalGeralCalculado, 2, ',', '.') }}
                    </td>
                </tr>
            @else
                <!-- Subtotal Items -->
                <tr style="background-color: #f9fafb;">
                    <td colspan="{{ $colspanBase }}" style="text-align: right; text-transform: uppercase; font-size: 8px; font-weight: bold; color: #64748b;">
                        Subtotal dos Itens
                    </td>
                    <td class="text-right whitespace-nowrap" style="font-weight: 600; font-size: 9px;">
                        R$ {{ number_format($totalSubtotalGeral, 2, ',', '.') }}
                    </td>
                </tr>

                <!-- Desconto -->
                @if($totalDescontoGeral > 0)
                <tr style="background-color: #fef2f2;">
                    <td colspan="{{ $colspanBase }}" style="text-align: right; text-transform: uppercase; font-size: 8px; font-weight: bold; color: #dc2626;">
                        Desconto
                    </td>
                    <td class="text-right whitespace-nowrap" style="font-weight: bold; color: #dc2626; font-size: 9px;">
                        - R$ {{ number_format($totalDescontoGeral, 2, ',', '.') }}
                    </td>
                </tr>
                @endif

                <!-- Freight Row -->
                <tr style="background-color: #f9fafb;">
                    <td colspan="{{ $colspanBase }}" style="text-align: right; text-transform: uppercase; font-size: 8px; font-weight: bold; color: #475569;">
                        Frete ({{ $proposal->frete_tipo ?? 'CIF' }})
                    </td>
                    <td class="text-right whitespace-nowrap" style="font-weight: bold; font-size: 9px;">
                        R$ {{ number_format($freteValor, 2, ',', '.') }}
                    </td>
                </tr>

                <!-- Total Geral -->
                <tr class="grand-total">
                    <td colspan="{{ $colspanBase }}" style="text-align: right; text-transform: uppercase; border-radius: 4px 0 0 4px;">
                        Valor Total Geral
                    </td>
                    <td class="text-right whitespace-nowrap" style="border-radius: 0 4px 4px 0;">
                        R$ {{ number_format($totalGeralCalculado, 2, ',', '.') }}
                    </td>
                </tr>
            @endif
        </tbody>
    </table>

    <!-- Conditions -->
    <div class="conditions">
        <h3>Condições Gerais de Fornecimento</h3>
        <ol>
            <li><strong>Faturamento:</strong> {{ $proposal->faturamento ?? '-' }}</li>
            <li><strong>Treinamento:</strong> {{ $proposal->treinamento ?? '-' }}</li>
            <li><strong>Condições de Pagamento:</strong> {{ $proposal->condicoes_pagamento ?? '-' }}</li>
            <li><strong>Prazo de Entrega:</strong> {{ $proposal->prazo_entrega ?? '-' }}</li>
            <li><strong>Garantia dos Equipamentos:</strong> {{ $proposal->garantia_equipamentos ?? '-' }}</li>
            <li><strong>Garantia dos Acessórios:</strong> {{ $proposal->garantia_acessorios ?? '-' }}</li>
            <li><strong>Instalação:</strong> {{ $proposal->instalacao ?? '-' }}</li>
            <li><strong>Assistência Técnica:</strong> {{ $proposal->assistencia_tecnica ?? '-' }}</li>
        </ol>
    </div>

    <!-- Observations -->
    @if($proposal->notes)
    <div style="font-size: 8px; margin-bottom: 15px;">
        <h3 style="font-size: 10px; color: #1e3a5f; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">Observações</h3>
        <p style="color: #64748b;">{{ $proposal->notes }}</p>
    </div>
    @endif

    <!-- Signature -->
    <div class="signature">
        <table width="100%">
            <tr>
                <td width="50%">
                    <div style="font-size: 7px; color: #94a3b8; text-transform: uppercase; margin-bottom: 2px;">Responsável Comercial</div>
                    <div style="font-weight: bold; color: #1e3a5f; font-size: 10px;">
                        {{ auth()->user()->name ?? 'Responsável' }}
                    </div>
                    <div style="text-transform: uppercase; color: #64748b; font-size: 7px;">
                        {{ auth()->user()->role ?? '' }}
                    </div>
                    <div style="font-size: 7px; color: #64748b;">
                        E-mail: {{ auth()->user()->email ?? '' }}
                    </div>
                </td>
                <td width="50%" style="text-align: right; vertical-align: bottom;">
                    <div style="border-bottom: 1px solid #000; width: 80%; margin-left: auto; margin-bottom: 4px;"></div>
                    <div style="font-size: 8px; color: #64748b;">
                        Data: ____/____/________ &nbsp;&nbsp;&nbsp; <strong style="color: #1f2937;">De Acordo</strong>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Footer -->
    <div class="footer">
        Gerado por {{ $company['name'] ?? 'ERP' }} em {{ now()->format('d/m/Y H:i:s') }}
    </div>

</body>
</html>
