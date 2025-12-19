import { apiClient } from "../../../shared/api/client";
import { Car, CreateCarDto, UpdateCarDto } from "../model/types";

export const carsApi = {
  getCars: () => apiClient.get<Car[]>("/cars"),
  
  getCar: (id: string) => apiClient.get<Car>(`/cars/${id}`),
  
  getActiveCar: () => apiClient.get<Car>("/cars/active"),
  
  createCar: (data: CreateCarDto) => apiClient.post<Car>("/cars", data),
  
  updateCar: (id: string, data: UpdateCarDto) =>
    apiClient.patch<Car>(`/cars/${id}`, data),
  
  deleteCar: (id: string) => apiClient.delete(`/cars/${id}`),
  
  activateCar: (id: string) =>
    apiClient.patch<Car>(`/cars/${id}/activate`, {}),
};
