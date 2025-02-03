import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query, UseGuards, Request } from '@nestjs/common';
import { FichasService } from './fichas.service';
import { CreateFichaDto } from './dto/create-ficha.dto';
import { UpdateFichaDto } from './dto/update-ficha.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FiltersPaginatedQuery } from 'src/common/filtersPaginatedQuery';
import { RequestDTO } from '../programas/dto/filtrosReq';
import { Roles } from '../iam/decorators';
import { JwtAuthAccessGuard } from '../iam/guards/jwt-auth.guard';
import { RolesGuard } from '../iam/guards/roles.guard';
import { Role } from '../iam/models/roles.model';

@ApiTags('fichas')
@Controller('fichas')
export class FichasController {
  constructor(private readonly fichasService: FichasService) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthAccessGuard, RolesGuard)
  async create(@Body() createFichaDto: CreateFichaDto) {
    return this.fichasService.create(createFichaDto);
  }

  @Post('/subir-archivo')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthAccessGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('archivo'))
  async subirArchivo(@UploadedFile() archivo:  Express.Multer.File) {
    // Procesar el archivo y enviarlo al servicio de Ficha
    const fileBuffer = archivo.buffer;
    return await this.fichasService.procesarArchivo(fileBuffer);   
  }

  @Post('/subirSinopsis')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthAccessGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('archivo'))
  async subirSinopsis(@UploadedFile() archivo:  Express.Multer.File) {  
    const fileBuffer = archivo.buffer;
    return await this.fichasService.subirSinopsisArchivo(fileBuffer);   
  }

  @Post('/actualizarSinopsis')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthAccessGuard, RolesGuard)
  async actualizarSinopsis(@Body() body: any) {
    return await this.fichasService.actualizarSinopsis(body);
  }


  @Get('/paginadas')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthAccessGuard, RolesGuard)
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  async getProgramasPaginadas(
    @Query() query: FiltersPaginatedQuery,
    @Request() req: any
  ) {
    return this.fichasService.getFichasPaginated(req.user, query.page, query.limit);
  }

  @Get('/oneById/:id')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthAccessGuard, RolesGuard)
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  async findOne(
    @Param('id') id: string,
    @Query() query: FiltersPaginatedQuery,
    @Request() req: any
    ) {
    return this.fichasService.findOne(req.user, id, query.page, query.limit);
  }

  @Post('/buscar/:id')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthAccessGuard, RolesGuard)
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'limit', type: Number, required: true })
  async buscar(
    @Param('id') id: string,
    @Body() request: RequestDTO,
    @Query() query: FiltersPaginatedQuery,
    @Request() req: any
    ) {
    return this.fichasService.buscarPalabraEnFicha(req.user, id, request.palabraClave, query.page, query.limit);
  }

  @Get('/subtitulos/:id')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthAccessGuard, RolesGuard)
  async getSubtitulos(
    @Param('id') id: string,
    @Request() req: any
    ) {
    return this.fichasService.getSubtitulos(req.user, id);
  }

  @Get('/creditos/:id')
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(JwtAuthAccessGuard, RolesGuard)
  async getCreditos(
    @Param('id') id: string,
    @Request() req: any
    ) {
    return this.fichasService.getCreditos(req.user, id);
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
