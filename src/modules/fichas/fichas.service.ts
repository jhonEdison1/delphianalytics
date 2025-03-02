import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateFichaDto } from './dto/create-ficha.dto';
import { UpdateFichaDto } from './dto/update-ficha.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ficha } from './entities/ficha.entity';
import { Not, Repository, Like } from 'typeorm';
import { handleDbError } from 'src/utils/error.message';
import {CsvConverter} from 'src/utils/csv.converter';
import { Subtitulo } from '../subtitulos/entities/subtitulo.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Credito } from '../creditos/entities/credito.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AxiosService } from '../axios/axios.service';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { OpenaiService } from '../openai/openai.service';

@Injectable()
export class FichasService {

  constructor(
    @InjectRepository(Ficha) private fichaRepository: Repository<Ficha>,
    @InjectRepository(Subtitulo) private subtituloRepository: Repository<Subtitulo>,
    @InjectRepository(Credito) private creditoRepository: Repository<Credito>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    private readonly axiosService: AxiosService,
    private readonly openaiService: OpenaiService
  ) { }

  

  async create(createFichaDto: CreateFichaDto) {
    const ficha = this.fichaRepository.create(createFichaDto);
    try {
      await this.fichaRepository.save(ficha);
      return { message: 'Ficha creada correctamente', ficha };
    } catch (error) {
      console.log(error);
      return handleDbError(error);
    }
  }

  async procesarArchivo(fileBuffer: Buffer) {
    try {
      
      const csvString = fileBuffer.toString('utf-8');
      const jsonData = await CsvConverter(csvString);
      //return jsonData;

      const entidadesFichas  = jsonData.map((ficha) => {
        
        const nuevaFicha = new Ficha();
        // nuevaFicha.clavePrincipal = ficha.ClavePrincipal;
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

  async getFichasPaginated(usuario: Usuario, page: number, limit: number) {

      if(!usuario){
        throw new UnauthorizedException('El usuario no existe.');
      }

      const querySearch = usuario.rol === 'admin' ? {} : { programa: { usuarioId: usuario.id } }
      
      const [fichas, total] = await this.fichaRepository.findAndCount({
        where: querySearch,
        skip: (page - 1) * limit,
        take: limit
      });
  
      return {
        data: fichas,
        total
      };


  }


  async findOne(usuario: Usuario, id: string, page: number, limit: number) {

    if(!usuario){
      throw new UnauthorizedException('El usuario no existe.');
    }

    const querySearch = usuario.rol === 'admin' ? { clavePrincipal: id } : { clavePrincipal: id, programa: { usuarioId: usuario.id } }

    const ficha = await this.fichaRepository.findOne({ where: querySearch });

    if(!ficha){
      throw new NotFoundException('La ficha no ha sido encontrada.');
    }

    // const [subtitulos, totalSubtitulos] = (await this.subtituloRepository.findAndCount({ 
    //   where: { ficha: ficha },
    //   order: {
    //     linea: "ASC"
    //   }, 
    //   skip: (page - 1) * limit,
    //   take: limit
    //  }))

     const [tags, totalTags] = (await this.tagRepository.findAndCount({
      where: { ficha: ficha }
     }))

    return {
      ficha,
      // subtitulos,
      // totalSubtitulos,
      tags,
      totalTags
    };
    

  }



  async buscarPalabraEnFicha(usuario: Usuario, id: string, palabraClave:string, page:number, limit:number){

    if(!usuario){
      throw new UnauthorizedException('El usuario no existe.');
    }

    const querySearch = usuario.rol === 'admin' ? { clavePrincipal: id } : { clavePrincipal: id, programa: { usuarioId: usuario.id } }

    const ficha = await this.fichaRepository.findOne({ where: querySearch });

    if(!ficha){
      throw new NotFoundException('La ficha no ha sido encontrada.');
    }
    
    if(palabraClave !== ''){
      //delete blank spaces at the beginning and end of the string
      palabraClave = palabraClave.trim();
      const palabras = palabraClave.split(" ");
      const fraseFormateada = palabras.map(palabra => `'${palabra}'`).join(" & ");
      palabraClave = fraseFormateada;
    }

    if(palabraClave === '') {
      const [subtitulos, totalSubtitulos] = (await this.subtituloRepository.findAndCount({ 
        where: { ficha: ficha },
        order: {
          linea: "ASC"
        }, 
        skip: (page - 1) * limit,
        take: limit
       }))
  
       return {
        subtitulos,
        totalSubtitulos
      };
    }


    const [subtitulos, totalSubtitulos] = (await this.subtituloRepository.createQueryBuilder('subtitulo')
    .where("subtitulo.ficha = :ficha", { ficha: ficha.clavePrincipal })
    .andWhere('to_tsvector(subtitulo.texto::text) @@ to_tsquery(:palabraClave)', { palabraClave })
    .orderBy('subtitulo.linea', 'ASC')
    .skip((page - 1) * limit)
    .take(limit)
    .getManyAndCount())

    return {
      subtitulos,
      totalSubtitulos
    }


  }


  async getSubtitulos(usuario: Usuario, id: string) {

    if(!usuario){
      throw new UnauthorizedException('El usuario no existe.');
    }

    const querySearch = usuario.rol === 'admin' ? { clavePrincipal: id } : { clavePrincipal: id, programa: { usuarioId: usuario.id } }

    const ficha = await this.fichaRepository.findOne({ where: querySearch });

    if(!ficha){
      throw new NotFoundException('La ficha no ha sido encontrada.');
    }

    const subtitulos = await this.subtituloRepository.find({ 
      where: { ficha: ficha },
      order: {
        linea: "ASC"
      }
    })

    return subtitulos;
  }
  
  async getCreditos(usuario: Usuario, id: string) {

    if(!usuario){
      throw new UnauthorizedException('El usuario no existe.');
    }

    const querySearch = usuario.rol === 'admin' ? { clavePrincipal: id } : { clavePrincipal: id, programa: { usuarioId: usuario.id } };

    const ficha = await this.fichaRepository.findOne({ where: querySearch });

    if(!ficha){
      throw new NotFoundException('La ficha no ha sido encontrada.');
    }

    const creditos = await this.creditoRepository.find({ 
      where: { ficha: ficha }
    })

    return creditos;
  }

  async getAllfichas(id: string){

    const [fichas, totalFichas] =  await this.fichaRepository.findAndCount(
      {
        select: ['clavePrincipal', 'codigoArchivo'],
        where: { id_programa : Not(id)}
      }
    );

    return {
      fichas,
      totalFichas
    };
  }

  async getAllfichasNoSubtitulos(id: string){
      
    const [fichas, totalFichas] = await this.fichaRepository
    .createQueryBuilder("ficha")
    .leftJoin("subtitulos", "subtitulo", "ficha.clavePrincipal = subtitulo.id_ficha")
    .select(['ficha.clavePrincipal', 'ficha.codigoArchivo', 'ficha.id_programa'])
    .where("subtitulo.id_ficha IS NULL")
    .getManyAndCount();

    return {
      fichas,
      totalFichas
    };
  } 

  async subirSinopsisArchivo(fileBuffer : Buffer){

    try {
      const csvString = fileBuffer.toString('utf-8');
      const jsonData = await CsvConverter(csvString);

      const entidadesFichas  = jsonData.map(async (ficha) => {

        const fichaBD = await this.fichaRepository.findOne({ where: { clavePrincipal: ficha.ClavePrincipal} });
        if(fichaBD){
          fichaBD.sinopsis = ficha.Sinopsis;          
          await this.fichaRepository.save(fichaBD);
        }           
      }); 

      return { message: 'Archivo procesado correctamente' }
    } catch (error) {
      console.log(error)
      const message = handleDbError(error)
      return { message }      
    }
  }

  async actualizarSinopsis(request: any){
    try {
      const { idFicha, sinopsis } = request;

      const ficha = await this.fichaRepository.findOne({ where: { clavePrincipal: idFicha} });

      if(!ficha){
        return { message: 'Ficha no encontrada' }
      }

      ficha.sinopsis = sinopsis;
      await this.fichaRepository.save(ficha);

      return { message: 'Sinopsis actualizada correctamente', ficha }

    } catch (error) {
      return handleDbError(error);
    }
  }

  async getAllFichasData(){
    const [fichas, total] = await this.fichaRepository.findAndCount(
      {
        select: ['clavePrincipal', 'codigoArchivo']
      }
    );

    return {
      data: fichas,
      total
    }
  }


  // metodos calidad
  async sinscronizarCalidadFichas(dataSincronizar: any) {
    const { prefijo, idPrograma} = dataSincronizar;

    try {
      const { ok, data } = await this.axiosService.getSesiones(prefijo);
      if(ok) {
        const fichas = data.data;

        if(fichas.length === 0){
          return { message: 'No hay fichas para sincronizar' }
        }

        const fichasActualizadas = fichas.map(ficha => this.applyFichaModifications(ficha, dataSincronizar));

        const nuevasFichas = [];

        for ( const ficha of fichas ){
          const nuevaFicha = await this.crearFicha(ficha, idPrograma);

          const responseTranscription = await this.axiosService.getTranscripciones(ficha.id);

          if(!responseTranscription.ok){
            return { message: 'Error al obtener las transcripciones' }
          }

          const transcripciones = await this.procesarTranscripciones(responseTranscription.data, nuevaFicha);
          
          const generateSrtResponse = await this.generateAndSaveSRT(responseTranscription.data, nuevaFicha);

          let texto = '';

          responseTranscription.data.map((item) => {
            texto += item.textoCorregido + ' ';
          });

          const sinopsis = await this.openaiService.resumirTexto(texto);

          if(sinopsis.ok){
            nuevaFicha.sinopsis = sinopsis.resumen;
          }

          await this.fichaRepository.save(nuevaFicha);
          await this.subtituloRepository.save(transcripciones);

          await this.axiosService.sincronizarSesiones(ficha.id);
          
          nuevasFichas.push({...nuevaFicha, subtitulos: transcripciones, srtFilePath: generateSrtResponse.ruta});
        }
        

        return { message: 'Fichas sincronizadas correctamente', fichas: nuevasFichas }
      }
    } catch (error) {
      return { message: 'Error al sincronizar las fichas', error }
    }
  }

  async crearFicha(ficha: any, idPrograma: string): Promise<Ficha> {
    try {
      const nombreFicha = ficha.nombre;

      const fechaFicha = await this.fechaFormatter(ficha.fecha);
      const nombre_ficha = this.nombreFormatter(nombreFicha, fechaFicha);

      const nuevaFicha = new Ficha();
      nuevaFicha.clavePrincipal = randomUUID();
      nuevaFicha.nombreArchivo = `${nombre_ficha}.${ficha.tipoArchivoRecibido.toLowerCase()}`;
      nuevaFicha.codigoArchivo = nombre_ficha;
      nuevaFicha.id_programa = idPrograma;
      nuevaFicha.error = '';
      nuevaFicha.referencia = '';
      nuevaFicha.fechaRealizacion = ficha.fechaRealizacion;
      nuevaFicha.fechaEmision = ficha.fechaEmision;
      nuevaFicha.casaProductora = ficha.casaProductora;
      nuevaFicha.formato = ficha.formato;
      nuevaFicha.tipoArchivoRecibido = ficha.tipoArchivoRecibido;
      nuevaFicha.tipoArchivoGuardado = ficha.tipoArchivoGuardado;
      nuevaFicha.soporteFisicoGrabacion = 'Digital';
      nuevaFicha.resolucion = ficha.resolucion;
      nuevaFicha.tasaRecuadro = ficha.tasaRecuadro;
      nuevaFicha.codecVideo = 'H264';
      nuevaFicha.codecAudio = 'AAC';
      nuevaFicha.canalesAudio = 'Estéreo';
      nuevaFicha.tasaMuestra = ficha.tasaMuestra;
      nuevaFicha.bitsPorMuestra = ficha.bitsPorMuestra;
      nuevaFicha.sistemaAcceso = 'FTP';
      nuevaFicha.duracion = ficha.duracion;
      nuevaFicha.sinopsis = '';
      nuevaFicha.observaciones = '';
      nuevaFicha.copyright = '';
      nuevaFicha.thumbnailUrl = `${nombreFicha}-thumbnail.png`

      return nuevaFicha;
    } catch (error) {
      throw new Error('Error al crear la ficha');
    }
  }

  async procesarTranscripciones(data: any, ficha: Ficha): Promise<Subtitulo[]> {
    try {

      const mergedSubtitulos = await this.mergeData(data);

      const entidadesTranscripciones = await Promise.all(mergedSubtitulos.map(async (transcripcion) => {
        const textoCorregido = transcripcion.textoCorregido;
        if(textoCorregido === ''){
          return;
        }

        const nuevaTranscripcion = new Subtitulo();
        nuevaTranscripcion.clavePrincipal = randomUUID();
        nuevaTranscripcion.id_ficha = ficha.clavePrincipal;
        nuevaTranscripcion.linea = transcripcion.minuto,
        nuevaTranscripcion.tiempo_Inicio = transcripcion.start_time;
        nuevaTranscripcion.tiempo_Fin = transcripcion.end_time;
        nuevaTranscripcion.texto = await this.escaparCaracteres(textoCorregido);
        nuevaTranscripcion.textoOriginal = transcripcion.textoCorregido;
        nuevaTranscripcion.textoTraducido = '';

        return nuevaTranscripcion;
      }));

      return entidadesTranscripciones;
    } catch (error) {
      throw new Error('Error al procesar las transcripciones de la ficha');
    }
  }

  async escaparCaracteres(texto) {
    // Escapar caracteres problemáticos con \
    const caracteresProblematicos = /[\\'":!()*/?]/g;
    return texto.replace(caracteresProblematicos, '\\$&');
  }

  async fechaFormatter(fechaSesion: string) {
    const date = new Date(fechaSesion);
    const formattedDate = date.toISOString().split('T')[0];

    return formattedDate;
  }

  getHoraActual() {
    const fecha = new Date();
    return `${fecha.getHours()}:${fecha.getMinutes()}:${fecha.getSeconds()}`;
  }

  nombreFormatter(nombre:any, fecha:any){
    const temp = nombre.replace(`${fecha}-`, '');
    return temp;
  }

  private applyFichaModifications(ficha: Ficha, data: any) {
    ficha.fechaRealizacion = data.fechaRealizacion;
    ficha.fechaEmision = data.fechaEmision;
    ficha.casaProductora = data.casaProductora;
    ficha.formato = data.formato;
    ficha.tipoArchivoRecibido = data.tipoArchivoRecibido;
    ficha.tipoArchivoGuardado = data.tipoArchivoGuardado;
    ficha.resolucion = data.resolucion;
    ficha.tasaRecuadro = data.tasaRecuadro;
    ficha.tasaMuestra = data.tasaMuestra;
    ficha.bitsPorMuestra = data.bitsPorMuestra;
    return ficha;
  }

  private mergeData(data: any): any {
    const result = [];

    for(let i = 0; i < data.length; i += 2){
        const first = data[i];
        const second = data[i + 1];

        if(!second){
            result.push({
                textoCorregido: first.textoCorregido,
                minuto: (i / 2) + 1,
                start_time: first.start_time,
                end_time: first.end_time
            });
        }else{
            result.push({
                // textoTranscripcion: first.textoTranscripcion + ' ' + second.textoTranscripcion,
                textoCorregido: first.textoCorregido + ' ' + second.textoCorregido,
                minuto: (i / 2) + 1,
                start_time: first.start_time,
                end_time: second.end_time
            });
        }
    }

    return result;
  }

  private async generateSRT(transcripciones: any){
    let srtContent = "";  
    let transcripcions = transcripciones.filter((item) => item.textoCorregido !== ""); // Filtrar transcripciones vacías  
    // return transcripcions; 
    transcripcions.forEach((item: any, index: number) => {
      // console.log(item);
      // Usar valores vacíos en caso de que start_time o end_time sean undefined
      const startTime = item.start_time ? item.start_time.replace(".", ",") : "";
      const endTime = item.end_time ? item.end_time.replace(".", ",") : "";
      
      srtContent += `${index + 1}\n`; // Número del subtítulo
      srtContent += `${startTime} --> ${endTime}\n`; // Tiempos de inicio y fin
      srtContent += `${item.textoCorregido}\n\n`; // Texto del subtítulo
  }); 
    return srtContent;
  }

  private async generateAndSaveSRT(transcripciones: any, ficha:Ficha): Promise<{ message: string, ruta: string }>{
    try {
      // Generar contenido del archivo SRT
      const srtContent = await this.generateSRT(transcripciones);

      // Crear archivo SRT
      const fileName = `${ficha.codigoArchivo}.srt`;

      // Guardar archivo SRT
      const baseDir = '/var/www/html/assets/subtitulos';
      const uploadsDir = path.join(baseDir, ficha.id_programa.toString());

      await fs.mkdir(uploadsDir, { recursive: true });
      const ruta = path.join(uploadsDir, fileName);

      await fs.writeFile(ruta, srtContent, 'utf-8');

      return { message: 'Archivo SRT generado correctamente', ruta };
    } catch (error) {
      console.log(error);
      throw new Error('Error al generar el archivo SRT');
    }
  }

}
