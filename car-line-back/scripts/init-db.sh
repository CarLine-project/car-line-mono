#!/bin/bash

echo "🔧 Ініціалізація бази даних..."

cd "$(dirname "$0")/.." || exit
if ! docker-compose ps 2>/dev/null | grep -q "carline_postgres.*Up"; then
  echo "❌ PostgreSQL не запущений. Запустіть спочатку: npm run db:start"
  exit 1
fi

echo "⏳ Очікування готовності PostgreSQL..."

max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if docker exec carline_postgres pg_isready -U carline_user -d carline_db > /dev/null 2>&1; then
    echo "✅ PostgreSQL готовий до роботи"
    break
  fi
  
  attempt=$((attempt + 1))
  echo "   Спроба $attempt/$max_attempts..."
  sleep 1
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ PostgreSQL не відповідає після $max_attempts спроб"
  exit 1
fi

echo ""
echo "✅ База даних готова до використання!"
echo ""
echo "📋 Інформація про базу даних:"
echo "   • Хост: localhost"
echo "   • Порт: 5432"
echo "   • База даних: carline_db"
echo "   • Користувач: carline_user"
echo ""
echo "📝 TypeORM автоматично створить таблиці при запуску бекенду"
echo "   (таблиці: users, refresh_tokens)"
echo ""
echo "🚀 Наступний крок: запустіть бекенд командою:"
echo "   npm run start:dev"
echo ""

