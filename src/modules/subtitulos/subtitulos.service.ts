import { Injectable } from '@nestjs/common';
import { CreateSubtituloDto } from './dto/create-subtitulo.dto';
import { UpdateSubtituloDto } from './dto/update-subtitulo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { parse } from 'csv-parse';
import { Subtitulo } from './entities/subtitulo.entity';
import { handleDbError } from 'src/utils/error.message';

@Injectable()
export class SubtitulosService {

  constructor(
    @InjectRepository(Subtitulo) private subtituloRepository: Repository<Subtitulo>
  ) { }


  async create(createSubtituloDto: CreateSubtituloDto) {
     
    const nuevoSubtitulo = new Subtitulo();
    nuevoSubtitulo.ClavePrincipal = createSubtituloDto.ClavePrincipal;
    nuevoSubtitulo.ID_Ficha = createSubtituloDto.ID_Ficha;
    nuevoSubtitulo.Linea = createSubtituloDto.Linea;
    nuevoSubtitulo.Tiempo_Inicio = createSubtituloDto.Tiempo_Inicio;
    nuevoSubtitulo.Tiempo_Fin = createSubtituloDto.Tiempo_Fin;
    nuevoSubtitulo.Texto =  await this.escaparCaracteres(createSubtituloDto.Texto);
    nuevoSubtitulo.TextoOriginal = createSubtituloDto.Texto;
    console.log(nuevoSubtitulo)   
    return await this.subtituloRepository.save(nuevoSubtitulo);

   
  }

  async procesarArchivo(fileBuffer: Buffer) {


    try {
      
      const csvString = fileBuffer.toString('utf-8');
      const jsonData = await this.parseCSVToJson(csvString);       

      const entidadesSubtitulos = await Promise.all(jsonData.map(async (subtitulo) => {
        const nuevoSubtitulo = new Subtitulo();
        nuevoSubtitulo.ClavePrincipal = subtitulo.ClavePrincipal;
        nuevoSubtitulo.ID_Ficha = subtitulo['ID Ficha'];
        nuevoSubtitulo.Linea = subtitulo['Línea'];
        nuevoSubtitulo.Tiempo_Inicio = subtitulo['Tiempo Inicio'];
        nuevoSubtitulo.Tiempo_Fin = subtitulo['Tiempo Fin'];
        nuevoSubtitulo.Texto = await this.escaparCaracteres(subtitulo.Texto);
        nuevoSubtitulo.TextoOriginal = subtitulo.Texto;
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


  private async parseCSVToJson(csvString: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      parse(csvString, {
        columns: true, // Trata la primera fila como encabezados
        skip_empty_lines: false,
      }, (err, output) => {
        if (err) {
          reject(err);
        } else {
          resolve(output);
        }
      });
    });
  }


  async escaparCaracteres(texto) {
    // Escapar caracteres problemáticos con \
    const caracteresProblematicos = /[\\'":!()*/?]/g;
    return texto.replace(caracteresProblematicos, '\\$&');
  }




}
