import { IsString, MinLength } from "class-validator";
import { CreateUserDto } from "./create-user.dto";
import { PartialType, OmitType } from "@nestjs/mapped-types";


export class EditUserDto extends PartialType(
    OmitType(CreateUserDto, ['email'] as const)
    ) {}

    export class EditClientDto extends PartialType(
        OmitType(CreateUserDto, ['roles'] as const)
        ) {}

export class EditUserPasswordDTO {
    @IsString({message:'La contraseña debe de ser una cadena de caracteres'})
	@MinLength(3, {message:'La contraseña debe de tener minimo 2 caracteres'})
    password: string;

    @IsString({message:'La contraseña de confirmación debe de ser una cadena de caracteres'})
	@MinLength(3, {message:'La contraseña de confirmación debe de tener minimo 2 caracteres'})
    password2: string;


    @IsString({message:'La contraseña vieja debe de ser una cadena de caracteres'})
	@MinLength(3, {message:'La contraseña vieja debe de tener minimo 2 caracteres'})
    oldPassword: string;
}