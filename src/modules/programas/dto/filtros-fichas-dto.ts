import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional } from "class-validator";

export class FiltrosFichasDto { 
    @ApiProperty({
        required: false,
        description: 'formato'
    })
    @IsOptional()
    readonly formato: string;


    @ApiProperty({
        required: false,
        description: 'tipoArchivoRecibido'
    })
    @IsOptional()
    readonly tipoArchivoRecibido: string;

    @ApiProperty({
        required: false,
        description: 'tipoArchivoGuardado'
    })
    @IsOptional()
    readonly tipoArchivoGuardado: string;

    @ApiProperty({
        required: false,
        description: 'resolucion'
    })
    @IsOptional()
    readonly resolucion: string;

    @ApiProperty({
        required: false,
        description: 'soporteFisico'
    })
    @IsOptional()
    readonly soporteFisicoGrabacion: string;

}