import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtGuard } from 'src/guard/jwt.guard';
import { Roles, RolesGuard } from 'src/guard/roles.guard';

@Controller('analytics')
@UseGuards(JwtGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('user-kpi')
  async getUserKpi(@Request() request) {
    return await this.analyticsService.getUserKpi(request.user.sub.id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get('admin-kpi')
  async getAdminKpi() {
    return await this.analyticsService.getAdminKpi();
  }

  @Get('user-used-devices')
  async getUsedDevices(@Request() request) {
    return await this.analyticsService.getUsedDevices(request.user.sub.id);
  }

  @Get('user-registered-clients')
  async getRegisteredClients(@Request() request) {
    return await this.analyticsService.getRegisteredClients(
      request.user.sub.id,
    );
  }
}
