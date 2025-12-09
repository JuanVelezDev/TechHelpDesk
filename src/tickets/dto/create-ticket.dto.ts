import { IsNotEmpty, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { TicketStatus, TicketPriority } from '../entities/ticket.entity';

export class CreateTicketDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsUUID()
  clientId: string;

  @IsOptional()
  @IsUUID()
  technicianId?: string;

  @IsUUID()
  categoryId: string;
}
