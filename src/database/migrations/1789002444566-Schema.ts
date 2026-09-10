import { MigrationInterface, QueryRunner } from 'typeorm';

export class Schema1789002444566 implements MigrationInterface {
  name = 'Schema1789002444566';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "image_public_id" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "image_public_id"`,
    );
  }
}
