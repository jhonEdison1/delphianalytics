import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { FiltrosFichasDto } from "./filtros-fichas-dto";
import { FiltrosProgramaDto } from "./filtros-programa-dto";

export class RequestDTO {

  programaFiltros: FiltrosProgramaDto;

  fichaFiltros: FiltrosFichasDto;

  palabraClave: string;

  ids: string[];
}