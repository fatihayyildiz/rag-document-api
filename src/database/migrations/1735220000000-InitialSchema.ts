import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1735220000000 implements MigrationInterface {
  name = 'InitialSchema1735220000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create documents table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "originalName" character varying NOT NULL,
        "storedName" character varying NOT NULL,
        "mimeType" character varying NOT NULL,
        "size" bigint NOT NULL,
        "storagePath" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'uploaded',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_documents" PRIMARY KEY ("id")
      )
    `);

    // Create index on documents status
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_documents_status" ON "documents" ("status")
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    // Ensure uuid-ossp extension is available
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_documents_status"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "documents"`);
  }
}
