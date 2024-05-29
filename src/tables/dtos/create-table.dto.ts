import { IsBoolean, IsNumber, IsPositive, IsString, MinLength } from "class-validator";

export class CreateTableDto{
    @IsString({message:'Debes enviar un nombre'})
    @MinLength(3, {message:'El nombre debe de tener minimo 2 caracteres'})
    name: string;

    @IsNumber()
    @IsPositive({message:"El ID del vendedor debe de ser valido"})
    capacity: number;

    
}

