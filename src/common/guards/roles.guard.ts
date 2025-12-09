// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());

    // Si no se especifican roles, dejamos pasar la petición
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // El usuario debe estar en el request gracias a JwtAuthGuard

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const userRole = user.role;

    // Comparamos el rol del usuario con los roles requeridos
    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException('Forbidden resource');
    }

    return true;
  }
}
