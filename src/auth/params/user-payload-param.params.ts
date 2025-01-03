import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_USER_PAYLOAD } from '../auth.constant';

export const UserPayloadParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const context = ctx.switchToHttp();
    const request = context.getRequest();

    return request[REQUEST_USER_PAYLOAD];
  },
);
