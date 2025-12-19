export interface Car {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  initialMileage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCarDto {
  make: string;
  model: string;
  year: number;
  initialMileage: number;
}

export interface UpdateCarDto {
  make?: string;
  model?: string;
  year?: number;
  initialMileage?: number;
}
