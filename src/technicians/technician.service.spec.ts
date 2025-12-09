import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TechniciansService } from './technician.service';
import { Technician } from './entities/technician.entity';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

describe('TechniciansService', () => {
  let service: TechniciansService;
  let repository: Repository<Technician>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TechniciansService,
        {
          provide: getRepositoryToken(Technician),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TechniciansService>(TechniciansService);
    repository = module.get<Repository<Technician>>(getRepositoryToken(Technician));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear un técnico exitosamente', async () => {
      const createTechnicianDto: CreateTechnicianDto = {
        name: 'Test Technician',
        email: 'tech@example.com',
        phone: '123456789',
        specialization: 'Hardware',
        availability: true,
      };

      const createdTechnician = {
        id: 'technician-id',
        ...createTechnicianDto,
      };

      mockRepository.create.mockReturnValue(createdTechnician);
      mockRepository.save.mockResolvedValue(createdTechnician);

      const result = await service.create(createTechnicianDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createTechnicianDto);
      expect(mockRepository.save).toHaveBeenCalledWith(createdTechnician);
      expect(result).toEqual(createdTechnician);
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los técnicos', async () => {
      const technicians = [
        {
          id: '1',
          name: 'Tech 1',
          email: 'tech1@example.com',
          phone: '111',
          specialization: 'Hardware',
          availability: true,
        },
        {
          id: '2',
          name: 'Tech 2',
          email: 'tech2@example.com',
          phone: '222',
          specialization: 'Software',
          availability: false,
        },
      ];

      mockRepository.find.mockResolvedValue(technicians);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(technicians);
    });
  });

  describe('findOne', () => {
    it('debería retornar un técnico por ID', async () => {
      const technicianId = 'technician-id';
      const technician = {
        id: technicianId,
        name: 'Test Technician',
        email: 'tech@example.com',
        phone: '123456789',
        specialization: 'Hardware',
        availability: true,
      };

      mockRepository.findOne.mockResolvedValue(technician);

      const result = await service.findOne(technicianId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: technicianId } });
      expect(result).toEqual(technician);
    });

    it('debería lanzar NotFoundException si el técnico no existe', async () => {
      const technicianId = 'non-existent-id';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(technicianId)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: technicianId } });
    });
  });

  describe('update', () => {
    it('debería actualizar un técnico exitosamente', async () => {
      const technicianId = 'technician-id';
      const updateTechnicianDto: UpdateTechnicianDto = {
        name: 'Updated Technician',
        availability: false,
      };

      const existingTechnician = {
        id: technicianId,
        name: 'Test Technician',
        email: 'tech@example.com',
        phone: '123456789',
        specialization: 'Hardware',
        availability: true,
      };

      const updatedTechnician = {
        ...existingTechnician,
        ...updateTechnicianDto,
      };

      mockRepository.findOne.mockResolvedValue(existingTechnician);
      mockRepository.save.mockResolvedValue(updatedTechnician);

      const result = await service.update(technicianId, updateTechnicianDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: technicianId } });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedTechnician);
      expect(result).toEqual(updatedTechnician);
    });
  });

  describe('remove', () => {
    it('debería eliminar un técnico exitosamente', async () => {
      const technicianId = 'technician-id';
      const technician = {
        id: technicianId,
        name: 'Test Technician',
        email: 'tech@example.com',
        phone: '123456789',
        specialization: 'Hardware',
        availability: true,
      };

      mockRepository.findOne.mockResolvedValue(technician);
      mockRepository.remove.mockResolvedValue(technician);

      await service.remove(technicianId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: technicianId } });
      expect(mockRepository.remove).toHaveBeenCalledWith(technician);
    });
  });
});
