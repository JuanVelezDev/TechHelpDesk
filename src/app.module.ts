import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

// Módulos
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { TechniciansModule } from './technicians/technician.module';
import { TicketsModule } from './tickets/tickets.module';
import { CategoriesModule } from './categories/category.module';

// Entidades
import { User } from './users/entities/user.entity';
import { Client } from './clients/entities/client.entity';
import { Technician } from './technicians/entities/technician.entity';
import { Ticket } from './tickets/entities/ticket.entity';
import { Category } from './categories/entities/category.entity';

@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        if (!databaseUrl) {
          throw new Error('DATABASE_URL no está configurada');
        }
        
        Logger.log('DATABASE_URL cargada correctamente', 'TypeORM');

        // Determinar si se debe usar SSL (solo para conexiones remotas)
        const isLocalConnection = databaseUrl.includes('localhost') || 
                                  databaseUrl.includes('127.0.0.1') ||
                                  databaseUrl.includes('postgres:5432') ||
                                  databaseUrl.includes('@postgres:');

        return {
          type: 'postgres',
          url: databaseUrl,
          // Solo usar SSL si no es una conexión local
          ...(isLocalConnection ? {} : { ssl: { rejectUnauthorized: false } }),
          extra: {
            max: 5,
            idleTimeoutMillis: 0,
            connectionTimeoutMillis: 2000,
          },
          autoLoadEntities: true,
        
          synchronize: false,
          logging: ['error', 'warn'],
          retryAttempts: 5,
          retryDelay: 3000,
          entities: [User, Client, Technician, Ticket, Category],
        };
      },
    }),

    // Módulos del proyecto
    AuthModule,
    UsersModule,
    ClientsModule,
    TechniciansModule,
    TicketsModule,
    CategoriesModule,

    // JWT Module
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'change_this_secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
})
export class AppModule {}
