import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Table } from './entities/tables.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTableDto } from './dtos/create-table.dto';
import { User } from '../user/entities/user.entity';
import { EditTableAvailabilityDto, EditTableDto } from './dtos/edit-table.dto';
import { Sale } from '../sale/entities';
import { statusEnum } from 'src/sale/enum';

@Injectable()
export class TablesService {
    constructor(@InjectRepository(Table)
    private readonly tablesRepository: Repository<Table>,
        @InjectRepository(Sale)
        private readonly saleRepository: Repository<Sale>,
    ) { }

    async getMany(): Promise<any[]> {
        let tables: any[] = [];

        tables = await this.tablesRepository.find({ order: { name: 'asc' }, relations:['sale','sale.sale_items','sale.sale_items.item','sale.user'] });
        return tables;
    }
    async getManyBy(available: boolean): Promise<Table[]> {
        return await this.tablesRepository.find({ where: { available: available } });
    }
    async delete(id: number) {
        const table = await this.getOne(id);
        return await this.tablesRepository.delete({ id: table.id });
    }
    async getOne(id: number): Promise<Table> {
        const table = await this.tablesRepository.findOne({ where: { id: id } })
        if (!table) throw new NotFoundException('La mesa no existe');
        return table;
    }
    async getOneByName(name: string): Promise<Table> {
        const table = await this.tablesRepository.findOne({ where: { name: name } })
        if (table) throw new BadRequestException('Ya existe una mesa con ese');
        return table;
    }
    async create(dto: CreateTableDto, user: User): Promise<Table> {
        const check = await this.getOneByName(dto.name);
        const newComplaint = await this.tablesRepository.create(dto);
        return await this.tablesRepository.save(newComplaint);
    }
    async edit(dto: EditTableAvailabilityDto, id: number): Promise<Table> {
        const table = await this.getOne(id);
        const editedClient = Object.assign(table, dto);
        editedClient.available = true;
        return await this.tablesRepository.save({ ...editedClient });
    }
    async update(dto: EditTableDto, id: number): Promise<Table> {
        const table = await this.getOne(id);
        const editedClient = Object.assign(table, dto);
        return await this.tablesRepository.save(editedClient);
    }
    async updateTable(id: number, sale_id:number): Promise<Table> {
        const table = await this.getOne(id);
        table.available = false;
        return await this.tablesRepository.save({...table, sale:{id: sale_id}});
    }
}
