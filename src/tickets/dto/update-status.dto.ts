import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '../entities/ticket.entity';

export class UpdateStatusDto {
  @ApiProperty({
    enum: TicketStatus,
    description: 'Nuevo estado del ticket',
    example: TicketStatus.IN_PROGRESS,
  })
  @IsEnum(TicketStatus)
  status: TicketStatus;
}



