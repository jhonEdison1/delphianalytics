import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FichasService } from './fichas.service';
import { CreateFichaDto } from './dto/create-ficha.dto';
import { UpdateFichaDto } from './dto/update-ficha.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FiltersPaginatedQuery } from 'src/common/filtersPaginatedQuery';
import { RequestDTO } from '../programas/dto/filtrosReq';

@ApiTags('fichas')
@Controller('fichas')
export class FichasController {
  constructor(private readonly fichasService: FichasService) {}

  @Post('/subir-archivo')
  @UseInterceptors(FileInterceptor('archivo'))
  async subirArchivo(@UploadedFile() archivo:  Express.Multer.File) {
    // Procesar el archivo y enviarlo al servicio de Ficha
    const fileBuffer = archivo.buffer;
    return await this.fichasService.procesarArchivo(fileBuffer);   
  }

  @Post('/subirSinopsis')
  @UseInterceptors(FileInterceptor('archivo'))
  async subirSinopsis(@UploadedFile() archivo:  Express.Multer.File) {  
    const fileBuffer = archivo.buffer;
    return await this.fichasService.subirSinopsisArchivo(fileBuffer);   
  }

  @Post('/actualizarSinopsis')
  async actualizarSinopsis(@Body() body: any) {
    return await this.fichasService.actualizarSinopsis(body);
  }


  @Get('/paginadas')
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  async getProgramasPaginadas(
    @Query() query: FiltersPaginatedQuery,
  ) {
    return this.fichasService.getFichasPaginated(query.page, query.limit);
  }

  @Get('/oneById/:id')
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  async findOne(
    @Param('id') id: string,
    @Query() query: FiltersPaginatedQuery
    ) {
    return this.fichasService.findOne(id, query.page, query.limit);
  }

  @Post('/buscar/:id')
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  async buscar(
    @Param('id') id: string,
    @Body() request: RequestDTO,
    @Query() query: FiltersPaginatedQuery
    ) {
    return this.fichasService.buscarPalabraEnFicha(id, request.palabraClave, query.page, query.limit);
  }

  @Get('/subtitulos/:id')
  async getSubtitulos(
    @Param('id') id: string
    ) {
    return this.fichasService.getSubtitulos(id);
  }

  @Get('/creditos/:id')
  async getCreditos(
    @Param('id') id: string
    ) {
    return this.fichasService.getCreditos(id);
  }
  
  // @Get('/all/:id')
  // async getTags(
  //   @Param('id') id: string
  //   ) {
  //   return this.fichasService.getAllfichas(id);
  // }

  @Get('/allNosubs/:id')
  async getFichasNoSubtitulos(
    @Param('id') id: string
  ) {
    return this.fichasService.getAllfichasNoSubtitulos(id);
  }


  @Get('all-fichas-data')
  async getAllFichasData() {
    return this.fichasService.getAllFichasData();
  }
}
