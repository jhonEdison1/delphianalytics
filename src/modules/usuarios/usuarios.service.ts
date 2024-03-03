import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { HashingService } from 'src/providers/hashing.service';

@Injectable()
export class UsuariosService {

  constructor(
    @InjectRepository(Usuario) private usuarioRepository: Repository<Usuario>,
    private readonly hashingService: HashingService,
  ) { }

  async onModuleInit() {
    const userCount = await this.usuarioRepository.count();
    if (userCount === 0) {
      await this.createDefaultUser();
    }
  }

  private async createDefaultUser() {
    // Crea el usuario por defecto
    const defaultUser = new Usuario();
    defaultUser.email = 'admin@admin.com';
    defaultUser.password =  await this.hashingService.hash('Abcd1234.');
    defaultUser.rol = 'admin';

    await this.usuarioRepository.save(defaultUser);
  }




}
