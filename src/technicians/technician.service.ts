import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Technician } from './entities/technician.entity';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

@Injectable()
export class TechniciansService {
  constructor(
    @InjectRepository(Technician)
    private readonly techniciansRepo: Repository<Technician>,
  ) {}

  async create(dto: CreateTechnicianDto): Promise<Technician> {
    const technician = this.techniciansRepo.create(dto);
    return this.techniciansRepo.save(technician);
  }

  findAll(): Promise<Technician[]> {
    return this.techniciansRepo.find();
  }

  async findOne(id: string): Promise<Technician> {
    const technician = await this.techniciansRepo.findOne({ where: { id } });
    if (!technician) throw new NotFoundException('Technician not found');
    return technician;
  }

  async update(id: string, dto: UpdateTechnicianDto): Promise<Technician> {
    const technician = await this.findOne(id);
    Object.assign(technician, dto);
    return this.techniciansRepo.save(technician);
  }

  async remove(id: string): Promise<void> {
    const technician = await this.findOne(id);
    await this.techniciansRepo.remove(technician);
  }
}
