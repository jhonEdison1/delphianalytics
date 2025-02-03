import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateProgramaDto } from './dto/create-programa.dto';
import { UpdateProgramaDto } from './dto/update-programa.dto';
import { Programa } from './entities/programa.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Like, Repository } from 'typeorm';
import { CsvConverter } from 'src/utils/csv.converter';
import { handleDbError } from 'src/utils/error.message';
import { Ficha } from '../fichas/entities/ficha.entity';
import { FiltrosProgramaDto } from './dto/filtros-programa-dto';
import { Subtitulo } from '../subtitulos/entities/subtitulo.entity';
import * as path from 'path';
import * as fs from 'fs';
import { Credito } from '../creditos/entities/credito.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class ProgramasService {

  constructor(
    @InjectRepository(Programa) private programaRepository: Repository<Programa>,
    @InjectRepository(Ficha) private fichaRepository: Repository<Ficha>,
    @InjectRepository(Subtitulo) private subtituloRepository: Repository<Subtitulo>,
    @InjectRepository(Credito) private creditoRepository: Repository<Credito>,
  ) { }

  async create(createProgramaDto: CreateProgramaDto) {
    const nuevoPrograma = new Programa();
    nuevoPrograma.titulo = createProgramaDto.titulo;
    nuevoPrograma.criterio = createProgramaDto.criterio;
    nuevoPrograma.genero = createProgramaDto.genero;
    nuevoPrograma.patrimonio = createProgramaDto.patrimonio;
    nuevoPrograma.clasificacion = createProgramaDto.clasificacion;
    nuevoPrograma.idioma = createProgramaDto.idioma;
    nuevoPrograma.productora = createProgramaDto.productora;
    nuevoPrograma.imagen = createProgramaDto.imagen;
    try {
      await this.programaRepository.save(nuevoPrograma);
      return { message: 'Programa guardado correctamente', nuevoPrograma };
    } catch (error) {
      console.log(error);
      const message = handleDbError(error);
      return { message };
    }
  }

  async procesarArchivo(fileBuffer: Buffer) {
    try {
      const csvString = fileBuffer.toString('utf-8');
      const jsonData = await CsvConverter(csvString);

      // return jsonData;

      const entidadesProgramas = jsonData.map((programa) => {
        // console.log(programa)
        const nuevoPrograma = new Programa();
        // nuevoPrograma.clavePrincipal = programa.ClavePrincipal;
        nuevoPrograma.titulo = programa.Titulo;
        nuevoPrograma.criterio = programa.Criterio;
        nuevoPrograma.genero = programa.Genero;
        nuevoPrograma.patrimonio = programa.Patrimonio;
        nuevoPrograma.clasificacion = programa.Clasificación;
        nuevoPrograma.idioma = programa.Idioma;
        nuevoPrograma.productora = programa.Productora;

        return nuevoPrograma;
      });

      await this.programaRepository.save(entidadesProgramas);
      return { message: 'Programas guardados correctamente' };

    } catch (error) {
      console.log(error);
      const message = handleDbError(error);
      return { message };
    }
  }

  async getProgramasPaginated(usuario: Usuario, page: number, limit: number, orden: 'ASC' | 'DESC') {

    if (!usuario) {
      throw new UnauthorizedException('El usuario no existe.');
    }

    const querySearch = usuario.rol === 'admin' ? {} : { usuarioId: usuario.id };

    const [programas, total] = await this.programaRepository.findAndCount({
      where: querySearch,
      skip: (page - 1) * limit,
      take: limit,
      order: { titulo: orden }
    });

    return {
      data: programas,
      total
    };

  }


  async findOne(usuario: Usuario, id: string) {

    if (!usuario) {
      throw new UnauthorizedException('El usuario no existe.');
    }

    const querySearch = usuario.rol === 'admin' ? { clavePrincipal: id } : { clavePrincipal: id, usuarioId: usuario.id };

    const programa = await this.programaRepository.findOne({ where: querySearch });

    const [fichas, totalFichas] = await this.fichaRepository.findAndCount({ where: { programa: programa } });

    const emision = fichas.map(ficha => {
      return ficha.fechaEmision.split('/')[2];
    }).reduce((acumulador, año) => {
      if (!acumulador[año]) {
        acumulador[año] = 1;
      } else {
        acumulador[año] = acumulador[año] + 1;
      }
      return acumulador;
    }, {});


    const emisionArray = Object.keys(emision).map(año => {
      return { año, cantidad: emision[año] };
    });
    return {
      programa,
      emisionArray,
      totalFichas
    };
  }

  async findFichasByProgramaAndYear(usuario: Usuario, id: string, year: string, page: number, limit: number, orden: 'ASC' | 'DESC', criterioOrden: 'alfabetico' | 'fecha', palabraClave: string) {

    if (!usuario) {
      return { message: 'Usuario no encontrado' };
    }

    const querySearch = usuario.rol === 'admin' ? { clavePrincipal: id } : { clavePrincipal: id, usuarioId: usuario.id };

    let criterio = criterioOrden === 'alfabetico' ? 'codigoArchivo' : 'fechaEmision';

    const programa = await this.programaRepository.findOne({ where: querySearch });

    if (palabraClave === '') {
      if (year.length !== 4) {
        year = "";

        const [fichas, total] = await this.fichaRepository.findAndCount({
          where: { programa: programa, fechaEmision: year },
          skip: (page - 1) * limit,
          take: limit,
          order: { [criterio]: orden }
        });
        return {
          data: fichas,
          total
        };
      } else {
        year = '/' + year;
        const [fichas, total] = await this.fichaRepository.findAndCount({
          where: { programa: programa, fechaEmision: Like(`%${year}`) },
          skip: (page - 1) * limit,
          take: limit,
          order: { [criterio]: orden }
        });
        return {
          data: fichas,
          total
        };
      }

    } else {
      palabraClave = palabraClave.trim();
      const palabras = palabraClave.split(" ");
      const fraseFormateada = palabras.map(palabra => `'${palabra}'`).join(" & ");
      palabraClave = fraseFormateada;

      if (year.length !== 4) {
        year = "";
        const [fichas, totaltemp] = await this.fichaRepository.findAndCount({
          where: { programa: programa, fechaEmision: year },
          order: { [criterio]: orden }
        });

        const subtituloQuery = this.subtituloRepository.createQueryBuilder('subtitulo');
        subtituloQuery.where('subtitulo.id_ficha IN (:...fichas)', { fichas: fichas.map(ficha => ficha.clavePrincipal) });
        subtituloQuery.andWhere('to_tsvector(subtitulo.texto::text) @@ to_tsquery(:palabraClave)', { palabraClave });
        const creditoQuery = this.creditoRepository.createQueryBuilder('credito');
        creditoQuery.where('credito.id_ficha IN (:...fichas)', { fichas: fichas.map(ficha => ficha.clavePrincipal) });
        creditoQuery.andWhere('to_tsvector(credito.persona_ts::text) @@ to_tsquery(:palabraClave)', { palabraClave });

        const [subtitulos, creditos] = await Promise.all([
          subtituloQuery.getMany(),
          creditoQuery.getMany()
        ]);

        const resultadosSubtitulos = await Promise.all(subtitulos.map(async subtitulo => {
          const ficha = await this.fichaRepository.findOne({ where: { clavePrincipal: subtitulo.id_ficha } });
          return { ficha, subtitulo, credito: null };
        }));

        const resultadosCreditos = await Promise.all(creditos.map(async credito => {
          const ficha = await this.fichaRepository.findOne({ where: { clavePrincipal: credito.id_ficha } });
          return { ficha, credito, subtitulo: null};
        }));

        // Procesa los resultados y devuelve el resultado paginado
        const agrupado = resultadosSubtitulos.concat(resultadosCreditos).reduce((acumulador, resultado) => {
          const { ficha, subtitulo, credito } = resultado;
          if (!acumulador[programa.clavePrincipal]) {
            acumulador[programa.clavePrincipal] = {
              fichas: [ficha],
            };
          } else {
            acumulador[programa.clavePrincipal].fichas.push(ficha);
          }
          return acumulador;
        }, {});

        const resultadoArray = Object.keys(agrupado).map(clavePrincipal => {
          return agrupado[clavePrincipal];
        });
        
        // return {resultadoArray}        
        if(resultadoArray.length === 0) {
          return { data: [], total: 0 };
        }

        const fichasList = resultadoArray[0].fichas.filter((v, i, a) => a.findIndex(t => (t['clavePrincipal'] === v['clavePrincipal'])) === i);
        // return {fichasList};
        const resultadoOrdenado2 = [];

        for (let i = 0; i < fichasList.length; i++) {
          resultadoOrdenado2[i] = await this.fichaRepository.findOne({ where: { clavePrincipal: fichasList[i].clavePrincipal } });
          resultadoOrdenado2[i] = {...resultadoOrdenado2[i], coincidencias: fichasList[i].coincidencias};
        }

        // Ordenar el array por la cantidad de subtitulos
        const resultadoOrdenado = fichasList.sort((a, b) => b.subtitulos - a.subtitulos);
        
        //  return {resultadoOrdenado}
        // Obtener el total de resultadoscarlos
        const total = resultadoOrdenado.length;
        const skip = (Number(page) - 1) * Number(limit);
        const limite = skip + Number(limit);
 
        // Paginar los resultados
        const resultadosPaginados = resultadoOrdenado.slice(skip, limite);
        // estos es lo nuevo
        return { data: resultadosPaginados, total };

      } else {
        year = '/' + year;
        const [fichas, totaltemporal] = await this.fichaRepository.findAndCount({
          where: { programa: programa, fechaEmision: Like(`%${year}`) },
          order: { [criterio]: orden }
        });

        // console.log(totaltemporal);

        // return fichas;

        const subtituloQuery = this.subtituloRepository.createQueryBuilder('subtitulo');
        subtituloQuery.where('subtitulo.id_ficha IN (:...fichas)', { fichas: fichas.map(ficha => ficha.clavePrincipal) });
        subtituloQuery.andWhere('to_tsvector(subtitulo.texto::text) @@ to_tsquery(:palabraClave)', { palabraClave });

        const creditoQuery = this.creditoRepository.createQueryBuilder('credito');
        creditoQuery.where('credito.id_ficha IN (:...fichas)', { fichas: fichas.map(ficha => ficha.clavePrincipal) });
        creditoQuery.andWhere('to_tsvector(credito.persona_ts::text) @@ to_tsquery(:palabraClave)', { palabraClave });

        const [subtitulos, creditos] = await Promise.all([
          subtituloQuery.getMany(),
          creditoQuery.getMany()
        ]);

        //return {aqui: creditos};

        const resultadosSubtitulos = await Promise.all(subtitulos.map(async subtitulo => {
          const ficha = await this.fichaRepository.findOne({ where: { clavePrincipal: subtitulo.id_ficha } });
          return { ficha, subtitulo, credito: null };
        }));

        const resultadosCreditos = await Promise.all(creditos.map(async credito => {
          const ficha = await this.fichaRepository.findOne({ where: { clavePrincipal: credito.id_ficha } });
          return { ficha, credito, subtitulo: null};
        }));

        const agrupado = resultadosSubtitulos.concat(resultadosCreditos).reduce((acumulador, resultado) => {
          const { ficha, subtitulo, credito } = resultado;
          if (!acumulador[programa.clavePrincipal]) {
            acumulador[programa.clavePrincipal] = {
              // programa,
              fichas: [ficha],
              // subtitulos: subtitulo ? [subtitulo] : [],
              // creditos: credito ? [credito] : []
              // ficha: ficha.clavePrincipal
            };
          } else {
            acumulador[programa.clavePrincipal].fichas.push(ficha);
            // if (subtitulo) acumulador[programa.clavePrincipal].subtitulos.push(subtitulo);
            // if (credito) acumulador[programa.clavePrincipal].creditos.push(credito);
          }
          return acumulador;
        }, {});

        const resultadoArray = Object.keys(agrupado).map(clavePrincipal => {
          return agrupado[clavePrincipal];
        });
        

        // return {resultadoArray}        
        if(resultadoArray.length === 0) {
          return { data: [], total: 0 };
        }

        const fichasList = resultadoArray[0].fichas.filter((v, i, a) => a.findIndex(t => (t['clavePrincipal'] === v['clavePrincipal'])) === i);

        // return {fichasList};

        const resultadoOrdenado2 = [];

        for (let i = 0; i < fichasList.length; i++) {
          resultadoOrdenado2[i] = await this.fichaRepository.findOne({ where: { clavePrincipal: fichasList[i].clavePrincipal } });
          resultadoOrdenado2[i] = {...resultadoOrdenado2[i], coincidencias: fichasList[i].coincidencias};
        }

        
         // Ordenar el array por la cantidad de subtitulos
       const resultadoOrdenado = fichasList.sort((a, b) => b.subtitulos - a.subtitulos);
        
      //  return {resultadoOrdenado}
       // Obtener el total de resultadoscarlos
       const total = resultadoOrdenado.length;
       const skip = (Number(page) - 1) * Number(limit);
        const limite = skip + Number(limit);
 
       // Paginar los resultados
       const resultadosPaginados = resultadoOrdenado.slice(skip, limite);
        // estos es lo nuevo
       return { data: resultadosPaginados, total };
      }
    }
  }

  async findFichasByProgramaAndYearNew(usuario: Usuario, id: string, year: string, page: number, limit: number, orden: 'ASC' | 'DESC', criterioOrden: 'alfabetico' | 'fecha', palabraClave: string) {
    
    if (!usuario) {
      throw new UnauthorizedException('El usuario no existe.');
    }

    const querySearch = usuario.rol === 'admin' ? { clavePrincipal: id } : { clavePrincipal: id, usuarioId: usuario.id };

    let criterio = criterioOrden === 'alfabetico' ? 'codigoArchivo' : 'fechaEmision';

    const programa = await this.programaRepository.findOne({ where: querySearch });

    if(palabraClave === ''){
      if (year.length !== 4) {
        year = "";

        const [fichas, total] = await this.fichaRepository.findAndCount({
          where: { programa: programa, fechaEmision: year },
          skip: (page - 1) * limit,
          take: limit,
          order: { [criterio]: orden }
        });
        return {
          data: fichas,
          total
        };
      } else {
        year = '/' + year;
        const [fichas, total] = await this.fichaRepository.findAndCount({
          where: { programa: programa, fechaEmision: Like(`%${year}`) },
          skip: (page - 1) * limit,
          take: limit,
          order: { [criterio]: orden }
        });
        return {
          data: fichas,
          total
        };
      }
    }else{
      palabraClave = palabraClave.trim();
      const palabras = palabraClave.split(" ");
      const fraseFormateada = palabras.map(palabra => `'${palabra}'`).join(" & ");
      palabraClave = fraseFormateada;

      const yearQuery = year.length === 4 ? Like(`%${year}`) : "" 

      // 1. Obtener las fichas filtradas por programa y año
      const [fichas, totalTemp] = await this.fichaRepository.findAndCount({
        where: { programa: programa, fechaEmision: yearQuery },
        order: { [criterio]: orden },
        // skip: (page - 1) * limit,
        // take: limit,
      })  

      // 2. Obtener los IDs de las fichas
      const fichasIds = fichas.map((ficha) => ficha.clavePrincipal) 

      // 3. Consultar subtítulos y créditos en paralelo
      const [subtitulos, creditos] = await Promise.all([
        this.subtituloRepository.createQueryBuilder("subtitulo").where("subtitulo.id_ficha IN (:...fichasIds)", { fichasIds }).andWhere("to_tsvector(subtitulo.texto::text) @@ to_tsquery(:palabraClave)", {palabraClave}).getMany(),
        this.creditoRepository.createQueryBuilder("credito").where("credito.id_ficha IN (:...fichasIds)", { fichasIds }).andWhere("to_tsvector(credito.persona_ts::text) @@ to_tsquery(:palabraClave)", {palabraClave}).getMany(),
      ])  

      // 4. Mapear resultados de subtítulos y créditos a las fichas correspondientes
      const resultados = fichas.map((ficha) => {
        const subtitulosFicha = subtitulos.filter(
          (subtitulo) => subtitulo.id_ficha === ficha.clavePrincipal
        );
        const creditosFicha = creditos.filter(
          (credito) => credito.id_ficha === ficha.clavePrincipal
        ) 

        return {
          ...ficha,
          coincidencias: subtitulosFicha.length + creditosFicha.length, // Contar coincidencias
        };
      })  

      //filterout fichas sin coincidencias
      const fichasConCoincidencias = resultados.filter((ficha) => ficha.coincidencias > 0)

      // 5. Ordenar por coincidencias (subtítulos + créditos)
      const resultadosOrdenados = fichasConCoincidencias.sort((a, b) => b.coincidencias - a.coincidencias)  

      // 6. Paginar los resultados
      const total = resultadosOrdenados.length;
      const skip = (Number(page) - 1) * Number(limit);
      const resultadosPaginados = resultadosOrdenados.slice(skip, skip + Number(limit))  

      // 7. Devolver los resultados paginados
      return { data: resultadosPaginados, total };
    }
  }


  async findByFiltros(
    usuario: Usuario,
    filtros: FiltrosProgramaDto,
    page: number,
    limit: number,
  ): Promise<{ programas: Programa[]; total: number }> {
    const { titulo, criterio, patrimonio, clasificacion, idioma } =
      filtros;

    // Creamos un array para almacenar las condiciones de filtrado
    const condiciones: any[] = [];

    if (titulo) {
      condiciones.push({ titulo: ILike(`%${titulo}%`) });
    }
    if (criterio) {
      condiciones.push({ criterio });
    }
    if (patrimonio) {
      condiciones.push({ patrimonio });
    }
    if (clasificacion) {
      condiciones.push({ clasificacion });
    }
    if (idioma) {
      condiciones.push({ idioma });
    }

    // Ejecutamos la consulta para obtener los programas
    const [programas, total] = await this.programaRepository.findAndCount({
      where: condiciones,
      take: limit,
      skip: (page - 1) * limit,
    });

    return { programas, total };
  }


  //la siguiente funcion necesito filtrar por progrmas y por fichas, primero se filtra por programas y luego por fichas, debe ser paginado

  //funcion original
  /* async buscarConFiltros(programaFiltros: any, fichaFiltros: any, palabraClave: string, pagina: number, tamanoPagina: number, ids: string[]): Promise<any> {
     const skip = (Number(pagina) - 1) * Number(tamanoPagina);
     const limit = skip + Number(tamanoPagina);
 
     if (palabraClave !== '') {
       const palabras = palabraClave.split(" ");
       const fraseFormateada = palabras.map(palabra => `'${palabra}'`).join(" & ");
       palabraClave = fraseFormateada;
     }
     const programaQuery = this.programaRepository.createQueryBuilder('programa');
     if (ids.length == 0) {
 
       if (programaFiltros) {
         for (const key in programaFiltros) {
           if (key === 'titulo') {
             programaQuery.andWhere(`programa.${key} ILIKE :${key}`, { [key]: `%${programaFiltros[key]}%` });
           } else {
             programaQuery.andWhere(`programa.${key} = :${key}`, { [key]: programaFiltros[key] });
           }
         }
       }
     } else {
       programaQuery.where('programa.clavePrincipal IN (:...ids)', { ids });
     }
 
     // Obtener los IDs de los programas que coinciden con los filtros
     const programas = await programaQuery.select('programa.clavePrincipal').getMany();
 
     //return programas;
 
     if (programas.length === 0) {
       return { resultados: [], total: 0 };
     }
 
     const fichaQuery = this.fichaRepository.createQueryBuilder('ficha');
     fichaQuery.where('ficha.id_programa IN (:...programas)', { programas: programas.map(programa => programa.clavePrincipal) }); // Aquí se agrega la línea
     if (fichaFiltros) {
       for (const key in fichaFiltros) {
         fichaQuery.andWhere(`ficha.${key} = :${key}`, { [key]: fichaFiltros[key] });
       }
     }
 
     const fichas = await fichaQuery.select('ficha.clavePrincipal').getMany();
 
     // return fichas;
 
     if (fichas.length === 0) {
       return { resultados: [], total: 0 };
     }
 
     if (palabraClave === '') {
       const resultados = await Promise.all(fichas.map(async fich => {
         const ficha = await this.fichaRepository.findOne({ where: { clavePrincipal: fich.clavePrincipal } });
         const programa = await this.programaRepository.findOne({ where: { clavePrincipal: ficha.id_programa } });
         return { programa, ficha };
       }));
 
 
       //return {resultados}
 
       //paginacion
 
       //const total = resultados.length;
 
       const agrupado = resultados.reduce((acumulador, resultado) => {
         const { programa, ficha } = resultado;
         if (!acumulador[programa.clavePrincipal]) {
           acumulador[programa.clavePrincipal] = {
             programa,
             fichas: [ficha]
           };
         } else {
           acumulador[programa.clavePrincipal].fichas.push(ficha);
         }
         return acumulador;
       }, {});
 
       const resultadoArray = Object.keys(agrupado).map(clavePrincipal => {
         return agrupado[clavePrincipal];
       });
 
       // Ordenar el array por la cantidad de subtitulos
       const resultadoOrdenado = resultadoArray.sort((a, b) => b.subtitulos - a.subtitulos);
 
       // Obtener el total de resultados
       const total = resultadoOrdenado.length;
 
       // Paginar los resultados
       const resultadosPaginados = resultadoOrdenado.slice(skip, limit);
 
       return { resultados: resultadosPaginados, total };
     }
     const subtituloQuery = this.subtituloRepository.createQueryBuilder('subtitulo');
     subtituloQuery.where('subtitulo.id_ficha IN (:...fichas)', { fichas: fichas.map(ficha => ficha.clavePrincipal) });
     subtituloQuery.andWhere('to_tsvector(subtitulo.texto::text) @@ to_tsquery(:palabraClave)', { palabraClave });
     // Obtener los subtitulos que coinciden con la palabra clave
     const subtitulos = await subtituloQuery
       .getMany();
 
     // Obtener los programas y fichas correspondientes a los subtitulos
     const resultados = await Promise.all(subtitulos.map(async subtitulo => {
       const ficha = await this.fichaRepository.findOne({ where: { clavePrincipal: subtitulo.id_ficha } });
       const programa = await this.programaRepository.findOne({ where: { clavePrincipal: ficha.id_programa } });
       return { programa, ficha, subtitulo };
     }));
 
     // console.log(resultados)
 
     //agrupar por programas, la cantidad de fichas y la cantidad de subtitulos y las veces que aparece la palabra clave
 
     const agrupado = resultados.reduce((acumulador, resultado) => {
       const { programa, ficha } = resultado;
       if (!acumulador[programa.clavePrincipal]) {
         acumulador[programa.clavePrincipal] = {
           programa,
           fichasPalabra: 1,
           fichas: [ficha]
         };
       } else {
         acumulador[programa.clavePrincipal].fichasPalabra++;
         acumulador[programa.clavePrincipal].fichas.push(ficha);
       }
       return acumulador;
     }, {});
 
 
     //return agrupado;
 
     // Convertir el objeto a un array
     const resultadoArray = Object.keys(agrupado).map(clavePrincipal => {
       return agrupado[clavePrincipal];
     });
 
     // Ordenar el array por la cantidad de subtitulos
     const resultadoOrdenado = resultadoArray.sort((a, b) => b.subtitulos - a.subtitulos);
 
     // Obtener el total de resultados
     const total = resultadoOrdenado.length;
 
     // Paginar los resultados
     const resultadosPaginados = resultadoOrdenado.slice(skip, limit);
 
     return { resultados: resultadosPaginados, total };
 
 
 
   }*/

  async buscarConFiltros(usuario: Usuario, programaFiltros: any, fichaFiltros: any, palabraClave: string, pagina: number, tamanoPagina: number, ids: string[]): Promise<any> {

    if (!usuario) {
      throw new UnauthorizedException('El usuario no existe.');
    }

    const skip = (Number(pagina) - 1) * Number(tamanoPagina);
    const limit = skip + Number(tamanoPagina);

    if (palabraClave !== '') {
      palabraClave = palabraClave.trim();
      const palabras = palabraClave.split(" ");
      const fraseFormateada = palabras.map(palabra => `'${palabra}'`).join(" & ");
      palabraClave = fraseFormateada;
    }

    let programaQuery = this.programaRepository.createQueryBuilder('programa');

    if(usuario.rol !== 'admin') {
      programaQuery.where('programa.usuarioId = :usuarioId', { usuarioId: usuario.id });
    }


    if (ids.length == 0) {
      if (programaFiltros) {
        for (const key in programaFiltros) {
          if (key === 'titulo') {
            programaQuery.andWhere(`programa.${key} ILIKE :${key}`, { [key]: `%${programaFiltros[key]}%` });
          } else {
            programaQuery.andWhere(`programa.${key} = :${key}`, { [key]: programaFiltros[key] });
          }
        }
      }
    } else {
      programaQuery.where('programa.clavePrincipal IN (:...ids)', { ids });
    }

    const programas = await programaQuery.select('programa.clavePrincipal').getMany();
    if (programas.length === 0) {
      return { resultados: [], total: 0 };
    }

    const fichaQuery = this.fichaRepository.createQueryBuilder('ficha');
    fichaQuery.where('ficha.id_programa IN (:...programas)', { programas: programas.map(programa => programa.clavePrincipal) });
    if (fichaFiltros) {
      for (const key in fichaFiltros) {
        fichaQuery.andWhere(`ficha.${key} = :${key}`, { [key]: fichaFiltros[key] });
      }
    }

    const fichas = await fichaQuery.select('ficha.clavePrincipal').getMany();
    if (fichas.length === 0) {
      return { resultados: [], total: 0 };
    }

    if (palabraClave === '') {
      const resultados = await Promise.all(fichas.map(async fich => {
        const ficha = await this.fichaRepository.findOne({ where: { clavePrincipal: fich.clavePrincipal } });
        const programa = await this.programaRepository.findOne({ where: { clavePrincipal: ficha.id_programa } });
        return { programa, ficha };
      }));

      const agrupado = resultados.reduce((acumulador, resultado) => {
        const { programa, ficha } = resultado;
        if (!acumulador[programa.clavePrincipal]) {
          acumulador[programa.clavePrincipal] = {
            programa,
            fichas: [ficha]
          };
        } else {
          acumulador[programa.clavePrincipal].fichas.push(ficha);
        }
        return acumulador;
      }, {});

      const resultadoArray = Object.keys(agrupado).map(clavePrincipal => {
        return agrupado[clavePrincipal];
      });

      const resultadoOrdenado = resultadoArray.sort((a, b) => b.fichas.length - a.fichas.length);
      const total = resultadoOrdenado.length;
      const resultadosPaginados = resultadoOrdenado.slice(skip, limit);

      return { resultados: resultadosPaginados, total };
    }

    const subtituloQuery = this.subtituloRepository.createQueryBuilder('subtitulo');
    subtituloQuery.where('subtitulo.id_ficha IN (:...fichas)', { fichas: fichas.map(ficha => ficha.clavePrincipal) });
    subtituloQuery.andWhere('to_tsvector(subtitulo.texto::text) @@ to_tsquery(:palabraClave)', { palabraClave });

    const subtitulos = await subtituloQuery.getMany();

    const creditoQuery = this.creditoRepository.createQueryBuilder('credito');
    creditoQuery.where('credito.id_ficha IN (:...fichas)', { fichas: fichas.map(ficha => ficha.clavePrincipal) });
    creditoQuery.andWhere('to_tsvector(credito.persona_ts::text) @@ to_tsquery(:palabraClave)', { palabraClave });

    const creditos = await creditoQuery.getMany();

    const resultadosSubtitulos = await Promise.all(subtitulos.map(async subtitulo => {
      const ficha = await this.fichaRepository.findOne({ where: { clavePrincipal: subtitulo.id_ficha } });
      const programa = await this.programaRepository.findOne({ where: { clavePrincipal: ficha.id_programa } });
      return { programa, ficha, subtitulo, credito: null };
    }));

    const resultadosCreditos = await Promise.all(creditos.map(async credito => {
      const ficha = await this.fichaRepository.findOne({ where: { clavePrincipal: credito.id_ficha } });
      const programa = await this.programaRepository.findOne({ where: { clavePrincipal: ficha.id_programa } });
      return { programa, ficha, credito, subtitulo: null };
    }));

    const agrupado = resultadosSubtitulos.concat(resultadosCreditos).reduce((acumulador, resultado) => {
      const { programa, ficha, subtitulo, credito } = resultado;
      if (!acumulador[programa.clavePrincipal]) {
        acumulador[programa.clavePrincipal] = {
          programa,
          fichas: [ficha],
          subtitulos: subtitulo ? [subtitulo] : [],
          creditos: credito ? [credito] : []
        };
      } else {
        acumulador[programa.clavePrincipal].fichas.push(ficha);
        if (subtitulo) acumulador[programa.clavePrincipal].subtitulos.push(subtitulo);
        if (credito) acumulador[programa.clavePrincipal].creditos.push(credito);
      }
      return acumulador;
    }, {});

    const resultadoArray = Object.keys(agrupado).map(clavePrincipal => {
      return agrupado[clavePrincipal];
    });

    const resultadoOrdenado = resultadoArray.sort((a, b) => (b.subtitulos.length + b.creditos.length) - (a.subtitulos.length + a.creditos.length));
    const total = resultadoOrdenado.length;
    const resultadosPaginados = resultadoOrdenado.slice(skip, limit);

    return { resultados: resultadosPaginados, total };
  }


  async buscarConFiltrosNew(usuario: Usuario, programaFiltros: any, fichaFiltros: any, palabraClave: string, pagina: number, tamanoPagina: number, ids: string[]): Promise<any> {
    if (!usuario) {
      throw new UnauthorizedException('El usuario no existe.')
    }

    const skip = (Number(pagina) - 1) * Number(tamanoPagina);
    const limit = skip + Number(tamanoPagina);

    if (palabraClave !== '') {
      palabraClave = palabraClave.trim();
      const palabras = palabraClave.split(" ");
      const fraseFormateada = palabras.map(palabra => `'${palabra}'`).join(" & ");
      palabraClave = fraseFormateada;
    }

    try {
      
      let programaQuery = this.programaRepository.createQueryBuilder('programa');
  
      if(usuario.rol !== 'admin') {
        programaQuery.where('programa.usuarioId = :usuarioId', { usuarioId: usuario.id });
      }

      if (ids.length === 0 && programaFiltros) {
        for (const key in programaFiltros) {
          if (key === 'titulo') {
            programaQuery.andWhere(`programa.${key} ILIKE :${key}`, { [key]: `%${programaFiltros[key]}%` });
          } else {
            programaQuery.andWhere(`programa.${key} = :${key}`, { [key]: programaFiltros[key] });
          }
        }
      } else if (ids.length > 0) {
        programaQuery.where('programa.clavePrincipal IN (:...ids)', { ids });
      }
  
      const programas = await programaQuery.select('programa.clavePrincipal').getMany();
  
      if (programas.length === 0) {
        return { resultados: [], total: 0 };
      }

      const programaIds = programas.map(programa => programa.clavePrincipal);

      // Consulta de fichas
      let fichaQuery = this.fichaRepository.createQueryBuilder('ficha').where('ficha.id_programa IN (:...programaIds)', { programaIds });

      if (fichaFiltros) {
        for (const key in fichaFiltros) {
          fichaQuery.andWhere(`ficha.${key} = :${key}`, { [key]: fichaFiltros[key] });
        }
      }

      const fichas = await fichaQuery.select('ficha.clavePrincipal').getMany();

      if (fichas.length === 0) {
        return { resultados: [], total: 0 };
      }

      const fichaIds = fichas.map(ficha => ficha.clavePrincipal);
      // console.log(fichaIds);
      if (!palabraClave) {
        // Caso sin palabra clave
        const resultados = await this.obtenerResultadosSinPalabraClave(fichaIds, skip, limit);
        return resultados;
      }

      // Caso con palabra clave
      const resultados = await this.obtenerResultadosConPalabraClave(fichaIds, palabraClave, skip, limit);
      return resultados;
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      throw new Error('Error al procesar la búsqueda');
    }

  }

  private async obtenerResultadosSinPalabraClave(fichaIds: string[], skip: number, limit: number): Promise<any> {
    const fichaQuery = this.fichaRepository.createQueryBuilder('ficha')
      .leftJoinAndSelect('ficha.programa', 'programa')
      .where('ficha.clavePrincipal IN (:...fichaIds)', { fichaIds })
      .orderBy('ficha.id_programa', 'ASC')
      .skip(skip)
      .take(limit);
  
    const fichas = await fichaQuery.getMany();
  
    const agrupado: { [key: string]: { programa: Programa, fichas: Ficha[] } } = fichas.reduce((acumulador, ficha) => {
      const programaId = ficha.programa.clavePrincipal;
      if (!acumulador[programaId]) {
        acumulador[programaId] = { programa: ficha.programa, fichas: [ficha] };
      } else {
        acumulador[programaId].fichas.push(ficha);
      }
      return acumulador;
    }, {});
  
    const resultadoArray = Object.values(agrupado).sort((a, b) => b.fichas.length - a.fichas.length) as { programa: Programa, fichas: Ficha[] }[];
    const total = resultadoArray.length;
  
    return { resultados: resultadoArray, total };
  }
  
  private async obtenerResultadosConPalabraClave(fichaIds: string[], palabraClave: string, skip: number, limit: number): Promise<any> {

    if (fichaIds.length === 0) {
      return { resultados: [], total: 0 };
    }

    const subtituloQuery = this.subtituloRepository.createQueryBuilder('subtitulo')
      .where('subtitulo.id_ficha IN (:...fichaIds)', { fichaIds })
      .andWhere('to_tsvector(subtitulo.texto::text) @@ to_tsquery(:palabraClave)', { palabraClave });
  
    const creditosQuery = this.creditoRepository.createQueryBuilder('credito')
      .where('credito.id_ficha IN (:...fichaIds)', { fichaIds })
      .andWhere('to_tsvector(credito.persona_ts::text) @@ to_tsquery(:palabraClave)', { palabraClave });
  
    const [subtitulos, creditos] = await Promise.all([subtituloQuery.getMany(), creditosQuery.getMany()]);
  
    const resultadosSubtitulos = subtitulos.map(subtitulo => ({
      fichaId: subtitulo.id_ficha,
      subtitulo
    }));
  
    const resultadosCreditos = creditos.map(credito => ({
      fichaId: credito.id_ficha,
      credito
    }));
  
    const resultadosCombinados = [...resultadosSubtitulos, ...resultadosCreditos];
  
    const fichasUnicas = Array.from(new Set(resultadosCombinados.map(r => r.fichaId)));

    // Verificar si no hay fichas únicas para buscar
    if (fichasUnicas.length === 0) {
      return { resultados: [], total: 0 };
    }
  
    const fichasQuery = this.fichaRepository.createQueryBuilder('ficha')
      .leftJoinAndSelect('ficha.programa', 'programa')
      .where('ficha.clavePrincipal IN (:...fichaIds)', { fichaIds: fichasUnicas })
      .orderBy('ficha.id_programa', 'ASC')
      .skip(skip)
      .take(limit);
  
    const fichas = await fichasQuery.getMany();
  
    const agrupado: { [key: string]: { programa: Programa, fichas: Ficha[], subtitulos: Subtitulo[], creditos: Credito[] } } = fichas.reduce((acumulador, ficha) => {
      const programaId = ficha.programa.clavePrincipal;
      if (!acumulador[programaId]) {
        acumulador[programaId] = { programa: ficha.programa, fichas: [ficha], subtitulos: [], creditos: [] };
      } else {
        acumulador[programaId].fichas.push(ficha);
      }
      return acumulador;
    }, {});
  
    resultadosCombinados.forEach(resultado => {
      const ficha = fichas.find(f => f.clavePrincipal === resultado.fichaId);
      if (ficha) {
        const programaId = ficha.programa.clavePrincipal;
        if ('subtitulo' in resultado) {
          agrupado[programaId].subtitulos.push(resultado.subtitulo);
        }
        if ('credito' in resultado) {
          agrupado[programaId].creditos.push(resultado.credito);
        }
      }
    });
  
    const resultadoArray = Object.values(agrupado).sort((a, b) => (b.subtitulos.length + b.creditos.length) - (a.subtitulos.length + a.creditos.length));
    const total = resultadoArray.length;
  
    return { resultados: resultadoArray, total };
  }



  //Buscar fichas en un programa por filtrosFicha y palabra clave, traer cuantas coincidencias de la palabra clave hay en cada ficha y paginar las fichas, el orden sera de mayor a menor coincidencias de la palabra clave

  /*async buscarFichasConFiltros(programaId: string, filtrosFicha: any, palabraClave: string, pagina: number, tamanoPagina: number): Promise<any> {

    const skip = (Number(pagina) - 1) * Number(tamanoPagina);
    const limit = skip + Number(tamanoPagina);

    if (palabraClave !== '') {
      const palabras = palabraClave.split(" ");
      const fraseFormateada = palabras.map(palabra => `'${palabra}'`).join(" & ");
      palabraClave = fraseFormateada;
    }


    const programa = await this.programaRepository.findOne({ where: { clavePrincipal: programaId } });

    const fichaQuery = this.fichaRepository.createQueryBuilder('ficha');
    fichaQuery.where('ficha.id_programa = :programaId', { programaId });
    if (filtrosFicha) {
      for (const key in filtrosFicha) {
        fichaQuery.andWhere(`ficha.${key} = :${key}`, { [key]: filtrosFicha[key] });
      }
    }

    const fichas = await fichaQuery.select('ficha.clavePrincipal').getMany();

    //return fichas;

    if (fichas.length === 0) {
      return { resultados: [], total: 0 };
    }

    if (palabraClave === '') {
      const resultados = await Promise.all(fichas.map(async fich => {
        const ficha = await this.fichaRepository.findOne({ where: { clavePrincipal: fich.clavePrincipal } });
        return { ficha };
      }));

      const total = resultados.length;

      //const resultadosPaginados = resultados.slice(skip, skip + tamanoPagina);
      const resultadosPaginados = resultados.slice(skip, limit);


      return { resultados: resultadosPaginados, total };
    }

    const subtituloQuery = this.subtituloRepository.createQueryBuilder('subtitulo');
    subtituloQuery.where('subtitulo.id_ficha IN (:...fichas)', { fichas: fichas.map(ficha => ficha.clavePrincipal) });
    subtituloQuery.andWhere('to_tsvector(subtitulo.texto::text) @@ to_tsquery(:palabraClave)', { palabraClave });

    const subtitulos = await subtituloQuery
      .getMany();

    const resultados = await Promise.all(subtitulos.map(async subtitulo => {
      const ficha = await this.fichaRepository.findOne({ where: { clavePrincipal: subtitulo.id_ficha } });
      return { ficha, subtitulo };
    }));

    const agrupado = resultados.reduce((acumulador, resultado) => {
      const { ficha } = resultado;
      if (!acumulador[ficha.clavePrincipal]) {
        acumulador[ficha.clavePrincipal] = {
          ficha,
          coincidencias: 1,
          subtitulos: [resultado.subtitulo]
        };
      } else {
        acumulador[ficha.clavePrincipal].coincidencias++;
        acumulador[ficha.clavePrincipal].subtitulos.push(resultado.subtitulo);

      }
      return acumulador;
    }, {});

    const resultadoArray = Object.keys(agrupado).map(clavePrincipal => {
      return agrupado[clavePrincipal];
    });

    const resultadoOrdenado = resultadoArray.sort((a, b) => b.coincidencias - a.coincidencias);

    const total = resultadoOrdenado.length;


    //const resultadosPaginados = resultadoOrdenado.slice(skip, (skip + tamanoPagina));
    const resultadosPaginados = resultadoOrdenado.slice(skip, limit);
    //console.log(skip, limit)

    return { resultados: resultadosPaginados, total };
  }*/
  async buscarFichasConFiltros(usuario: Usuario, programaId: string, filtrosFicha: any, palabraClave: string, pagina: number, tamanoPagina: number): Promise<any> {

    if (!usuario) {
      throw new UnauthorizedException('El usuario no existe.');
    }

    const programaQuery = usuario.rol === 'admin' ? { clavePrincipal: programaId } : { clavePrincipal: programaId, usuarioId: usuario.id };

    const skip = (Number(pagina) - 1) * Number(tamanoPagina);
    const limit = skip + Number(tamanoPagina);

    if (palabraClave !== '') {
      palabraClave = palabraClave.trim();
      const palabras = palabraClave.split(" ");
      const fraseFormateada = palabras.map(palabra => `'${palabra}'`).join(" & ");
      palabraClave = fraseFormateada;
    }

    const programa = await this.programaRepository.findOne({ where: programaQuery });

    if(!programa){
      return {
        resultados: [],
        total: 0
      };
    }

    const fichaQuery = this.fichaRepository.createQueryBuilder('ficha');
    fichaQuery.where('ficha.id_programa = :programaId', { programaId });
    if (filtrosFicha) {
      for (const key in filtrosFicha) {
        fichaQuery.andWhere(`ficha.${key} = :${key}`, { [key]: filtrosFicha[key] });
      }
    }

    const fichas = await fichaQuery.select('ficha.clavePrincipal').getMany();

    if (fichas.length === 0) {
      return { resultados: [], total: 0 };
    }

    if (palabraClave === '') {
      const resultados = await Promise.all(fichas.map(async fich => {
        const ficha = await this.fichaRepository.findOne({ where: { clavePrincipal: fich.clavePrincipal } });
        return { ficha };
      }));

      const total = resultados.length;
      const resultadosPaginados = resultados.slice(skip, limit);
      return { resultados: resultadosPaginados, total };
    }

    const subtituloQuery = this.subtituloRepository.createQueryBuilder('subtitulo');
    subtituloQuery.where('subtitulo.id_ficha IN (:...fichas)', { fichas: fichas.map(ficha => ficha.clavePrincipal) });
    subtituloQuery.andWhere('to_tsvector(subtitulo.texto::text) @@ to_tsquery(:palabraClave)', { palabraClave });

    const subtitulos = await subtituloQuery.getMany();

    const creditoQuery = this.creditoRepository.createQueryBuilder('credito');
    creditoQuery.where('credito.id_ficha IN (:...fichas)', { fichas: fichas.map(ficha => ficha.clavePrincipal) });
    creditoQuery.andWhere('to_tsvector(credito.persona_ts::text) @@ to_tsquery(:palabraClave)', { palabraClave });

    const creditos = await creditoQuery.getMany();

    const resultadosSubtitulos = await Promise.all(subtitulos.map(async subtitulo => {
      const ficha = await this.fichaRepository.findOne({ where: { clavePrincipal: subtitulo.id_ficha } });
      return { ficha, subtitulo, credito: null };
    }));

    const resultadosCreditos = await Promise.all(creditos.map(async credito => {
      const ficha = await this.fichaRepository.findOne({ where: { clavePrincipal: credito.id_ficha } });
      return { ficha, subtitulo: null, credito };
    }));

    const agrupado = resultadosSubtitulos.concat(resultadosCreditos).reduce((acumulador, resultado) => {
      const { ficha, subtitulo, credito } = resultado;
      if (!acumulador[ficha.clavePrincipal]) {
        acumulador[ficha.clavePrincipal] = {
          ficha,
          coincidencias: 1,
          subtitulos: subtitulo ? [subtitulo] : [],
          creditos: credito ? [credito] : []
        };
      } else {
        acumulador[ficha.clavePrincipal].coincidencias++;
        if (subtitulo) acumulador[ficha.clavePrincipal].subtitulos.push(subtitulo);
        if (credito) acumulador[ficha.clavePrincipal].creditos.push(credito);
      }
      return acumulador;
    }, {});

    const resultadoArray = Object.keys(agrupado).map(clavePrincipal => {
      return agrupado[clavePrincipal];
    });

    const resultadoOrdenado = resultadoArray.sort((a, b) => b.coincidencias - a.coincidencias);
    const total = resultadoOrdenado.length;
    const resultadosPaginados = resultadoOrdenado.slice(skip, limit);

    return { resultados: resultadosPaginados, total };
  }


  async buscarFichasConFiltrosNew(usuario: Usuario, programaId: string, filtrosFicha: any, palabraClave: string, pagina: number, tamanoPagina: number): Promise<any> {
    if (!usuario) {
      throw new UnauthorizedException('El usuario no existe.');
    }
  
    const skip = (Number(pagina) - 1) * Number(tamanoPagina);
    const limit = Number(tamanoPagina);

    try {
      // Formatear palabra clave si existe
      let fraseFormateada = '';
      if (palabraClave) {
        palabraClave = palabraClave.trim();
        const palabras = palabraClave.split(' ');
        fraseFormateada = palabras.map(palabra => `'${palabra}'`).join(' & ');
      } else {
        return { resultados: [], total: 0 }; // Sin palabra clave, no hay coincidencias
      }

      // Verificar si el programa existe
      const programaQuery = usuario.rol === 'admin'
        ? { clavePrincipal: programaId }
        : { clavePrincipal: programaId, usuarioId: usuario.id };

      const programa = await this.programaRepository.findOne({ where: programaQuery });
      if (!programa) {
        return { resultados: [], total: 0 };
      }

      // Obtener todas las fichas asociadas al programa
      const fichaQuery = this.fichaRepository.createQueryBuilder('ficha')
        .where('ficha.id_programa = :programaId', { programaId });

      const fichas = await fichaQuery.getMany();

      if (fichas.length === 0) {
        return { resultados: [], total: 0 };
      }

      // Extraer IDs de fichas para filtrar subtítulos y créditos
      const fichaIds = fichas.map(ficha => ficha.clavePrincipal);

      // Buscar subtítulos y créditos que coincidan con la palabra clave
      const subtitulosQuery = this.subtituloRepository.createQueryBuilder('subtitulo')
        .where('subtitulo.id_ficha IN (:...fichaIds)', { fichaIds })
        .andWhere('to_tsvector(subtitulo.texto::text) @@ to_tsquery(:palabraClave)', { palabraClave: fraseFormateada });

      const creditosQuery = this.creditoRepository.createQueryBuilder('credito')
        .where('credito.id_ficha IN (:...fichaIds)', { fichaIds })
        .andWhere('to_tsvector(credito.persona_ts::text) @@ to_tsquery(:palabraClave)', { palabraClave: fraseFormateada });

      const [subtitulos, creditos] = await Promise.all([subtitulosQuery.getMany(), creditosQuery.getMany()]);

      // Filtrar fichas que tienen coincidencias en subtítulos o créditos
      const fichaIdsConCoincidencias = [
        ...new Set([
          ...subtitulos.map(subtitulo => subtitulo.id_ficha),
          ...creditos.map(credito => credito.id_ficha)
        ])
      ];

      if (fichaIdsConCoincidencias.length === 0) {
        return { resultados: [], total: 0 };
      }

      // Consultar las fichas correspondientes a los IDs encontrados
      const fichasConCoincidenciasQuery = this.fichaRepository.createQueryBuilder('ficha')
        .where('ficha.clavePrincipal IN (:...fichaIdsConCoincidencias)', { fichaIdsConCoincidencias })
        .skip(skip)
        .take(limit);

      const [fichasConCoincidencias, total] = await fichasConCoincidenciasQuery.getManyAndCount();

      // Mapear resultados para incluir subtítulos y créditos relacionados
      const resultados = await Promise.all(fichasConCoincidencias.map(async ficha => {
        const subt = subtitulos.filter(subtitulo => subtitulo.id_ficha === ficha.clavePrincipal);
        const cred = creditos.filter(credito => credito.id_ficha === ficha.clavePrincipal);
        return {
          ficha,
          subtitulos: subt,
          creditos: cred
        };
      }));

      return { resultados, total };
    } catch (error) {
      console.log('Error en la busqueda:', error)
      throw new Error('Error al procesar la búsqueda');
    }
  }



  async subirImagen(usuario: Usuario, file: Express.Multer.File, id: string) {

    const programa = await this.programaRepository.findOne({ where: { clavePrincipal: id } });

    //subir el archivo a una carpeta en el servidor

    //el path es el dir 
    // ../../../../../../var/www/html/assets/programas/
    const dir = path.resolve(__dirname, '../../../../../../var/www/html/assets/programas/' + id + '/');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, file.originalname);
    fs.writeFileSync(filePath, file.buffer, 'binary');



    //fs.writeFileSync(filePath, file.buffer, 'binary');

    //guardar la ruta en la base de datos

    programa.imagen = filePath;

    await this.programaRepository.save(programa);

    return { message: 'Imagen guardada correctamente' };


  }



}
