# Environment Configuration

## Required Environment Variables

Create a `.env` file in the `car-line-back` directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=carline

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# AI Configuration (OpenAI)
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-your-api-key-here

# Application Configuration
PORT=3000
NODE_ENV=development
```

## How to Set Up

1. Copy the above content to a new file named `.env` in `car-line-back/`
2. Replace `sk-proj-your-api-key-here` with your actual OpenAI API key
3. Adjust other values as needed for your environment

## Getting OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys: https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key (it's only shown once!)
6. Paste it into your `.env` file

## Important Notes

- Never commit `.env` file to Git (it's already in .gitignore)
- Keep your API keys secret
- Use different keys for development and production
