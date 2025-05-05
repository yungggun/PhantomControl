export enum Role {
  ADMIN = "ADMIN",
  VIP = "VIP",
  PREMIUM = "PREMIUM",
  USER = "USER",
}

export interface User {
  id?: number;
  email?: string;
  username?: string;
  password?: string;
  role?: Role;
  createdAt?: Date;
  updatedAt?: Date;
}
