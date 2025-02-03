import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query, UseGuards, Request } from '@nestjs/common';
import { ProgramasService } from './programas.service';
import { CreateProgramaDto } from './dto/create-programa.dto';
import { UpdateProgramaDto } from './dto/update-programa.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { FiltersPaginatedQuery } from 'src/common/filtersPaginatedQuery';
import { FiltrosProgramaDto } from './dto/filtros-programa-dto';
import { RequestDTO } from './dto/filtrosReq';
import { RolesGuard } from '../iam/guards/roles.guard';
import { JwtAuthAccessGuard } from '../iam/guards/jwt-auth.guard';
import { Roles } from '../iam/decorators';
import { Role } from '../iam/models/roles.model';

@ApiTags('programas')
@Controller('programas')
export class ProgramasController {
  constructor(
    private readonly programasService: ProgramasService
  ) { }

  //create programa
  @Post()
  async create(@Body() createProgramaDto: CreateProgramaDto) {
    return this.programasService.create(createProgramaDto);
  }

  @Post('/subir-archivo')
  @UseInterceptors(FileInterceptor('archivo'))
  async subirArchivo(@UploadedFile() archivo: Express.Multer.File) {
    // Procesar el archivo y enviarlo al servicio de Ficha
    const fileBuffer = archivo.buffer;
    return await this.programasService.procesarArchivo(fileBuffer);

  }

  //obtener programas paginados
  @Get('/paginados')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthAccessGuard, RolesGuard)
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  @ApiQuery({ name: 'orden', type: String, required: false })
  async getProgramasPaginadas(
    @Query() query: FiltersPaginatedQuery,
    @Request() req: any
  ) {
    return this.programasService.getProgramasPaginated(req.user, query.page, query.limit, query.orden);
  }

  @Get('/oneById/:id')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthAccessGuard, RolesGuard)
  async findOne(
    @Param('id') id: string,
    @Request() req: any

  ) {
    return this.programasService.findOne(req.user, id);
  }

  @Post('/fichasByProgramaYAnio/:id/:anio')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthAccessGuard, RolesGuard)
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  @ApiQuery({ name: 'orden', type: String, required: false })
  @ApiQuery({ name: 'criterioOrden', type: String, required: false})
  async getFichaByProgramaYAnio(
    @Param('id') id: string, @Param('anio') anio: string, @Query() query: FiltersPaginatedQuery,  @Body() request: RequestDTO,
    @Request() req: any
  ){
    const { palabraClave } = request;
    return this.programasService.findFichasByProgramaAndYearNew(req.user, id, anio, query.page, query.limit, query.orden, query.criterioOrden, palabraClave);
  }


  @Post('/filtros')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthAccessGuard, RolesGuard)
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  async getProgramasFiltrados(
    @Query() query: FiltersPaginatedQuery,
    @Body() filtros: FiltrosProgramaDto,
    @Request() req: any
  ) {
    return this.programasService.findByFiltros(req.user, filtros, query.page, query.limit);
  }

  @Post('buscar')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthAccessGuard, RolesGuard)
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  async buscar(
    @Query() query: FiltersPaginatedQuery,
    @Body() request: RequestDTO,
    @Request() req: any
  ) {
    const { programaFiltros, fichaFiltros, palabraClave, ids } = request;
    return this.programasService.buscarConFiltrosNew(req.user, programaFiltros, fichaFiltros, palabraClave, query.page, query.limit, ids);
  }

  @Post('buscar/:id')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthAccessGuard, RolesGuard)
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  async buscarPorPrograma(
    @Param('id') id: string,
    @Query() query: FiltersPaginatedQuery,
    @Body() request: RequestDTO,
    @Request() req: any
  ) {
    const {  fichaFiltros, palabraClave } = request;
    return this.programasService.buscarFichasConFiltrosNew(req.user, id,  fichaFiltros, palabraClave, query.page, query.limit);
  }


  @Post('/subir-imagen/:id')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthAccessGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('archivo'))
  async subirImagen(
    @UploadedFile() archivo: Express.Multer.File,
    @Param('id') id: string,
    @Request() req: any
  ) {      
    return await this.programasService.subirImagen(req.user, archivo, id);

  }






}
