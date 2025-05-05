import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtGuard } from 'src/guard/jwt.guard';
import { Role } from '@prisma/client';

@Controller('payment')
@UseGuards(JwtGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-checkout-session')
  async createCheckoutSession(
    @Request() request,
    @Query('plan') planName: string,
  ) {
    if (!planName || (planName !== Role.PREMIUM && planName !== Role.VIP))
      throw new BadRequestException('A valid plan is required');

    return this.paymentService.createCheckoutSession(request, planName as Role);
  }

  @Get('session-status')
  async getSessionStatus(
    @Request() request,
    @Query('session_id') sessionId: string,
  ) {
    if (!sessionId) throw new BadRequestException('Session ID is required');

    return this.paymentService.getSessionStatus(sessionId, request.user.sub.id);
  }

  @Get('invoices')
  async getAllInvoices(@Request() request) {
    return this.paymentService.getAllInvoices(request.user.sub.id);
  }

  @Get('subscription')
  async getCurrentSubscription(@Request() request) {
    return this.paymentService.getCurrentSubscription(request.user.sub.id);
  }

  @Post('cancel-subscription')
  async cancelSubscription(@Request() request) {
    return this.paymentService.cancelSubscription(request.user.sub.id);
  }

  @Post('update-subscription')
  async updateSubscription(
    @Request() request,
    @Query('plan') planName: string,
  ) {
    if (!planName || (planName !== Role.PREMIUM && planName !== Role.VIP))
      throw new BadRequestException('A valid plan is required');

    return this.paymentService.updateSubscription(
      request.user.sub.id,
      planName as Role,
    );
  }
}
