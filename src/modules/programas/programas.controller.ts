import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { ProgramasService } from './programas.service';
import { CreateProgramaDto } from './dto/create-programa.dto';
import { UpdateProgramaDto } from './dto/update-programa.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { FiltersPaginatedQuery } from 'src/common/filtersPaginatedQuery';
import { FiltrosProgramaDto } from './dto/filtros-programa-dto';
import { RequestDTO } from './dto/filtrosReq';

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
  @ApiQuery({ name: 'orden', type: String, required: false })
  async getProgramasPaginadas(
    @Query() query: FiltersPaginatedQuery,
  ) {
    return this.programasService.getProgramasPaginated(query.page, query.limit, query.orden);
  }

  @Get('/oneById/:id')
  async findOne(@Param('id') id: string) {
    return this.programasService.findOne(id);
  }

  /*@Get('/fichasByProgramaYAnio/:id/:anio')
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  @ApiQuery({ name: 'orden', type: String, required: false })
  @ApiQuery({ name: 'criterioOrden', type: String, required: false})
  async getFichaByProgramaYAnio(@Param('id') id: string, @Param('anio') anio: string, @Query() query: FiltersPaginatedQuery ){
    return this.programasService.findFichasByProgramaAndYear(id, anio, query.page, query.limit, query.orden, query.criterioOrden);
  }*/

  @Post('/fichasByProgramaYAnio/:id/:anio')
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  @ApiQuery({ name: 'orden', type: String, required: false })
  @ApiQuery({ name: 'criterioOrden', type: String, required: false})
  async getFichaByProgramaYAnio(@Param('id') id: string, @Param('anio') anio: string, @Query() query: FiltersPaginatedQuery,  @Body() request: RequestDTO ){
    const { palabraClave } = request;
    return this.programasService.findFichasByProgramaAndYear(id, anio, query.page, query.limit, query.orden, query.criterioOrden, palabraClave);
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

  @Post('buscar')
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  async buscar(
    @Query() query: FiltersPaginatedQuery,
    @Body() request: RequestDTO
  ) {
    const { programaFiltros, fichaFiltros, palabraClave, ids } = request;
    return this.programasService.buscarConFiltros(programaFiltros, fichaFiltros, palabraClave, query.page, query.limit, ids);
  }

  @Post('buscar/:id')
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  async buscarPorPrograma(
    @Param('id') id: string,
    @Query() query: FiltersPaginatedQuery,
    @Body() request: RequestDTO
  ) {
    const {  fichaFiltros, palabraClave } = request;
    return this.programasService.buscarFichasConFiltros(id,  fichaFiltros, palabraClave, query.page, query.limit);
  }


  @Post('/subir-imagen/:id')
  @UseInterceptors(FileInterceptor('archivo'))
  async subirImagen(
    @UploadedFile() archivo: Express.Multer.File,
    @Param('id') id: string,
    ) {      
    return await this.programasService.subirImagen(archivo, id);

  }






}
