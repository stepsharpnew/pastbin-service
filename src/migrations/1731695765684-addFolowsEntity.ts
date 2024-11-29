import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFolowsEntity1731695765684 implements MigrationInterface {
    name = 'AddFolowsEntity1731695765684'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "folows" ("id" SERIAL NOT NULL, "folowingId" integer NOT NULL, "folowedId" integer NOT NULL, CONSTRAINT "PK_5a925327222f55aebc5fe460894" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "folows"`);
    }

}
