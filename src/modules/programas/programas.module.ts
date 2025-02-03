import { Module } from '@nestjs/common';
import { ProgramasService } from './programas.service';
import { ProgramasController } from './programas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Programa } from './entities/programa.entity';
import { Ficha } from '../fichas/entities/ficha.entity';
import { Subtitulo } from '../subtitulos/entities/subtitulo.entity';
import { Credito } from '../creditos/entities/credito.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { IamModule } from '../iam/iam.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Programa, Ficha, Subtitulo, Credito, Usuario]),
    IamModule
  ],
  controllers: [ProgramasController],
  providers: [ProgramasService],
  exports: [ProgramasService]
})
export class ProgramasModule {}
