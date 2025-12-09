import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTechnicianDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  specialization: string;
}
