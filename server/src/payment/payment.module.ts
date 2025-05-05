import { DynamicModule, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({})
export class PaymentModule {
  static forRootAsync(): DynamicModule {
    return {
      module: PaymentModule,
      controllers: [PaymentController],
      imports: [ConfigModule.forRoot()],
      providers: [
        PaymentService,
        PrismaService,
        JwtService,
        {
          provide: 'STRIPE_SECRET_KEY',
          useFactory: async (configService: ConfigService) =>
            configService.get('STRIPE_SECRET_KEY'),
          inject: [ConfigService],
        },
      ],
      exports: [PaymentService],
    };
  }
}
