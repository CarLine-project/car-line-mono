import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesApi } from "./expenses.api";
import { CreateExpenseDto, UpdateExpenseDto } from "../model/types";

export const useExpenseCategories = () => {
  return useQuery({
    queryKey: ["expense-categories"],
    queryFn: async () => {
      const response = await expensesApi.getCategories();
      return response.data;
    },
  });
};

export const useExpenseList = (
  carId: string,
  params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    from?: string;
    to?: string;
  }
) => {
  return useQuery({
    queryKey: ["expenses", carId, params],
    queryFn: async () => {
      const response = await expensesApi.getExpenseList(carId, params);
      return response.data;
    },
    enabled: !!carId,
  });
};

export const useExpenseStats = (carId: string, from?: string, to?: string) => {
  return useQuery({
    queryKey: ["expenses", carId, "stats", from, to],
    queryFn: async () => {
      const response = await expensesApi.getStats(carId, from, to);
      return response.data;
    },
    enabled: !!carId,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      carId,
      data,
    }: {
      carId: string;
      data: CreateExpenseDto;
    }) => {
      const response = await expensesApi.createExpense(carId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expenses", variables.carId] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      carId,
      data,
    }: {
      id: string;
      carId: string;
      data: UpdateExpenseDto;
    }) => {
      const response = await expensesApi.updateExpense(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expenses", variables.carId] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, carId }: { id: string; carId: string }) => {
      await expensesApi.deleteExpense(id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expenses", variables.carId] });
    },
  });
};
