import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Ticket } from '../../tickets/entities/ticket.entity';  // Importa Ticket

@Entity('technicians')
export class Technician {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  specialization: string;

  @Column({ default: true })
  availability: boolean;

  @OneToMany(() => Ticket, (ticket) => ticket.technician)  
  tickets: Ticket[];
}
