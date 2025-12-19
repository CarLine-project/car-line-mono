import { apiClient } from "../../../shared/api/client";
import {
  Expense,
  ExpenseCategory,
  CreateExpenseDto,
  UpdateExpenseDto,
  ExpenseListResponse,
  ExpenseStats,
} from "../model/types";

export const expensesApi = {
  createExpense: (carId: string, data: CreateExpenseDto) =>
    apiClient.post<Expense>(`/cars/${carId}/expenses`, data),

  getExpenseList: (
    carId: string,
    params?: {
      page?: number;
      limit?: number;
      categoryId?: string;
      from?: string;
      to?: string;
    }
  ) =>
    apiClient.get<ExpenseListResponse>(`/cars/${carId}/expenses`, { params }),

  getExpense: (id: string) => apiClient.get<Expense>(`/expenses/${id}`),

  updateExpense: (id: string, data: UpdateExpenseDto) =>
    apiClient.patch<Expense>(`/expenses/${id}`, data),

  deleteExpense: (id: string) => apiClient.delete(`/expenses/${id}`),

  getCategories: () => apiClient.get<ExpenseCategory[]>("/expense-categories"),

  getStats: (carId: string, from?: string, to?: string) =>
    apiClient.get<ExpenseStats>(`/cars/${carId}/expenses/stats`, {
      params: { from, to },
    }),
};
