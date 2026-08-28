import { MigrationInterface, QueryRunner } from "typeorm";

export class Schema1787889840035 implements MigrationInterface {
    name = 'Schema1787889840035'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "product" ("id" BIGSERIAL NOT NULL, "name" character varying(70) NOT NULL, "description" text NOT NULL, "price" numeric(10,2) NOT NULL, "stock" integer NOT NULL, "deleted_at" TIMESTAMP, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "product"`);
    }

}
