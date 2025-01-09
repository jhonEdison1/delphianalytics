import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tag } from './entities/tag.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ficha } from '../fichas/entities/ficha.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tag, Ficha])
  ],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
