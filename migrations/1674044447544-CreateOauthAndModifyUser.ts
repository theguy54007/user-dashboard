import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOauthAndModifyUser1674044447544 implements MigrationInterface {
    name = 'CreateOauthAndModifyUser1674044447544'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."oauths_source_enum" AS ENUM('fb', 'google')`);
        await queryRunner.query(`CREATE TABLE "oauths" ("id" SERIAL NOT NULL, "auth_id" character varying NOT NULL, "source" "public"."oauths_source_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, CONSTRAINT "REL_c0dd153263e7a3a32d24f37fb8" UNIQUE ("user_id"), CONSTRAINT "PK_c3a2382f78ddee47a6657018c37" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c0dd153263e7a3a32d24f37fb8" ON "oauths" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "oauths" ADD CONSTRAINT "FK_c0dd153263e7a3a32d24f37fb8f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "oauths" DROP CONSTRAINT "FK_c0dd153263e7a3a32d24f37fb8f"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c0dd153263e7a3a32d24f37fb8"`);
        await queryRunner.query(`DROP TABLE "oauths"`);
        await queryRunner.query(`DROP TYPE "public"."oauths_source_enum"`);
    }

}
