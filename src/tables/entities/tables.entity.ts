import { Sale } from "../../sale/entities";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, OneToOne } from "typeorm";
// import { User } from "../../user/entities/user.entity";

@Entity('tables')
export class Table{
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({type:'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updateAt?: Date;

    @Column({type: 'varchar', length: 255, nullable: false})
    name:string;

    @Column({type: 'integer', unsigned:true, nullable: false})
    capacity:number;

    @Column({type: 'boolean', unsigned:true, nullable: false, default: true})
    available:boolean;

    @ManyToOne(type => Sale, (sale) => sale.table, {nullable:true, cascade:true, onUpdate: 'CASCADE', onDelete: 'SET NULL' })
    @JoinColumn({name: "sale_id"})
    sale: Sale;

    // @OneToMany((type) => Sale, (sale) => sale.table)
    // sales: Sale[];

    // @OneToMany(type => TableSale, (sale_table) => sale_table.table)
    // table_sale: TableSale[];

    @OneToMany(type => Sale, (sale) => sale.selected_table)
    @JoinColumn({name: "sale_id"})
    sales: Sale[];
}