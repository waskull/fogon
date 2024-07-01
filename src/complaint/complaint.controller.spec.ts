import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintController } from './complaint.controller';
import { AppModule } from '../app.module';
import { ComplaintService } from './complaint.service';

describe('ComplaintController', () => {
  let controller: ComplaintController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintController],
      imports: [AppModule],
      providers: [{
        provide: ComplaintService,
        useValue: {
          findOne: jest.fn(),
          save: jest.fn(),
          create: jest.fn(),
        }
      },
      ]
    }).compile();

    controller = module.get<ComplaintController>(ComplaintController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
