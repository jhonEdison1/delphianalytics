
ALTER DATABASE delphi SET search_path = delphi, public;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE EXTENSION IF NOT EXISTS unaccent;



CREATE INDEX idx_texto_gin ON subtitulos USING gin(to_tsvector('spanish', "Texto"::text));


