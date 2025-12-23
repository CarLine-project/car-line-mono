import { DataSource } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Car } from '../../cars/entities/car.entity';
import { Expense } from '../../expenses/entities/expense.entity';
import { ExpenseCategory } from '../../expenses/entities/expense-category.entity';
import { Maintenance } from '../../maintenance/entities/maintenance.entity';
import { Mileage } from '../../mileage/entities/mileage.entity';

export async function seedUserData(
  dataSource: DataSource,
  userEmail: string,
): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const carRepository = dataSource.getRepository(Car);
  const expenseRepository = dataSource.getRepository(Expense);
  const categoryRepository = dataSource.getRepository(ExpenseCategory);
  const maintenanceRepository = dataSource.getRepository(Maintenance);
  const mileageRepository = dataSource.getRepository(Mileage);

  console.log(`\nПошук користувача з email: ${userEmail}...`);

  const user = await userRepository.findOne({
    where: { email: userEmail },
  });

  if (!user) {
    console.error(`❌ Користувача з email ${userEmail} не знайдено!`);
    console.log('Спочатку зареєструйте користувача через API або додаток.');
    return;
  }

  console.log(`✅ Користувача знайдено: ${user.email}`);

  const existingCars = await carRepository.find({
    where: { userId: user.id },
  });

  if (existingCars.length > 0) {
    console.log(
      `⚠️  У користувача вже є ${existingCars.length} машин(и). Пропускаю створення...`,
    );
    return;
  }

  const categories = await categoryRepository.find();
  if (categories.length === 0) {
    console.error(
      '❌ Категорії витрат не знайдено! Спочатку запустіть seeder категорій.',
    );
    return;
  }

  console.log('\n📝 Створення машин...');

  const car1 = carRepository.create({
    userId: user.id,
    make: 'Toyota',
    model: 'Camry',
    year: 2018,
    initialMileage: 85000,
    isActive: true,
  });
  await carRepository.save(car1);
  console.log(`✅ Створено машину: ${car1.make} ${car1.model} ${car1.year}`);

  const car2 = carRepository.create({
    userId: user.id,
    make: 'Honda',
    model: 'Civic',
    year: 2020,
    initialMileage: 45000,
    isActive: false,
  });
  await carRepository.save(car2);
  console.log(`✅ Створено машину: ${car2.make} ${car2.model} ${car2.year}`);

  const randomDate = (daysBack: number) => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    return date.toISOString().split('T')[0];
  };

  console.log('\n💰 Створення витрат для Toyota Camry...');
  const expensesData1 = [
    {
      categoryName: 'Паливо',
      amount: 1250.5,
      description: 'Заправка на ОККО, 95-й бензин',
    },
    {
      categoryName: 'Паливо',
      amount: 1180.0,
      description: 'Заправка на WOG',
    },
    {
      categoryName: 'Паливо',
      amount: 1340.75,
      description: 'Повний бак на Shell',
    },
    { categoryName: 'Ремонт', amount: 3500.0, description: 'Заміна колодок' },
    {
      categoryName: 'Ремонт',
      amount: 5200.0,
      description: 'Ремонт підвіски, заміна амортизаторів',
    },
    {
      categoryName: 'ТО',
      amount: 2800.0,
      description: 'Планове технічне обслуговування',
    },
    {
      categoryName: 'Мийка',
      amount: 250.0,
      description: 'Комплексна мийка з салоном',
    },
    { categoryName: 'Мийка', amount: 150.0, description: 'Мийка кузова' },
    {
      categoryName: 'Страховка',
      amount: 8500.0,
      description: 'КАСКО на рік',
    },
    {
      categoryName: 'Парковка',
      amount: 450.0,
      description: 'Паркування в центрі міста',
    },
  ];

  for (const expenseData of expensesData1) {
    const category = categories.find(
      (c) => c.name === expenseData.categoryName,
    );
    if (category) {
      const expense = expenseRepository.create({
        carId: car1.id,
        categoryId: category.id,
        amount: expenseData.amount,
        expenseDate: randomDate(180),
        description: expenseData.description,
      });
      await expenseRepository.save(expense);
    }
  }
  console.log(`✅ Створено ${expensesData1.length} витрат для Toyota Camry`);

  console.log('\n💰 Створення витрат для Honda Civic...');
  const expensesData2 = [
    { categoryName: 'Паливо', amount: 980.0, description: 'Заправка на ОККО' },
    {
      categoryName: 'Паливо',
      amount: 1050.5,
      description: 'Заправка 95-го бензину',
    },
    {
      categoryName: 'Паливо',
      amount: 1120.0,
      description: 'Повний бак на WOG',
    },
    {
      categoryName: 'ТО',
      amount: 2200.0,
      description: 'Планове ТО, заміна масла',
    },
    {
      categoryName: 'Ремонт',
      amount: 1800.0,
      description: 'Заміна гальмівних дисків',
    },
    {
      categoryName: 'Мийка',
      amount: 200.0,
      description: 'Мийка з воском',
    },
    {
      categoryName: 'Страховка',
      amount: 6500.0,
      description: 'Автоцивілка на рік',
    },
    {
      categoryName: 'Парковка',
      amount: 300.0,
      description: 'Місячна підписка на паркування',
    },
    { categoryName: 'Інше', amount: 450.0, description: 'Придбання килимків' },
    {
      categoryName: 'Інше',
      amount: 850.0,
      description: 'Встановлення сигналізації',
    },
  ];

  for (const expenseData of expensesData2) {
    const category = categories.find(
      (c) => c.name === expenseData.categoryName,
    );
    if (category) {
      const expense = expenseRepository.create({
        carId: car2.id,
        categoryId: category.id,
        amount: expenseData.amount,
        expenseDate: randomDate(180),
        description: expenseData.description,
      });
      await expenseRepository.save(expense);
    }
  }
  console.log(`✅ Створено ${expensesData2.length} витрат для Honda Civic`);

  console.log('\n🔧 Створення записів обслуговування для Toyota Camry...');
  const maintenanceData1 = [
    {
      serviceType: 'Заміна масла',
      mileageAtService: 85000,
      cost: 1500.0,
      description: 'Заміна моторного масла та фільтра',
    },
    {
      serviceType: 'Заміна гальмівних колодок',
      mileageAtService: 88000,
      cost: 3500.0,
      description: 'Заміна передніх гальмівних колодок',
    },
    {
      serviceType: 'Ремонт підвіски',
      mileageAtService: 90000,
      cost: 5200.0,
      description: 'Заміна амортизаторів та стійок',
    },
    {
      serviceType: 'Заміна свічок запалювання',
      mileageAtService: 92000,
      cost: 800.0,
      description: 'Встановлення нових свічок',
    },
    {
      serviceType: 'ТО',
      mileageAtService: 95000,
      cost: 2800.0,
      description: 'Планове технічне обслуговування',
    },
  ];

  for (const maintenanceData of maintenanceData1) {
    const maintenance = maintenanceRepository.create({
      carId: car1.id,
      serviceType: maintenanceData.serviceType,
      mileageAtService: maintenanceData.mileageAtService,
      serviceDate: randomDate(180),
      cost: maintenanceData.cost,
      description: maintenanceData.description,
    });
    await maintenanceRepository.save(maintenance);
  }
  console.log(
    `✅ Створено ${maintenanceData1.length} записів обслуговування для Toyota Camry`,
  );

  console.log('\n🔧 Створення записів обслуговування для Honda Civic...');
  const maintenanceData2 = [
    {
      serviceType: 'Заміна масла',
      mileageAtService: 45000,
      cost: 1200.0,
      description: 'Планова заміна масла',
    },
    {
      serviceType: 'Заміна фільтрів',
      mileageAtService: 47000,
      cost: 600.0,
      description: 'Заміна повітряного та салонного фільтрів',
    },
    {
      serviceType: 'Заміна гальмівних дисків',
      mileageAtService: 48000,
      cost: 1800.0,
      description: 'Заміна передніх гальмівних дисків',
    },
    {
      serviceType: 'ТО',
      mileageAtService: 50000,
      cost: 2200.0,
      description: 'Велике технічне обслуговування',
    },
    {
      serviceType: 'Балансування коліс',
      mileageAtService: 51000,
      cost: 400.0,
      description: 'Балансування та розвал-сходження',
    },
  ];

  for (const maintenanceData of maintenanceData2) {
    const maintenance = maintenanceRepository.create({
      carId: car2.id,
      serviceType: maintenanceData.serviceType,
      mileageAtService: maintenanceData.mileageAtService,
      serviceDate: randomDate(180),
      cost: maintenanceData.cost,
      description: maintenanceData.description,
    });
    await maintenanceRepository.save(maintenance);
  }
  console.log(
    `✅ Створено ${maintenanceData2.length} записів обслуговування для Honda Civic`,
  );

  console.log('\n📊 Створення записів пробігу для Toyota Camry...');
  const mileageData1 = [
    { value: 85000, comment: 'Початковий пробіг' },
    { value: 87500, comment: 'Поїздка на море' },
    { value: 90000, comment: 'Після щотижневих поїздок' },
    { value: 92500, comment: 'Довга поїздка у відрядження' },
    { value: 95000, comment: 'Поточний пробіг' },
  ];

  for (let i = 0; i < mileageData1.length; i++) {
    const mileage = mileageRepository.create({
      carId: car1.id,
      value: mileageData1[i].value,
      recordedAt: randomDate(180 - i * 30),
      comment: mileageData1[i].comment,
    });
    await mileageRepository.save(mileage);
  }
  console.log(
    `✅ Створено ${mileageData1.length} записів пробігу для Toyota Camry`,
  );

  console.log('\n📊 Створення записів пробігу для Honda Civic...');
  const mileageData2 = [
    { value: 45000, comment: 'Початковий пробіг' },
    { value: 47000, comment: 'Поїздки по місту' },
    { value: 49000, comment: 'Поїздка до родичів' },
    { value: 50500, comment: 'Регулярне використання' },
    { value: 52000, comment: 'Поточний пробіг' },
  ];

  for (let i = 0; i < mileageData2.length; i++) {
    const mileage = mileageRepository.create({
      carId: car2.id,
      value: mileageData2[i].value,
      recordedAt: randomDate(180 - i * 30),
      comment: mileageData2[i].comment,
    });
    await mileageRepository.save(mileage);
  }
  console.log(
    `✅ Створено ${mileageData2.length} записів пробігу для Honda Civic`,
  );

  console.log('\n✅ Тестові дані для користувача успішно створено!');
  console.log('\n📈 Підсумок:');
  console.log(`   - Машин: 2`);
  console.log(`   - Витрат: ${expensesData1.length + expensesData2.length}`);
  console.log(
    `   - Записів обслуговування: ${maintenanceData1.length + maintenanceData2.length}`,
  );
  console.log(
    `   - Записів пробігу: ${mileageData1.length + mileageData2.length}`,
  );
}
