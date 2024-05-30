import { Injectable, NotFoundException } from '@nestjs/common';
import { Complaint } from './entities/complaint.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../sale/entities';
import { ComplaintDTO } from './dtos/create-complaint.dto';
import { User } from 'src/user/entities/user.entity';
import { EditComplaintDTO } from './dtos/edit-complaint.dto';
import { User as UserEntity } from '../user/entities/user.entity';
import { Rol } from 'src/user/enum';

@Injectable()
export class ComplaintService {
    constructor(@InjectRepository(Complaint)
        private readonly complaintRepository: Repository<Complaint>,
        @InjectRepository(Sale)
        private readonly saleRepository: Repository<Sale>
    ) { }

    async getMany(user:User): Promise<Complaint[]>{
        if(user.roles.includes(Rol.CLIENT)) return await this.complaintRepository.find({relations:['user','revisedBy'], where:{user:{id:user.id}}, order: {createdAt: 'desc'}});
        return await this.complaintRepository.find({relations:['user','revisedBy'], order: {createdAt: 'desc'}});
    }
    async getManyByFilter(user:User, filter:string): Promise<Complaint[]>{
        if(user.roles.includes(Rol.CLIENT)) return await this.complaintRepository.find({relations:['user','revisedBy'], where:{user:{id:user.id}, complaintStatus: filter ? filter : null}, order: {createdAt: 'desc'}});
        return await this.complaintRepository.find({relations:['user','revisedBy'],where:{complaintStatus: filter === 'all' ? null : filter}, order: {createdAt: 'desc'}});
    }
    async getManyBy(type:string): Promise<Complaint[]>{
        return await this.complaintRepository.find({relations:['user','revisedBy'], where:{type:type}, order: {createdAt: 'desc'} });
    }
    async delete(id: number) {
        const complaint = await this.getOne(id);
        return await this.complaintRepository.delete({id:complaint.id});
    }
    async getOne(id: number): Promise<Complaint> {
        const complaint = await this.complaintRepository.findOne({ where: { id: id } })
        if (!complaint) throw new NotFoundException('El reclamo no existe');
        return complaint;
    }
    async create(dto: ComplaintDTO, user:User): Promise<Complaint>{
        const newComplaint = await this.complaintRepository.create({type:dto.type, description: dto.description, user: user});
        const complaint = await this.complaintRepository.save(newComplaint);
        return complaint;
    }
    async edit(dto: EditComplaintDTO, id:number, user: UserEntity){
        const complaint = await this.getOne(id);
        const editedComplaint = Object.assign(complaint, dto);
        editedComplaint.revised = true;
        editedComplaint.revisedBy = user;
        return await this.complaintRepository.save(editedComplaint);
    }
    
}
