import { Module } from '@nestjs/common';
import { SubtitulosService } from './subtitulos.service';
import { SubtitulosController } from './subtitulos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subtitulo } from './entities/subtitulo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subtitulo])
  ],
  controllers: [SubtitulosController],
  providers: [SubtitulosService],
})
export class SubtitulosModule {}
