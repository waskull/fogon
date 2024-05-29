import { RolesBuilder } from 'nest-access-control';

export enum AppRoles{
    MANAGER = 'gerente',
    ADMIN = 'admin',
    CASHIER = 'cajero',
    CLIENT = 'cliente',
    DELIVERY_MAN = 'repartidor'
}

export enum AppResource{
    USER = 'USER',
    CLIENT = ' CLIENT',
    ITEM = 'ITEM',
    INVENTORY = 'INVENTORY',
    ORDER = 'ORDER',
    SALE = 'SALE'
}
export const roles: RolesBuilder = new RolesBuilder();

roles

.grant(AppRoles.CLIENT)
.readAny([AppResource.ITEM,AppResource.INVENTORY])
.readOwn([AppResource.USER,AppResource.SALE])
.create(AppResource.SALE)
.updateOwn(AppResource.SALE,AppResource.USER)

.grant(AppRoles.CASHIER)
.readAny([AppResource.ITEM,AppResource.SALE])
.readOwn([AppResource.USER])
.updateAny(AppResource.SALE)
.create(AppResource.SALE)

.grant(AppRoles.DELIVERY_MAN)
.readAny([AppResource.ITEM,AppResource.SALE])
.readOwn([AppResource.USER])
.updateOwn(AppResource.SALE)

.grant(AppRoles.MANAGER)
.readAny([AppResource.USER, AppResource.ITEM])
.create([AppResource.USER, AppResource.ITEM,AppResource.SALE,AppResource.ORDER, AppResource.INVENTORY])
.updateAny([AppResource.USER, AppResource.ITEM,AppResource.SALE,AppResource.ORDER, AppResource.INVENTORY])
.deleteAny([AppResource.ITEM])

.grant(AppRoles.ADMIN)
.readAny([AppResource.USER, AppResource.ITEM,AppResource.SALE,AppResource.ORDER, AppResource.INVENTORY])
.createAny([AppResource.USER, AppResource.ITEM,AppResource.SALE,AppResource.ORDER, AppResource.INVENTORY])
.updateAny([AppResource.USER, AppResource.ITEM,AppResource.SALE,AppResource.ORDER, AppResource.INVENTORY])
.deleteAny([AppResource.USER, AppResource.ITEM,AppResource.SALE,AppResource.ORDER, AppResource.INVENTORY])

