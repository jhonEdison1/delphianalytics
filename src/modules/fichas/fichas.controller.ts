import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FichasService } from './fichas.service';
import { CreateFichaDto } from './dto/create-ficha.dto';
import { UpdateFichaDto } from './dto/update-ficha.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FiltersPaginatedQuery } from 'src/common/filtersPaginatedQuery';

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

  
}
