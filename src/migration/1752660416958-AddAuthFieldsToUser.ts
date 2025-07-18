import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuthFieldsToUser1752660416958 implements MigrationInterface {
    name = 'AddAuthFieldsToUser1752660416958'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` varchar(36) NOT NULL, \`username\` varchar(30) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`userType\` enum ('admin', 'user', 'moderator') NOT NULL DEFAULT 'user', \`isActive\` tinyint NOT NULL DEFAULT 1, \`emailVerified\` tinyint NOT NULL DEFAULT 0, \`mfaEnabled\` tinyint NOT NULL DEFAULT 0, \`mfaSecret\` varchar(255) NULL, \`emailVerificationToken\` varchar(255) NULL, \`emailVerificationExpires\` datetime NULL, \`forgotPasswordOtp\` varchar(255) NULL, \`forgotPasswordExpires\` datetime NULL, \`lastLogin\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`session\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(255) NOT NULL, \`refreshToken\` varchar(512) NOT NULL, \`expiresAt\` datetime NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`session\` ADD CONSTRAINT \`FK_3d2f174ef04fb312fdebd0ddc53\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`session\` DROP FOREIGN KEY \`FK_3d2f174ef04fb312fdebd0ddc53\``);
        await queryRunner.query(`DROP TABLE \`session\``);
        await queryRunner.query(`DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
    }

}
