import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Role, Subscription } from '@prisma/client';
import { getMaxClientsByRole } from 'src/client/client.helper';
import { Action } from 'src/payment/entities/payment.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

export const handleSubscription = async (
  prisma: PrismaService,
  userId: number,
  customerId: string,
  subscriptionId: string,
  role: Role,
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new NotFoundException('User not found');

  await prisma.subscription.upsert({
    where: {
      userId: userId,
    },
    create: {
      userId: userId,
      customerId: customerId,
      subscriptionId: subscriptionId,
    },
    update: {
      customerId: customerId,
      subscriptionId: subscriptionId,
    },
  });

  await changeRole(prisma, userId, role);
};

export const changeRole = async (
  prisma: PrismaService,
  userId: number,
  role: Role,
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) throw new NotFoundException('User not found');

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role: role,
    },
  });
};

export const getPlanAndPrice = async (stripe: Stripe, planName: Role) => {
  const planId = await stripe.products.search({
    query: `name:'${planName}'`,
    expand: ['data.default_price'],
  });

  if (!planId.data.length) {
    throw new NotFoundException('Plan not found');
  }

  const product = planId.data[0];

  if (!product.default_price) {
    throw new NotFoundException('Price not found');
  }

  const priceId =
    typeof product.default_price === 'string'
      ? product.default_price
      : product.default_price.id;

  return { price: priceId };
};

export const checkForExistingCustomer = async (
  prisma: PrismaService,
  stripe: Stripe,
  userId: number,
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) return { status: false, subscription: null };

  if (user) {
    const subscription = await prisma.subscription.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!subscription) return { status: false, subscription: null };

    //Check if the user exists in Stripe
    const customer = await stripe.customers
      .retrieve(subscription.customerId)
      .catch(() => {
        throw new ConflictException(
          'There was an error while fetching customer',
        );
      });

    if (!customer || customer.deleted) {
      await prisma.subscription
        .delete({
          where: {
            userId: userId,
          },
        })
        .catch((error) => {
          if (error.code !== 'P2025') {
            throw new ConflictException(
              'There was an error while deleting subscription',
            );
          }
        });

      return { status: false, subscription: null };
    }

    return { status: true, subscription: subscription };
  }
};

export const checkForExistingSubscription = async (
  stripe: Stripe,
  customer: { status: boolean; subscription: Subscription },
) => {
  if (customer.status) {
    const subscription = await stripe.subscriptions
      .retrieve(customer.subscription.subscriptionId)
      .catch(() => null);

    if (
      subscription &&
      (subscription.status === 'active' || subscription.status === 'trialing')
    ) {
      throw new ForbiddenException(
        'You already have an active subscription. Please cancel it before subscribing to a new plan.',
      );
    }
  }
};

export const restClientList = async (
  prisma: PrismaService,
  userId: number,
  action: Action,
) => {
  if (action === 'CANCEL') {
    const oldestClient = await prisma.client.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    if (!oldestClient) return;

    await prisma.client.deleteMany({
      where: {
        userId: userId,
        id: { not: oldestClient.id },
      },
    });
  } else {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const maxClients = getMaxClientsByRole(user.role);

    const userClients = await prisma.client.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'asc' },
    });

    if (userClients.length <= maxClients) return;

    const clientsToDelete = userClients.length - maxClients;

    const clientsToDeleteIds = userClients
      .slice(-clientsToDelete)
      .map((client) => client.id);

    await prisma.client.deleteMany({
      where: {
        id: { in: clientsToDeleteIds },
      },
    });
  }
};
