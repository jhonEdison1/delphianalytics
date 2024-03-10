import { Injectable } from '@nestjs/common';
import { CreateSoundtrackDto } from './dto/create-soundtrack.dto';
import { UpdateSoundtrackDto } from './dto/update-soundtrack.dto';
import { Soundtrack } from './entities/soundtrack.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CsvConverter } from 'src/utils/csv.converter';
import { handleDbError } from 'src/utils/error.message';

@Injectable()
export class SoundtracksService {

    constructor(
        @InjectRepository(Soundtrack)
        private soundtrackRepository: Repository<Soundtrack>

    ) { }


    /**
     *   {
            "ClavePrincipal": "CC29023E-3D5A-B94E-BDC7-97E327A0FC44",
            "ID_Ficha": "ADE84BDA-00CE-F043-A3FB-7BFA54B49D47",
            "Principal": "1",
            "Título": "El Arte de Nuestra Gente",
            "Artista": "Al Ritmo de la basura",
            "Copyright​": ""
        }
     */

    async procesarArchivo(fileBuffer: Buffer) {
        try {
            //return fileBuffer
            const csvString = fileBuffer.toString('utf-8');
            const jsonData = await CsvConverter(csvString);
           // return jsonData
           
           
            const entidadesSoundtracks = await Promise.all(jsonData.map(async (soundtrack) => {
                const nuevoSoundtrack = new Soundtrack();
                nuevoSoundtrack.clavePrincipal = soundtrack.ClavePrincipal;
                nuevoSoundtrack.id_ficha = soundtrack['ID Ficha'];
                nuevoSoundtrack.principal = soundtrack.Principal;
                nuevoSoundtrack.título = soundtrack.Título;
                nuevoSoundtrack.artista = soundtrack.Artista;
                nuevoSoundtrack.copyright = soundtrack.Copyright;
                return nuevoSoundtrack;
            }));
            await this.soundtrackRepository.save(entidadesSoundtracks);
            return { message: 'Archivo procesado correctamente' }

        } catch (error) {
            console.log(error)
            const message = handleDbError(error)
            return { message }

        }
    }





}
