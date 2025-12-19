export interface Mileage {
  id: string;
  carId: string;
  value: number;
  recordedAt: string;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMileageDto {
  value: number;
  recordedAt: string;
  comment?: string;
}

export interface UpdateMileageDto {
  value?: number;
  recordedAt?: string;
  comment?: string;
}

export interface MileageListResponse {
  data: Mileage[];
  total: number;
  page: number;
  limit: number;
}
