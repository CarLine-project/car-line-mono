export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  carId: string;
  categoryId: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDto {
  categoryId: string;
  amount: number;
  expenseDate: string;
  description?: string;
}

export interface UpdateExpenseDto {
  categoryId?: string;
  amount?: number;
  expenseDate?: string;
  description?: string;
}

export interface ExpenseListResponse {
  data: Expense[];
  total: number;
  page: number;
  limit: number;
}

export interface ExpenseStats {
  totalAmount: number;
  byCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  byMonth: Array<{
    month: string;
    amount: number;
  }>;
}
