import { Controller, Get, Param, Patch, Delete, Post, Body, NotFoundException, ParseIntPipe, Res, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateSaleDto, CreateSaleOrderDto, editSaleDto } from './dtos';
import { Sale, SaleItems } from './entities';
import { Auth, User } from '../common/decorators';
import { User as userEntity } from '../user/entities/user.entity';
import { SaleService } from './sale.service';
import { ItemService } from '../item/item.service';
import { AppResource } from '../app.roles';
import { statusEnum, Method } from './enum';
import { Item } from '../item/entities/item.entity';
import { UserService } from '../user/user.service';
import { TablesService } from '../tables/tables.service';
import { Dates, reportDTO } from '../sale/dtos';
import { Response } from 'express';

@ApiTags('Sale')
@Controller('sale')
export class SaleController {
    constructor(
        private saleService: SaleService,
        private itemService: ItemService,
        private userService: UserService,
        private tableService: TablesService,
    ) { }
    @Auth()
    @Get()
    async getAll(@User() user: userEntity) {
        return await this.saleService.getMany(user,'');
    }
    @Auth()
    @Get('custom/:filter')
    async getAllByFilter(@User() user: userEntity, @Param('filter') filter: string) {
        return await this.saleService.getMany(user, filter);
    }
    @Get('/stats')
    async getStats() {
        let users = await this.userService.getCount();
        let sales = await this.saleService.getCompletedCount();
		let incompletes = await this.saleService.getIncompletesCount();
        let item = await this.itemService.getCount();
        let topsales = await this.saleService.getTopSales();
        let topclients = await this.saleService.getTopClients();
        let weeksales = await this.saleService.getSalesByWeek();
        return { incompletes, sales, item, topsales, users, topclients, weeksales }
    }
    @Auth()
    @Get('/lastfour')
    async getLastFout(@User() user: userEntity) {
        return await this.saleService.getLastFourByUser(user);
    }
    
    @Auth()
    @Get('/client')
    async getAllByClient(@User() user: userEntity) {
        return await this.saleService.getIncompletes(user.id);
    }
/*     @Auth()
    @Get('/delivery')
    async getAllDelivery(@User() user: userEntity) {
        return await this.saleService.getManyDelivery(user.id);
    } */
    @Get('/weeksales')
    async week() {
        return await this.saleService.getSalesByWeek();
    }
    @Get(':id')
    async getOne(@Param('id', ParseIntPipe) id: number) {
        return await this.saleService.getOne(id);
    }


    @Auth(
        {
            possession: 'own',
            action: 'create',
            resource: AppResource.SALE
        }
    )
    @Post()
    async create(@Body() dto: CreateSaleDto, @User() user: userEntity, @Res({ passthrough: true }) res) {
        if (dto.paymentMethod !== (Method.Cash || Method.Credit_Card || Method.Debit_Card) && dto?.pay_code?.length === undefined) {
            throw new BadRequestException('Debes de enviar al menos un codigo de referencia');
        }
        var sale = new Sale();
        sale.paymentMethod = dto.paymentMethod;
        if (dto.paymentMethod !== (Method.Cash || Method.Credit_Card || Method.Debit_Card)) sale.pay_code = dto.pay_code
        sale.status = statusEnum.INCOMPLETE;
        sale.total = 0.0;
        sale.user = await this.userService.getOneById(dto?.user);
        if (dto?.user === undefined) { sale.user = user; }
        sale.address = dto.address;
        if (!sale.user) throw new NotFoundException('Usuario Invalido');
        const items = await this.itemService.getByIds(dto.items.map(a => a.id));
        if (items.length === 0 || items.length < dto.items.length) throw new NotFoundException('Uno o varios de los articulos enviados no existen en la base de datos');
        var saleItems: SaleItems[] = [];
        dto.items.forEach(async (e, i) => {
            saleItems[i] = {
                quantity: e.quantity,
                sale_id: sale.id,
                item: items[i],
                id: 0
            };
        });
        var subtotal: number = 0.0;
        
        for (var i = 0; i < saleItems.length; i++) {
            const item = await this.itemService.getOneByItem(saleItems[i].item.id);
            subtotal += (saleItems[i].quantity * parseFloat(item.price.toString()));
        }
        //Provisional
        sale.total = subtotal;
        /*
        for (var i = 0; i < saleItems.length; i++) {
            const item = await this.itemService.getOneByItem(saleItems[i].item.id);
            console.log(i, "qty: ", saleItems[i].quantity, "price: ", saleItems[i].item.price, "whole: ", saleItems[i].item.wholesale_price);
            if (subtotal >= 10) {
                sale.total += (saleItems[i].quantity * parseFloat(item.item.wholesale_price.toString()));
            }
            else {
                sale.total += (saleItems[i].quantity * parseFloat(item.item.price.toString()));
            }

        }
        */
        if (sale.total < 30) sale.total += 4
        else if (sale.total >= 30 && sale.total < 60) sale.total += 2
        
        return await this.saleService.create(sale, saleItems);
    }

    @Auth(
        {
            possession: 'own',
            action: 'create',
            resource: AppResource.SALE
        }
    )
    @Post('table')
    async createSale(@Body() dto: CreateSaleOrderDto, @User() user: userEntity, @Res({ passthrough: true }) res) {
        if (dto.paymentMethod !== (Method.Cash || Method.Credit_Card || Method.Debit_Card) && dto?.pay_code?.length === undefined) {
            throw new BadRequestException('Debes de enviar al menos un codigo de referencia');
        }
        await this.tableService.getOne(dto.table);
        var sale = new Sale();
        sale.paymentMethod = dto.paymentMethod;
        if (dto.paymentMethod !== (Method.Cash || Method.Credit_Card || Method.Debit_Card)) sale.pay_code = dto.pay_code
        sale.status = statusEnum.COMPLETED_TABLE;
        sale.total = 0.0;
        sale.user = user;
        sale.isOrder = false;
        if (!sale.user) throw new NotFoundException('Usuario Invalido');
        const items = await this.itemService.getByIds(dto.items.map(a => a.id));
        if (items.length === 0 || items.length < dto.items.length) throw new NotFoundException('Uno o varios de los articulos enviados no existen en la base de datos');
        var saleItems: SaleItems[] = [];
        dto.items.forEach(async (e, i) => {
            saleItems[i] = {
                quantity: e.quantity,
                sale_id: sale.id,
                item: items[i],
                id: 0
            };
        });
        var subtotal: number = 0.0;
        
        for (var i = 0; i < saleItems.length; i++) {
            const item = await this.itemService.getOneByItem(saleItems[i].item.id);
            subtotal += (saleItems[i].quantity * parseFloat(item.price.toString()));
        }
        //Provisional
        sale.total = subtotal;
        /*
        for (var i = 0; i < saleItems.length; i++) {
            const item = await this.itemService.getOneByItem(saleItems[i].item.id);
            console.log(i, "qty: ", saleItems[i].quantity, "price: ", saleItems[i].item.price, "whole: ", saleItems[i].item.wholesale_price);
            if (subtotal >= 10) {
                sale.total += (saleItems[i].quantity * parseFloat(item.item.wholesale_price.toString()));
            }
            else {
                sale.total += (saleItems[i].quantity * parseFloat(item.item.price.toString()));
            }

        }
        
        if (sale.total < 30) sale.total += 4
        else if (sale.total >= 30 && sale.total < 60) sale.total += 2
        */
        let stockItems:Item[] = [];
        for (let i = 0; i < saleItems.length; i++){
            const item = await this.itemService.getOne(saleItems[i].item.id);
            if (item.stock < saleItems[i].quantity) {stockItems.push(saleItems[i].item);}
        }
        if (stockItems.length > 0) {throw new BadRequestException(`No hay suficiente stock para ${stockItems.length>1 ? 'los productos' : 'el producto'}: ${stockItems.map((ee:Item) => {return ee.name})}`)}

        const newSale = await this.saleService.createSale(sale, saleItems, dto.table);

        
        
        newSale.forEach(async e => {
            let item = new Item();
            item = await this.itemService.getOneByItem(e.item.id);
            if (item.stock < e.quantity)  throw new BadRequestException(`No hay suficiente stock para el producto: ${item.name}`);
            item.stock -= e.quantity;
            this.itemService.reduceInventory(item);
        });


        await this.tableService.updateTable(dto.table, newSale[0].sale_id);
    }

    @Post('/date')
    async getByDates(@Body() dates: Dates, @Res() response: Response) {
        const pdfDoc = this.saleService.generatePdf(await this.saleService.getManyByDate(dates));
        pdfDoc.pipe(response);
        pdfDoc.end();
    }
    @Post('/report')
    async getReport(@Body() dto:reportDTO,@Res() response: Response){
        const pdfDoc = this.saleService.getReport(await this.saleService.getOne(dto.id));
        pdfDoc.pipe(response);
        pdfDoc.end();
    }
    @Auth(
        {
            possession: 'own',
            action: 'update',
            resource: AppResource.SALE
        }
    )

    @Patch('/confirm/:id')
    async confirm(@Body() dto: editSaleDto, @Param('id', ParseIntPipe) id: number) {
        const sale = await this.saleService.getOne(id);
        if (sale.status !== statusEnum.INCOMPLETE) throw new BadRequestException(`El pedido seleccionado ya ha sido procesado`);
        let items:Item[] = [];
        for (let i = 0; i < sale.sale_items.length; i++){
            const item = await this.itemService.getOne(sale.sale_items[i].item.id);
            if (item.stock < sale.sale_items[i].quantity) {items.push(sale.sale_items[i].item);}
        }
        if (items.length > 0) {throw new BadRequestException(`No hay suficiente stock para ${items.length>1 ? 'los productos' : 'el producto'}: ${items.map((ee:Item) => {return ee.name})}`)}
        
        sale.sale_items.forEach(async e => {
            let item = new Item();
            item = await this.itemService.getOneByItem(e.item.id);
            item.stock -= e.quantity;
            await this.itemService.reduceInventory(item);
        });
        await this.saleService.confirmSale(id, dto.delivery_man_id);
        return { message: "Pedido aprobado y listo para ser entregado" }
    }
    @Auth(
        {
            possession: 'own',
            action: 'update',
            resource: AppResource.SALE
        }
    )

    @Patch('/complete/:id')
    async complete(@Param('id', ParseIntPipe) id: number, @Res({ passthrough: true }) res) {
        const sale = await this.saleService.getOne(id);
        if (sale.status !== statusEnum.WAITING) { return res.status(HttpStatus.BAD_REQUEST).json({ message: `El pedido seleccionado ya ha sido procesado` }); }
        /*

        sale.sale_items.forEach(async e => {
            let item = new item();
            item = await this.itemService.getOneByItem(e.item.id);
            if (item.stock < e.quantity) { return res.status(HttpStatus.BAD_REQUEST).json({ message: `No hay suficiente stock para el producto: ${item.item.name}` }) }
            item.stock -= e.quantity;
            this.itemService.reduceitem(item);
        });*/
        await this.saleService.completeSaleById(id);
        return { message: "Pedido entregado" }
    }

    @Auth(
        {
            possession: 'own',
            action: 'update',
            resource: AppResource.SALE
        }
    )

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Res({ passthrough: true }) res) {
        const sale = await this.saleService.getOne(id);
        if (sale.status !== statusEnum.WAITING) { return res.status(HttpStatus.BAD_REQUEST).json({ message: `El pedido seleccionado ya ha sido procesado` }); }
        await this.saleService.completeSale(id);
        return { message: "Pedido completado" }
    }

    @Auth(
        {
            possession: 'own',
            action: 'update',
            resource: AppResource.SALE
        }
    )
    @Patch('/cancel/:id')
    async cancelSale(@Param('id', ParseIntPipe) id: number, @Res({ passthrough: true }) res) {
        const sale = await this.saleService.getOne(id);
        if (sale.status !== statusEnum.INCOMPLETE) { return res.status(HttpStatus.BAD_REQUEST).json({ message: `Este pedido ya no puede ser cancelado` }); }
        await this.saleService.setSaleCanceled_ByUser(id);
        return { message: "Pedido cancelado" }
    }
    @Auth(
        {
            possession: 'own',
            action: 'update',
            resource: AppResource.SALE
        }
    )
    @Patch('/syscancel/:id')
    async systemCancelSale(@Param('id', ParseIntPipe) id: number, @Res({ passthrough: true }) res) {
        const sale = await this.saleService.getOne(id);
        if (sale.status !== statusEnum.INCOMPLETE) { return res.status(HttpStatus.BAD_REQUEST).json({ message: `Este pedido ya no puede ser cancelado` }); }
        await this.saleService.setSaleCanceled_BySystem(id);
        return { message: "Pedido cancelado" }
    }

    @Auth(
        {
            possession: 'own',
            action: 'update',
            resource: AppResource.SALE
        }
    )

    @Patch('confirmorder/:id')
    async delivered(@Param('id', ParseIntPipe) id: number, @Res({ passthrough: true }) res) {
        console.log(id);
        const sale = await this.saleService.getOne(id);
        if (sale.status !== statusEnum.COMPLETED) { throw new BadRequestException(`El pedido seleccionado no puede ser procesado`); }
        await this.saleService.confirmOrder(id);
        return { message: "Pedido confirmado" }
    }

    @Auth(
        {
            possession: 'own',
            action: 'update',
            resource: AppResource.SALE
        }
    )
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id: number, @Res({ passthrough: true }) res) {
        const sale = await this.saleService.getOne(id);
        if (sale.status !== statusEnum.INCOMPLETE)  throw new BadRequestException(`Este pedido ya no puede ser cancelado`)
        await this.saleService.delete(sale);
        return { message: "Pedido cancelado" }
    }


}
