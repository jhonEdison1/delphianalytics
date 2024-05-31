import { Injectable } from '@nestjs/common';
import { CreateSubtituloDto } from './dto/create-subtitulo.dto';
import { UpdateSubtituloDto } from './dto/update-subtitulo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getConnection } from 'typeorm';
import { parse } from 'csv-parse';
import { Subtitulo } from './entities/subtitulo.entity';
import { handleDbError } from 'src/utils/error.message';
import { CsvConverter } from 'src/utils/csv.converter';

@Injectable()
export class SubtitulosService {

  constructor(
    @InjectRepository(Subtitulo) private subtituloRepository: Repository<Subtitulo>
  ) { }


  async create(createSubtituloDto: CreateSubtituloDto) {
     
    const nuevoSubtitulo = new Subtitulo();
    nuevoSubtitulo.clavePrincipal = createSubtituloDto.ClavePrincipal;
    nuevoSubtitulo.id_ficha = createSubtituloDto.ID_Ficha;
    nuevoSubtitulo.linea = createSubtituloDto.Linea;
    nuevoSubtitulo.tiempo_Inicio = createSubtituloDto.Tiempo_Inicio;
    nuevoSubtitulo.tiempo_Fin = createSubtituloDto.Tiempo_Fin;
    nuevoSubtitulo.texto =  await this.escaparCaracteres(createSubtituloDto.Texto);
   // nuevoSubtitulo.textoOriginal = createSubtituloDto.Texto;
    console.log(nuevoSubtitulo)   
    return await this.subtituloRepository.save(nuevoSubtitulo);

   
  }

  async procesarArchivo(fileBuffer: Buffer) {


    try {
      
      const csvString = fileBuffer.toString('utf-8');
      const jsonData = await CsvConverter(csvString);    
     

      const entidadesSubtitulos = await Promise.all(jsonData.map(async (subtitulo) => {
       // console.log(subtitulo)
       
        const nuevoSubtitulo = new Subtitulo();  
        //ajustar si trae Clave principál en blanco generar un id aleatorio unico de tipo uuid     
        nuevoSubtitulo.clavePrincipal = subtitulo.ClavePrincipal ? subtitulo.ClavePrincipal : crypto.randomUUID();
        nuevoSubtitulo.id_ficha = subtitulo['ID Ficha'];
        nuevoSubtitulo.linea = subtitulo['Línea'];
        nuevoSubtitulo.tiempo_Inicio = subtitulo['Tiempo Inicio'];
        nuevoSubtitulo.tiempo_Fin = subtitulo['Tiempo Fin'];
        nuevoSubtitulo.texto = await this.escaparCaracteres(subtitulo.Texto);
        nuevoSubtitulo.textoOriginal = subtitulo.Texto;
        return nuevoSubtitulo;
      }));

      console.log(entidadesSubtitulos)

      //insertar uno por uno
      // for (let index = 0; index < entidadesSubtitulos.length; index++) {
       
      //   const element = entidadesSubtitulos[index];
      //   if (!element.clavePrincipal || !element.id_ficha || element.clavePrincipal == '' || element.id_ficha == '' ) {
      //     continue; 
      //   }
      //   // console.log('elemento', element)
      //   await this.subtituloRepository.save(element);
      // }
  
      // await this.subtituloRepository.save(entidadesSubtitulos);
      return { message: 'Archivo procesado correctamente' }



    } catch (error) {
      console.log(error)
      const message = handleDbError(error)
      return { message }


    }

  }

  async escaparCaracteres(texto) {
    // Escapar caracteres problemáticos con \
    const caracteresProblematicos = /[\\'":!()*/?]/g;
    return texto.replace(caracteresProblematicos, '\\$&');
  }

  async findAll() {
    //find all and count

    const [subtitulos, total] = await this.subtituloRepository.findAndCount();

    return {
      data: subtitulos,
      total
    };
  }

  async eliminarSubtitulos() {
    //Elminar todos los subtitulos que coincidan con el parametro dado
    const listaFichas = ["2b4bc5cd-7cb1-344b-8a03-f3a443de3c50", "471896f6-aaf0-174b-890a-101d470e7f17", "95d5e8db-b793-224b-86f0-290c23c3e3cb", "41b50dbf-c629-9a41-bd8f-efe90733bd31", "ec1da17e-cf63-9e43-bc84-e630a342e74a", "f28d2a69-0033-f444-ad0b-4356948480ca", "9e59c797-9db7-e844-9acd-7805ab73454f", "31ff7b0b-5d71-2442-abce-a1348858ef36", "7063fe66-ec99-db4b-b28b-fde334b4252d", "b8a7398f-e4c0-4b4a-bb24-925bf278b7c0", "14b74ad1-2262-4c4b-8ac7-0495d25a9ddf", "89351aa9-2fb3-7c4a-8904-de2baf71d9d4", "dd47556b-28f8-1b47-acc5-8dde61a0b7d9", "ad9e0f9f-3f04-1541-ab65-44bd150e517f", "1fa8e6bf-5c35-3e47-92ce-a42abe1498a2", "d58ab914-d969-7f4f-ab1c-6ce099a39a1a", "43eb99c3-f67e-7945-8887-73d299d3fa7e", "c2068180-612b-a147-b287-5d6c4523a4a1", "343eb727-8319-ed48-984b-1b26114d8407", "0236ca1a-a0a5-f54b-bede-22725b5d55c1", "80c285c8-1bdd-434c-aae1-2d51af8f7398", "1bd68cf8-7bfd-ae48-b4dc-861d76a673f7", "77eff52d-005c-4647-83c6-09a8b0c0412f", "07a957c3-40e5-5d45-a030-fbce904acd5b", "e26e19b7-950d-ea4d-8941-4f1bb0bcfb9f", "246c2cf1-0cf0-2d4c-8f9c-bd826f2fb1d3", "18a2e96b-17c1-7141-bcff-4d3fcbb14552", "83a9c128-a98b-d846-bd43-13d09dbc8ed7", "2cfb20a7-6a8b-6e4f-986e-559c7c109314", "ed78cceb-dec5-b84c-8cac-cd8beefadf64", "7b5ca332-2c82-bd47-b120-5ab6488b7ce7", "a3f7cc41-379e-184a-87c2-d1b4eb1d9f10", "06ad5f16-d311-e641-94e8-5e4568858e9d", "bf795cb6-6a28-b44f-b086-4a779919c8af", "21e94876-9a20-8e4b-ae19-af7ee1b466e9", "02113245-3d03-e645-855d-c4a895fde362", "59dea945-c155-7e49-9ca7-bbf027ef492d", "58ac27ad-c80f-e742-acf0-b5cc848f6f3d", "a662084c-2877-244c-9711-804a924037d7", "ab849c8f-cf9a-9642-8d22-97eab14641ad", "d6c02811-0286-eb4f-a948-3024c71a8f1d", "064a368e-375b-224d-87e8-cb6f48db2d0f", "8bdfc77a-29b7-bb4f-9a32-60d87e11e7d6", "babba2ee-3529-0040-af13-66fe7f5204dd", "8bc06e8d-0781-a740-b402-e5cc5a1a70c9", "618dfe1d-1ada-714d-9e4b-d2ca056a55e1", "7851e6b3-e13f-6b43-9890-9a3b0cf23c65", "db24cae4-0ab7-7f4e-8abd-94a32a8996bb", "1fd40686-c1dd-f34b-b578-ccf3f28e2aed", "632a9884-719e-4c44-bb67-63797d1bafc4", "75ec98e0-fad5-1c48-8629-ed784cc377b8", "95507aa3-b062-a248-af67-45885fd11763", "0fdfa1fb-8b8a-814e-9e21-d4e24c8cb8c3", "5c1c5984-2c41-1b40-9b10-c205517faa2e", "299cb212-558e-db49-8eb3-393b33301a71", "41a485bf-da12-a242-83ca-f392fb5f13ef", "c298d5bb-ff17-594c-89fd-c98f28159ab3", "0cd00c66-473e-6e4d-ae82-db30831b2d79", "67195b91-357e-bf40-ad84-54ffef717aa9", "bbb041d4-6e92-dc42-82b4-0e8dfd4a3a60", "a6e4a9ce-a65c-074b-b102-f6ddf594aeaa", "30a7d950-cbcc-b34f-a52e-b9dde20ba6cb", "33ab61c9-d9c4-7344-915b-42d82c47c7dd", "aeaa3d32-93e6-5642-8e06-ea6267b1cf0f", "3599a3c2-3cf0-c241-bcd3-445af7572201", "61ff9b83-0532-934e-87a3-539d534dc733", "bdb24e28-8ede-2248-ad93-a9352a159718", "9af0b267-3fce-8f4f-a5c1-dc8c913715e5", "82e42b19-90eb-b041-a728-8bb9d091bb34", "3dc4dbe0-541c-3045-943a-352f62c20b25", "fcd15624-c75d-c64a-9ba5-e77c7aad7d52", "1ac7527e-64a9-6b4c-9dee-cda4301fbda5", "3ab0fd75-8f55-3945-83e4-46666ed5c4a6", "aa800128-feb4-0240-8e0a-6c646c788b47", "89bb275d-ebc8-6044-9200-aa802be0905e", "f033003f-21dd-5a4f-ba62-2bb8934c26d1", "5d815143-ff5d-5140-af98-641fd7ba7e9c", "341519f2-2872-a14f-9e00-c3ef5b296fb4", "2c2ed0ec-9a3e-1c42-b8f1-7ef44ab9e9c7", "42a3d948-29b7-6440-9901-838679ea3481", "4f0e3572-0cec-564a-a0b1-1302397835bd", "c8f052fd-23c0-fe45-9999-7eb5a8f8a911", "5b1d9e2e-9189-8b4b-8178-76f84ffc6cf6", "5558577d-bf29-da47-8e34-4a50baeb0135", "d4b1b430-da88-0041-94e0-5da80bb0db77", "7cbf838f-9b9f-6f41-96ce-1ca72e18d7d2", "250c2d4a-3a18-b543-91de-6be2e1024e94", "f5d536a1-40fa-ce45-8789-6e04eefcf9d3", "b30623b0-8168-9e47-a682-5f3bf0655596", "de22331d-9228-1040-9ca6-802b9b234d7a", "c9549122-527b-9145-9050-6832d9631968", "b8f82a9d-5cd6-2541-8da0-e163518aa4aa", "7d281334-d606-544d-9561-efb4f96d5e43", "0bd110f1-d1f6-944b-bf8a-14b87e5b29f3", "c3ea321d-a008-4449-9b4b-fdb99a9f5f1f", "8bfb924d-5780-314a-8209-0f4c6d1ed347", "8b0de578-9d2b-e344-a979-1c011019eff7", "b2f57680-42a5-0c48-9163-8fcbe7cca688", "9af06903-b187-3c42-ab0e-482b607a8c89", "7a9a72a8-7edb-6f4c-8a9b-d6b3a0b14d33", "d0d60e84-3bbe-8e4f-b45f-e5c14e4699a5", "22f4e93b-4a8f-6e4e-9503-27bca81b4358", "5adf117c-4036-0443-be06-910446798209", "d91273bd-366a-7e46-9cd6-625075563b72", "b66d85a7-4d97-aa49-95a9-01f1067d0a84", "b38aed92-9fac-7848-9db0-4e2b7534419a", "142b4ad4-7be5-3044-ae6d-537311071a86", "da14d4c2-fa76-e64e-98d1-6e274757647a", "474d192d-9292-2348-bd04-c21e8ca9647c", "bdb25b88-70da-8f4c-997c-b37bffe844fc", "c5d81825-1740-ef4a-8d65-57d95f2ee35e", "eb6a6872-a69a-ea48-adb7-81b21aa701c1", "80da6d84-2b1e-784d-a146-33b649aff0a1", "c637ae85-a082-7541-98db-4e51340160ea", "c87f6bd7-c490-664e-b6ad-be13dcf3c7d6", "5bff7371-6455-2845-8bfa-34b8c6f08dd9", "b4776a8e-60f8-0142-bee4-eaa52999e64c", "0fa2d206-40f6-7649-b6ed-0c095c251e48", "ebb66f29-e403-3243-9f5d-446df0b16f7a", "3f46e303-e38b-8547-98f9-46c3fe39e9a9", "34832f62-224f-e14a-b073-4bf658b16ddd", "b1f0f094-9877-9f44-b634-02532276d969", "f2d9de4f-e8a2-8e49-a9a3-c74fe1574a0e", "af4d4f6b-c7bb-534c-9da3-c347e5cebe76", "62cbb069-771e-b849-96a9-6af28ea03c38", "84a4a717-403c-7c44-8ea1-80bdc64537f1", "d1606dc4-b272-4e48-a1c7-40ab4d4820b1", "b0af1663-8f45-564a-994b-06965e8b5776", "da2060d4-5780-2044-9012-ace17df86023", "6e5cf45b-2246-c047-9300-e7b6d1bb907e", "beaf2ed3-210e-934a-87c7-683e9e8b99f8", "b57fe286-f198-4643-bf24-18f3fe206da9", "0c960b1c-cda8-8c44-84f8-41a802b52b68", "c72da6a3-6c83-9f42-bd5a-ed46f2b3844c", "7bb9527f-13e9-be49-b6b4-a2456c9e360a", "6775fd40-2f9b-5c41-9478-ea399ff541f2", "21125ec2-4485-8441-bf61-98abb109fbc4", "508b95f7-0e73-cd4e-be06-055ad10fabc0", "528f71aa-e556-6e41-859e-6c520d04efd0", "afeab06d-e6c3-c549-a38a-a112edfd4ea9", "f724f848-4d69-6b4c-98c4-3c3fef520d28", "d1800e75-5596-8942-a20d-7a8261bbcb77", "144ba418-1c1b-f346-aa87-2cf76300e944", "745ca83b-0d21-8a41-8fbd-fd04ba46048a", "a3dda9ad-c33c-744d-9adc-9f6255cc3474", "a4569f51-2808-084d-a187-956f3f80935b", "9d0c5eba-8921-c745-a557-37357eee828a", "c69b0c8a-46a9-ce47-8d74-ba550e6da719", "91260b4d-5649-2c4f-89d3-c18917862f4e", "19771a67-fe39-2245-84d1-52720a583085", "7f1283e7-263a-ac41-9035-1b69c5d641e3", "36a145e6-6de0-d14f-84e6-35eee44fe6e3", "62b3c17a-ec2f-d647-9f7b-e28b020fd9f6", "d8072abe-393a-6a47-a3b0-4ee6daa32ea3"];
    const result =  this.subtituloRepository.createQueryBuilder()
      .delete()
      .from(Subtitulo)
      .where("id_ficha IN (:...fichas)", { fichas: listaFichas })
      .execute();

    //contar todos los subtitulos coincidan con la lista de fichas
    // const subtitulos = await this.subtituloRepository.createQueryBuilder('subtitulo').where("id_ficha IN (:...fichas)", { fichas: listaFichas }).getCount();

    return result;
  }


}
