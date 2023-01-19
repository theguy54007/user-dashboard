import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeAssociationBetweenUserAndOauth1674112642442 implements MigrationInterface {
    name = 'ChangeAssociationBetweenUserAndOauth1674112642442'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "oauths" DROP CONSTRAINT "FK_c0dd153263e7a3a32d24f37fb8f"`);
        await queryRunner.query(`ALTER TABLE "oauths" DROP CONSTRAINT "REL_c0dd153263e7a3a32d24f37fb8"`);
        await queryRunner.query(`ALTER TABLE "oauths" ADD CONSTRAINT "FK_c0dd153263e7a3a32d24f37fb8f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "oauths" DROP CONSTRAINT "FK_c0dd153263e7a3a32d24f37fb8f"`);
        await queryRunner.query(`ALTER TABLE "oauths" ADD CONSTRAINT "REL_c0dd153263e7a3a32d24f37fb8" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "oauths" ADD CONSTRAINT "FK_c0dd153263e7a3a32d24f37fb8f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
