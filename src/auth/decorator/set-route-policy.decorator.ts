import { SetMetadata } from '@nestjs/common';
import { RoutePolicies } from '../enum/route-policies.enum';

export const SetRoutePolicy = (role: RoutePolicies) => {
  return SetMetadata('route_policy', role);
};
