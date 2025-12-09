import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear un usuario exitosamente', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'client',
      };

      const createdUser = {
        id: 'user-id',
        ...createUserDto,
      };

      mockRepository.create.mockReturnValue(createdUser);
      mockRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los usuarios', async () => {
      const users = [
        { id: '1', name: 'User 1', email: 'user1@example.com', role: 'admin' },
        { id: '2', name: 'User 2', email: 'user2@example.com', role: 'client' },
      ];

      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('debería retornar un usuario por ID', async () => {
      const userId = 'user-id';
      const user = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        role: 'client',
      };

      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne(userId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(result).toEqual(user);
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      const userId = 'non-existent-id';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });
  });

  describe('update', () => {
    it('debería actualizar un usuario exitosamente', async () => {
      const userId = 'user-id';
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const existingUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        role: 'client',
      };

      const updatedUser = {
        ...existingUser,
        ...updateUserDto,
      };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto);

      expect(mockRepository.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('debería eliminar un usuario exitosamente', async () => {
      const userId = 'user-id';

      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(userId);

      expect(mockRepository.delete).toHaveBeenCalledWith(userId);
    });
  });

  describe('findByEmail', () => {
    it('debería retornar un usuario por email', async () => {
      const email = 'test@example.com';
      const user = {
        id: 'user-id',
        name: 'Test User',
        email,
        role: 'client',
      };

      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.findByEmail(email);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toEqual(user);
    });

    it('debería retornar null si el usuario no existe', async () => {
      const email = 'nonexistent@example.com';

      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toBeNull();
    });
  });
});
