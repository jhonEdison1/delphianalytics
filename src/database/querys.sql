
ALTER DATABASE delphi SET search_path = delphi, public;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE EXTENSION IF NOT EXISTS unaccent;


/**
Despues de que elimine las tablas copie desde aqui en la base de datos
*/
CREATE INDEX idx_texto_gin ON subtitulos USING gin(to_tsvector('spanish', "texto"::text));

CREATE INDEX idx_texto_gin_tags ON tags USING gin(to_tsvector('spanish', "textoTag"::text));



