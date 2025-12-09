import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CategoriesService } from './category.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: Repository<Category>;

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
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get<Repository<Category>>(getRepositoryToken(Category));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear una categoría exitosamente', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Hardware',
        description: 'Hardware issues',
      };

      const createdCategory = {
        id: 'category-id',
        ...createCategoryDto,
      };

      mockRepository.create.mockReturnValue(createdCategory);
      mockRepository.save.mockResolvedValue(createdCategory);

      const result = await service.create(createCategoryDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createCategoryDto);
      expect(mockRepository.save).toHaveBeenCalledWith(createdCategory);
      expect(result).toEqual(createdCategory);
    });
  });

  describe('findAll', () => {
    it('debería retornar todas las categorías', async () => {
      const categories = [
        { id: '1', name: 'Hardware', description: 'Hardware issues' },
        { id: '2', name: 'Software', description: 'Software issues' },
      ];

      mockRepository.find.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({ relations: ['tickets'] });
      expect(result).toEqual(categories);
    });
  });

  describe('findOne', () => {
    it('debería retornar una categoría por ID', async () => {
      const categoryId = 'category-id';
      const category = {
        id: categoryId,
        name: 'Hardware',
        description: 'Hardware issues',
      };

      mockRepository.findOne.mockResolvedValue(category);

      const result = await service.findOne(categoryId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
        relations: ['tickets'],
      });
      expect(result).toEqual(category);
    });

    it('debería lanzar NotFoundException si la categoría no existe', async () => {
      const categoryId = 'non-existent-id';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(categoryId)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
        relations: ['tickets'],
      });
    });
  });

  describe('update', () => {
    it('debería actualizar una categoría exitosamente', async () => {
      const categoryId = 'category-id';
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Hardware',
      };

      const existingCategory = {
        id: categoryId,
        name: 'Hardware',
        description: 'Hardware issues',
      };

      const updatedCategory = {
        ...existingCategory,
        ...updateCategoryDto,
      };

      mockRepository.findOne.mockResolvedValue(existingCategory);
      mockRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.update(categoryId, updateCategoryDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
        relations: ['tickets'],
      });
      expect(mockRepository.save).toHaveBeenCalledWith(updatedCategory);
      expect(result).toEqual(updatedCategory);
    });
  });

  describe('remove', () => {
    it('debería eliminar una categoría exitosamente', async () => {
      const categoryId = 'category-id';
      const category = {
        id: categoryId,
        name: 'Hardware',
        description: 'Hardware issues',
      };

      mockRepository.findOne.mockResolvedValue(category);
      mockRepository.remove.mockResolvedValue(category);

      await service.remove(categoryId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryId },
        relations: ['tickets'],
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(category);
    });
  });
});
