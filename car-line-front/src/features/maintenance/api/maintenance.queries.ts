import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { maintenanceApi } from "./maintenance.api";
import { CreateMaintenanceDto, UpdateMaintenanceDto } from "../model/types";

export const useMaintenanceList = (carId: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["maintenance", carId, page, limit],
    queryFn: async () => {
      const response = await maintenanceApi.getMaintenanceList(
        carId,
        page,
        limit
      );
      return response.data;
    },
    enabled: !!carId,
  });
};

export const useMaintenanceRecommendation = (carId: string) => {
  return useQuery({
    queryKey: ["maintenance", carId, "recommendation"],
    queryFn: async () => {
      const response = await maintenanceApi.getNextRecommendation(carId);
      return response.data;
    },
    enabled: !!carId,
  });
};

export const useCreateMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      carId,
      data,
    }: {
      carId: string;
      data: CreateMaintenanceDto;
    }) => {
      const response = await maintenanceApi.createMaintenance(carId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["maintenance", variables.carId],
      });
    },
  });
};

export const useUpdateMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      carId,
      data,
    }: {
      id: string;
      carId: string;
      data: UpdateMaintenanceDto;
    }) => {
      const response = await maintenanceApi.updateMaintenance(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["maintenance", variables.carId],
      });
    },
  });
};

export const useDeleteMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, carId }: { id: string; carId: string }) => {
      await maintenanceApi.deleteMaintenance(id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["maintenance", variables.carId],
      });
    },
  });
};

export const useAllMaintenance = (params?: {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  carId?: string;
}) => {
  return useQuery({
    queryKey: ["maintenance", "all", params],
    queryFn: async () => {
      const response = await maintenanceApi.getAllMaintenance(params);
      return response.data;
    },
  });
};
