import { Injectable } from '@nestjs/common';
import { CreateSubtituloDto } from './dto/create-subtitulo.dto';
import { UpdateSubtituloDto } from './dto/update-subtitulo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { parse } from 'csv-parse';
import { Subtitulo } from './entities/subtitulo.entity';
import { handleDbError } from 'src/utils/error.message';
import { CsvConverter } from 'src/utils/csv.converter';

@Injectable()
export class SubtitulosService {

  constructor(
    @InjectRepository(Subtitulo) private subtituloRepository: Repository<Subtitulo>
  ) { }


  async create(createSubtituloDto: CreateSubtituloDto) {
     
    const nuevoSubtitulo = new Subtitulo();
    nuevoSubtitulo.clavePrincipal = createSubtituloDto.ClavePrincipal;
    nuevoSubtitulo.id_ficha = createSubtituloDto.ID_Ficha;
    nuevoSubtitulo.linea = createSubtituloDto.Linea;
    nuevoSubtitulo.tiempo_Inicio = createSubtituloDto.Tiempo_Inicio;
    nuevoSubtitulo.tiempo_Fin = createSubtituloDto.Tiempo_Fin;
    nuevoSubtitulo.texto =  await this.escaparCaracteres(createSubtituloDto.Texto);
    nuevoSubtitulo.textoOriginal = createSubtituloDto.Texto;
    console.log(nuevoSubtitulo)   
    return await this.subtituloRepository.save(nuevoSubtitulo);

   
  }

  async procesarArchivo(fileBuffer: Buffer) {


    try {
      
      const csvString = fileBuffer.toString('utf-8');
      const jsonData = await CsvConverter(csvString);       

      const entidadesSubtitulos = await Promise.all(jsonData.map(async (subtitulo) => {
        const nuevoSubtitulo = new Subtitulo();
        nuevoSubtitulo.clavePrincipal = subtitulo.ClavePrincipal;
        nuevoSubtitulo.id_ficha = subtitulo['ID Ficha'];
        nuevoSubtitulo.linea = subtitulo['Línea'];
        nuevoSubtitulo.tiempo_Inicio = subtitulo['Tiempo Inicio'];
        nuevoSubtitulo.tiempo_Fin = subtitulo['Tiempo Fin'];
        nuevoSubtitulo.texto = await this.escaparCaracteres(subtitulo.Texto);
        nuevoSubtitulo.textoOriginal = subtitulo.Texto;
        return nuevoSubtitulo;
      }));
  
      await this.subtituloRepository.save(entidadesSubtitulos);
      return { message: 'Archivo procesado correctamente' }



    } catch (error) {
      console.log(error)
      const message = handleDbError(error)
      return { message }


    }

  }

  async escaparCaracteres(texto) {
    // Escapar caracteres problemáticos con \
    const caracteresProblematicos = /[\\'":!()*/?]/g;
    return texto.replace(caracteresProblematicos, '\\$&');
  }

  async findAll() {
    //find all and count

    const [subtitulos, total] = await this.subtituloRepository.findAndCount();

    return {
      data: subtitulos,
      total
    };
  }




}
