#!/bin/bash
echo "🚀 Iniciando Deployment BidFlow SaaS Produção..."

# Pull latest changes (desativado se já no servidor)
# git pull origin main

echo "📦 Reconstruindo contêineres Docker..."
docker-compose up -d --build

echo "🔄 Instalando dependências do Composer..."
docker-compose exec app composer install --optimize-autoloader --no-dev

echo "📂 Limpando Caches..."
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan route:clear
docker-compose exec app php artisan view:clear

echo "🗄️ Executando Migrations..."
docker-compose exec app php artisan migrate --force

echo "🔒 Ajustando Permissões (Storage / Cache)..."
docker-compose exec app chown -R www-data:www-data storage bootstrap/cache
docker-compose exec app chmod -R 775 storage bootstrap/cache

echo "🔁 Reiniciando Fila de Processamento..."
docker-compose exec queue php artisan queue:restart

echo "⚙️ Build do Frontend React Vite..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Deploy Concluído com Sucesso!"
