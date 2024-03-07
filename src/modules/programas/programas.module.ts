import { Module } from '@nestjs/common';
import { ProgramasService } from './programas.service';
import { ProgramasController } from './programas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Programa } from './entities/programa.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Programa]),
  ],
  controllers: [ProgramasController],
  providers: [ProgramasService],
  exports: [ProgramasService]
})
export class ProgramasModule {}
