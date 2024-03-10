import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { SoundtracksService } from './soundtracks.service';
import { CreateSoundtrackDto } from './dto/create-soundtrack.dto';
import { UpdateSoundtrackDto } from './dto/update-soundtrack.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('soundtracks')
@Controller('soundtracks')
export class SoundtracksController {
  constructor(private readonly soundtracksService: SoundtracksService) {}

  @Post('/subir-archivo')
  @UseInterceptors(FileInterceptor('archivo'))
  async subirArchivo(@UploadedFile() archivo:  Express.Multer.File) {
    const fileBuffer = archivo.buffer;
    return await this.soundtracksService.procesarArchivo(fileBuffer);   
  }




 
}
