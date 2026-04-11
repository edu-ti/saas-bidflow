<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Proposta Comercial - {{ $proposal->id }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; line-height: 1.5; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
        .logo { max-width: 150px; }
        .title { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
        .details { margin-bottom: 30px; }
        .details h3 { font-size: 14px; margin-bottom: 5px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .items-table th { background-color: #f8f9fa; font-weight: bold; }
        .items-table .text-right { text-align: right; }
        .footer { text-align: center; margin-top: 50px; font-size: 10px; color: #777; border-top: 1px solid #eee; padding-top: 10px; }
        .total-row { font-weight: bold; background-color: #f8f9fa; }
    </style>
</head>
<body>

    <div class="header">
        <div class="title">PROPOSTA COMERCIAL</div>
        <div>{{ $company->name }} - CNPJ: {{ $company->document ?? 'Não Informado' }}</div>
    </div>

    <div class="details">
        <h3>Dados do Cliente (Órgão Público)</h3>
        <p>
            <strong>Órgão:</strong> {{ $organization->name ?? 'N/A' }}<br>
            <strong>UASG:</strong> {{ $organization->uasg_code ?? 'N/A' }}<br>
            <strong>CNPJ:</strong> {{ $organization->document_number ?? 'N/A' }}
        </p>

        <h3>Dados da Proposta</h3>
        <p>
            <strong>Licitação Referência:</strong> {{ $opportunity->title }}<br>
            <strong>Data Prevista:</strong> {{ now()->format('d/m/Y') }}<br>
            <strong>Status:</strong> {{ $proposal->status }}
        </p>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Item</th>
                <th>Descrição</th>
                <th class="text-right">Qtd</th>
                <th class="text-right">V. Unitário (R$)</th>
                <th class="text-right">Total (R$)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $index => $item)
            <tr>
                <td style="text-align: center;">{{ $index + 1 }}</td>
                <td>{{ $item->description }} {!! $item->brand ? "<br><em>Marca: {$item->brand}</em>" : '' !!}</td>
                <td class="text-right">{{ number_format($item->quantity, 2, ',', '.') }}</td>
                <td class="text-right">{{ number_format($item->unit_price, 4, ',', '.') }}</td>
                <td class="text-right">{{ number_format($item->total_price, 2, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="4" class="text-right">VALOR TOTAL GLOBAL</td>
                <td class="text-right">{{ number_format($proposal->total_value, 2, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    @if($proposal->notes)
    <div class="details">
        <h3>Observações Adicionais</h3>
        <p>{{ $proposal->notes }}</p>
    </div>
    @endif

    <div class="footer">
        Gerado por BidFlow ERP - {{ now()->format('d/m/Y H:i:s') }}
    </div>

</body>
</html>
