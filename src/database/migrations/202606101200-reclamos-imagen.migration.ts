import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReclamosImagen1778611200000 implements MigrationInterface {
  name = 'ReclamosImagen1778611200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE reclamos
      ADD COLUMN IF NOT EXISTS imagen VARCHAR(512) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Intencionalmente vacio para evitar drops destructivos en produccion.
  }
}
