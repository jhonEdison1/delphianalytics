import { Injectable } from '@nestjs/common';
import { CreateFichaDto } from './dto/create-ficha.dto';
import { UpdateFichaDto } from './dto/update-ficha.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ficha } from './entities/ficha.entity';
import { Repository } from 'typeorm';
import { handleDbError } from 'src/utils/error.message';
import {CsvConverter} from 'src/utils/csv.converter';
import { Subtitulo } from '../subtitulos/entities/subtitulo.entity';
import { Tag } from '../tags/entities/tag.entity';



@Injectable()
export class FichasService {

  constructor(
    @InjectRepository(Ficha) private fichaRepository: Repository<Ficha>,
    @InjectRepository(Subtitulo) private subtituloRepository: Repository<Subtitulo>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
  ) { }


  async procesarArchivo(fileBuffer: Buffer) {
    try {
      
      const csvString = fileBuffer.toString('utf-8');
      const jsonData = await CsvConverter(csvString);
      //return jsonData;

      const entidadesFichas  = jsonData.map((ficha) => {
        
        const nuevaFicha = new Ficha();
        nuevaFicha.clavePrincipal = ficha.ClavePrincipal;
        nuevaFicha.nombreArchivo = ficha['Nombre del Archivo'];
        nuevaFicha.codigoArchivo = ficha['Código del Archivo']; 
        nuevaFicha.id_programa = ficha['ID Programa'];     
        nuevaFicha.error = ficha.Error;
        nuevaFicha.referencia = ficha.Referencia;       
        nuevaFicha.fechaRealizacion = ficha['Fecha de Realización'];
        nuevaFicha.fechaEmision = ficha['Fecha de Emisión'];
        nuevaFicha.casaProductora = ficha['Casa Productora'];
        nuevaFicha.formato = ficha.Formato;
        nuevaFicha.tipoArchivoRecibido = ficha['Tipo de Archivo Recibido'];
        nuevaFicha.tipoArchivoGuardado = ficha['Tipo de Archivo Guardado'];
        nuevaFicha.soporteFisicoGrabacion = ficha['Soporte Fisico de Grabación'];
        nuevaFicha.resolucion = ficha.Resolución;
        nuevaFicha.tasaRecuadro = ficha['Tasa de Recuadro'];
        nuevaFicha.codecVideo = ficha['Codec Video'];
        nuevaFicha.codecAudio = ficha['Codec Audio'];
        nuevaFicha.canalesAudio = ficha['Canales de Audio'];
        nuevaFicha.tasaMuestra = ficha['Tasa de Muestra'];
        nuevaFicha.bitsPorMuestra = ficha['Bits Por Muestra'];
        nuevaFicha.sistemaAcceso = ficha['Sistema de Acceso'];        
        nuevaFicha.duracion = ficha.Duración;
        nuevaFicha.sinopsis = ficha.Sinopsis;
        nuevaFicha.observaciones = ficha.Observaciones;
        nuevaFicha.copyright = ficha['Copyright​'];              
        return nuevaFicha;
      });
//
      await this.fichaRepository.save(entidadesFichas);
      return { message: 'Archivo procesado correctamente' }



    } catch (error) {
      console.log(error)
      const message = handleDbError(error)
      return { message }


    }

  }

  async getFichasPaginated(page: number, limit: number) {
      
      const [fichas, total] = await this.fichaRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit
      });
  
      return {
        data: fichas,
        total
      };


  }


  async findOne(id: string, page: number, limit: number) {

    const ficha = await this.fichaRepository.findOne({ where: { clavePrincipal: id} });

    const [subtitulos, totalSubtitulos] = (await this.subtituloRepository.findAndCount({ 
      where: { ficha: ficha },
      order: {
        linea: "ASC"
      }, 
      skip: (page - 1) * limit,
      take: limit
     }))

     const [tags, totalTags] = (await this.tagRepository.findAndCount({
      where: { ficha: ficha }
     }))

    return {
      ficha,
      subtitulos,
      totalSubtitulos,
      tags,
      totalTags
    };
    

  }
  






}
