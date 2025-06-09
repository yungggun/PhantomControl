import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientGateway } from './client.gateway';
import { Client } from './entities/client.entity';
import { CreateFileDto, SendCommandDto, UpdateFileDto } from './dto/client.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as fse from 'fs-extra';
import { Role } from '@prisma/client';
import { getMaxClientsByRole } from './client.helper';

@Injectable()
export class ClientService {
  constructor(
    private prisma: PrismaService,
    private clientGateway: ClientGateway,
  ) {}

  public readonly uploadPath = path.join(__dirname, '../../uploads');
  public readonly downloadPath = path.join(__dirname, '../../downloads');
  public readonly massDownloadZipName = 'download.zip';

  public async maxFileUploadSize(hwid: string): Promise<number> {
    const client = await this.prisma.client.findUnique({
      where: {
        hwid: hwid,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: {
        id: client.userId,
      },
    });

    switch (user.role) {
      case Role.PREMIUM:
        return 5 * 1024 * 1024 * 1024;
      case Role.VIP:
        return 10 * 1024 * 1024 * 1024;
      case Role.USER:
      default:
        return 2 * 1024 * 1024 * 1024;
    }
  }

  async getClientsByUserId(userId: number) {
    return this.prisma.client.findMany({
      where: {
        userId: userId,
      },
    });
  }

  async destroyConnection(hwid: string, userId: number) {
    const client = await this.prisma.client.findUnique({
      where: {
        hwid: hwid,
        userId: userId,
      },
    });

    if (!client) throw new NotFoundException('Client not found');

    return this.clientGateway.destroyConnection(client.hwid);
  }

  async restartClient(hwid: string, userId: number) {
    const client = await this.prisma.client.findUnique({
      where: {
        hwid: hwid,
        userId: userId,
      },
    });

    if (!client) throw new NotFoundException('Client not found');

    return this.clientGateway.restartClient(client.hwid);
  }

  async registerClient(data: Client) {
    const user = await this.prisma.clientKey.findUnique({
      where: {
        key: data.clientKey,
      },
      include: {
        user: {
          include: {
            clients: true,
          },
        },
      },
    });

    if (!user) return null;

    const existingClient = await this.prisma.client.findUnique({
      where: {
        hwid: data.hwid,
      },
    });

    if (!existingClient) {
      const clientCount = user.user.clients.length;
      const maxClients = getMaxClientsByRole(user.user.role);

      if (clientCount >= maxClients) return null;
    }

    const client = await this.prisma.client.upsert({
      where: {
        hwid: data.hwid,
      },
      update: {
        ip: data.ip,
        os: data.os,
        hostname: data.hostname,
        username: data.username,
        userId: user.userId,
        online: true,
      },
      create: {
        hwid: data.hwid,
        ip: data.ip,
        os: data.os,
        hostname: data.hostname,
        username: data.username,
        userId: user.userId,
        online: true,
      },
    });

    //Create the register history
    await this.prisma.clientRegisterHistory.create({
      data: {
        clientId: client.id,
      },
    });

    return client;
  }

  async updateClientStatus(hwid: string, online: boolean) {
    await this.prisma.client.update({
      where: {
        hwid: hwid,
      },
      data: {
        online: online,
      },
    });
  }

  async sendCommandToClient(
    hwid: string,
    userId: number,
    dto: SendCommandDto,
    callback: (response: string) => void,
  ) {
    const client = await this.prisma.client.findUnique({
      where: {
        hwid: hwid,
        userId: userId,
      },
    });

    if (!client) throw new NotFoundException('Client not found');

    const console = await this.getConsoleByHwid(userId, hwid);

    if (!console) throw new NotFoundException('Console not found');

    const createdMessage = await this.prisma.message.create({
      data: {
        content: dto.command,
        response: '',
        consoleId: console.id,
      },
    });

    if (!createdMessage) throw new ConflictException('Failed to save command');

    return this.clientGateway.sendCommandToClient(
      client,
      dto.command,
      async (response: string) => {
        await this.prisma.message.update({
          where: {
            id: createdMessage.id,
          },
          data: {
            response: JSON.stringify(response),
          },
        });

        callback(JSON.stringify(response));
      },
    );
  }

  async uploadFileToClient(
    hwid: string,
    userId: number,
    files: Express.Multer.File[],
    destination: string,
  ) {
    const client = await this.prisma.client.findUnique({
      where: {
        hwid: hwid,
        userId: userId,
      },
    });

    if (!client) throw new ConflictException('Client not found');

    if (!files || files.length === 0)
      throw new ConflictException('No files uploaded');
    files.forEach(async (file) => {
      if (file.size > (await this.maxFileUploadSize(client.hwid))) {
        throw new ConflictException('One or more files are too large');
      }
    });

    try {
      await fse.ensureDir(this.uploadPath);

      const uploadedFiles = [];
      const uploadResults = [];

      for (const file of files) {
        const safeFilename = path
          .basename(file.originalname)
          .replace(/[^a-zA-Z0-9._-]/g, '_');

        const filePath = path.resolve(this.uploadPath, safeFilename);
        if (!filePath.startsWith(this.uploadPath)) {
          throw new ConflictException('Invalid file path detected');
        }

        await fse.writeFile(filePath, file.buffer);
        uploadedFiles.push(safeFilename);
      }

      //Send the files to the client
      for (const filename of uploadedFiles) {
        try {
          const result = (await this.clientGateway.uploadFileToClient(
            client,
            filename,
            destination,
          )) as { message: string };
          uploadResults.push(result.message);
        } catch (error) {
          console.error('Error sending file to client:', error.message);
          uploadResults.push(`Failed to upload ${filename}: ${error.message}`);
        }
      }

      // Delete the files from the server after sending them to the client
      uploadedFiles.forEach(async (filename) => {
        const filePath = path.join(this.uploadPath, filename);
        try {
          await fs.promises.unlink(filePath);
        } catch (error) {
          console.error(`Failed to delete file ${filename}`, error);
        }
      });

      return {
        message: uploadResults.join(', '),
        filenames: uploadedFiles,
      };
    } catch (error) {
      throw new ConflictException(
        error.response.message || 'File upload failed',
      );
    }
  }

  async downloadFileFromClient(
    hwid: string,
    userId: number,
    filePath: string,
    filename: string,
  ) {
    const client = await this.prisma.client.findUnique({
      where: {
        hwid: hwid,
        userId: userId,
      },
    });

    if (!client) throw new NotFoundException('Client not found');

    return this.clientGateway.downloadFileFromClient(
      client,
      filePath,
      filename,
    );
  }

  async createFile(
    hwid: string,
    userId: number,
    filePath: string,
    dto: CreateFileDto,
  ) {
    if (dto.type !== 'file' && dto.type !== 'folder')
      throw new ConflictException('Invalid file type');

    const client = await this.prisma.client.findUnique({
      where: {
        hwid: hwid,
        userId: userId,
      },
    });

    if (!client) throw new NotFoundException('Client not found');

    if (dto.type === 'file') {
      const extension = path.extname(filePath).toLowerCase();
      const allowedExtensions = ['.txt'];
      if (extension === '' || !allowedExtensions.includes(extension)) {
        throw new ConflictException('File must have a valid extension');
      }
    }

    return this.clientGateway.createFile(
      client,
      filePath,
      dto.content,
      dto.type,
    );
  }

  async readFile(hwid: string, userId: number, filePath: string) {
    const client = await this.prisma.client.findUnique({
      where: {
        hwid: hwid,
        userId: userId,
      },
    });

    if (!client) throw new NotFoundException('Client not found');

    return this.clientGateway.readFile(client, filePath);
  }

  async updateFile(
    hwid: string,
    userId: number,
    filePath: string,
    dto: UpdateFileDto,
  ) {
    const client = await this.prisma.client.findUnique({
      where: {
        hwid: hwid,
        userId: userId,
      },
    });

    if (!client) throw new NotFoundException('Client not found');

    return this.clientGateway.updateFile(client, filePath, dto.content);
  }

  async deleteFile(hwid: string, userId: number, filePath: string) {
    const client = await this.prisma.client.findUnique({
      where: {
        hwid: hwid,
        userId: userId,
      },
    });

    if (!client) throw new NotFoundException('Client not found');

    return this.clientGateway.deleteFile(client, filePath);
  }

  async getFileTree(hwid: string, userId: number, path: string) {
    const client = await this.prisma.client.findUnique({
      where: {
        hwid: hwid,
        userId: userId,
      },
    });

    if (!client) throw new NotFoundException('Client not found');

    return this.clientGateway.getFileTree(client, path);
  }

  async createConsole(userId: number, hwid: string) {
    const existingClient = await this.prisma.client.findUnique({
      where: {
        hwid: hwid,
        userId: userId,
      },
    });

    if (!existingClient) throw new NotFoundException('Client not found');

    return this.prisma.console.upsert({
      where: {
        hwid: hwid,
      },
      update: {
        name: existingClient.username,
      },
      create: {
        name: existingClient.username,
        hwid: hwid,
        clientId: existingClient.id,
      },
    });
  }

  async getConsolesByUserId(userId: number) {
    const clients = await this.prisma.client.findMany({
      where: {
        userId: userId,
      },
    });

    if (!clients) throw new NotFoundException('Client not found');

    const consoles = [];

    for (const client of clients) {
      const console = await this.prisma.console.findUnique({
        where: {
          hwid: client.hwid,
        },
        include: {
          client: {
            select: {
              online: true,
            },
          },
        },
      });

      if (console) consoles.push(console);
    }

    return consoles;
  }

  async getConsoleByHwid(userId: number, hwid: string) {
    const client = await this.prisma.client.findUnique({
      where: {
        hwid: hwid,
        userId: userId,
      },
    });

    if (!client) throw new NotFoundException('Client not found');

    const console = await this.prisma.console.findUnique({
      where: {
        hwid: hwid,
        clientId: client.id,
      },
      include: {
        messages: true,
      },
    });

    if (!console)
      throw new NotFoundException('There is no open console for this client');

    return console;
  }

  async deleteConsole(userId: number, hwid: string) {
    const client = await this.prisma.client.findUnique({
      where: {
        hwid: hwid,
        userId: userId,
      },
    });

    if (!client) throw new NotFoundException('Console not found');

    return this.prisma.console.delete({
      where: {
        hwid: hwid,
        clientId: client.id,
      },
    });
  }

  async deleteClient(userId: number, hwid: string) {
    const client = await this.prisma.client.findUnique({
      where: {
        hwid: hwid,
        userId: userId,
      },
    });

    if (!client) throw new NotFoundException('Client not found');

    return this.prisma.client.delete({
      where: {
        hwid: hwid,
      },
    });
  }

  async createFileExplorer(userId: number, hwid: string) {
    const existingClient = await this.prisma.client.findUnique({
      where: {
        hwid: hwid,
        userId: userId,
      },
    });

    if (!existingClient) throw new NotFoundException('Client not found');

    return this.prisma.fileExplorer.upsert({
      where: {
        hwid: hwid,
      },
      update: {
        name: existingClient.username,
      },
      create: {
        name: existingClient.username,
        hwid: hwid,
        clientId: existingClient.id,
      },
    });
  }

  async getFileExplorersByUserId(userId: number) {
    const clients = await this.prisma.client.findMany({
      where: {
        userId: userId,
      },
    });

    if (!clients) throw new NotFoundException('Client not found');

    const fileExplorers = [];

    for (const client of clients) {
      const fileExplorer = await this.prisma.fileExplorer.findUnique({
        where: {
          hwid: client.hwid,
        },
        include: {
          client: {
            select: {
              online: true,
            },
          },
        },
      });

      if (fileExplorer) fileExplorers.push(fileExplorer);
    }

    return fileExplorers;
  }

  async deleteFileExplorer(userId: number, hwid: string) {
    const client = await this.prisma.client.findUnique({
      where: {
        hwid: hwid,
        userId: userId,
      },
    });

    if (!client) throw new NotFoundException('Console not found');

    return this.prisma.fileExplorer.delete({
      where: {
        hwid: hwid,
        clientId: client.id,
      },
    });
  }

  async downloadClientFile() {
    const filePath = path.join(this.downloadPath, 'PhantomController.exe');

    if (!fs.existsSync(filePath)) throw new NotFoundException('File not found');

    return fs.promises.readFile(filePath);
  }
}
