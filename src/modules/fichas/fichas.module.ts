import { Module } from '@nestjs/common';
import { FichasService } from './fichas.service';
import { FichasController } from './fichas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ficha } from './entities/ficha.entity';
import { Subtitulo } from '../subtitulos/entities/subtitulo.entity';
import { Tag } from '../tags/entities/tag.entity';

@Module({
  imports: [
    // Import the TypeOrmModule to use the Ficha entity
     TypeOrmModule.forFeature([Ficha, Subtitulo, Tag]),
  ],
  controllers: [FichasController],
  providers: [FichasService],
})
export class FichasModule {}
