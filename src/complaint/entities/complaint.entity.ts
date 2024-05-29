import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { ComplaintType } from "../enums/ComplaintType.enum";
import { User } from "../../user/entities/user.entity";
import { ComplaintStatus } from "../enums/ComplaintStatus.enum";

@Entity('complaint')
export class Complaint{
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({type:'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updateAt?: Date;

    @Column({type: 'text', nullable: false})
    description:string;

    @Column({type: 'enum', enum:ComplaintType, nullable: true, default: ComplaintType.COMPLAINT})
    type:string;

    @ManyToOne(type => User, (user) => user.complaints, { cascade:true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
    @JoinColumn({name: "user"})
    user: User;

    @Column({type: 'boolean', default: false, nullable: true})
    revised: boolean;

    @ManyToOne(type => User, (user) => user.revisedComplaints, {nullable:true, cascade:true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
    @JoinColumn({name: "revisedBy_id"})
    revisedBy: User;

    @Column({type: 'text', nullable: true})
    note:string

    @Column({type: 'text', nullable: false, default: ComplaintStatus.WAITING})
    complaintStatus:string
}