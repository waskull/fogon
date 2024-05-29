import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DATABASE_HOST, DATABASE_NAME, DATABASE_PASSWORD, DATABASE_PORT, DATABASE_USERNAME, SMTP_PASSWORD, SMTP_USER } from './config/constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessControlModule } from 'nest-access-control';
import { AuthModule } from './auth/auth.module';
import { roles } from './app.roles';
import { UserModule } from './user/user.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { MailerModule } from '@nestjs-modules/mailer';
import { ItemModule } from './item/item.module';
import { SaleModule } from './sale/sale.module';
// import { InventoryModule } from './inventory/inventory.module';
import { OrderModule } from './order/order.module';
import { ComplaintController } from './complaint/complaint.controller';
import { ComplaintService } from './complaint/complaint.service';
import { ComplaintModule } from './complaint/complaint.module';
import { TablesModule } from './tables/tables.module';

const localEmailConfig = {
  transport: {
    host: "localhost",
    port: 1025,
  },
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '/public/'),
      serveStaticOptions: {
        index: false,
      }
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: config.get<string>(SMTP_USER),
            pass: config.get<string>(SMTP_PASSWORD),
          }
        }
      })
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>(DATABASE_HOST),
        port: parseInt(config.get<string>(DATABASE_PORT), 10),
        username: config.get<string>(DATABASE_USERNAME),
        password: config.get<string>(DATABASE_PASSWORD),
        database: config.get<string>(DATABASE_NAME),
        entities: [__dirname + './**/**/*entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true,
        ssl: true,
        logging: true,
        logger: 'simple-console',
      })
    }),
    AuthModule,
    AccessControlModule.forRoles(roles),
    UserModule,
    ItemModule,
    SaleModule,
    // InventoryModule,
    OrderModule,
    ComplaintModule,
    TablesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
