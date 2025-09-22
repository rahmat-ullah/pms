import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from '../../../shared/database/schemas/user.schema';

export const CurrentUser = createParamDecorator(
  (data: keyof UserDocument | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
