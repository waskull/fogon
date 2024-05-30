import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import {TypeOrmModule} from '@nestjs/typeorm'
import {Item} from './entities/item.entity'
// import { Inventory } from '../inventory/entities/inventory.entity';
// import { Category } from './entities/category.entity';
@Module({
  imports:[
    TypeOrmModule.forFeature([Item])
  ],
  controllers: [ItemController],
  providers: [ItemService],
  exports:[ItemService]
})
export class ItemModule {}
