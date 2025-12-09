import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'Juanes Updated', description: 'Nombre actualizado del usuario' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'nuevoemail@example.com', description: 'Correo electrónico actualizado' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'newPassword123', description: 'Contraseña actualizada' })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ example: 'user', description: 'Rol actualizado del usuario' })
  @IsString()
  @IsOptional()
  role?: string;
}
