import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Gender, Rol } from "../enum";
import { hash } from 'bcrypt'
import { Sale } from "../../sale/entities";
import { Order } from "../../order/entities";
import { PasswordRecovery } from "../../auth/entities/password.entity";
import { Complaint } from "../../complaint/entities/complaint.entity";

@Entity('user')
export class User{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 255, nullable: false})
    firstname!:string;

    @Column({type: 'varchar', length: 255, nullable: false})
    lastname!:string;

    @Column({type: 'varchar', length: 255, nullable: false, unique: true})
    email!:string;

    @Column({type: 'varchar', length: 255, nullable: false, select: false})
    password!:string;

    @Column({type: 'simple-array', nullable: false, enum:Rol, default:Rol.CLIENT})
    roles: string[];

    @Column({type: 'enum', nullable: true, enum:Gender, default:Gender.Male})
    gender: string;

    @Column({type:'date', nullable: true})
    birthdate: Date;

    @Column({type: 'varchar', length: 255, nullable: false})
    dni: string;

    @Column({type: 'varchar', length: 255, nullable: true})
    phone?: string;

    @Column({type: 'boolean', nullable: true, default: true})
    active:boolean;

    @CreateDateColumn({type:'timestamp'})
    createdAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(){
        if (!this.password){
            return;
        }
        this.password = await hash(this.password, 10);
    }


    @OneToMany((type) => Order, (order) => order.bought_by)
    orders: Order[];

    
    @OneToMany((type) => Sale, (sale) => sale.delivery_man)
    delivery_man: Sale[];
	@OneToMany((type) => Sale, (sale) => sale.user)
    sales: Sale[];

    @OneToMany((type) => Complaint, (complaint) => complaint.user)
    complaints: Complaint[];

    @OneToMany((type) => Complaint, (revisedComplaint) => revisedComplaint.revisedBy)
    revisedComplaints: Complaint[];

    @OneToMany((type) => PasswordRecovery, (passwordRecovery) => passwordRecovery.user)
    resetCode: PasswordRecovery[];
    
}