import { Module } from '@nestjs/common';
import { FichasService } from './fichas.service';
import { FichasController } from './fichas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ficha } from './entities/ficha.entity';

@Module({
  imports: [
    // Import the TypeOrmModule to use the Ficha entity
     TypeOrmModule.forFeature([Ficha]),
  ],
  controllers: [FichasController],
  providers: [FichasService],
})
export class FichasModule {}
