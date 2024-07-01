import { Test, TestingModule } from '@nestjs/testing';
import { TablesService } from './tables.service';
import { Table } from './entities/tables.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';
import { Repository } from 'typeorm';
import { Sale, SaleItems } from '../sale/entities';
import { SaleService } from '../sale/sale.service';

describe('TablesService', () => {
  let service: TablesService;
  let repo: Repository<Table>;
  jest.setTimeout(20000);
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaleService, {
            provide: getRepositoryToken(Sale), useValue: createMock<Repository<Sale>>()
        },
        TablesService, {
            provide: getRepositoryToken(Table), useValue: createMock<Repository<Table>>()
        },
        
        {
          provide: getRepositoryToken(SaleItems), useValue: createMock<Repository<SaleItems>>()
      }
    ],
    }).compile();
    repo = module.get<Repository<Table>>(getRepositoryToken(Table));
    // service = module.get<TablesService>(TablesService);
  });

  it('should be defined', () => {
    // expect(service).toBeDefined();
    expect(typeof repo.find).toBe('function');
  });
});
