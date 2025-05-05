export interface Client {
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

  clientKey?: string;
}
