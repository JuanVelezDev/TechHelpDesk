import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    get: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn(),
    }),
    getHandler: jest.fn(),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('debería retornar true si no hay roles requeridos', () => {
      const request = {
        user: { id: 'user-id', role: Role.Admin },
      };

      mockReflector.get.mockReturnValue(undefined);
      mockExecutionContext.switchToHttp().getRequest.mockReturnValue(request);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockReflector.get).toHaveBeenCalledWith(
        ROLES_KEY,
        mockExecutionContext.getHandler(),
      );
    });

    it('debería retornar true si el usuario tiene el rol requerido', () => {
      const request = {
        user: { id: 'user-id', role: Role.Admin },
      };

      mockReflector.get.mockReturnValue([Role.Admin]);
      mockExecutionContext.switchToHttp().getRequest.mockReturnValue(request);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('debería retornar true si el usuario tiene uno de los roles requeridos', () => {
      const request = {
        user: { id: 'user-id', role: Role.Technician },
      };

      mockReflector.get.mockReturnValue([Role.Admin, Role.Technician]);
      mockExecutionContext.switchToHttp().getRequest.mockReturnValue(request);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('debería lanzar ForbiddenException si el usuario no tiene el rol requerido', () => {
      const request = {
        user: { id: 'user-id', role: Role.Client },
      };

      mockReflector.get.mockReturnValue([Role.Admin]);
      mockExecutionContext.switchToHttp().getRequest.mockReturnValue(request);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });

    it('debería lanzar ForbiddenException si no hay usuario en el request', () => {
      const request = {};

      mockReflector.get.mockReturnValue([Role.Admin]);
      mockExecutionContext.switchToHttp().getRequest.mockReturnValue(request);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });
  });
});
