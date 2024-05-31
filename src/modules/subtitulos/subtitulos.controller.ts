import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { SubtitulosService } from './subtitulos.service';
import { CreateSubtituloDto } from './dto/create-subtitulo.dto';
import { UpdateSubtituloDto } from './dto/update-subtitulo.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('subtitulos')
@Controller('subtitulos')
export class SubtitulosController {
  constructor(private readonly subtitulosService: SubtitulosService) {}


  @Post('/create')
  create(@Body() createSubtituloDto: CreateSubtituloDto) {
    return this.subtitulosService.create(createSubtituloDto);
  }

  @Post('/subir-archivo')
  @UseInterceptors(FileInterceptor('archivo'))
  async subirArchivo(@UploadedFile() archivo:  Express.Multer.File) {
    // Procesar el archivo y enviarlo al servicio de Ficha
    const fileBuffer = archivo.buffer;
    return await this.subtitulosService.procesarArchivo(fileBuffer);   
  }

  @Get('/findAll')
  async findAll() {
    return await this.subtitulosService.findAll();
  }

  @Delete('/deleteAll')
  async deleteAll() {
    return await this.subtitulosService.eliminarSubtitulos();
  }
}
