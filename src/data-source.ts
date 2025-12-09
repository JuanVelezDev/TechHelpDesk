import { DataSource } from 'typeorm';
import { Client } from './clients/entities/client.entity';
import { Technician } from './technicians/entities/technician.entity';
import { Ticket } from './tickets/entities/ticket.entity';
import { Category } from './categories/entities/category.entity';


export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, 
  logging: true,       
  entities: [Client, Technician, Ticket, Category], 
  migrations: ['src/migrations/*.ts'],  
  subscribers: [],
  extra: {
    
    connectionTimeoutMillis: 5000, 
    idleInTransactionSessionTimeout: 10000,  
  },
});
