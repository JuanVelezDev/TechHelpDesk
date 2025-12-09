import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockJwtService = {
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn(),
    }),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('debería retornar true si el token es válido', () => {
      const request = {
        headers: {
          authorization: 'Bearer valid-token',
        },
        user: null,
      };

      const payload = {
        sub: 'user-id',
        email: 'test@example.com',
        role: 'admin',
      };

      mockExecutionContext.switchToHttp().getRequest.mockReturnValue(request);
      mockJwtService.verify.mockReturnValue(payload);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(request.user).toEqual(payload);
    });

    it('debería lanzar UnauthorizedException si no hay token', () => {
      const request = {
        headers: {},
        user: null,
      };

      mockExecutionContext.switchToHttp().getRequest.mockReturnValue(request);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
      expect(mockJwtService.verify).not.toHaveBeenCalled();
    });

    it('debería lanzar UnauthorizedException si el token es inválido', () => {
      const request = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
        user: null,
      };

      mockExecutionContext.switchToHttp().getRequest.mockReturnValue(request);
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('debería lanzar UnauthorizedException si el formato del header es incorrecto', () => {
      const request = {
        headers: {
          authorization: 'InvalidFormat token',
        },
        user: null,
      };

      mockExecutionContext.switchToHttp().getRequest.mockReturnValue(request);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        UnauthorizedException,
      );
    });
  });
});
