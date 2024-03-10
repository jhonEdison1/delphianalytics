import { Module } from '@nestjs/common';
import { SoundtracksService } from './soundtracks.service';
import { SoundtracksController } from './soundtracks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Soundtrack } from './entities/soundtrack.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Soundtrack]),
  ],
  controllers: [SoundtracksController],
  providers: [SoundtracksService],
})
export class SoundtracksModule {}
