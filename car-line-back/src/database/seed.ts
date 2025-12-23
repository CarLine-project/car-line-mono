import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { seedExpenseCategories } from './seeders/expense-categories.seeder';
import { seedUserData } from './seeders/user-data.seeder';

config();

const TEST_USER_EMAIL = 'btihovic@gmail.com';

async function runSeed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'carline_user',
    password: process.env.DB_PASSWORD || 'carline_password',
    database: process.env.DB_DATABASE || 'carline_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
  });

  try {
    await dataSource.initialize();
    console.log("✅ З'єднання з базою даних встановлено!");

    console.log('\n=== Створення категорій витрат ===');
    await seedExpenseCategories(dataSource);

    console.log('\n=== Створення тестових даних користувача ===');
    await seedUserData(dataSource, TEST_USER_EMAIL);

    console.log('\n🎉 Всі seeds успішно виконано!');
  } catch (error) {
    console.error('❌ Помилка під час виконання seed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeed();
