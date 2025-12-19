import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { carsApi } from "./cars.api";
import { CreateCarDto, UpdateCarDto } from "../model/types";

export const useCars = () => {
  return useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      const response = await carsApi.getCars();
      return response.data;
    },
  });
};

export const useCar = (id: string) => {
  return useQuery({
    queryKey: ["cars", id],
    queryFn: async () => {
      const response = await carsApi.getCar(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useActiveCar = () => {
  return useQuery({
    queryKey: ["cars", "active"],
    queryFn: async () => {
      const response = await carsApi.getActiveCar();
      return response.data;
    },
  });
};

export const useCreateCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCarDto) => {
      const response = await carsApi.createCar(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
  });
};

export const useUpdateCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCarDto }) => {
      const response = await carsApi.updateCar(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["cars", variables.id] });
    },
  });
};

export const useDeleteCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await carsApi.deleteCar(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
    },
  });
};

export const useActivateCar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await carsApi.activateCar(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["cars", "active"] });
    },
  });
};
