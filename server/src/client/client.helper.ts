import { Role } from '@prisma/client';

export const getMaxClientsByRole = (role: Role): number => {
  switch (role) {
    case Role.PREMIUM:
      return 20;
    case Role.VIP:
      return 50;
    case Role.USER:
    default:
      return 1;
  }
};
