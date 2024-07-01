import { IsEnum, IsString, MinLength } from "class-validator";
import { ComplaintType } from "../enums/ComplaintType.enum";
import { EnumToString } from "../../common/utils/enumToString";

export class ComplaintDTO{
    @IsString({message:'El reclamo, sugerencia o queja debe de ser una cadena de caracteres'})
	@MinLength(3, {message:'El reclamo, sugerencia o queja debe de tener minimo 2 caracteres'})
    description:string;

    @IsString({message:'El tipo de reclamo, sugerencia o queja debe de ser una cadena de caracteres'})
    @IsEnum(ComplaintType, {each: true, message: `El tipo de reclamo debe de ser una opción entre: ${EnumToString(ComplaintType)}`})
    type:string;
}