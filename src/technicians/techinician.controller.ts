import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TechniciansService } from 'src/technicians/technician.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Technicians')
@Controller('technicians')
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new technician' })
  @ApiResponse({ status: 201, description: 'The technician has been successfully created.' })
  async create(@Body() dto: CreateTechnicianDto) {
    return this.techniciansService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all technicians' })
  @ApiResponse({ status: 200, description: 'List of all technicians.' })
  async findAll() {
    return this.techniciansService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get technician by ID' })
  @ApiResponse({ status: 200, description: 'Technician details.' })
  @ApiResponse({ status: 404, description: 'Technician not found.' })
  async findOne(@Param('id') id: string) {
    return this.techniciansService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update technician by ID' })
  @ApiResponse({ status: 200, description: 'Technician updated successfully.' })
  async update(@Param('id') id: string, @Body() dto: UpdateTechnicianDto) {
    return this.techniciansService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete technician by ID' })
  @ApiResponse({ status: 200, description: 'Technician deleted successfully.' })
  async remove(@Param('id') id: string) {
    return this.techniciansService.remove(id);
  }
}
