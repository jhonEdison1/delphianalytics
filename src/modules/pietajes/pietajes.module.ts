import { Module } from '@nestjs/common';
import { PietajesService } from './pietajes.service';
import { PietajesController } from './pietajes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pietaje } from './entities/pietaje.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pietaje])
  ],
  controllers: [PietajesController],
  providers: [PietajesService],
})
export class PietajesModule {}
