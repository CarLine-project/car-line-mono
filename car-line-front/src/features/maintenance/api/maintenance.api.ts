import { apiClient } from "../../../shared/api/client";
import {
  Maintenance,
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
  MaintenanceListResponse,
  MaintenanceRecommendation,
} from "../model/types";

export const maintenanceApi = {
  createMaintenance: (carId: string, data: CreateMaintenanceDto) =>
    apiClient.post<Maintenance>(`/cars/${carId}/maintenance`, data),

  getMaintenanceList: (carId: string, page = 1, limit = 20) =>
    apiClient.get<MaintenanceListResponse>(`/cars/${carId}/maintenance`, {
      params: { page, limit },
    }),

  getNextRecommendation: (carId: string) =>
    apiClient.get<MaintenanceRecommendation>(
      `/cars/${carId}/maintenance/next`
    ),

  getMaintenance: (id: string) =>
    apiClient.get<Maintenance>(`/maintenance/${id}`),

  updateMaintenance: (id: string, data: UpdateMaintenanceDto) =>
    apiClient.patch<Maintenance>(`/maintenance/${id}`, data),

  deleteMaintenance: (id: string) => apiClient.delete(`/maintenance/${id}`),
};
