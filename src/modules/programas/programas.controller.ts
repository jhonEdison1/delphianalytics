import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { ProgramasService } from './programas.service';
import { CreateProgramaDto } from './dto/create-programa.dto';
import { UpdateProgramaDto } from './dto/update-programa.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { FiltersPaginatedQuery } from 'src/common/filtersPaginatedQuery';
import { FiltrosProgramaDto } from './dto/filtros-programa-dto';

@ApiTags('programas')
@Controller('programas')
export class ProgramasController {
  constructor(
    private readonly programasService: ProgramasService
  ) { }

  @Post('/subir-archivo')
  @UseInterceptors(FileInterceptor('archivo'))
  async subirArchivo(@UploadedFile() archivo: Express.Multer.File) {
    // Procesar el archivo y enviarlo al servicio de Ficha
    const fileBuffer = archivo.buffer;
    return await this.programasService.procesarArchivo(fileBuffer);

  }

  //obtener programas paginados

 
  @Get('/paginados')
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  async getProgramasPaginadas(
    @Query() query: FiltersPaginatedQuery,
  ) {
    return this.programasService.getProgramasPaginated(query.page, query.limit);
  }

  @Get('/oneById/:id')
  async findOne(@Param('id') id: string) {
    return this.programasService.findOne(id);
  }

  @Get('/fichasByProgramaYAnio/:id/:anio')
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  async getFichaByProgramaYAnio(@Param('id') id: string, @Param('anio') anio: string, @Query() query: FiltersPaginatedQuery ){
    return this.programasService.findFichasByProgramaAndYear(id, anio, query.page, query.limit);
  }

  @Post('/filtros')
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  async getProgramasFiltrados(
    @Query() query: FiltersPaginatedQuery,
    @Body() filtros: FiltrosProgramaDto

  ) {
    return this.programasService.findByFiltros(filtros, query.page, query.limit);
  }



}
