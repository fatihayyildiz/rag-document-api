import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeIsActiveDefaultFalse1767009220198 implements MigrationInterface {
    name = 'MakeIsActiveDefaultFalse1767009220198'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_documents_userId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_documents_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_documents_userId"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "isActive" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_e300b5c2e3fefa9d6f8a3f2597" ON "documents" ("userId") `);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_e300b5c2e3fefa9d6f8a3f25975" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_e300b5c2e3fefa9d6f8a3f25975"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e300b5c2e3fefa9d6f8a3f2597"`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "isActive" SET DEFAULT true`);
        await queryRunner.query(`CREATE INDEX "IDX_documents_userId" ON "documents" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_documents_status" ON "documents" ("status") `);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_documents_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
