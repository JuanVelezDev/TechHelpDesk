// src/tickets/tickets.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket } from './entities/ticket.entity';
import { ClientsModule } from '../clients/clients.module';
import { TechniciansModule } from 'src/technicians/technician.module';
import { CategoriesModule } from 'src/categories/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    JwtModule,
    ClientsModule,
    TechniciansModule,
    CategoriesModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}
