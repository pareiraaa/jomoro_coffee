import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private role: string) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== this.role) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }

  // canActivate(context: ExecutionContext): boolean {
  //   const request = context.switchToHttp().getRequest();
  //   const user = request.user;

  //   console.log('user from request:', user);  // ← tambah ini
  //   console.log('required role:', this.role); // ← tambah ini

  //   if (!user || user.role !== this.role) {
  //     throw new ForbiddenException('Access denied');
  //   }

  //   return true;
  // }
}