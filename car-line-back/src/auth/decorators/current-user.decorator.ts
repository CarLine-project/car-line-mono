import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): User | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If a specific property is requested (e.g., 'id'), return only that property
    if (data) {
      return user?.[data];
    }

    // Otherwise, return the entire user object
    return user;
  },
);
