import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateFichaDto } from './dto/create-ficha.dto';
import { UpdateFichaDto } from './dto/update-ficha.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ficha } from './entities/ficha.entity';
import { Not, Repository } from 'typeorm';
import { handleDbError } from 'src/utils/error.message';
import {CsvConverter} from 'src/utils/csv.converter';
import { Subtitulo } from '../subtitulos/entities/subtitulo.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Credito } from '../creditos/entities/credito.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';



@Injectable()
export class FichasService {

  constructor(
    @InjectRepository(Ficha) private fichaRepository: Repository<Ficha>,
    @InjectRepository(Subtitulo) private subtituloRepository: Repository<Subtitulo>,
    @InjectRepository(Credito) private creditoRepository: Repository<Credito>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
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
}
