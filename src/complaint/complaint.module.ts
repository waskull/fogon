import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm'
import { ComplaintController } from './complaint.controller';
import { ComplaintService } from './complaint.service';
import { Sale } from '../sale/entities';
import { Complaint } from './entities/complaint.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Complaint, Sale])
  ],
  controllers: [ComplaintController],
  providers: [ComplaintService],
  exports:[ComplaintService]
})
export class ComplaintModule {}
