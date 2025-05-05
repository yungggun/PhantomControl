import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [PaymentModule.forRootAsync()],
  controllers: [AuthController],
  providers: [AuthService, UserService, PrismaService, JwtService],
})
export class AuthModule {}
