import { Client } from "./clients";

export interface Consoles {
  id?: number;
  hwid: string;
  name: string;
  userId?: number;
  createdAt?: Date;
  updatedAt?: Date;

  client?: Client;
}

export type Console = Consoles;
