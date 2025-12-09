import { IsString, IsNotEmpty, IsEmail, IsUUID } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @IsUUID()
  userId: string; 
}
