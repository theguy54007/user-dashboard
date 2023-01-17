import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexToUserIdAtSession1673944166127 implements MigrationInterface {
    name = 'AddIndexToUserIdAtSession1673944166127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_085d540d9f418cfbdc7bd55bb1" ON "sessions" ("user_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_085d540d9f418cfbdc7bd55bb1"`);
    }

}
