import { ForbiddenException, Injectable } from '@nestjs/common';
import { endOfMonth, format, startOfMonth, subDays, subMonths } from 'date-fns';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  private lastMonthStart = startOfMonth(subMonths(new Date(), 1));
  private lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
  private currentMonthStart = startOfMonth(new Date());
  private currentMonthEnd = endOfMonth(new Date());

  async getUserKpi(userId: number) {
    const clientsCount = await this.prisma.client.count({
      where: {
        userId,
        createdAt: {
          gte: this.currentMonthStart,
          lt: this.currentMonthEnd,
        },
      },
    });

    const consolesCount = await this.prisma.console.count({
      where: {
        client: { userId },
        createdAt: {
          gte: this.currentMonthStart,
          lt: this.currentMonthEnd,
        },
      },
    });

    const fileExplorersCount = await this.prisma.fileExplorer.count({
      where: {
        client: { userId },
        createdAt: {
          gte: this.currentMonthStart,
          lt: this.currentMonthEnd,
        },
      },
    });

    const oldClientsCount = await this.prisma.client.count({
      where: {
        userId,
        createdAt: {
          gte: this.lastMonthStart,
          lt: this.lastMonthEnd,
        },
      },
    });

    const oldConsolesCount = await this.prisma.console.count({
      where: {
        client: { userId },
        createdAt: {
          gte: this.lastMonthStart,
          lt: this.lastMonthEnd,
        },
      },
    });

    const oldFileExplorersCount = await this.prisma.fileExplorer.count({
      where: {
        client: { userId },
        createdAt: {
          gte: this.lastMonthStart,
          lt: this.lastMonthEnd,
        },
      },
    });

    const getChange = (current: number, previous: number): string => {
      if (previous === 0) return current > 0 ? '100%' : '0%';
      return `${Math.round(((current - previous) / previous) * 100)}%`;
    };

    const getChangeType = (change: string): string => {
      const value = parseInt(change);
      if (value > 0) return 'positive';
      if (value < 0) return 'negative';
      return 'neutral';
    };

    return {
      clientsCount: {
        value: clientsCount,
        change: getChange(clientsCount, oldClientsCount),
        changeType: getChangeType(getChange(clientsCount, oldClientsCount)),
      },
      consolesCount: {
        value: consolesCount,
        change: getChange(consolesCount, oldConsolesCount),
        changeType: getChangeType(getChange(consolesCount, oldConsolesCount)),
      },
      fileExplorersCount: {
        value: fileExplorersCount,
        change: getChange(fileExplorersCount, oldFileExplorersCount),
        changeType: getChangeType(
          getChange(fileExplorersCount, oldFileExplorersCount),
        ),
      },
    };
  }

  async getAdminKpi() {
    const usersCount = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: this.currentMonthStart,
          lt: this.currentMonthEnd,
        },
      },
    });

    const clientsCount = await this.prisma.client.count({
      where: {
        createdAt: {
          gte: this.currentMonthStart,
          lt: this.currentMonthEnd,
        },
      },
    });

    const messagesCount = await this.prisma.message.count({
      where: {
        timestamp: {
          gte: this.currentMonthStart,
          lt: this.currentMonthEnd,
        },
      },
    });

    const oldUsersCount = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: this.lastMonthStart,
          lt: this.lastMonthEnd,
        },
      },
    });

    const oldClientsCount = await this.prisma.client.count({
      where: {
        createdAt: {
          gte: this.lastMonthStart,
          lt: this.lastMonthEnd,
        },
      },
    });

    const oldMessagesCount = await this.prisma.message.count({
      where: {
        timestamp: {
          gte: this.lastMonthStart,
          lt: this.lastMonthEnd,
        },
      },
    });

    const getChange = (current: number, previous: number): string => {
      if (previous === 0) return current > 0 ? '100%' : '0%';
      return `${Math.round(((current - previous) / previous) * 100)}%`;
    };

    const getChangeType = (change: string): string => {
      const value = parseInt(change);
      if (value > 0) return 'positive';
      if (value < 0) return 'negative';
      return 'neutral';
    };

    return {
      usersCount: {
        value: usersCount,
        change: getChange(usersCount, oldUsersCount),
        changeType: getChangeType(getChange(usersCount, oldUsersCount)),
      },
      clientsCount: {
        value: clientsCount,
        change: getChange(clientsCount, oldClientsCount),
        changeType: getChangeType(getChange(clientsCount, oldClientsCount)),
      },
      messagesCount: {
        value: messagesCount,
        change: getChange(messagesCount, oldMessagesCount),
        changeType: getChangeType(getChange(messagesCount, oldMessagesCount)),
      },
    };
  }

  async getUsedDevices(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role === 'USER')
      throw new ForbiddenException(
        'You are not allowed to access this resource',
      );

    const osCount = await this.prisma.client.groupBy({
      by: ['os'],
      where: {
        userId: user.role === 'ADMIN' ? undefined : userId,
      },
      _count: true,
    });

    return osCount.map((item) => {
      return {
        name: item.os,
        amount: item._count,
      };
    });
  }

  async getRegisteredClients(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role === 'USER')
      throw new ForbiddenException(
        'You are not allowed to access this resource',
      );

    const clients = await this.prisma.clientRegisterHistory.groupBy({
      by: ['registeredAt'],
      where: {
        client: {
          userId: user.role === 'ADMIN' ? undefined : userId,
        },
        registeredAt: {
          gte: this.currentMonthStart,
          lte: this.currentMonthEnd,
        },
      },
      _count: {
        id: true,
      },
    });

    const daysInMonth = Array.from(
      { length: this.currentMonthEnd.getDate() },
      (_, i) => {
        const date = new Date(this.currentMonthStart);
        date.setDate(i + 1);
        return { x: format(date, 'yyyy-MM-dd'), y: 0 };
      },
    );

    clients.forEach((entry) => {
      const dateKey = format(entry.registeredAt, 'yyyy-MM-dd');
      const index = daysInMonth.findIndex((d) => d.x === dateKey);

      if (index !== -1) {
        daysInMonth[index].y += entry._count.id;
      }
    });

    return daysInMonth;
  }
}
