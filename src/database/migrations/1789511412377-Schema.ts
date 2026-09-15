import { MigrationInterface, QueryRunner } from "typeorm";

export class Schema1789511412377 implements MigrationInterface {
    name = 'Schema1789511412377'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD "image_url" character varying(512)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "image_url"`);
    }

}
