
import { Module } from '@nestjs/common';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from './entities/tables.entity';
import { SaleService } from 'src/sale/sale.service';
import { Sale, SaleItems } from 'src/sale/entities';

@Module({
  imports:[
    TypeOrmModule.forFeature([Table, Sale, SaleItems])
  ],
  controllers: [TablesController],
  providers: [TablesService, SaleService]
})
export class TablesModule {}
