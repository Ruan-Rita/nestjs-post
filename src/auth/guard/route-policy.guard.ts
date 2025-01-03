import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUEST_USER_PAYLOAD } from '../auth.constant';
import { User } from 'src/user/entities/user.entity';
import { RoutePolicies } from '../enum/route-policies.enum';

@Injectable()
export class RoutePolicyGuard implements CanActivate {
  constructor(private readonly refletor: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policy: RoutePolicies = this.refletor.get(
      'route_policy',
      context.getHandler(),
    );

    if (!policy) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userPaylaod = request[REQUEST_USER_PAYLOAD];
    if (!userPaylaod) {
      throw new UnauthorizedException(
        `Route is requiring ${policy} permission`,
      );
    }
    const user: User = userPaylaod.user;
    console.log('USER', user);

    if (!user.routePolicies.includes(policy)) {
      throw new ForbiddenException('User do not have permission in this route');
    }

    return true;
  }
}
