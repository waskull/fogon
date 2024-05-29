import { IsArray, IsDateString, IsEmail, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";
import { EnumToString } from "../../common/utils/enumToString";
import { AppRoles } from "../../app.roles";
import { Gender } from "../enum";
export class CreateUserDto{
    @IsEmail({}, {message:'El correo debe de ser una cadena de caracteres'})
	@MinLength(3, {message:'El correo debe de tener minimo 2 caracteres'})
    email: string;

    @IsString({message:'La contraseña debe de ser una cadena de caracteres'})
	@MinLength(3, {message:'La contraseña debe de tener minimo 2 caracteres'})
    password: string;

    @IsString({message:'El nombre debe de ser una cadena de caracteres'})
    @MinLength(3, {message:'El nombre debe de tener minimo 2 caracteres'})
    firstname: string;

    @IsString({message:'El apellido debe de ser una cadena de caracteres'})
    @MinLength(3, {message:'El apellido debe de tener minimo 2 caracteres'})
    lastname: string;

    @IsArray()
    @IsEnum(AppRoles, {each: true, message: `Debes escoger un rol válido entre: ${EnumToString(AppRoles)}`})
    roles: string[];

    @IsString({message:'El género debe de ser una cadena de caracteres'})
    @IsEnum(Gender, {each: true, message: `Debes escoger un género válido entre: ${EnumToString(Gender)}`})
    gender: string;

    @IsString({message:'El dni debe de ser una cadena de caracteres'})
    @MinLength(3, {message:'El dni debe de tener minimo 3 caracteres'})
    dni: string;

    @IsOptional()
    @MinLength(5, {message:'El telefono debe de tener minimo 5 caracteres'})
    @IsString({message:'El telefono debe de ser una cadena de caracteres'})
    phone?: string;

    @IsDateString()
    birthdate: Date;
}


export class CreateUserDtoPass{
    @IsEmail({}, {message:'El correo debe de ser una cadena de caracteres'})
	@MinLength(3, {message:'El correo debe de tener minimo 2 caracteres'})
    email: string;

    @IsOptional()
    @IsString({message:'La contraseña debe de ser una cadena de caracteres'})
	@MinLength(3, {message:'La contraseña debe de tener minimo 2 caracteres'})
    password: string;

    @IsString({message:'El nombre debe de ser una cadena de caracteres'})
    @MinLength(3, {message:'El nombre debe de tener minimo 2 caracteres'})
    firstname: string;

    @IsString({message:'El apellido debe de ser una cadena de caracteres'})
    @MinLength(3, {message:'El apellido debe de tener minimo 2 caracteres'})
    lastname: string;

    @IsString({message:'El genero debe de ser una cadena de caracteres'})
    @IsEnum(AppRoles, {each: true, message: `Debes escoger un genero valido entre: ${EnumToString(Gender)}`})
    gender: string;

    @IsArray()
    @IsEnum(AppRoles, {each: true, message: `Debes escoger un rol valido entre: ${EnumToString(AppRoles)}`})
    roles: string[];

    @IsString({message:'La cedula debe de ser una cadena de caracteres'})
    @MinLength(3, {message:'La cedula debe de tener minimo 3 caracteres'})
    dni: string;

    @IsOptional()
    @MinLength(5, {message:'El telefono debe de tener minimo 5 caracteres'})
    @IsString({message:'El telefono debe de ser una cadena de caracteres'})
    phone?: string;

    @IsDateString()
    birthdate: Date;
}