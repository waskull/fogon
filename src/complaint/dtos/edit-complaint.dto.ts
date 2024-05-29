import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { EnumToString } from "../../common/utils/enumToString";
import { ComplaintStatus } from "../enums/ComplaintStatus.enum";

export class EditComplaintDTO{
    @IsOptional()
    @IsString({message:'La nota del reclamo debe de ser una cadena de caracteres'})
    note:string;

    @IsString({message:'El estado del reclamo debe de ser una cadena de caracteres'})
    @IsEnum(ComplaintStatus, {each: true, message: `El estado del reclamo debe de ser una opción entre: ${EnumToString(ComplaintStatus)}`})
    complaintStatus:string;
}