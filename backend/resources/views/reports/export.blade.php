<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Relatório BI - {{ strtoupper($tab) }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
        .header h1 { margin: 0; font-size: 24px; color: #111; }
        .header p { margin: 5px 0 0 0; color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f8f9fa; font-weight: bold; text-transform: uppercase; font-size: 10px; color: #444; }
        .footer { position: fixed; bottom: -20px; left: 0; right: 0; height: 30px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Relatório BI Platinum - {{ strtoupper($tab) }}</h1>
        <p>Gerado em {{ date('d/m/Y H:i') }}</p>
    </div>

    @if(is_array($data) && count($data) > 0)
        <table>
            <thead>
                <tr>
                    @if(isset($data[0]) && is_array($data[0]))
                        @foreach(array_keys($data[0]) as $key)
                            <th>{{ str_replace('_', ' ', $key) }}</th>
                        @endforeach
                    @else
                        <th>Métrica</th>
                        <th>Valor</th>
                    @endif
                </tr>
            </thead>
            <tbody>
                @if(isset($data[0]) && is_array($data[0]))
                    @foreach($data as $row)
                        <tr>
                            @foreach($row as $value)
                                <td>{{ is_numeric($value) && strpos((string)$value, '.') !== false ? number_format($value, 2, ',', '.') : $value }}</td>
                            @endforeach
                        </tr>
                    @endforeach
                @else
                    @foreach($data as $key => $value)
                        <tr>
                            <td style="text-transform: uppercase; font-size: 10px; font-weight: bold;">{{ str_replace('_', ' ', $key) }}</td>
                            <td>{{ is_numeric($value) && strpos((string)$value, '.') !== false ? number_format($value, 2, ',', '.') : $value }}</td>
                        </tr>
                    @endforeach
                @endif
            </tbody>
        </table>
    @else
        <p style="text-align: center; padding: 50px; color: #999; font-style: italic;">Nenhum dado encontrado para os filtros selecionados.</p>
    @endif

    <div class="footer">
        BidFlow Intelligence & Flow - Documento gerado automaticamente.
    </div>
</body>
</html>
