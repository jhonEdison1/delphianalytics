import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ProgramasService {

  constructor(
    @InjectRepository(Programa) private programaRepository: Repository<Programa>,
    @InjectRepository(Ficha) private fichaRepository: Repository<Ficha>,
    @InjectRepository(Subtitulo) private subtituloRepository: Repository<Subtitulo>,
  ) { }

  async procesarArchivo(fileBuffer: Buffer) {
    try {
      const csvString = fileBuffer.toString('utf-8');
      const jsonData = await CsvConverter(csvString);

      // return jsonData;

      const entidadesProgramas = jsonData.map((programa) => {
        // console.log(programa)
        const nuevoPrograma = new Programa();
        nuevoPrograma.clavePrincipal = programa.ClavePrincipal;
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

  async getProgramasPaginated(page: number, limit: number) {

    // skip: (page - 1) * limit,
    // take: limit

    const [programas, total] = await this.programaRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit
    });

    return {
      data: programas,
      total
    };

  }


  async findOne(id: string) {
    const programa = await this.programaRepository.findOne({ where: { clavePrincipal: id } });
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

  async findFichasByProgramaAndYear(id: string, year: string, page: number, limit: number) {

    if (year.length !== 4) {
      year = "";
      const programa = await this.programaRepository.findOne({ where: { clavePrincipal: id } });
      const [fichas, total] = await this.fichaRepository.findAndCount({
        where: { programa: programa, fechaEmision: year },
        skip: (page - 1) * limit,
        take: limit,
        order: { fechaEmision: 'ASC' }
      });
      return {
        data: fichas,
        total
      };
    } else {
      year = '/' + year;
      const programa = await this.programaRepository.findOne({ where: { clavePrincipal: id } });
      const [fichas, total] = await this.fichaRepository.findAndCount({
        where: { programa: programa, fechaEmision: Like(`%${year}`) },
        skip: (page - 1) * limit,
        take: limit,
        order: { fechaEmision: 'ASC' }
      });
      return {
        data: fichas,
        total
      };
    }
  }




  async findByFiltros(
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

  async buscarConFiltros(programaFiltros: any, fichaFiltros: any, palabraClave: string, pagina: number, tamanoPagina: number): Promise<any> {
    const skip = (pagina - 1) * tamanoPagina;

    const programaQuery = this.programaRepository.createQueryBuilder('programa');
    if (programaFiltros) {
      for (const key in programaFiltros) {
        if (key === 'titulo') {
          programaQuery.andWhere(`programa.${key} ILIKE :${key}`, { [key]: `%${programaFiltros[key]}%` });
        } else {
          programaQuery.andWhere(`programa.${key} = :${key}`, { [key]: programaFiltros[key] });
        }
      }
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
      const resultadosPaginados = resultadoOrdenado.slice(skip, skip + tamanoPagina);

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

    console.log(resultados)

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
    const resultadosPaginados = resultadoOrdenado.slice(skip, skip + tamanoPagina);

    return { resultados: resultadosPaginados, total };



  }


  //Buscar fichas en un programa por filtrosFicha y palabra clave, traer cuantas coincidencias de la palabra clave hay en cada ficha y paginar las fichas, el orden sera de mayor a menor coincidencias de la palabra clave

  async buscarFichasConFiltros(programaId: string, filtrosFicha: any, palabraClave: string, pagina: number, tamanoPagina: number): Promise<any> {

    const skip = (pagina - 1) * tamanoPagina;

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

      const resultadosPaginados = resultados.slice(skip, skip + tamanoPagina);

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

    const resultadosPaginados = resultadoOrdenado.slice(skip, skip + tamanoPagina);

    return { resultados: resultadosPaginados, total };
  }



  async subirImagen(file: Express.Multer.File, id: string) {

    const programa = await this.programaRepository.findOne({ where: { clavePrincipal: id } });

    //subir el archivo a una carpeta en el servidor

    //el path es el dir 

    const dir = path.resolve(__dirname, '../../../public/imagenes/' + id + '/');
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
