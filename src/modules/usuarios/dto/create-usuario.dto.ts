import { IsEmail, IsEnum, IsString, IsStrongPassword } from "class-validator";
import { Role } from "src/modules/iam/models/roles.model";

export class CreateUsuarioDto {

    @IsEmail()
    email: string;

    @IsString()
    password: string;

    // @IsString()
    @IsEnum(Role)
    rol: Role;
}
