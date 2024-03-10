import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import config from './config';
import { IamModule } from './modules/iam/iam.module';
import { FichasModule } from './modules/fichas/fichas.module';
import { SubtitulosModule } from './modules/subtitulos/subtitulos.module';
import { ProgramasModule } from './modules/programas/programas.module';
import { TagsModule } from './modules/tags/tags.module';
import { PietajesModule } from './modules/pietajes/pietajes.module';
import { SoundtracksModule } from './modules/soundtracks/soundtracks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    DatabaseModule,
    UsuariosModule,
    IamModule,
    FichasModule,
    SubtitulosModule,
    ProgramasModule,
    TagsModule,
    PietajesModule,
    SoundtracksModule  
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
