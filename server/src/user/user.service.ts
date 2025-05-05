import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET } from 'src/lib/constants';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async createUser(dto: CreateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (user)
      throw new ConflictException('There is already a user with this email');

    const newUser = await this.prisma.user.create({
      data: {
        ...dto,
        password: await hash(dto.password, 12),
        clientKey: { create: { key: crypto.randomUUID() } },
      },
    });

    const { password, ...result } = newUser;

    return result;
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  async findUserById(id: number) {
    return await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
  }

  async findUserByClientKey(clientKey: string) {
    const key = await this.prisma.clientKey.findUnique({
      where: {
        key: clientKey,
      },
    });

    if (!key) throw new ConflictException('Client key not found');

    const user = await this.prisma.user.findUnique({
      where: {
        id: key.userId,
      },
    });

    const { password, ...result } = user;

    return result;
  }

  async getUserDataFromToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: JWT_SECRET,
      });
      const userEmail = decoded.email;

      const user = await this.findUserByEmail(userEmail);

      if (!user) throw new ConflictException('User not found');

      const { password, ...result } = user;

      return result;
    } catch (error) {
      throw new ConflictException('Invalid token');
    }
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: id },
    });

    if (!existingUser) throw new NotFoundException('User not found');

    const newUser = await this.prisma.user.update({
      where: { id: id },
      data: { username: dto.username },
    });

    const { password, ...result } = newUser;

    return result;
  }

  async deleteUser(id: number) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: id },
    });

    if (!existingUser) throw new NotFoundException('User not found');

    const newUser = await this.prisma.user.delete({
      where: { id: id },
    });

    const { password, ...result } = newUser;

    return result;
  }

  async getClientKey(id: number) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: id },
    });

    if (!existingUser) throw new NotFoundException('User not found');

    const key = await this.prisma.clientKey.findUnique({
      where: { userId: id },
    });

    return key;
  }

  async resetClientKey(id: number) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: id },
    });

    if (!existingUser) throw new NotFoundException('User not found');

    return await this.prisma.clientKey.update({
      where: { userId: id },
      data: { key: crypto.randomUUID() },
    });
  }
}
