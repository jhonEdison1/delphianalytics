import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { SubtitulosService } from './subtitulos.service';
import { CreateSubtituloDto } from './dto/create-subtitulo.dto';
import { UpdateSubtituloDto } from './dto/update-subtitulo.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestDTO } from '../programas/dto/filtrosReq';

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

  @Get('/subirSubtitulos')
  async subirSubtitulos(
    @Query('idFicha') idFicha: string,
    @Query('idSesion') idSesion: string
  ) {
    return await this.subtitulosService.subirSubtitulos(idFicha, idSesion);
  }

  @Get('/findAll')
  async findAll() {
    return await this.subtitulosService.findAll();
  }

  @Delete('/deleteAll')
  async deleteAll() {
    return await this.subtitulosService.eliminarSubtitulos();
  }

  @Post('/por-codigo')
  async subirImagen(
    @Body() request: RequestDTO
  ) {      
    return await this.subtitulosService.getSubtituloPorCodigoArchivo(request);

  }

  @Get('/por-n-caracteres/:nCaracteres')
  async getSubNCaracteres(
    @Param('nCaracteres') id: string
  ) {      
    return await this.subtitulosService.getAllSubtitulosWithMorethanNCaracters(id);

  }

  @Get('/duplicados')
  async getDuplicadosPorTexto(
  ) {      
    return await this.subtitulosService.getSubtitulosRepetidosPorTextoOriginal();

  }

  @Get('/subtitulosUnidos')
  async getSubtitulosUnidos(
    @Query('idFicha') idFicha: string
  ) {      
    return await this.subtitulosService.getSubtitulosPorFichaUnidos(idFicha);
  }

  @Post('/traducir/:id')
  async traducirSubtitulosFicha(
    @Param('id') id: string,
    @Body('idioma') idioma: string
  ) {      
    return await this.subtitulosService.traducirSubtitulosFicha(id, idioma);
  }

  @Post('/traducirData')
  async traducirData(
    @Body('data') data: any,
    @Body('idioma') idioma: string
  ){
    return await this.subtitulosService.traducirData(data, idioma);
  }
}
