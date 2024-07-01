import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Item } from '../item/entities/item.entity';
import { ItemService } from '../item/item.service';
import { createMock } from '@golevelup/ts-jest';
import { OrderItems, Order } from './entities';
describe('OrderService', () => {
    //let service: OrderService;
    let repo: Repository<Order>;
    jest.setTimeout(310000);
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService, {
                    provide: getRepositoryToken(Order), useValue: createMock<Repository<Order>>()
                },
                ItemService, {
                    provide: getRepositoryToken(Item), useValue: createMock<Repository<Item>>()
                },
                {
                    provide: getRepositoryToken(OrderItems), useValue: createMock<Repository<OrderItems>>()
                }
            ],
        }).compile();

        //service = module.get<OrderService>(OrderService);
        repo = module.get<Repository<Order>>(getRepositoryToken(Order));
    });

    it('should be defined', () => {
        expect(typeof repo.find).toBe('function');
        //expect(service).toBeDefined();
    });
});
