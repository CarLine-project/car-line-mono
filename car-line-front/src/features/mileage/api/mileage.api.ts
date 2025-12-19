import { apiClient } from "../../../shared/api/client";
import {
  Mileage,
  CreateMileageDto,
  UpdateMileageDto,
  MileageListResponse,
} from "../model/types";

export const mileageApi = {
  createMileage: (carId: string, data: CreateMileageDto) =>
    apiClient.post<Mileage>(`/cars/${carId}/mileage`, data),

  getMileageList: (carId: string, page = 1, limit = 20) =>
    apiClient.get<MileageListResponse>(`/cars/${carId}/mileage`, {
      params: { page, limit },
    }),

  getCurrentMileage: (carId: string) =>
    apiClient.get<Mileage>(`/cars/${carId}/mileage/current`),

  getMileage: (id: string) => apiClient.get<Mileage>(`/mileage/${id}`),

  updateMileage: (id: string, data: UpdateMileageDto) =>
    apiClient.patch<Mileage>(`/mileage/${id}`, data),

  deleteMileage: (id: string) => apiClient.delete(`/mileage/${id}`),
};
