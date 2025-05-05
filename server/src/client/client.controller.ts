import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  Param,
  Body,
  Response,
  UseInterceptors,
  UploadedFiles,
  Query,
  StreamableFile,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Patch,
  Delete,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { JwtGuard } from 'src/guard/jwt.guard';
import { CreateFileDto, SendCommandDto, UpdateFileDto } from './dto/client.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('clients')
@UseGuards(JwtGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  async getClients(@Request() request) {
    return this.clientService.getClientsByUserId(request.user.sub.id);
  }

  @Post(':hwid/command')
  async sendCommand(
    @Param('hwid') hwid: string,
    @Request() request,
    @Response() response,
    @Body() dto: SendCommandDto,
  ) {
    const result = await this.clientService.sendCommandToClient(
      hwid,
      request.user.sub.id,
      dto,
      (commandResponse) => {
        const data = commandResponse;
        response.json({ output: data });
      },
    );
    return result;
  }

  @Post(':hwid/destroy')
  async destroyConnection(@Param('hwid') hwid: string, @Request() request) {
    return this.clientService.destroyConnection(hwid, request.user.sub.id);
  }

  @Post(':hwid/file/upload')
  @UseInterceptors(FilesInterceptor('file'))
  async uploadFileToClient(
    @UploadedFiles() files: Express.Multer.File[],
    @Param('hwid') hwid: string,
    @Query('filepath') destination: string,
    @Request() request,
  ) {
    if (!destination) throw new BadRequestException('Destination is required');

    return this.clientService.uploadFileToClient(
      hwid,
      request.user.sub.id,
      files,
      destination,
    );
  }

  @Get(':hwid/file/download')
  async downloadFileFromClient(
    @Param('hwid') hwid: string,
    @Query('filepath') filePath: string,
    @Query('filename') filename: string,
    @Request() request,
  ) {
    if (!filePath || !filename)
      throw new BadRequestException('File path and filename are required');

    const fileBuffer = await this.clientService.downloadFileFromClient(
      hwid,
      request.user.sub.id,
      filePath,
      filename,
    );

    try {
      const uint8Array = new Uint8Array(fileBuffer);

      const streamableFile = new StreamableFile(uint8Array, {
        disposition: 'attachment',
        type: filename === '*' ? 'application/zip' : 'application/octet-stream',
      });

      const fileToDelete =
        filename === '*' ? this.clientService.massDownloadZipName : filename;
      const filePathToDelete = path.join(
        this.clientService.downloadPath,
        fileToDelete,
      );

      if (fs.existsSync(filePathToDelete)) {
        fs.unlinkSync(filePathToDelete);
      }

      return streamableFile;
    } catch (error) {
      console.log(error);
      if (error instanceof ConflictException) {
        throw new NotFoundException(`File ${filename} not found.`);
      } else {
        throw new InternalServerErrorException('Failed to download file');
      }
    }
  }

  @Get('download')
  async downloadClientFile(@Request() request) {
    try {
      const fileBuffer = await this.clientService.downloadClientFile();
      const uint8Array = new Uint8Array(fileBuffer);

      const streamableFile = new StreamableFile(uint8Array, {
        disposition: 'attachment',
        type: 'application/octet-stream',
      });

      return streamableFile;
    } catch (error) {
      throw new ConflictException('Failed to download client file');
    }
  }

  @Post(':hwid/file/create')
  async createFile(
    @Param('hwid') hwid: string,
    @Request() request,
    @Query('filepath') filePath: string,
    @Body() dto: CreateFileDto,
  ) {
    if (!filePath) throw new BadRequestException('File path is required');

    return this.clientService.createFile(
      hwid,
      request.user.sub.id,
      filePath,
      dto,
    );
  }

  @Get(':hwid/file/read')
  async readFile(
    @Param('hwid') hwid: string,
    @Query('filepath') filePath: string,
    @Request() request,
  ) {
    if (!filePath) throw new BadRequestException('File path is required');

    return this.clientService.readFile(hwid, request.user.sub.id, filePath);
  }

  @Patch(':hwid/file/update')
  async updateFile(
    @Param('hwid') hwid: string,
    @Request() request,
    @Query('filepath') filePath: string,
    @Body() dto: UpdateFileDto,
  ) {
    if (!filePath) throw new BadRequestException('File path is required');

    return this.clientService.updateFile(
      hwid,
      request.user.sub.id,
      filePath,
      dto,
    );
  }

  @Delete(':hwid/file/delete')
  async deleteFile(
    @Param('hwid') hwid: string,
    @Request() request,
    @Query('filepath') filePath: string,
  ) {
    if (!filePath) throw new BadRequestException('File path is required');

    return this.clientService.deleteFile(hwid, request.user.sub.id, filePath);
  }

  @Get(':hwid/file/tree')
  async getFileTree(
    @Param('hwid') hwid: string,
    @Request() request,
    @Query('path') path: string,
  ) {
    if (!path) throw new BadRequestException('Path is required');

    return this.clientService.getFileTree(hwid, request.user.sub.id, path);
  }

  @Post(':hwid/console/create')
  async createConsole(@Param('hwid') hwid: string, @Request() request) {
    return this.clientService.createConsole(request.user.sub.id, hwid);
  }

  @Get('consoles')
  async getConsolesByUserId(@Request() request) {
    return this.clientService.getConsolesByUserId(request.user.sub.id);
  }

  @Get(':hwid/console')
  async getConsoleByHwid(@Param('hwid') hwid: string, @Request() request) {
    return this.clientService.getConsoleByHwid(request.user.sub.id, hwid);
  }

  @Delete(':hwid/console/delete')
  async deleteConsole(@Param('hwid') hwid: string, @Request() request) {
    return this.clientService.deleteConsole(request.user.sub.id, hwid);
  }

  @Delete(':hwid/delete')
  deleteClient(@Param('hwid') hwid: string, @Request() request) {
    return this.clientService.deleteClient(request.user.sub.id, hwid);
  }

  @Post(':hwid/file-explorer/create')
  async createFileExplorer(@Param('hwid') hwid: string, @Request() request) {
    return this.clientService.createFileExplorer(request.user.sub.id, hwid);
  }

  @Get('file-explorers')
  async getFileExplorersByUserId(@Request() request) {
    return this.clientService.getFileExplorersByUserId(request.user.sub.id);
  }

  @Delete(':hwid/file-explorer/delete')
  async deleteFileExplorer(@Param('hwid') hwid: string, @Request() request) {
    return this.clientService.deleteFileExplorer(request.user.sub.id, hwid);
  }
}
