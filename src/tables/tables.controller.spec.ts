import { Test, TestingModule } from '@nestjs/testing';
import { TablesController } from './tables.controller';
import { AppModule } from '../app.module';
import { TablesService } from './tables.service';

describe('TablesController', () => {
  let controller: TablesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TablesController],
      imports: [AppModule],
      providers: [{
        provide: TablesService,
        useValue: {
          findOne: jest.fn(),
          save: jest.fn(),
          create: jest.fn(),
        }
      },
      ]
    }).compile();

    controller = module.get<TablesController>(TablesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
