import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket, TicketStatus, TicketPriority } from './entities/ticket.entity';
import { ClientsService } from '../clients/clients.service';
import { TechniciansService } from '../technicians/technician.service';
import { CategoriesService } from '../categories/category.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateTicketDto } from './dto/update-ticket-status.dto';

describe('TicketsService', () => {
  let service: TicketsService;
  let repository: Repository<Ticket>;
  let clientsService: ClientsService;
  let techniciansService: TechniciansService;
  let categoriesService: CategoriesService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    remove: jest.fn(),
  };

  const mockClientsService = {
    findOne: jest.fn(),
  };

  const mockTechniciansService = {
    findOne: jest.fn(),
  };

  const mockCategoriesService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: getRepositoryToken(Ticket),
          useValue: mockRepository,
        },
        {
          provide: ClientsService,
          useValue: mockClientsService,
        },
        {
          provide: TechniciansService,
          useValue: mockTechniciansService,
        },
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    repository = module.get<Repository<Ticket>>(getRepositoryToken(Ticket));
    clientsService = module.get<ClientsService>(ClientsService);
    techniciansService = module.get<TechniciansService>(TechniciansService);
    categoriesService = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear un ticket exitosamente', async () => {
      const createTicketDto: CreateTicketDto = {
        title: 'Test Ticket',
        description: 'Test Description',
        clientId: 'client-id',
        categoryId: 'category-id',
      };

      const mockClient = { id: 'client-id', name: 'Test Client' };
      const mockCategory = { id: 'category-id', name: 'Test Category' };
      const mockTicket = {
        id: 'ticket-id',
        ...createTicketDto,
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        client: mockClient,
        category: mockCategory,
      };

      mockClientsService.findOne.mockResolvedValue(mockClient);
      mockCategoriesService.findOne.mockResolvedValue(mockCategory);
      mockRepository.create.mockReturnValue(mockTicket);
      mockRepository.save.mockResolvedValue(mockTicket);

      const result = await service.create(createTicketDto);

      expect(result).toEqual(mockTicket);
      expect(mockClientsService.findOne).toHaveBeenCalledWith('client-id');
      expect(mockCategoriesService.findOne).toHaveBeenCalledWith('category-id');
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('debería crear un ticket con técnico asignado exitosamente', async () => {
      const createTicketDto: CreateTicketDto = {
        title: 'Test Ticket',
        description: 'Test Description',
        clientId: 'client-id',
        categoryId: 'category-id',
        technicianId: 'technician-id',
      };

      const mockClient = { id: 'client-id', name: 'Test Client' };
      const mockCategory = { id: 'category-id', name: 'Test Category' };
      const mockTechnician = { id: 'technician-id', name: 'Test Technician' };
      const mockTicket = {
        id: 'ticket-id',
        ...createTicketDto,
        status: TicketStatus.OPEN,
        priority: TicketPriority.MEDIUM,
        client: mockClient,
        category: mockCategory,
        technician: mockTechnician,
      };

      mockClientsService.findOne.mockResolvedValue(mockClient);
      mockCategoriesService.findOne.mockResolvedValue(mockCategory);
      mockTechniciansService.findOne.mockResolvedValue(mockTechnician);
      mockRepository.count.mockResolvedValue(2); // Menos de 5 tickets en progreso
      mockRepository.create.mockReturnValue(mockTicket);
      mockRepository.save.mockResolvedValue(mockTicket);

      const result = await service.create(createTicketDto);

      expect(result).toEqual(mockTicket);
      expect(mockTechniciansService.findOne).toHaveBeenCalledWith('technician-id');
      expect(mockRepository.count).toHaveBeenCalled();
    });

    it('debería crear un ticket con estado y prioridad personalizados', async () => {
      const createTicketDto: CreateTicketDto = {
        title: 'Test Ticket',
        description: 'Test Description',
        clientId: 'client-id',
        categoryId: 'category-id',
        status: TicketStatus.IN_PROGRESS,
        priority: TicketPriority.HIGH,
      };

      const mockClient = { id: 'client-id', name: 'Test Client' };
      const mockCategory = { id: 'category-id', name: 'Test Category' };
      const mockTicket = {
        id: 'ticket-id',
        ...createTicketDto,
        client: mockClient,
        category: mockCategory,
      };

      mockClientsService.findOne.mockResolvedValue(mockClient);
      mockCategoriesService.findOne.mockResolvedValue(mockCategory);
      mockRepository.create.mockReturnValue(mockTicket);
      mockRepository.save.mockResolvedValue(mockTicket);

      const result = await service.create(createTicketDto);

      expect(result.status).toBe(TicketStatus.IN_PROGRESS);
      expect(result.priority).toBe(TicketPriority.HIGH);
    });

    it('debería lanzar error si el técnico tiene más de 5 tickets en progreso', async () => {
      const createTicketDto: CreateTicketDto = {
        title: 'Test Ticket',
        description: 'Test Description',
        clientId: 'client-id',
        categoryId: 'category-id',
        technicianId: 'technician-id',
      };

      const mockClient = { id: 'client-id', name: 'Test Client' };
      const mockCategory = { id: 'category-id', name: 'Test Category' };
      const mockTechnician = { id: 'technician-id', name: 'Test Technician' };

      mockClientsService.findOne.mockResolvedValue(mockClient);
      mockCategoriesService.findOne.mockResolvedValue(mockCategory);
      mockTechniciansService.findOne.mockResolvedValue(mockTechnician);
      mockRepository.count.mockResolvedValue(5);

      await expect(service.create(createTicketDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepository.count).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('debería actualizar el estado del ticket correctamente', async () => {
      const ticketId = 'ticket-id';
      const updateStatusDto: UpdateStatusDto = {
        status: TicketStatus.IN_PROGRESS,
      };

      const mockTicket = {
        id: ticketId,
        title: 'Test Ticket',
        status: TicketStatus.OPEN,
        technician: null,
      };

      const updatedTicket = {
        ...mockTicket,
        status: TicketStatus.IN_PROGRESS,
      };

      mockRepository.findOne.mockResolvedValue(mockTicket);
      mockRepository.count.mockResolvedValue(0);
      mockRepository.save.mockResolvedValue(updatedTicket);

      const result = await service.updateStatus(ticketId, updateStatusDto);

      expect(result.status).toBe(TicketStatus.IN_PROGRESS);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar error si la transición de estado es inválida', async () => {
      const ticketId = 'ticket-id';
      const updateStatusDto: UpdateStatusDto = {
        status: TicketStatus.CLOSED,
      };

      const mockTicket = {
        id: ticketId,
        title: 'Test Ticket',
        status: TicketStatus.OPEN,
      };

      mockRepository.findOne.mockResolvedValue(mockTicket);

      await expect(service.updateStatus(ticketId, updateStatusDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar error si el ticket no existe', async () => {
      const ticketId = 'non-existent-id';
      const updateStatusDto: UpdateStatusDto = {
        status: TicketStatus.IN_PROGRESS,
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateStatus(ticketId, updateStatusDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debería lanzar error si el técnico tiene más de 5 tickets en progreso al cambiar estado', async () => {
      const ticketId = 'ticket-id';
      const updateStatusDto: UpdateStatusDto = {
        status: TicketStatus.IN_PROGRESS,
      };

      const mockTicket = {
        id: ticketId,
        title: 'Test Ticket',
        status: TicketStatus.OPEN,
        technician: { id: 'technician-id', name: 'Test Technician' },
      };

      mockRepository.findOne.mockResolvedValue(mockTicket);
      mockRepository.count.mockResolvedValue(5);

      await expect(service.updateStatus(ticketId, updateStatusDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería actualizar estado de RESOLVED a CLOSED correctamente', async () => {
      const ticketId = 'ticket-id';
      const updateStatusDto: UpdateStatusDto = {
        status: TicketStatus.CLOSED,
      };

      const mockTicket = {
        id: ticketId,
        title: 'Test Ticket',
        status: TicketStatus.RESOLVED,
        technician: null,
      };

      const updatedTicket = {
        ...mockTicket,
        status: TicketStatus.CLOSED,
      };

      mockRepository.findOne.mockResolvedValue(mockTicket);
      mockRepository.save.mockResolvedValue(updatedTicket);

      const result = await service.updateStatus(ticketId, updateStatusDto);

      expect(result.status).toBe(TicketStatus.CLOSED);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('debería actualizar estado de IN_PROGRESS a RESOLVED correctamente', async () => {
      const ticketId = 'ticket-id';
      const updateStatusDto: UpdateStatusDto = {
        status: TicketStatus.RESOLVED,
      };

      const mockTicket = {
        id: ticketId,
        title: 'Test Ticket',
        status: TicketStatus.IN_PROGRESS,
        technician: null,
      };

      const updatedTicket = {
        ...mockTicket,
        status: TicketStatus.RESOLVED,
      };

      mockRepository.findOne.mockResolvedValue(mockTicket);
      mockRepository.save.mockResolvedValue(updatedTicket);

      const result = await service.updateStatus(ticketId, updateStatusDto);

      expect(result.status).toBe(TicketStatus.RESOLVED);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los tickets', async () => {
      const tickets = [
        {
          id: '1',
          title: 'Ticket 1',
          description: 'Description 1',
          status: TicketStatus.OPEN,
          priority: TicketPriority.MEDIUM,
        },
        {
          id: '2',
          title: 'Ticket 2',
          description: 'Description 2',
          status: TicketStatus.IN_PROGRESS,
          priority: TicketPriority.HIGH,
        },
      ];

      mockRepository.find.mockResolvedValue(tickets);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['client', 'technician', 'category'],
      });
      expect(result).toEqual(tickets);
    });
  });

  describe('findByClient', () => {
    it('debería retornar tickets por cliente', async () => {
      const clientId = 'client-id';
      const mockClient = { id: clientId, name: 'Test Client' };
      const tickets = [
        {
          id: '1',
          title: 'Ticket 1',
          client: mockClient,
        },
      ];

      mockClientsService.findOne.mockResolvedValue(mockClient);
      mockRepository.find.mockResolvedValue(tickets);

      const result = await service.findByClient(clientId);

      expect(mockClientsService.findOne).toHaveBeenCalledWith(clientId);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { client: { id: mockClient.id } },
        relations: ['client', 'technician', 'category'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(tickets);
    });
  });

  describe('findByTechnician', () => {
    it('debería retornar tickets por técnico', async () => {
      const technicianId = 'technician-id';
      const mockTechnician = { id: technicianId, name: 'Test Technician' };
      const tickets = [
        {
          id: '1',
          title: 'Ticket 1',
          technician: mockTechnician,
        },
      ];

      mockTechniciansService.findOne.mockResolvedValue(mockTechnician);
      mockRepository.find.mockResolvedValue(tickets);

      const result = await service.findByTechnician(technicianId);

      expect(mockTechniciansService.findOne).toHaveBeenCalledWith(technicianId);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { technician: { id: mockTechnician.id } },
        relations: ['client', 'technician', 'category'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(tickets);
    });
  });

  describe('findOne', () => {
    it('debería retornar un ticket por ID', async () => {
      const ticketId = 'ticket-id';
      const ticket = {
        id: ticketId,
        title: 'Test Ticket',
        description: 'Test Description',
        status: TicketStatus.OPEN,
      };

      mockRepository.findOne.mockResolvedValue(ticket);

      const result = await service.findOne(ticketId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: ticketId },
        relations: ['client', 'technician', 'category'],
      });
      expect(result).toEqual(ticket);
    });

    it('debería lanzar NotFoundException si el ticket no existe', async () => {
      const ticketId = 'non-existent-id';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(ticketId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debería actualizar un ticket exitosamente', async () => {
      const ticketId = 'ticket-id';
      const updateTicketDto: UpdateTicketDto = {
        title: 'Updated Ticket',
        description: 'Updated Description',
      };

      const existingTicket = {
        id: ticketId,
        title: 'Test Ticket',
        description: 'Test Description',
        status: TicketStatus.OPEN,
        client: { id: 'client-id' },
        category: { id: 'category-id' },
      };

      const updatedTicket = {
        ...existingTicket,
        ...updateTicketDto,
      };

      mockRepository.findOne.mockResolvedValue(existingTicket);
      mockRepository.save.mockResolvedValue(updatedTicket);

      const result = await service.update(ticketId, updateTicketDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: ticketId },
        relations: ['client', 'technician', 'category'],
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedTicket);
    });

    it('debería actualizar cliente si se proporciona clientId', async () => {
      const ticketId = 'ticket-id';
      const updateTicketDto: UpdateTicketDto = {
        clientId: 'new-client-id',
      };

      const existingTicket = {
        id: ticketId,
        title: 'Test Ticket',
        client: { id: 'old-client-id' },
        category: { id: 'category-id' },
      };

      const newClient = { id: 'new-client-id', name: 'New Client' };
      const updatedTicket = {
        ...existingTicket,
        client: newClient,
      };

      mockRepository.findOne.mockResolvedValue(existingTicket);
      mockClientsService.findOne.mockResolvedValue(newClient);
      mockRepository.save.mockResolvedValue(updatedTicket);

      const result = await service.update(ticketId, updateTicketDto);

      expect(mockClientsService.findOne).toHaveBeenCalledWith('new-client-id');
      expect(result.client).toEqual(newClient);
    });

    it('debería actualizar técnico si se proporciona technicianId', async () => {
      const ticketId = 'ticket-id';
      const updateTicketDto: UpdateTicketDto = {
        technicianId: 'new-technician-id',
      };

      const existingTicket = {
        id: ticketId,
        title: 'Test Ticket',
        technician: null,
      };

      const newTechnician = { id: 'new-technician-id', name: 'New Technician' };
      const updatedTicket = {
        ...existingTicket,
        technician: newTechnician,
      };

      mockRepository.findOne.mockResolvedValue(existingTicket);
      mockTechniciansService.findOne.mockResolvedValue(newTechnician);
      mockRepository.save.mockResolvedValue(updatedTicket);

      const result = await service.update(ticketId, updateTicketDto);

      expect(mockTechniciansService.findOne).toHaveBeenCalledWith('new-technician-id');
      expect(result.technician).toEqual(newTechnician);
    });

    it('debería eliminar técnico si technicianId es null', async () => {
      const ticketId = 'ticket-id';
      const updateTicketDto: UpdateTicketDto = {
        technicianId: null,
      };

      const existingTicket = {
        id: ticketId,
        title: 'Test Ticket',
        technician: { id: 'old-technician-id' },
      };

      const updatedTicket = {
        ...existingTicket,
        technician: undefined,
      };

      mockRepository.findOne.mockResolvedValue(existingTicket);
      mockRepository.save.mockResolvedValue(updatedTicket);

      const result = await service.update(ticketId, updateTicketDto);

      expect(mockTechniciansService.findOne).not.toHaveBeenCalled();
      expect(result.technician).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('debería eliminar un ticket exitosamente', async () => {
      const ticketId = 'ticket-id';
      const ticket = {
        id: ticketId,
        title: 'Test Ticket',
        description: 'Test Description',
      };

      mockRepository.findOne.mockResolvedValue(ticket);
      mockRepository.remove.mockResolvedValue(ticket);

      await service.remove(ticketId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: ticketId },
        relations: ['client', 'technician', 'category'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(ticket);
    });
  });
});



