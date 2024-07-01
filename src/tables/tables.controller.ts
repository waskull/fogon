import { Body, Controller, Delete, Get, Param, ParseBoolPipe, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { TablesService } from './tables.service';
import { User as UserEntity } from '../user/entities/user.entity';
import { User } from '../common/decorators';
import { CreateTableDto } from './dtos/create-table.dto';
import { EditTableDto, EditTableAvailabilityDto } from './dtos/edit-table.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Tables')
@Controller('tables')
export class TablesController {
    constructor(private readonly tableService: TablesService){}
    @Get()
    async getAll(){
        return await this.tableService.getMany();
    }
    @Post('filter/:available')
    async getBy(@Param('available', ParseBoolPipe) available: boolean){
        return await this.tableService.getManyBy(available);
    }
    @Post()
    async create(@Body() dto: CreateTableDto, @User() user: UserEntity){
        return await this.tableService.create(dto, user);
    }

    @Patch(':id')
    async edit(@Body() dto: EditTableDto, @Param('id', ParseIntPipe) id: number){
       return await this.tableService.update(dto,id);
    }
    @Patch('availability/:id')
    async update(@Body() dto: EditTableAvailabilityDto, @Param('id', ParseIntPipe) id: number){
       return await this.tableService.edit(dto,id);
    }

    @Delete()
    async delete(@Param('id', ParseIntPipe) id: number){
        return await this.tableService.delete(id);
    }
    
}
