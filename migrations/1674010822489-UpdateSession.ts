import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSession1674010822489 implements MigrationInterface {
    name = 'UpdateSession1674010822489'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "action_name"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "auth_token" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "end_at" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "end_at"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "auth_token"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "action_name" character varying`);
    }

}
