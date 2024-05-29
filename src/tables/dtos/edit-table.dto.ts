import { IsBoolean } from "class-validator";
import { CreateTableDto } from "./create-table.dto";

export class EditTableAvailabilityDto{
    @IsBoolean({message:'Debes enviar el estado de la mesa'})
    available: boolean;
}

export class EditTableDto extends CreateTableDto{
    @IsBoolean({message:'Debes enviar el estado de la mesa'})
    available: boolean;
}