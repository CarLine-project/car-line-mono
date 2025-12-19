# AI Receipt Processing Setup

## Огляд

Модуль AI забезпечує автоматичне розпізнавання чеків за допомогою GPT-4 Vision API від OpenAI.

## Функціонал

- Розпізнавання тексту з фото чеків
- Автоматичне витягування даних: сума, дата, назва магазину, категорія
- Оцінка впевненості (confidence score)
- Валідація витягнутих даних
- Інтелектуальна категоризація витрат

## Необхідні пакети

Всі необхідні пакети вже включені в проект:

- `@nestjs/config` - для конфігурації
- `class-validator` - для валідації
- `class-transformer` - для трансформації даних

**Додаткових пакетів встановлювати НЕ потрібно!** Node.js має вбудований `fetch` API.

## Налаштування

### 1. Отримайте API ключ OpenAI

1. Зайдіть на https://platform.openai.com/
2. Створіть акаунт або увійдіть
3. Перейдіть в розділ API Keys: https://platform.openai.com/api-keys
4. Натисніть "Create new secret key"
5. Скопіюйте ключ (він показується тільки один раз!)

### 2. Додайте API ключ до .env файлу

Відредагуйте файл `car-line-back/.env`:

```env
# Існуючі змінні...
DB_HOST=localhost
DB_PORT=5432
# ... інші змінні

# AI Configuration
OPENAI_API_KEY=sk-proj-your-api-key-here
```

**ВАЖЛИВО:** Замініть `sk-proj-your-api-key-here` на ваш реальний API ключ!

### 3. Перезапустіть сервер

```bash
cd car-line-back
npm run start:dev
```

## API Endpoints

### 1. Обробити фото чека

**POST** `/ai/process-receipt`

**Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "image": "base64_encoded_image_string",
  "carId": "uuid-of-car"
}
```

**Response (200 OK):**

```json
{
  "amount": 1250.5,
  "date": "2024-12-19",
  "merchant": "WOG",
  "category": "fuel",
  "description": "Заправка бензином А-95",
  "confidence": 0.95,
  "needsReview": false
}
```

**Response з низькою впевненістю:**

```json
{
  "amount": 450.0,
  "date": "2024-12-19",
  "merchant": "Невідомий магазин",
  "category": "other",
  "description": null,
  "confidence": 0.65,
  "needsReview": true // Користувач повинен перевірити дані
}
```

### 2. Перевірити статус AI сервісу

**GET** `/ai/health`

**Response:**

```json
{
  "status": "available",
  "configured": true
}
```

## Категорії витрат

Система автоматично визначає одну з категорій:

- `fuel` - паливо
- `maintenance` - технічне обслуговування
- `carwash` - мийка
- `parts` - запчастини
- `insurance` - страхування
- `other` - інше

## Confidence Score

Система оцінює впевненість у розпізнаних даних:

- **0.8 - 1.0** (80-100%) - Високаточність, дані можна використовувати без перевірки
- **0.6 - 0.8** (60-80%) - Середня точність, рекомендується перевірка
- **< 0.6** (< 60%) - Низька точність, обов'язкова перевірка користувачем

Якщо `needsReview: true`, фронтенд повинен показати форму з заповненими даними для підтвердження.

## Валідація даних

Сервіс автоматично валідує:

- **Сума:** Не може бути від'ємною або більше 1,000,000
- **Дата:** Не може бути в майбутньому або старше року
- **Категорія:** Має бути одна з дозволених категорій
- **Формат зображення:** Має бути валідний base64

## Обробка помилок

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Invalid image format. Please provide a valid base64 encoded image.",
  "error": "Bad Request"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "You don't have access to this car",
  "error": "Forbidden"
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Failed to process receipt. Please try again or enter data manually.",
  "error": "Internal Server Error"
}
```

## Вартість використання

OpenAI GPT-4o-mini pricing (станом на грудень 2024):

- **Input:** $0.150 / 1M tokens (~$0.00015 per image)
- **Output:** $0.600 / 1M tokens (~$0.0001 per response)

**Приблизна вартість:** ~$0.00025 (0.0067 грн) за одне розпізнавання чека

## Приклад використання з Frontend

```typescript
// React/TypeScript приклад
async function processReceiptPhoto(file: File, carId: string) {
  // Конвертувати файл в base64
  const base64 = await fileToBase64(file);

  // Відправити на backend
  const response = await fetch('http://localhost:3000/ai/process-receipt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      image: base64,
      carId: carId,
    }),
  });

  const result = await response.json();

  if (result.needsReview) {
    // Показати форму з заповненими даними для перевірки
    showConfirmationForm(result);
  } else {
    // Створити витрату автоматично
    await createExpense(carId, result);
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Видалити префікс "data:image/jpeg;base64,"
      const cleanBase64 = base64.split(',')[1];
      resolve(cleanBase64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

## Логування

Сервіс логує:

- Успішні розпізнавання
- Помилки API
- Підозрілі дані (сума/дата поза межами)
- Низьку впевненість

Логи можна переглянути в консолі сервера.

## Безпека

- ✅ JWT authentication обов'язкова
- ✅ Перевірка власності автомобіля (CarOwnershipGuard)
- ✅ Валідація формату зображення
- ✅ API ключ зберігається в .env (не комітиться в Git)
- ✅ Зображення не зберігаються на сервері
- ✅ Обмеження розміру зображення (рекомендовано < 10MB)

## Troubleshooting

### "AI service is not configured"

- Перевірте, чи додали ви `OPENAI_API_KEY` в `.env`
- Перезапустіть сервер після додавання ключа

### "OpenAI API error: 401 Unauthorized"

- Перевірте правильність API ключа
- Переконайтеся, що у вас є активна підписка OpenAI

### "Could not extract JSON from response"

- Спробуйте інше фото (краща якість/освітлення)
- Перевірте логи сервера для деталей

### Низька точність розпізнавання

- Використовуйте фото з хорошим освітленням
- Розмістіть чек на рівній поверхні
- Уникайте розмитих/зім'ятих чеків

## Подальші покращення (опціонально)

1. **OCR pre-processing** - додати Tesseract.js для попередньої обробки
2. **Кешування** - зберігати результати для повторних запитів
3. **Batch processing** - обробка декількох чеків одночасно
4. **Image compression** - автоматичне стиснення на backend
5. **Локальне OCR** - офлайн режим з базовим розпізнаванням

## Підтримка

При виникненні проблем:

1. Перевірте логи сервера
2. Перевірте статус API: `GET /ai/health`
3. Переконайтеся, що API ключ валідний
4. Перевірте, чи є кредити на OpenAI акаунті
