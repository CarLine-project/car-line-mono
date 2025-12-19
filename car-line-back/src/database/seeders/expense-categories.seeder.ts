import { DataSource } from 'typeorm';
import { ExpenseCategory } from '../../expenses/entities/expense-category.entity';

export async function seedExpenseCategories(
  dataSource: DataSource,
): Promise<void> {
  const categoryRepository = dataSource.getRepository(ExpenseCategory);

  const categories = [
    { name: 'Паливо', icon: 'fuel' },
    { name: 'Ремонт', icon: 'construct' },
    { name: 'Страховка', icon: 'shield' },
    { name: 'ТО', icon: 'build' },
    { name: 'Мийка', icon: 'water' },
    { name: 'Парковка', icon: 'car' },
    { name: 'Інше', icon: 'ellipsis-horizontal' },
  ];

  for (const category of categories) {
    const existing = await categoryRepository.findOne({
      where: { name: category.name },
    });

    if (!existing) {
      const newCategory = categoryRepository.create(category);
      await categoryRepository.save(newCategory);
      console.log(`Created category: ${category.name}`);
    } else {
      console.log(`Category already exists: ${category.name}`);
    }
  }

  console.log('Expense categories seeding completed');
}
