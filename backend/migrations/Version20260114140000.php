<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260114140000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create core RocketReport tables: api_sources, documents, document_variables, code_processors, templates, document_generations';
    }

    public function up(Schema $schema): void
    {
        // CREATE api_sources TABLE
        $this->addSql('CREATE TABLE api_sources (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            description VARCHAR(1000),
            url_base VARCHAR(500) NOT NULL,
            auth_type VARCHAR(50) NOT NULL DEFAULT "none",
            auth_token LONGTEXT,
            headers JSON,
            status VARCHAR(50) NOT NULL DEFAULT "active",
            created_at DATETIME NOT NULL COMMENT "(DC2Type:datetime_immutable)",
            updated_at DATETIME NOT NULL COMMENT "(DC2Type:datetime_immutable)",
            INDEX IDX_F06DEF47A76ED395 (user_id),
            PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');

        // CREATE documents TABLE
        $this->addSql('CREATE TABLE documents (
            id INT AUTO_INCREMENT NOT NULL,
            user_id INT NOT NULL,
            api_source_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            description VARCHAR(1000),
            endpoint VARCHAR(500) NOT NULL,
            method VARCHAR(10) NOT NULL DEFAULT "GET",
            query_params JSON,
            path_params JSON,
            body_schema JSON,
            status VARCHAR(50) NOT NULL DEFAULT "active",
            created_at DATETIME NOT NULL COMMENT "(DC2Type:datetime_immutable)",
            updated_at DATETIME NOT NULL COMMENT "(DC2Type:datetime_immutable)",
            INDEX IDX_A9DA0E62A76ED395 (user_id),
            INDEX IDX_A9DA0E624FE52A53 (api_source_id),
            PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');

        // CREATE document_variables TABLE
        $this->addSql('CREATE TABLE document_variables (
            id INT AUTO_INCREMENT NOT NULL,
            document_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL,
            json_path VARCHAR(500),
            calculation_formula LONGTEXT,
            description VARCHAR(1000),
            format VARCHAR(50) NOT NULL DEFAULT "string",
            required TINYINT(1) NOT NULL DEFAULT 0,
            default_value LONGTEXT,
            created_at DATETIME NOT NULL COMMENT "(DC2Type:datetime_immutable)",
            updated_at DATETIME NOT NULL COMMENT "(DC2Type:datetime_immutable)",
            INDEX IDX_E957C0E3C33F7837 (document_id),
            PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');

        // CREATE code_processors TABLE
        $this->addSql('CREATE TABLE code_processors (
            id INT AUTO_INCREMENT NOT NULL,
            document_id INT NOT NULL,
            code LONGTEXT NOT NULL,
            description LONGTEXT,
            status VARCHAR(50) NOT NULL DEFAULT "active",
            created_at DATETIME NOT NULL COMMENT "(DC2Type:datetime_immutable)",
            updated_at DATETIME NOT NULL COMMENT "(DC2Type:datetime_immutable)",
            UNIQUE INDEX UNIQ_7C6CB8D4C33F7837 (document_id),
            PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');

        // CREATE templates TABLE
        $this->addSql('CREATE TABLE templates (
            id INT AUTO_INCREMENT NOT NULL,
            document_id INT NOT NULL,
            content LONGTEXT NOT NULL,
            output_format VARCHAR(50) NOT NULL DEFAULT "html",
            description LONGTEXT,
            status VARCHAR(50) NOT NULL DEFAULT "active",
            created_at DATETIME NOT NULL COMMENT "(DC2Type:datetime_immutable)",
            updated_at DATETIME NOT NULL COMMENT "(DC2Type:datetime_immutable)",
            UNIQUE INDEX UNIQ_65B99D16C33F7837 (document_id),
            PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');

        // CREATE document_generations TABLE
        $this->addSql('CREATE TABLE document_generations (
            id INT AUTO_INCREMENT NOT NULL,
            document_id INT NOT NULL,
            input_params JSON,
            api_response JSON,
            processed_data JSON,
            extracted_variables JSON,
            rendered_output LONGTEXT,
            file_path LONGTEXT,
            output_format VARCHAR(50) NOT NULL DEFAULT "html",
            execution_logs LONGTEXT,
            status VARCHAR(50) NOT NULL DEFAULT "pending",
            error_message LONGTEXT,
            created_at DATETIME NOT NULL COMMENT "(DC2Type:datetime_immutable)",
            updated_at DATETIME NOT NULL COMMENT "(DC2Type:datetime_immutable)",
            INDEX IDX_A73F2B8DC33F7837 (document_id),
            PRIMARY KEY (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');

        // ADD FOREIGN KEYS
        $this->addSql('ALTER TABLE api_sources ADD CONSTRAINT FK_F06DEF47A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE documents ADD CONSTRAINT FK_A9DA0E62A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE documents ADD CONSTRAINT FK_A9DA0E624FE52A53 FOREIGN KEY (api_source_id) REFERENCES api_sources (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE document_variables ADD CONSTRAINT FK_E957C0E3C33F7837 FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE code_processors ADD CONSTRAINT FK_7C6CB8D4C33F7837 FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE templates ADD CONSTRAINT FK_65B99D16C33F7837 FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE document_generations ADD CONSTRAINT FK_A73F2B8DC33F7837 FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE documents DROP FOREIGN KEY FK_A9DA0E624FE52A53');
        $this->addSql('ALTER TABLE document_variables DROP FOREIGN KEY FK_E957C0E3C33F7837');
        $this->addSql('ALTER TABLE code_processors DROP FOREIGN KEY FK_7C6CB8D4C33F7837');
        $this->addSql('ALTER TABLE templates DROP FOREIGN KEY FK_65B99D16C33F7837');
        $this->addSql('ALTER TABLE document_generations DROP FOREIGN KEY FK_A73F2B8DC33F7837');
        $this->addSql('ALTER TABLE api_sources DROP FOREIGN KEY FK_F06DEF47A76ED395');
        $this->addSql('ALTER TABLE documents DROP FOREIGN KEY FK_A9DA0E62A76ED395');
        $this->addSql('DROP TABLE document_generations');
        $this->addSql('DROP TABLE templates');
        $this->addSql('DROP TABLE code_processors');
        $this->addSql('DROP TABLE document_variables');
        $this->addSql('DROP TABLE documents');
        $this->addSql('DROP TABLE api_sources');
    }
}
