
ALTER DATABASE delphi SET search_path = delphi, public;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE EXTENSION IF NOT EXISTS unaccent;


/**
Despues de que elimine las tablas copie desde aqui en la base de datos
*/
CREATE INDEX idx_subtitulo_texto_gin ON subtitulos USING gin(to_tsvector('spanish', "texto"::text));

CREATE INDEX idx_tag_texto_gin ON tags USING gin(to_tsvector('spanish', "textoTag"::text));


/*ignorar si no es necesario*/
ALTER TABLE delphi.nombre_de_tabla SET SCHEMA public;  /*hacer esto con todas las tablas



/**
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

   

    const fichaQuery = this.fichaRepository.createQueryBuilder('ficha');
    fichaQuery.where('ficha.id_programa IN (:...programas)', { programas: programas.map(programa => programa.clavePrincipal) }); // Aquí se agrega la línea
    if (fichaFiltros) {
        for (const key in fichaFiltros) {
            fichaQuery.andWhere(`ficha.${key} = :${key}`, { [key]: fichaFiltros[key] });
        }
    }

    const fichas = await fichaQuery.select('ficha.clavePrincipal').getMany();

   // return fichas;

    // Construir la consulta para los subtitulos
    const subtituloQuery = this.subtituloRepository.createQueryBuilder('subtitulo');
    //subtituloQuery.where('subtitulo.id_ficha IN (:...fichas)', { fichas });
    subtituloQuery.where('subtitulo.id_ficha IN (:...fichas)', { fichas: fichas.map(ficha => ficha.clavePrincipal) });
    subtituloQuery.andWhere('to_tsvector(subtitulo.texto::text) @@ to_tsquery(:palabraClave)', { palabraClave });



    // Obtener los subtitulos que coinciden con la palabra clave
    const subtitulos = await subtituloQuery
      .offset(skip)
      .limit(tamanoPagina)
      .getMany();

    //return subtitulos;

    // Obtener los programas y fichas correspondientes a los subtitulos
    const resultados = await Promise.all(subtitulos.map(async subtitulo => {    
      const ficha = await this.fichaRepository.findOne({ where: {clavePrincipal : subtitulo.id_ficha } }); 
      const programa = await this.programaRepository.findOne({ where: {clavePrincipal : ficha.id_programa } });
      return { programa, ficha, subtitulo };
    }));

 
    return resultados;
  }*/



