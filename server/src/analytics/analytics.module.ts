import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, JwtService, PrismaService, UserService],
})
export class AnalyticsModule {}
