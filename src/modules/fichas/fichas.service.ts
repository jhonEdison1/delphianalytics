import { Injectable } from '@nestjs/common';
import { CreateFichaDto } from './dto/create-ficha.dto';
import { UpdateFichaDto } from './dto/update-ficha.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ficha } from './entities/ficha.entity';
import { Repository } from 'typeorm';
import { handleDbError } from 'src/utils/error.message';
import { parse } from 'csv-parse';


@Injectable()
export class FichasService {

  constructor(
    @InjectRepository(Ficha) private fichaRepository: Repository<Ficha>
  ) { }


  async procesarArchivo(fileBuffer: Buffer) {


    try {
      
      const csvString = fileBuffer.toString('utf-8');
      const jsonData = await this.parseCSVToJson(csvString);
     // return jsonData;

      const entidadesFichas  = jsonData.map((ficha) => {
        console.log(ficha)
        const nuevaFicha = new Ficha();
        nuevaFicha.clavePrincipal = ficha.ClavePrincipal;
        nuevaFicha.nombreArchivo = ficha['Nombre del Archivo'];
        nuevaFicha.codigoArchivo = ficha['Código del Archivo'];
        nuevaFicha.criterio = ficha.Criterio;
        nuevaFicha.titulo = ficha.Titulo;
        nuevaFicha.error = ficha.Error;
        nuevaFicha.referencia = ficha.Referencia;
        nuevaFicha.patrimonio = ficha.Patrimonio;
        nuevaFicha.genero = ficha.Genero;
        nuevaFicha.fechaRealizacion = ficha['Fecha de Realización'];
        nuevaFicha.fechaEmision = ficha['Fecha de Emisión'];
        nuevaFicha.productora = ficha.Productora;
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
        nuevaFicha.idioma = ficha.Idioma;
        nuevaFicha.clasificacion = ficha.Clasificación;        
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




}
