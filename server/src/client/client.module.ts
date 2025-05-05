import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientGateway } from './client.gateway';

@Module({
  controllers: [ClientController],
  providers: [ClientService, JwtService, PrismaService, ClientGateway],
  exports: [ClientService],
})
export class ClientModule {}
