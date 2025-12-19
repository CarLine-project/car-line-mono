# Quick Start Guide - AI Receipt Processing

## Швидке налаштування (5 хвилин)

### Крок 1: Отримайте OpenAI API ключ

1. Відкрийте: https://platform.openai.com/api-keys
2. Натисніть **"Create new secret key"**
3. Скопіюйте ключ (показується 1 раз!)

### Крок 2: Додайте ключ в .env

Відкрийте файл `car-line-back/.env` та додайте:

```env
OPENAI_API_KEY=sk-proj-ваш-справжній-ключ-тут
```

**Замініть** `sk-proj-ваш-справжній-ключ-тут` на ваш реальний ключ!

### Крок 3: Перезапустіть сервер

```bash
cd car-line-back
npm run start:dev
```

### Крок 4: Перевірте що працює

Відкрийте в браузері або Postman:

```
GET http://localhost:3000/ai/health
```

Повинно повернути:

```json
{
  "status": "available",
  "configured": true
}
```

## Готово! ✅

Тепер API `/ai/process-receipt` готовий до використання.

## Тестування

### З допомогою cURL:

```bash
curl -X POST http://localhost:3000/ai/process-receipt \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "image": "BASE64_ENCODED_IMAGE",
    "carId": "YOUR_CAR_UUID"
  }'
```

### З допомогою Postman:

1. **URL:** `POST http://localhost:3000/ai/process-receipt`
2. **Headers:**
   - `Authorization: Bearer <your-jwt-token>`
   - `Content-Type: application/json`
3. **Body (JSON):**

```json
{
  "image": "iVBORw0KGgoAAAANSUhEUgAA...(base64 string)",
  "carId": "uuid-of-your-car"
}
```

## Що далі?

Детальна документація: [AI_SETUP.md](./AI_SETUP.md)
