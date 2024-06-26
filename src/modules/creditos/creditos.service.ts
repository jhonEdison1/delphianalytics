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
        // console.log(credito['Clave Principal']);
        
         const nuevoCredito = new Credito();       
         nuevoCredito.clavePrincipal = credito['Clave Principal'];
         nuevoCredito.id_ficha = credito['ID Ficha'];
         nuevoCredito.cargo = credito['Cargo'];
         nuevoCredito.persona = credito['Persona']; 
         nuevoCredito.persona_ts = await this.escaparCaracteres(credito['Persona']);
         return nuevoCredito;
       }));

      //  console.log(entidadesCreditos);

       //insertar uno por uno
      for (let index = 0; index < entidadesCreditos.length; index++) {
       
        const element = entidadesCreditos[index];
        if (!element.clavePrincipal || !element.id_ficha || element.clavePrincipal == '' || element.id_ficha == '' ) {
          continue; 
        }

        await this.creditoRepository.save(element);
      }
  
      // await this.subtituloRepository.save(entidadesSubtitulos);
      return { message: 'Archivo procesado correctamente' }
    }
    catch (error) {
      const message = handleDbError(error)
      return { message }
    }

  }



  async escaparCaracteres(texto) {
    // Escapar caracteres problemáticos con \
    const caracteresProblematicos = /[\\'":!()*/?]/g;
    return texto.replace(caracteresProblematicos, '\\$&');
  }
}