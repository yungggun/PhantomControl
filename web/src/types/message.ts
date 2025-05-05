export interface Messages {
  id?: number;
  content?: string;
  response?: string;
  timestamp?: Date;
  consoleId?: number;
}

export type Message = Messages;
