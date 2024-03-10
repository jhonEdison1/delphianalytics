import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";


export class FiltrosProgramaDto {

    //entidad criterio, patrimonio, idioma, clasificacion, titulo

   /* @ApiProperty({
        required: true,
        description: 'Entidad de busqueda'
    })
    // es un enum o es en programa o es ficha no puede tomar otro valor
    @IsIn(['programa', 'ficha'])
    readonly entidad: string;*/


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