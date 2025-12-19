import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mileageApi } from "./mileage.api";
import { CreateMileageDto, UpdateMileageDto } from "../model/types";

export const useMileageList = (carId: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["mileage", carId, page, limit],
    queryFn: async () => {
      const response = await mileageApi.getMileageList(carId, page, limit);
      return response.data;
    },
    enabled: !!carId,
  });
};

export const useCurrentMileage = (carId: string) => {
  return useQuery({
    queryKey: ["mileage", carId, "current"],
    queryFn: async () => {
      const response = await mileageApi.getCurrentMileage(carId);
      return response.data;
    },
    enabled: !!carId,
  });
};

export const useCreateMileage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      carId,
      data,
    }: {
      carId: string;
      data: CreateMileageDto;
    }) => {
      const response = await mileageApi.createMileage(carId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mileage", variables.carId] });
    },
  });
};

export const useUpdateMileage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      carId,
      data,
    }: {
      id: string;
      carId: string;
      data: UpdateMileageDto;
    }) => {
      const response = await mileageApi.updateMileage(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mileage", variables.carId] });
    },
  });
};

export const useDeleteMileage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, carId }: { id: string; carId: string }) => {
      await mileageApi.deleteMileage(id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mileage", variables.carId] });
    },
  });
};
