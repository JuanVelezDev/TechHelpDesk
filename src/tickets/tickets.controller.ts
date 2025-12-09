// src/tickets/tickets.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from 'src/tickets/dto/update-ticket-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Roles } from '../common/decorators/roles.decorator';  
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../common/enums/role.enum';  


@ApiTags('tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear un nuevo ticket' })
  @ApiResponse({ status: 201, description: 'Ticket creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @Roles(Role.Client)  
  @UseGuards(RolesGuard) 
  create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar todos los tickets' })
  @ApiResponse({ status: 200, description: 'Lista de tickets' })
  @Roles(Role.Admin, Role.Technician, Role.Client)  
  @UseGuards(RolesGuard)  
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get('client/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener tickets por cliente' })
  @ApiResponse({ status: 200, description: 'Lista de tickets del cliente' })
  @Roles(Role.Admin, Role.Technician, Role.Client)  
  @UseGuards(RolesGuard)  
  findByClient(@Param('id') id: string) {
    return this.ticketsService.findByClient(id);
  }

  @Get('technician/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener tickets por técnico' })
  @ApiResponse({ status: 200, description: 'Lista de tickets del técnico' })
  @Roles(Role.Admin, Role.Technician)  
  @UseGuards(RolesGuard)  
  findByTechnician(@Param('id') id: string) {
    return this.ticketsService.findByTechnician(id);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener un ticket por ID' })
  @ApiResponse({ status: 200, description: 'Ticket encontrado' })
  @ApiResponse({ status: 404, description: 'Ticket no encontrado' })
  @Roles(Role.Admin, Role.Technician, Role.Client)  
  @UseGuards(RolesGuard)  
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar el estado de un ticket' })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Transición de estado inválida' })
  @Roles(Role.Admin, Role.Technician)  
  @UseGuards(RolesGuard)  
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.ticketsService.updateStatus(id, dto);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar un ticket' })
  @ApiResponse({ status: 200, description: 'Ticket actualizado exitosamente' })
  @Roles(Role.Admin, Role.Technician)  
  @UseGuards(RolesGuard)  
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketsService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar un ticket' })
  @ApiResponse({ status: 200, description: 'Ticket eliminado exitosamente' })
  @Roles(Role.Admin)  
  @UseGuards(RolesGuard)  
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
