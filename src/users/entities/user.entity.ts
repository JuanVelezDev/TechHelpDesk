import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from 'typeorm';
import { Client } from '../../clients/entities/client.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  role: string;

  // Relación con un cliente
  @OneToOne(() => Client, (client) => client.user)
  client: Client;

  // Relación con tickets como técnico
  @OneToMany(() => Ticket, (ticket) => ticket.technician)
  tickets: Ticket[];
}
