#!/bin/bash

echo "🚀 Запуск PostgreSQL..."

cd "$(dirname "$0")/.." || exit
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker daemon не запущений!"
  echo "📝 Будь ласка, запустіть Docker Desktop або Docker daemon"
  exit 1
fi

if docker-compose ps 2>/dev/null | grep -q "carline_postgres.*Up"; then
  echo "✅ PostgreSQL вже запущений"
else
  echo "📦 Запуск контейнера PostgreSQL..."
  docker-compose up -d postgres
  
  if [ $? -ne 0 ]; then
    echo "❌ Помилка запуску PostgreSQL"
    exit 1
  fi
  
  echo "⏳ Очікування готовності PostgreSQL..."
  sleep 5
  
  if docker-compose ps | grep -q "carline_postgres.*Up"; then
    echo "✅ PostgreSQL успішно запущений на порту 5432"
  else
    echo "❌ Помилка запуску PostgreSQL"
    exit 1
  fi
fi

