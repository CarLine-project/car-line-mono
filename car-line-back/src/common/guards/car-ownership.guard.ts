import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CarsService } from '../../cars/cars.service';

@Injectable()
export class CarOwnershipGuard implements CanActivate {
  constructor(private readonly carsService: CarsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    // Try to get carId from different param names
    const carId = request.params.carId || request.params.id;

    if (!carId) {
      throw new ForbiddenException('Car ID not provided');
    }

    // Verify ownership using the CarsService method
    const isOwner = await this.carsService.verifyOwnership(carId, userId);

    if (!isOwner) {
      throw new NotFoundException('Car not found');
    }

    return true;
  }
}
