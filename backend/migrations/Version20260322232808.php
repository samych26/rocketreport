<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260322232808 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // Check if table already exists (for retry support)
        if (!$schema->hasTable('api_endpoints')) {
            $this->addSql('CREATE TABLE api_endpoints (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(1000) DEFAULT NULL, path VARCHAR(500) NOT NULL, method VARCHAR(10) NOT NULL, variables JSON DEFAULT NULL, query_params JSON DEFAULT NULL, path_params JSON DEFAULT NULL, body_schema JSON DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, api_source_id INT NOT NULL, INDEX IDX_A1C980CBE8E8B91A (api_source_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
            $this->addSql('ALTER TABLE api_endpoints ADD CONSTRAINT FK_A1C980CBE8E8B91A FOREIGN KEY (api_source_id) REFERENCES api_sources (id) ON DELETE CASCADE');
        }

        // Check if column already exists in documents
        $documentsTable = $schema->getTable('documents');
        if (!$documentsTable->hasColumn('api_endpoint_id')) {
            // IMPORTANT: Make it DEFAULT NULL to avoid Integrity constraint violation on existing rows
            $this->addSql('ALTER TABLE documents ADD api_endpoint_id INT DEFAULT NULL');
            
            // Drop old columns only if they still exist
            if ($documentsTable->hasColumn('endpoint')) {
                $this->addSql('ALTER TABLE documents DROP endpoint, DROP method, DROP query_params, DROP path_params, DROP body_schema');
            }
            
            $this->addSql('ALTER TABLE documents ADD CONSTRAINT FK_A2B072884BD8F4B8 FOREIGN KEY (api_endpoint_id) REFERENCES api_endpoints (id) ON DELETE CASCADE');
            $this->addSql('CREATE INDEX IDX_A2B072884BD8F4B8 ON documents (api_endpoint_id)');
        }
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE api_endpoints DROP FOREIGN KEY FK_A1C980CBE8E8B91A');
        $this->addSql('DROP TABLE api_endpoints');
        $this->addSql('ALTER TABLE documents DROP FOREIGN KEY FK_A2B072884BD8F4B8');
        $this->addSql('DROP INDEX IDX_A2B072884BD8F4B8 ON documents');
        $this->addSql('ALTER TABLE documents ADD endpoint VARCHAR(500) NOT NULL, ADD method VARCHAR(10) NOT NULL, ADD query_params JSON DEFAULT NULL, ADD path_params JSON DEFAULT NULL, ADD body_schema JSON DEFAULT NULL, DROP api_endpoint_id');
    }
}
