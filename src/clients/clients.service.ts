import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    const user = await this.userRepository.findOne({ where: { id: createClientDto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const client = this.clientRepository.create({
      name: createClientDto.name,
      company: createClientDto.company,
      contactEmail: createClientDto.contactEmail,
      user,
    });

    return this.clientRepository.save(client);
  }

  findAll(): Promise<Client[]> {
    return this.clientRepository.find({ relations: ['user', 'tickets'] });
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne({ 
      where: { id },
      relations: ['user', 'tickets'],
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto): Promise<Client> {
    const client = await this.findOne(id);
    Object.assign(client, updateClientDto);
    return this.clientRepository.save(client);
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    await this.clientRepository.remove(client);
  }
}
