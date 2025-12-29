import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIdToDocuments1735220100000 implements MigrationInterface {
  name = 'AddUserIdToDocuments1735220100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add userId column to documents
    await queryRunner.query(`
      ALTER TABLE "documents" 
      ADD COLUMN "userId" uuid
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "documents"
      ADD CONSTRAINT "FK_documents_userId" 
      FOREIGN KEY ("userId") 
      REFERENCES "users"("id") 
      ON DELETE CASCADE
    `);

    // Create index on userId for better query performance
    await queryRunner.query(`
      CREATE INDEX "IDX_documents_userId" ON "documents" ("userId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_documents_userId"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT IF EXISTS "FK_documents_userId"`);
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "userId"`);
  }
}
