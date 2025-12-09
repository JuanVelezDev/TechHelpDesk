import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from 'src/tickets/dto/update-ticket-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ClientsService } from '../clients/clients.service';
import { TechniciansService } from '../technicians/technician.service';
import { CategoriesService } from 'src/categories/category.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepo: Repository<Ticket>,
    private readonly clientsService: ClientsService,
    private readonly techniciansService: TechniciansService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(dto: CreateTicketDto): Promise<Ticket> {
    const client = await this.clientsService.findOne(dto.clientId);
    const category = await this.categoriesService.findOne(dto.categoryId);
    
    let technician: any = undefined;
    if (dto.technicianId) {
      technician = await this.techniciansService.findOne(dto.technicianId);
      
      // Validar que el técnico no tenga más de 5 tickets en progreso
      const ticketsInProgress = await this.ticketsRepo.count({
        where: {
          technician: { id: technician.id },
          status: TicketStatus.IN_PROGRESS,
        },
      });

      if (ticketsInProgress >= 5) {
        throw new BadRequestException(
          'El técnico ya tiene 5 tickets en progreso. No se pueden asignar más.',
        );
      }
    }

    const ticketData: DeepPartial<Ticket> = {
      title: dto.title,
      description: dto.description,
      status: dto.status ?? TicketStatus.OPEN,
      priority: dto.priority ?? TicketPriority.MEDIUM,
      client,
      category,
      technician,
    };

    const ticket = this.ticketsRepo.create(ticketData);

    return this.ticketsRepo.save(ticket);
  }

  findAll(): Promise<Ticket[]> {
    return this.ticketsRepo.find({
      relations: ['client', 'technician', 'category'],
    });
  }

  async findByClient(clientId: string): Promise<Ticket[]> {
    const client = await this.clientsService.findOne(clientId);
    return this.ticketsRepo.find({
      where: { client: { id: client.id } },
      relations: ['client', 'technician', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByTechnician(technicianId: string): Promise<Ticket[]> {
    const technician = await this.techniciansService.findOne(technicianId);
    return this.ticketsRepo.find({
      where: { technician: { id: technician.id } },
      relations: ['client', 'technician', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketsRepo.findOne({ 
      where: { id },
      relations: ['client', 'technician', 'category'],
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findOne(id);

    if (dto.clientId) ticket.client = await this.clientsService.findOne(dto.clientId);
    if (dto.categoryId) ticket.category = await this.categoriesService.findOne(dto.categoryId);
    if (dto.technicianId !== undefined) {
      ticket.technician = dto.technicianId
        ? await this.techniciansService.findOne(dto.technicianId)
        : undefined;
    }

    Object.assign(ticket, dto);
    return this.ticketsRepo.save(ticket);
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<Ticket> {
    const ticket = await this.findOne(id);
    
    // Validar secuencia de estados
    const validTransitions: Record<TicketStatus, TicketStatus[]> = {
      [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS],
      [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED],
      [TicketStatus.RESOLVED]: [TicketStatus.CLOSED],
      [TicketStatus.CLOSED]: [], // No se puede cambiar desde CLOSED
    };

    const allowedStatuses = validTransitions[ticket.status];
    
    if (!allowedStatuses.includes(dto.status)) {
      throw new BadRequestException(
        `No se puede cambiar el estado de ${ticket.status} a ${dto.status}. ` +
        `Transiciones válidas: ${allowedStatuses.join(', ')}`,
      );
    }

    // Si se asigna a IN_PROGRESS, validar que el técnico no tenga más de 5 tickets en progreso
    if (dto.status === TicketStatus.IN_PROGRESS && ticket.technician) {
      const ticketsInProgress = await this.ticketsRepo.count({
        where: {
          technician: { id: ticket.technician.id },
          status: TicketStatus.IN_PROGRESS,
        },
      });

      if (ticketsInProgress >= 5) {
        throw new BadRequestException(
          'El técnico asignado ya tiene 5 tickets en progreso. No se puede cambiar el estado.',
        );
      }
    }

    ticket.status = dto.status;
    return this.ticketsRepo.save(ticket);
  }

  async remove(id: string): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketsRepo.remove(ticket);
  }
}
