import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Item } from '../item/entities/item.entity';
import { ItemService } from '../item/item.service';
import { createMock } from '@golevelup/ts-jest';
describe('ItemService', () => {
  //let service: InventoryService;
  let repo: Repository<Item>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemService, {
          provide: getRepositoryToken(Item), useValue: createMock<Repository<Item>>()
        }],
    }).compile();

    //service = module.get<InventoryService>(InventoryService);
    repo = module.get<Repository<Item>>(getRepositoryToken(Item));
  });

  it('should be defined', () => {
    expect(typeof repo.find).toBe('function');
    //expect(service).toBeDefined();
  });
});
