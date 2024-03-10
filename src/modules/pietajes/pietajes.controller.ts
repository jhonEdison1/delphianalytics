import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PietajesService } from './pietajes.service';
import { CreatePietajeDto } from './dto/create-pietaje.dto';
import { UpdatePietajeDto } from './dto/update-pietaje.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('pietajes')
@Controller('pietajes')
export class PietajesController {
  constructor(private readonly pietajesService: PietajesService) {}


  @Post('/subir-archivo')
  @UseInterceptors(FileInterceptor('archivo'))
  async subirArchivo(@UploadedFile() archivo:  Express.Multer.File) {
    // Procesar el archivo y enviarlo al servicio de Ficha
    const fileBuffer = archivo.buffer;
    return await this.pietajesService.procesarArchivo(fileBuffer);   
  }
  
}
