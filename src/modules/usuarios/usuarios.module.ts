import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { HashingService } from 'src/providers/hashing.service';
import { BcryptService } from 'src/providers/bcrypt.service';

@Module({
  imports:[
    TypeOrmModule.forFeature([Usuario])
  ],
  controllers: [UsuariosController],
  providers: [
    {
      provide: HashingService, 
      useClass: BcryptService
      
    },
    UsuariosService
  ],
})
export class UsuariosModule {}
