// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';  // Asegúrate de que el decorador sea correcto
import { Role } from '../enums/role.enum';  // Enum para roles si es que tienes

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,  // Inyectamos JwtService para verificar el token
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());

    // Si no se especifican roles, dejamos pasar la petición
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];  // Extraemos el token de la cabecera

    if (!token) {
      return false;
    }

    try {
      const decoded = this.jwtService.verify(token);  // Verificamos el token con JwtService
      const userRole = decoded.role;  // Extraemos el rol del token

      // Comparamos el rol del usuario con los roles requeridos
      return requiredRoles.includes(userRole);
    } catch (error) {
      return false;
    }
  }
}
