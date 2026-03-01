<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260228222759 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE api_sources (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(1000) DEFAULT NULL, url_base VARCHAR(500) NOT NULL, auth_type VARCHAR(50) NOT NULL, auth_token LONGTEXT DEFAULT NULL, headers JSON DEFAULT NULL, status VARCHAR(50) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, user_id INT NOT NULL, INDEX IDX_3F631195A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE code_processors (id INT AUTO_INCREMENT NOT NULL, code LONGTEXT NOT NULL, description LONGTEXT DEFAULT NULL, status VARCHAR(50) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, document_id INT NOT NULL, UNIQUE INDEX UNIQ_58E2A35FC33F7837 (document_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE document_generations (id INT AUTO_INCREMENT NOT NULL, input_params JSON DEFAULT NULL, api_response JSON DEFAULT NULL, processed_data JSON DEFAULT NULL, extracted_variables JSON DEFAULT NULL, rendered_output LONGTEXT DEFAULT NULL, file_path LONGTEXT DEFAULT NULL, output_format VARCHAR(50) NOT NULL, execution_logs LONGTEXT DEFAULT NULL, status VARCHAR(50) NOT NULL, error_message LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, document_id INT NOT NULL, INDEX IDX_287F3729C33F7837 (document_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE document_variables (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, type VARCHAR(50) NOT NULL, json_path VARCHAR(500) DEFAULT NULL, calculation_formula LONGTEXT DEFAULT NULL, description VARCHAR(1000) DEFAULT NULL, format VARCHAR(50) NOT NULL, required TINYINT NOT NULL, default_value LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, document_id INT NOT NULL, INDEX IDX_9AF355B0C33F7837 (document_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE documents (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(1000) DEFAULT NULL, endpoint VARCHAR(500) NOT NULL, method VARCHAR(10) NOT NULL, query_params JSON DEFAULT NULL, path_params JSON DEFAULT NULL, body_schema JSON DEFAULT NULL, status VARCHAR(50) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, user_id INT NOT NULL, api_source_id INT NOT NULL, INDEX IDX_A2B07288A76ED395 (user_id), INDEX IDX_A2B07288E8E8B91A (api_source_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE refresh_tokens (id INT AUTO_INCREMENT NOT NULL, token_hash VARCHAR(255) NOT NULL, expires_at DATETIME NOT NULL, created_at DATETIME NOT NULL, revoked_at DATETIME DEFAULT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_9BACE7E1B3BC57DA (token_hash), INDEX IDX_9BACE7E1A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE templates (id INT AUTO_INCREMENT NOT NULL, content LONGTEXT NOT NULL, output_format VARCHAR(50) NOT NULL, description LONGTEXT DEFAULT NULL, status VARCHAR(50) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, document_id INT NOT NULL, UNIQUE INDEX UNIQ_6F287D8EC33F7837 (document_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE users (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, password VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, roles JSON NOT NULL, UNIQUE INDEX UNIQ_1483A5E9E7927C74 (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE api_sources ADD CONSTRAINT FK_3F631195A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE code_processors ADD CONSTRAINT FK_58E2A35FC33F7837 FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE document_generations ADD CONSTRAINT FK_287F3729C33F7837 FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE document_variables ADD CONSTRAINT FK_9AF355B0C33F7837 FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE documents ADD CONSTRAINT FK_A2B07288A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE documents ADD CONSTRAINT FK_A2B07288E8E8B91A FOREIGN KEY (api_source_id) REFERENCES api_sources (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE refresh_tokens ADD CONSTRAINT FK_9BACE7E1A76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE templates ADD CONSTRAINT FK_6F287D8EC33F7837 FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE api_sources DROP FOREIGN KEY FK_3F631195A76ED395');
        $this->addSql('ALTER TABLE code_processors DROP FOREIGN KEY FK_58E2A35FC33F7837');
        $this->addSql('ALTER TABLE document_generations DROP FOREIGN KEY FK_287F3729C33F7837');
        $this->addSql('ALTER TABLE document_variables DROP FOREIGN KEY FK_9AF355B0C33F7837');
        $this->addSql('ALTER TABLE documents DROP FOREIGN KEY FK_A2B07288A76ED395');
        $this->addSql('ALTER TABLE documents DROP FOREIGN KEY FK_A2B07288E8E8B91A');
        $this->addSql('ALTER TABLE refresh_tokens DROP FOREIGN KEY FK_9BACE7E1A76ED395');
        $this->addSql('ALTER TABLE templates DROP FOREIGN KEY FK_6F287D8EC33F7837');
        $this->addSql('DROP TABLE api_sources');
        $this->addSql('DROP TABLE code_processors');
        $this->addSql('DROP TABLE document_generations');
        $this->addSql('DROP TABLE document_variables');
        $this->addSql('DROP TABLE documents');
        $this->addSql('DROP TABLE refresh_tokens');
        $this->addSql('DROP TABLE templates');
        $this->addSql('DROP TABLE users');
    }
}
