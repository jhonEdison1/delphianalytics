import { Injectable } from '@nestjs/common';
import { CreateProgramaDto } from './dto/create-programa.dto';
import { UpdateProgramaDto } from './dto/update-programa.dto';
import { Programa } from './entities/programa.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CsvConverter } from 'src/utils/csv.converter';
import { handleDbError } from 'src/utils/error.message';

@Injectable()
export class ProgramasService {

  constructor(
    @InjectRepository(Programa) private programaRepository: Repository<Programa>
  ) { }

  async procesarArchivo(fileBuffer: Buffer) {
    try {
      const csvString = fileBuffer.toString('utf-8');
      const jsonData = await CsvConverter(csvString);

      const entidadesProgramas = jsonData.map((programa) => {
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


}
