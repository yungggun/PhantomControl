export interface Clients {
  id?: number;
  username?: string;
  hostname?: string;
  hwid?: string;
  ip?: string;
  os?: string;
  online?: boolean;
  userId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type Client = Clients;
