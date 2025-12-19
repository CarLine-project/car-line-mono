export interface Maintenance {
  id: string;
  carId: string;
  serviceType: string;
  mileageAtService: number;
  serviceDate: string;
  cost: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceDto {
  serviceType: string;
  mileageAtService: number;
  serviceDate: string;
  cost: number;
  description?: string;
}

export interface UpdateMaintenanceDto {
  serviceType?: string;
  mileageAtService?: number;
  serviceDate?: string;
  cost?: number;
  description?: string;
}

export interface MaintenanceListResponse {
  data: Maintenance[];
  total: number;
  page: number;
  limit: number;
}

export interface MaintenanceRecommendation {
  recommended: boolean;
  reason: string;
  suggestedMileage: number | null;
  suggestedDate: string | null;
}
