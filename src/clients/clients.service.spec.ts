import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client } from './entities/client.entity';
import { User } from '../users/entities/user.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

describe('ClientsService', () => {
  let service: ClientsService;
  let clientRepository: Repository<Client>;
  let userRepository: Repository<User>;

  const mockClientRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getRepositoryToken(Client),
          useValue: mockClientRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    clientRepository = module.get<Repository<Client>>(getRepositoryToken(Client));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear un cliente exitosamente', async () => {
      const createClientDto: CreateClientDto = {
        name: 'Test Client',
        company: 'Test Company',
        contactEmail: 'client@example.com',
        userId: 'user-id',
      };

      const user = {
        id: 'user-id',
        name: 'Test User',
        email: 'user@example.com',
        role: 'client',
      };

      const createdClient = {
        id: 'client-id',
        name: createClientDto.name,
        company: createClientDto.company,
        contactEmail: createClientDto.contactEmail,
        user,
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      mockClientRepository.create.mockReturnValue(createdClient);
      mockClientRepository.save.mockResolvedValue(createdClient);

      const result = await service.create(createClientDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: createClientDto.userId },
      });
      expect(mockClientRepository.create).toHaveBeenCalledWith({
        name: createClientDto.name,
        company: createClientDto.company,
        contactEmail: createClientDto.contactEmail,
        user,
      });
      expect(result).toEqual(createdClient);
    });

    it('debería lanzar NotFoundException si el usuario no existe', async () => {
      const createClientDto: CreateClientDto = {
        name: 'Test Client',
        company: 'Test Company',
        contactEmail: 'client@example.com',
        userId: 'non-existent-user-id',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createClientDto)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: createClientDto.userId },
      });
      expect(mockClientRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los clientes', async () => {
      const clients = [
        {
          id: '1',
          name: 'Client 1',
          company: 'Company 1',
          contactEmail: 'client1@example.com',
        },
        {
          id: '2',
          name: 'Client 2',
          company: 'Company 2',
          contactEmail: 'client2@example.com',
        },
      ];

      mockClientRepository.find.mockResolvedValue(clients);

      const result = await service.findAll();

      expect(mockClientRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'tickets'],
      });
      expect(result).toEqual(clients);
    });
  });

  describe('findOne', () => {
    it('debería retornar un cliente por ID', async () => {
      const clientId = 'client-id';
      const client = {
        id: clientId,
        name: 'Test Client',
        company: 'Test Company',
        contactEmail: 'client@example.com',
      };

      mockClientRepository.findOne.mockResolvedValue(client);

      const result = await service.findOne(clientId);

      expect(mockClientRepository.findOne).toHaveBeenCalledWith({
        where: { id: clientId },
        relations: ['user', 'tickets'],
      });
      expect(result).toEqual(client);
    });

    it('debería lanzar NotFoundException si el cliente no existe', async () => {
      const clientId = 'non-existent-id';

      mockClientRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(clientId)).rejects.toThrow(NotFoundException);
      expect(mockClientRepository.findOne).toHaveBeenCalledWith({
        where: { id: clientId },
        relations: ['user', 'tickets'],
      });
    });
  });

  describe('update', () => {
    it('debería actualizar un cliente exitosamente', async () => {
      const clientId = 'client-id';
      const updateClientDto: UpdateClientDto = {
        name: 'Updated Client',
      };

      const existingClient = {
        id: clientId,
        name: 'Test Client',
        company: 'Test Company',
        contactEmail: 'client@example.com',
      };

      const updatedClient = {
        ...existingClient,
        ...updateClientDto,
      };

      mockClientRepository.findOne.mockResolvedValue(existingClient);
      mockClientRepository.save.mockResolvedValue(updatedClient);

      const result = await service.update(clientId, updateClientDto);

      expect(mockClientRepository.findOne).toHaveBeenCalledWith({
        where: { id: clientId },
        relations: ['user', 'tickets'],
      });
      expect(mockClientRepository.save).toHaveBeenCalledWith(updatedClient);
      expect(result).toEqual(updatedClient);
    });
  });

  describe('remove', () => {
    it('debería eliminar un cliente exitosamente', async () => {
      const clientId = 'client-id';
      const client = {
        id: clientId,
        name: 'Test Client',
        company: 'Test Company',
        contactEmail: 'client@example.com',
      };

      mockClientRepository.findOne.mockResolvedValue(client);
      mockClientRepository.remove.mockResolvedValue(client);

      await service.remove(clientId);

      expect(mockClientRepository.findOne).toHaveBeenCalledWith({
        where: { id: clientId },
        relations: ['user', 'tickets'],
      });
      expect(mockClientRepository.remove).toHaveBeenCalledWith(client);
    });
  });
});
