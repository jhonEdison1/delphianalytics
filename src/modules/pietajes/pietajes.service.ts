import { Injectable } from '@nestjs/common';
import { CreatePietajeDto } from './dto/create-pietaje.dto';
import { UpdatePietajeDto } from './dto/update-pietaje.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pietaje } from './entities/pietaje.entity';
import { Repository } from 'typeorm';
import { CsvConverter } from 'src/utils/csv.converter';
import { handleDbError } from 'src/utils/error.message';

@Injectable()
export class PietajesService {

  constructor(
    @InjectRepository(Pietaje)
    private pietajeRepository: Repository<Pietaje>
  ) {}


 

  async procesarArchivo(fileBuffer: Buffer) {
   try {
    
    const csvString = fileBuffer.toString('utf-8');
    const jsonData = await CsvConverter(csvString);  
    
   // return jsonData
    const entidadesPietajes = await Promise.all(jsonData.map(async (pietaje) => {
      const nuevoPietaje = new Pietaje();
      // nuevoPietaje.clavePrincipal = pietaje['Clave Principal'];
      nuevoPietaje.id_ficha = pietaje['ID Ficha'];
      nuevoPietaje.inicio = pietaje.Inicio;
      nuevoPietaje.fin = pietaje.Fin;
      nuevoPietaje.duracion = pietaje.Duración;
      return nuevoPietaje;
    }));
    await this.pietajeRepository.save(entidadesPietajes);
    return { message: 'Archivo procesado correctamente' }
   } catch (error) { 
    console.log(error)
    const message = handleDbError(error)
    return { message }

    
   }
  }




}
