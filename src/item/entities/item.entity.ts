// import { Inventory } from "../../inventory/entities/inventory.entity";
import { OrderItems } from "../../order/entities";
import { SaleItems } from "../../sale/entities/";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
// import { Category } from "./category.entity";

@Entity('item')
export class Item{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'varchar', length: 200, nullable: false})
    name:string;

    @Column({type: 'varchar', length: 255, nullable: true, default:"Un delicioso helado"})
    desc:string;
	
	@Column({type: 'varchar', length: 255, nullable: true})
    image:string;

    @CreateDateColumn({type:'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updateAt?: Date;

    @Column({type: 'decimal',precision:11, scale:2, default:0.02, nullable: false})
    price:number;

    // @OneToOne(type => Inventory, inventory => inventory.item)
    // inventory: Inventory;

    // @OneToOne(() => Category, { onUpdate: 'CASCADE', onDelete: 'SET NULL' })
    // @JoinColumn({name: 'category_id'})
    // category: Category;

    @OneToMany(type => OrderItems, (order_items) => order_items.item)
    order_item: OrderItems[];

    @OneToMany(type => SaleItems, (sale_items) => sale_items.item)
    sale_item: SaleItems[];

    @Column({type: 'integer', unsigned:true, nullable: false, default: 0})
    stock:number;
}