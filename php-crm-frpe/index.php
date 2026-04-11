<?php
// Inicia a sessão para verificar a autenticação
session_start();

if (!isset($_SESSION['user_id'])) {
    // CORREÇÃO: O redirecionamento deve ser para login.html se index.php requer login
    header('Location: login.html');
    exit;
}
// Gera um número de versão único baseado na hora atual para forçar a atualização dos ficheiros
$version = time();
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRM FR Produtos Médicos</title>
    <link rel="manifest" href="manifest.json">
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Fontes e Ícones -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Chart.js para gráficos -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- SheetJS (xlsx) para importação -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    <!-- ** ALTERAÇÃO: Insira a sua API Key aqui ** -->
    <script src="https://cdn.tiny.cloud/1/7w3oqmvbila1pjwhqf57sumy2pxj827rco8ictpgcegu9n45/tinymce/6/tinymce.min.js"
        referrerpolicy="origin"></script>
    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- Estilo personalizado com versionamento dinâmico -->
    <link rel="stylesheet" href="css/style.css?v=<?php echo $version; ?>">
</head>

<body class="bg-gray-100">

    <!-- Elementos globais que existem fora do root do app -->
    <div id="toast-container" class="fixed top-5 left-1/2 -translate-x-1/2 z-[80] space-y-2 w-full max-w-md"></div>
    <div id="loading-spinner"
        class="hidden fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[90]">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
    </div>
    <div id="modal-container"></div>


    <!-- O container principal será preenchido pelo JavaScript -->
    <div id="app-root">
        <div class="flex justify-center items-center h-screen">
            <div class="text-center">
                <i class="fas fa-spinner fa-spin text-4xl text-gray-500"></i>
                <p class="mt-4 text-lg font-medium text-gray-600">Carregando CRM...</p>
            </div>
        </div>
    </div>

    <!-- Script principal com versionamento dinâmico para forçar a atualização do cache  -->
    <script type="module" src="js/script.js?v=<?php echo $version; ?>"></script>

    <script>
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./service-worker.js')
                    .then(registration => {
                        console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    })
                    .catch(err => {
                        console.log('ServiceWorker registration failed: ', err);
                    });
            });
        }
    </script>
</body>

</html>