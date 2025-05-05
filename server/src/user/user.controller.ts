import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { GetUserDataFromTokenDto, UpdateUserDto } from './dto/user.dto';
import { JwtGuard } from 'src/guard/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('token/data/:token')
  async getUserDataFromToken(@Param() dto: GetUserDataFromTokenDto) {
    return this.userService.getUserDataFromToken(dto.token);
  }

  @Get('client-key/:clientKey')
  async findUserByClientKey(@Param('clientKey') clientKey: string) {
    return this.userService.findUserByClientKey(clientKey);
  }

  @UseGuards(JwtGuard)
  @Get('client-key')
  async getClientKey(@Request() request) {
    return this.userService.getClientKey(request.user.sub.id);
  }

  @UseGuards(JwtGuard)
  @Patch('update')
  updateUser(@Request() request, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(request.user.sub.id, dto);
  }

  @UseGuards(JwtGuard)
  @Delete('delete')
  deleteUser(@Request() request) {
    return this.userService.deleteUser(request.user.sub.id);
  }

  @UseGuards(JwtGuard)
  @Post('client-key/reset')
  async resetClientKey(@Request() request) {
    return this.userService.resetClientKey(request.user.sub.id);
  }
}
