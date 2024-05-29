import { MigrationInterface, QueryRunner } from "typeorm";

export class ClientType1713914529613 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO public.client_type(name) VALUES ('Prospecto');`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE * FROM client_type`);
    }

}
