import { Test, TestingModule } from '@nestjs/testing';
import { SaleService } from './sale.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Item } from '../item/entities/item.entity';
import { ItemService } from '../item/item.service';
import { createMock } from '@golevelup/ts-jest';
import { SaleItems, Sale } from './entities';
describe('SaleService', () => {
    //let service: SaleService;
    let repo: Repository<Sale>;
    jest.setTimeout(20000);
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SaleService, {
                    provide: getRepositoryToken(Sale), useValue: createMock<Repository<Sale>>()
                },
                ItemService, {
                    provide: getRepositoryToken(Item), useValue: createMock<Repository<Item>>()
                },
                {
                    provide: getRepositoryToken(SaleItems), useValue: createMock<Repository<SaleItems>>()
                }
            ],
        }).compile();

        //service = module.get<SaleService>(SaleService);
        repo = module.get<Repository<Sale>>(getRepositoryToken(Sale));
    });

    it('should be defined', () => {
        expect(typeof repo.find).toBe('function');
        //expect(service).toBeDefined();
    });
});
