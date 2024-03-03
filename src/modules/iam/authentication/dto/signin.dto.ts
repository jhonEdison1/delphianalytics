import { ApiProperty } from "@nestjs/swagger";
import {  IsNotEmpty } from "class-validator";



export class SignInDto {

    @ApiProperty({
        name: 'email',
        type: String,
        required: true,
        example: "email@email.com"
    })
    @IsNotEmpty({ message: "Por favor ingrese un email y/o contraseña válida" })    
    readonly email: string;
  

    @ApiProperty({
        name: 'password',
        type: String,
        required: true,
        example: "contrasena1234"
    })
    @IsNotEmpty({ message: "Por favor ingrese un email y/o contraseña válida" })    
    readonly password: string;
}