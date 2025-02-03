import { IsOptional } from "class-validator";

export class CreateProgramaDto {

    titulo: string;

    criterio: string;

    genero: string;

    patrimonio: string;

    @IsOptional()
    clasificacion: string;

    idioma: string;

    productora: string;

    @IsOptional()
    imagen: string;

    usuarioId: number;
}
