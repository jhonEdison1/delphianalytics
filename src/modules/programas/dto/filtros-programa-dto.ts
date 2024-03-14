import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";


export class FiltrosProgramaDto { 

    @ApiProperty({
        required: false,
        description: 'Criterio de busqueda'
    })
    @IsIn(['Programa', 'Promo', 'Ajuste', 'Transmisión'])
    @IsOptional()
    readonly criterio: string;

    @ApiProperty({
        required: false,
        description: 'Patrimonio de busqueda'
    })
    @IsIn(['Si', 'No'])
    @IsOptional()
    readonly patrimonio: string;

    @ApiProperty({
        required: false,
        description: 'Idioma de busqueda'
    })
    @IsOptional()
    readonly idioma: string;

    @ApiProperty({
        required: false,
        description: 'Clasificacion de busqueda'
    })
    @IsOptional()
    readonly clasificacion: string;

    @ApiProperty({
        required: false,
        description: 'Titulo de busqueda'
    })
    @IsOptional()
    readonly titulo: string;
}