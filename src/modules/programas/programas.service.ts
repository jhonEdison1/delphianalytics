import { Injectable } from '@nestjs/common';
import { CreateProgramaDto } from './dto/create-programa.dto';
import { UpdateProgramaDto } from './dto/update-programa.dto';
import { Programa } from './entities/programa.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Like, Repository } from 'typeorm';
import { CsvConverter } from 'src/utils/csv.converter';
import { handleDbError } from 'src/utils/error.message';
import { Ficha } from '../fichas/entities/ficha.entity';
import { FiltrosProgramaDto } from './dto/filtros-programa-dto';

@Injectable()
export class ProgramasService {

  constructor(
    @InjectRepository(Programa) private programaRepository: Repository<Programa>,
    @InjectRepository(Ficha) private fichaRepository: Repository<Ficha>
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
    const programa = await this.programaRepository.findOne({ where: { clavePrincipal: id } });
    const [fichas, total] = await this.fichaRepository.findAndCount({
      where: { programa: programa, fechaEmision: Like(`%/${year}`) },
      skip: (page - 1) * limit,
      take: limit,
      order: { fechaEmision: 'ASC' }
    });

    return {
      data: fichas,
      total
    };
  }




  async findByFiltros(
    filtros: FiltrosProgramaDto,
    page: number,
    limit: number,
  ): Promise<{ programas: Programa[]; total: number }> {
    const { titulo, criterio,  patrimonio, clasificacion, idioma } =
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



}
