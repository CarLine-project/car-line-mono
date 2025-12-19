# Guards

## CarOwnershipGuard

A guard that verifies the current user owns the car they are trying to access.

### Usage

Apply this guard to any route that operates on a specific car:

```typescript
import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CarOwnershipGuard } from '../common/guards/car-ownership.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('cars/:carId/expenses')
@UseGuards(JwtAuthGuard, CarOwnershipGuard)
export class ExpensesController {
  @Get()
  async getExpenses(@Param('carId') carId: string, @CurrentUser() user: User) {
    // User is guaranteed to own this car
    // If not, a NotFoundException would have been thrown
  }
}
```

### How it works

1. Extracts the user ID from `request.user.id` (set by JwtAuthGuard)
2. Extracts the car ID from `request.params.carId` or `request.params.id`
3. Calls `CarsService.verifyOwnership(carId, userId)` to check ownership
4. Throws `NotFoundException` if the car doesn't exist or doesn't belong to the user
5. Allows the request to proceed if ownership is verified

### Requirements

- Must be used **after** `JwtAuthGuard` (to ensure `request.user` is set)
- The route must have either `:carId` or `:id` parameter
- The `CarsModule` must be imported in the module using this guard
