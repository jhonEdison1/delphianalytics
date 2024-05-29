import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Credito } from "./entities/credito.entity";
import { Repository } from "typeorm";
import { handleDbError } from "src/utils/error.message";
import { CsvConverter } from "src/utils/csv.converter";

@Injectable()
export class CreditosService {

  constructor(
    @InjectRepository(Credito) private creditoRepository: Repository<Credito>
  ) { }


  async procesarArchivo(fileBuffer: Buffer) {


    try {
      const csvString = fileBuffer.toString('utf-8');
      const jsonData = await CsvConverter(csvString);

      const entidadesCreditos = await Promise.all(jsonData.map(async (credito) => {
        console.log(credito)
        
         const nuevoCredito = new Credito();       
         nuevoCredito.clavePrincipal = credito['ClavePrincipal'];
         nuevoCredito.id_ficha = credito['ID Ficha'];
         nuevoCredito.cargo = credito['Cargo'];
         nuevoCredito.persona = credito['Persona'];
         return nuevoCredito;
       }));

       //insertar uno por uno
      for (let index = 0; index < entidadesCreditos.length; index++) {
       
        const element = entidadesCreditos[index];
        if (!element.clavePrincipal || !element.id_ficha || element.clavePrincipal == '' || element.id_ficha == '' ) {
          continue; 
        }

        await this.creditoRepository.save(element);
      }
  
      //await this.subtituloRepository.save(entidadesSubtitulos);
      return { message: 'Archivo procesado correctamente' }
    }
    catch (error) {
      const message = handleDbError(error)
      return { message }
    }

  }
}