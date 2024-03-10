import { Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CsvConverter } from 'src/utils/csv.converter';
import { handleDbError } from 'src/utils/error.message';

@Injectable()
export class TagsService {

  constructor(
    @InjectRepository(Tag) private subtituloRepository: Repository<Tag>
  ) { }



  async procesarArchivo(fileBuffer: Buffer) {
    try {

      const csvString = fileBuffer.toString('utf-8');
      const jsonData = await CsvConverter(csvString);

      const entidadesTags = await Promise.all(jsonData.map(async (tag) => {
        const nuevoTag = new Tag();
        nuevoTag.clavePrincipal = tag.ClavePrincipal;
        nuevoTag.id_ficha = tag['ID Ficha'];
        nuevoTag.textoTag = await this.escaparCaracteres(tag.Tag);
        nuevoTag.textoOriginal = tag.Tag;
        return nuevoTag;
      }));

      await this.subtituloRepository.save(entidadesTags);
      return { message: 'Archivo procesado correctamente' }

    } catch (error) {
      console.log(error)
      const message = handleDbError(error)
      return { message }

    }
  }


  async create(createTagDto: CreateTagDto) {
    const nuevoTag = new Tag();
    nuevoTag.clavePrincipal = createTagDto.clavePrincipal;
    nuevoTag.id_ficha = createTagDto.id_ficha;
    nuevoTag.textoTag = await this.escaparCaracteres(createTagDto.tag);
    nuevoTag.textoOriginal = createTagDto.tag;
    return await this.subtituloRepository.save(nuevoTag);
  }






  async escaparCaracteres(texto) {
    // Escapar caracteres problemáticos con \
    const caracteresProblematicos = /[\\'":!()*/?]/g;
    return texto.replace(caracteresProblematicos, '\\$&');
  }

}
