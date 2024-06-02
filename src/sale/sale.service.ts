import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Sale, SaleItems } from './entities/'
import { statusEnum } from './enum';
import { MailerService } from '@nestjs-modules/mailer';
import { Dates } from '../sale/dtos';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { LOGO64 } from '../config/constants';
import { User } from '../user/entities/user.entity';
import { Rol } from '../user/enum';

@Injectable()
export class SaleService {
    constructor(
        @InjectRepository(Sale)
        private readonly saleRepository: Repository<Sale>,
        @InjectRepository(SaleItems)
        private readonly saleItemRepository: Repository<SaleItems>,
    ) { }
    async getMany(user: User, filter:string): Promise<Sale[]> {
        let sales:Sale[] = [];
        if(user?.roles?.includes(Rol.CLIENT)){
            if(filter === 'Cancelados'){
                sales = await this.saleRepository.find({ relations: ['sale_items', 'sale_items.item', 'user'],where:[{user:{id:user.id},status: statusEnum.CANCELED_SYSTEM},{user:{id:user.id}, status: statusEnum.CANCELED}], order: { createdAt: "DESC" } });
            }
            else if(filter === 'Completados'){
                sales = await this.saleRepository.find({ relations: ['sale_items', 'sale_items.item', 'user'],where:{user:{id:user.id}, status: statusEnum.COMPLETED}, order: { createdAt: "DESC" } });
            }
            else{
                sales = await this.saleRepository.find({ relations: ['sale_items', 'sale_items.item', 'user'],where:{user:{id:user.id}, status: filter === 'all' ? null : filter}, order: { createdAt: "DESC" } });
            }
            
        }
        else if(user?.roles?.includes(Rol.DELIVERY_MAN)){
            sales = await this.saleRepository.find({ relations: ['sale_items', 'sale_items.item', 'user'],where:{delivery_man: {id:user.id},status:statusEnum.WAITING}, order: { createdAt: "DESC" } });
        }
        else{
            if(filter === 'Cancelados'){
                sales = await this.saleRepository.find({ relations: ['sale_items', 'sale_items.item', 'user'], where:[{status: statusEnum.CANCELED},{status: statusEnum.CANCELED_SYSTEM}], order: { createdAt: "DESC" } });
            }
            else if(filter === 'Completados'){
                sales = await this.saleRepository.find({ relations: ['sale_items', 'sale_items.item', 'user'],where:[{status: statusEnum.COMPLETED_TABLE},{status: statusEnum.COMPLETED}], order: { createdAt: "DESC" } });
            }
            else{
                sales = await this.saleRepository.find({ relations: ['sale_items', 'sale_items.item', 'user'], where:{status: filter === 'all' ? null : filter}, order: { createdAt: "DESC" } });
            }
        }
        let newSales: any[] = [];
        sales.forEach(s => {
            let lowstock: boolean = false;

            s.sale_items.forEach(e => {
                if (e.quantity > e.item.stock) {
                    lowstock = true;
                }
            });

            newSales.push({
                ...s,
                lowstock: lowstock
            });
            lowstock = false;
        });
        return newSales;
    }
    async getManyByDate(dates: Dates): Promise<Sale[]> {
        return await this.saleRepository.find({
            relations: ['sale_items', 'sale_items.item', 'user'], where: [{
                createdAt: Between(
                    dates.start,
                    dates.end
                ),
                status: statusEnum.WAITING,

            }, {
                createdAt: Between(
                    dates.start,
                    dates.end
                ),
                status: statusEnum.COMPLETED_TABLE
            }
            , {
                createdAt: Between(
                    dates.start,
                    dates.end
                ),
                status: statusEnum.COMPLETED
            }
            ]

        });
    }

    getReport(sale: Sale): PDFKit.PDFDocument {
        var fonts = {
            Roboto: {
                normal: 'fonts/Roboto-Regular.ttf',
                bold: 'fonts/Roboto-Medium.ttf',
                italics: 'fonts/Roboto-Italic.ttf',
                bolditalics: 'fonts/Roboto-MediumItalic.ttf'
            },
            Poppins:{
                normal: 'fonts/Poppins-Medium.ttf',
                bold: 'fonts/Poppins-Bold.ttf',
                italics: 'fonts/Poppins-Italic.ttf',
                bolditalics: 'fonts/Poppins-MediumItalic.ttf',
            },
            Quicksand:{
                normal: 'fonts/Quicksand-Medium.ttf',
                bold: 'fonts/Quicksand-Bold.ttf',
                semibold: 'fonts/Quicksand-SemiBold.ttf',
                medium: 'fonts/Quicksand-Medium.ttf',
                italics: 'fonts/Quicksand-Italic.ttf',
                bolditalics: 'fonts/Quicksand-BoldItalic.ttf'
            }
        };
        let title = 'REPORTE DE PEDIDO';
        const code = sale.id;
        const printer = new PdfPrinter(fonts);
        const docDefinition = {
            header: '',
            defaultStyle: {
                font: 'Poppins',
                fontSize: 10,
            },
            content: [
                {
                    image: LOGO64,
                    width: 150,
                    alignment: 'center'

                },
                {
                    text: title,
                    fontSize: 14,
                    bold: true,
                    alignment: 'center',
                    decoration: 'underline',
                    color: '#18409d'
                },

                {
                    columns: [
                        [
                            {
                                text: `Fecha de solicitud: ${new Date(sale.createdAt).toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit", year: "numeric" })}`,
                                alignment: 'right',fontSize:12
                            },
                            {
                                text: `Pedido: #${code}`,
                                alignment: 'right',fontSize:12
                            },
                            {
                                text: sale?.user?.firstname ? `usere: ${sale?.user?.firstname} ${sale.user?.lastname}` : 'usere: ',
                                alignment: 'left',
                                bold: false,fontSize:1
                            },
                            {
                                text: sale?.user?.dni ? `Cédula: ${sale?.user?.dni}` : 'Cédula: ',
                                alignment: 'left',
                                bold: false,fontSize:12
                            },

                            {
                                text: sale?.user?.phone ? `Teléfono: ${sale?.user?.phone}` : 'Teléfono: ',
                                alignment: 'left',
                                bold: false,fontSize:12
                            },

                            {
                                text: sale?.user?.email ? `Correo: ${sale?.user?.email}` : 'Correo: ',
                                alignment: 'left',
                                bold: false,fontSize:12
                            },
                            {
                                text: `Método de pago: ${sale?.paymentMethod}`,
                                alignment: 'left',
                                bold: false,fontSize:12
                            },

                            {
                                text: `Dirección: ${sale?.address}`,
                                alignment: 'left',
                                bold: false,fontSize:12
                            },
                            {
                                text: `Estado: ${sale.status}`,
                                alignment: 'left',
                                bold: true,
                                decoration: 'underline',fontSize:12
                            }
                        ]
                    ]
                },
                {
                    text: 'DETALLES DEL PEDIDO',
                    style: 'sectionHeader'
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            ['Artículo', 'Precio', 'Cantidad', 'Monto'],
                            ...sale.sale_items.map(p => ([p?.item.name, sale.total >= 10 ? p?.item.wholesale_price : p?.item?.price, p?.quantity, parseFloat(sale.total >= 10 ? (p?.item.wholesale_price * p?.quantity).toString() : (p?.item.price * p?.quantity).toString()).toFixed(2)])),
                        ]
                    },
                },
                [
                    {
                        text: 'Total:',
                        bold: true,
                        fontSize: 12,
                        alignment: 'right',
                        italics: true,
                        border: [true, false, false, true],
                        margin: [0, 5, 0, 5],
                    },
                    {
                        text: sale.total,
                        bold: true,
                        fontSize: 12,
                        alignment: 'right',
                        border: [false, false, false, true],
                        fillColor: '#f5f5f5',
                        margin: [0, 0, 0, 5],
                        decoration: 'underline'
                    },
                ],
                {
                    text: 'Notas',
                    style: 'sectionHeader'
                },
                {
                    ul: [
                        'Este es un reporte de pedido generado por el sistema FOGON.'
                    ],
                },
            ],
            styles: {
                sectionHeader: {
                    bold: true,
                    decoration: 'underline',
                    fontSize: 14,
                    margin: [0, 15, 0, 15]
                }
            }

        } as TDocumentDefinitions;
        const options = {

        }
        return printer.createPdfKitDocument(docDefinition, options);
    }

    generatePdf(sales: Sale[]): PDFKit.PDFDocument {
        var fonts = {
            Roboto: {
                normal: 'fonts/Roboto-Regular.ttf',
                bold: 'fonts/Roboto-Medium.ttf',
                italics: 'fonts/Roboto-Italic.ttf',
                bolditalics: 'fonts/Roboto-MediumItalic.ttf'
            },
            Poppins:{
                normal: 'fonts/Poppins-Medium.ttf',
                bold: 'fonts/Poppins-Bold.ttf',
                italics: 'fonts/Poppins-Italic.ttf',
                bolditalics: 'fonts/Poppins-MediumItalic.ttf',
            },
            Quicksand:{
                normal: 'fonts/Quicksand-Medium.ttf',
                bold: 'fonts/Quicksand-Bold.ttf',
                semibold: 'fonts/Quicksand-SemiBold.ttf',
                medium: 'fonts/Quicksand-Medium.ttf',
                italics: 'fonts/Quicksand-Italic.ttf',
                bolditalics: 'fonts/Quicksand-BoldItalic.ttf'
            }
        };
        let title = 'REPORTE DE PEDIDOS';
        let total = 0;
        const code = Math.random().toString(36).slice(2).toUpperCase();
        const printer = new PdfPrinter(fonts);
        var data: any[] = [];
        sales.forEach(r => {
            r.sale_items.forEach((res: any) => {
                data.push({
                    id: r.id,
                    item: res.item,
                    quantity: res.quantity,
                    status: r.status,
                    total: r.total,
                    total_paid: r.total,
                    user: r?.user,
                });
            });
        });
        total = data.reduce((sum: number, p: { quantity: number; item: { price: string; } }) => sum + (p.quantity * parseFloat(p.item.price)), 0).toFixed(2);
        const docDefinition = {
            header: '',
            defaultStyle: {
                font: 'Poppins',
                fontSize: 10,
            },
            content: [
                {
                    image: LOGO64,
                    width: 150,
                    alignment: 'center'

                },
                {
                    text: title,
                    fontSize: 14,
                    bold: true,
                    alignment: 'center',
                    decoration: 'underline',
                    color: '#18409d'
                },

                {
                    columns: [
                        [
                            {
                                text: `Fecha: ${new Date().toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit", year: "numeric" })}`,
                                alignment: 'right'
                            },
                            {
                                text: `Reporte: ${code}`,
                                alignment: 'right'
                            }
                        ]
                    ]
                },
                {
                    text: 'DETALLES DEL PEDIDOS',
                    style: 'sectionHeader'
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            ['ID', 'Artículo', 'Precio', 'Cantidad', 'Monto', 'Usuario'],
                            ...data.map(p => ([p?.id, p?.item.name, parseFloat(p?.item?.price), p?.quantity, (parseFloat(p?.item?.price) * p?.quantity).toFixed(2), `${p?.user?.firstname} ${p?.user?.lastname}`])),
                        ]
                    },
                },
                [
                    {
                        text: 'Total:',
                        bold: true,
                        fontSize: 14,
                        alignment: 'right',
                        italics: true,
                        border: [true, false, false, true],
                        margin: [0, 5, 0, 5],
                    },
                    {
                        text: total,
                        bold: true,
                        fontSize: 14,
                        alignment: 'right',
                        border: [false, false, false, true],
                        fillColor: '#f5f5f5',
                        margin: [0, 0, 0, 5],
                        decoration: 'underline'
                    },
                ],
                {
                    text: 'Notas',
                    style: 'sectionHeader'
                },
                {
                    ul: [
                        'Esto es un reporte de pedidos generado por el sistema FOGON.'
                    ],
                },
            ],
            styles: {
                sectionHeader: {
                    bold: true,
                    decoration: 'underline',
                    fontSize: 14,
                    margin: [0, 15, 0, 15]
                }
            }

        } as TDocumentDefinitions;
        const options = {

        }
        return printer.createPdfKitDocument(docDefinition, options);
    }

    async getLastFour(): Promise<Sale[]> {
        return await this.saleRepository.find({ relations: ['sale_items', 'sale_items.item', 'user'], order: { createdAt: "DESC" }, take: 4 });
    }
    async getLastFourByUser(user: User): Promise<Sale[]> {
        if(user.roles.includes(Rol.CLIENT)) return await this.saleRepository.find({ relations: ['sale_items', 'sale_items.item', 'user'],where:{user:{id:user.id}}, order: { createdAt: "DESC" }, take: 4 });
        return await this.saleRepository.find({ relations: ['sale_items', 'sale_items.item', 'user'], order: { createdAt: "DESC" }, take: 4 });
    }
    async getOne(id: number): Promise<Sale> {
        const sale = await this.saleRepository.findOne({ relations: ['sale_items', 'sale_items.item', 'user'], where: { id: id } })
        if (!sale) throw new NotFoundException('El pedido no existe');
        return sale;
    }
    async getTopSales(): Promise<Sale[]> {
        return await this.saleItemRepository.query('select name, sum(quantity) as sales from sale_items inner join item on sale_items.item_id = item.id  group by name order by sum(quantity) desc limit 5;');
    }
    async getTopusers(): Promise<Sale[]> {
        return await this.saleItemRepository.query('select firstname,lastname,count(*) as sales from sale inner join user on user.id = sale.user where sale.status="Producto entregado" or sale.status="Comida servida" or sale.status="Esperando entrega" group by firstname order by sales desc limit 5; ;');
    }
    async getIncompletes(user_id: number): Promise<Sale[]> {
        const sales = await this.saleRepository.find({
            relations: ['sale_items', 'sale_items.item', 'user'], where: {
                user: { id: user_id }

            },
            order: { createdAt: "DESC" }
        })
        if (!sales) throw new NotFoundException('El pedido no existe');
        let newSales: any[] = [];
        sales.forEach(s => {
            let lowstock: boolean = false;

            s.sale_items.forEach(e => {
                if (e.quantity > e.item.stock) {
                    lowstock = true;
                }
            });

            newSales.push({
                ...s,
                lowstock: lowstock
            });
            lowstock = false;
        });
        return newSales;
    }
    async getWaiting(user: number): Promise<Sale[]> {
        const sale = await this.saleRepository.find({ relations: ['sale_items', 'sale_items.item', 'user'], where: { status: statusEnum.WAITING } })
        if (!sale) throw new NotFoundException('El pedido no existe');
        return sale;
    }

    async getSalesByWeek():Promise<any>{
        const sale = await this.saleItemRepository.query(`SELECT sequential_dates.date as date, COUNT(public.sale.*) AS sales FROM (SELECT CURRENT_DATE - sequential_dates.date AS date FROM generate_series(0, 6) AS sequential_dates(date)) sequential_dates LEFT JOIN public.sale ON public.sale."payment_date"::date = sequential_dates.date GROUP BY sequential_dates.date order by 1 desc;`);
        const sales = {
            sales: sale,
            total: sale.reduce((partialSum, a) => parseInt(partialSum) + parseInt(a.sales), 0),
            hightestElement: Math.max(...sale.map(e => e.sales))
        }
        return sales;
    }

    async getTopClients(): Promise<any> {
        const sale = await this.saleItemRepository.query(`select public.user.firstname, public.user.lastname, count(*) as sales from public.sale inner join public.user on public.user.id = public.sale.user where public.sale.status='Producto entregado' OR public.sale.status='Comida servida' group by lastname, firstname order by sales desc limit 5;`);
        return sale;
    }
    async getCompletedCount(): Promise<number> {
        const sale = await this.saleRepository.find({ where: { status: statusEnum.COMPLETED } })
        if (!sale) return 0;
        return sale.length;
    }

    async getIncompletesCount(): Promise<number> {
        const sale = await this.saleRepository.find({ where: { status: statusEnum.INCOMPLETE } })
        if (!sale) return 0;
        return sale.length;
    }

    async edit(id: number, salee: Sale) {
        const sale = await this.getOne(id);
        const editeduser = Object.assign(sale, salee);
        return await this.saleRepository.save(editeduser);
    }

    async completeSale(id: number) {
        const sale = await this.getOne(id);
        sale.status = statusEnum.COMPLETED;
        return await this.saleRepository.save(sale);
    }

    async confirmSale(id: number, delivery_man: number) {
        const sale = await this.getOne(id);
        return await this.saleRepository.save({
            id: sale.id,
            delivery_man: { id: delivery_man },
            status: statusEnum.WAITING,
            payment_date: new Date()
        });
    }
    async completeSaleById(id: number) {
        const sale = await this.getOne(id);
        return await this.saleRepository.save({
            id: sale.id,
            status: statusEnum.COMPLETED
        });
    }

    async confirmOrder(id: number) {
        const sale = await this.getOne(id);
        return await this.saleRepository.save({
            id: sale.id,
            delivered: true
        });
    }

    async setSaleCanceled(id: number) {
        const sale = await this.getOne(id);
        sale.status = statusEnum.CANCELED_SYSTEM;
        return await this.saleRepository.save(sale);
    }

    async getCount() {
        return await this.saleRepository.count();
    }

    async setSaleCanceled_ByUser(id: number) {
        const sale = await this.getOne(id);
        sale.status = statusEnum.CANCELED;
        return await this.saleRepository.save(sale);
    }
    async setSaleCanceled_BySystem(id: number) {
        const sale = await this.getOne(id);
        sale.status = statusEnum.CANCELED_SYSTEM;
        return await this.saleRepository.save(sale);
    }

    async create(sale: Sale, newItems: SaleItems[]) {

        const newSale = this.saleRepository.create({
            user: { id: sale.user.id },
            status: sale.status,
            paymentMethod: sale.paymentMethod,
            pay_code: sale.pay_code,
            total: sale.total,
            address: sale.address
        });

        const savedOrder = await this.saleRepository.save(newSale);

        newItems.forEach(async e => {
            e.sale_id = savedOrder.id;
        });

        const newitems = await this.saleItemRepository.create(newItems);
        const saveItems = await this.saleItemRepository.save(newitems);


        return savedOrder;
    }
    async createSale(sale: Sale, newItems: SaleItems[], table:number): Promise<SaleItems[]>{
        const newSale = this.saleRepository.create({
            user: { id: sale.user.id },
            status: sale.status,
            paymentMethod: sale.paymentMethod,
            pay_code: sale.pay_code,
            selected_table: {id:table},
            total: sale.total,
            isOrder: false,
            payment_date: new Date()
        });

        const savedOrder = await this.saleRepository.save(newSale);

        newItems.forEach(async e => {
            e.sale_id = savedOrder.id;
        });

        // await this.taleSaleRepository.create({
        //     sales: {id:savedOrder.id},
        //     table: {id:table}
        // });

        const newitems = await this.saleItemRepository.create(newItems);
        const saveItems = await this.saleItemRepository.save(newitems);


        return saveItems;
    }
    async deleteSale(id: number) {
        await this.saleItemRepository.delete({ sale_id: id });
        return this.saleRepository.delete(id);
    }
    async delete(sale: Sale) {
        sale.status = statusEnum.CANCELED;
        await this.saleRepository.save(sale);
    }



}

interface SalesWeek{date:Date,sales:number};
interface SalesByWeek{sales?:SalesWeek[],total?:number,hightestElement?:number}
