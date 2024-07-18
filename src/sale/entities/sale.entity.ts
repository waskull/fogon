import { User } from "../../user/entities/user.entity";
import { Column, JoinColumn, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinTable, UpdateDateColumn, OneToOne,  } from "typeorm";
import { SaleItems } from "./sale_item.entity";
import { Method, statusEnum } from '../enum/';
import { Table } from "../../tables/entities/tables.entity";

@Entity('sale')
export class Sale{
    @PrimaryGeneratedColumn()
    id?: number;

    @CreateDateColumn({type:'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updateAt?: Date;

    @OneToMany(type => SaleItems, (sale_items) => sale_items.sale_id, { cascade:true, onUpdate: 'CASCADE', onDelete: 'SET NULL'})
    @JoinColumn({name: "sale_items"})
    sale_items: SaleItems[];

    @Column({type: 'enum', nullable: false, enum:statusEnum, default:statusEnum.INCOMPLETE })
    status: string;

	@Column({type: 'varchar', length: 255, nullable: true})
    address:string;
	

    @Column({type: 'enum', nullable: false, enum:Method, default:Method.Cash })
    paymentMethod: string;

    @Column({type: 'simple-array', nullable: true})
    pay_code: string[];

    @Column({type:'decimal',precision:11, scale:2, nullable:true})
    total: number;
	
	@ManyToOne(type => User, (user) => user.delivery_man, { cascade:true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
    @JoinColumn({name: "delivery_man_id"})
    delivery_man: User;

    @ManyToOne(type => User, (user) => user.salesman_sales, { cascade:true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
    @JoinColumn({name: "salesman_id"})
    salesman: User;
	
	@ManyToOne(type => User, (user) => user.sales, { cascade:true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
    @JoinColumn({name: "user"})
    user: User;

    @Column({type: 'boolean', default:true, nullable: true})
    isOrder:boolean;

    @Column({type:'timestamptz', nullable: true})
    payment_date: Date;

    @OneToMany((type) => Table, (table) => table.sale)
    table: Table[];

    @ManyToOne((type) => Table, (table) => table.sales, { onUpdate: 'CASCADE', onDelete: 'SET NULL' })
    @JoinColumn({name: 'table_id'})
    selected_table: Table;

    @Column({type: 'boolean', default:false, nullable: true})
    delivered:boolean;

    // @ManyToOne(type => Table, (table) => table.sales, { cascade:true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
    // @JoinColumn({name: "table_id"})
    // table: Table;

    // @OneToMany(type => TableSale, (table_sale) => table_sale.sales, { cascade:true, onUpdate: 'CASCADE', onDelete: 'SET NULL'})
    // @JoinColumn({name: "sale_items"})
    // table_sale: TableSale[];
}