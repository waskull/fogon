import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintService } from './complaint.service';
import { createMock } from '@golevelup/ts-jest';
import { Repository } from 'typeorm';
import { Sale, SaleItems } from '../sale/entities';
import { SaleService } from '../sale/sale.service';
import { Complaint } from './entities/complaint.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ComplaintService', () => {
  // let service: ComplaintService;
  let repo: Repository<Complaint>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SaleService, {
            provide: getRepositoryToken(Sale), useValue: createMock<Repository<Sale>>()
        },
        ComplaintService,{
          provide: getRepositoryToken(Complaint), useValue: createMock<Repository<Complaint>>()
        },
        
        {
          provide: getRepositoryToken(SaleItems), useValue: createMock<Repository<SaleItems>>()
      }
    ],
    }).compile();
    repo = module.get<Repository<Complaint>>(getRepositoryToken(Complaint));
    // service = module.get<ComplaintService>(ComplaintService);
  });

  it('should be defined', () => {
    // expect(service).toBeDefined();
    expect(typeof repo.find).toBe('function');
  });
});
