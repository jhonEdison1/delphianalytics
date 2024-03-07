import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";


export class CreateTagDto {

    @ApiProperty({
        description: 'Clave principal de la entidad',
        type: String,
        required: true,
    })
    @IsString()    
    clavePrincipal: string;

    @ApiProperty({
        description: 'ID de la ficha a la que pertenece el tag',
        type: String,
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    id_ficha: string;

    @ApiProperty({
        description: 'Texto del tag',
        type: String,
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    tag: string;
}
