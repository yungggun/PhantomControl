import { Client } from "./clients";

export interface FileExplorers {
  id?: number;
  hwid: string;
  name: string;
  userId?: number;
  createdAt?: Date;
  updatedAt?: Date;

  client?: Client;
}

export interface FileTree {
  name: string;
  type: "file" | "folder";
}

export type FileExplorer = FileExplorers;
