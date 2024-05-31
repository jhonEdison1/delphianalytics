import { Module } from '@nestjs/common';
import { ProgramasService } from './programas.service';
import { ProgramasController } from './programas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Programa } from './entities/programa.entity';
import { Ficha } from '../fichas/entities/ficha.entity';
import { Subtitulo } from '../subtitulos/entities/subtitulo.entity';
import { Credito } from '../creditos/entities/credito.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Programa, Ficha, Subtitulo, Credito]),
  ],
  controllers: [ProgramasController],
  providers: [ProgramasService],
  exports: [ProgramasService]
})
export class ProgramasModule {}
