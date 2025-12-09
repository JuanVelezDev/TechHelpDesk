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
  });
});

