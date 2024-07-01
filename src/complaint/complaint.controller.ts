import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import { User as UserEntity } from '../user/entities/user.entity';
import { Auth, User } from '../common/decorators';
import { ComplaintDTO } from './dtos/create-complaint.dto';
import { ApiTags } from '@nestjs/swagger';
import { EditComplaintDTO } from './dtos/edit-complaint.dto';

@ApiTags('Complaints')
@Controller('complaint')
export class ComplaintController {
    constructor(private readonly complaintService: ComplaintService) { }
    @Auth()
    @Get()
    async getAll(@User() user: UserEntity) {
        return await this.complaintService.getMany(user);
    }
    @Auth()
    @Get('custom/:filter')
    async getByFilter(@User() user: UserEntity,@Param('filter') filter: string) {
        return await this.complaintService.getManyByFilter(user, filter);
    }
    @Post('filter')
    async getBy(@Param('filter') filter: string) {
        return await this.complaintService.getManyBy(filter);
    }
    @Auth()
    @Post()
    async create(@Body() dto: ComplaintDTO, @User() user: UserEntity) {
        return await this.complaintService.create(dto, user);
    }

    @Auth()
    @Patch(':id')
    async edit(@Body() dto: EditComplaintDTO, @Param('id', ParseIntPipe) id: number, @User() user: UserEntity) {
        await !this.complaintService.getOne(id);
        await this.complaintService.edit(dto, id, user);
        return { message: "Reclamo editado" };
    }

    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.complaintService.delete(id);
        return { message: "Reclamo eliminado" };
    }

}
