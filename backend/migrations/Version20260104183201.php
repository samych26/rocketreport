<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260104183201 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE api_sources (id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', name VARCHAR(255) NOT NULL, base_url VARCHAR(255) NOT NULL, method VARCHAR(255) NOT NULL, auth_type VARCHAR(255) NOT NULL, endpoints JSON NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE audit_logs (id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', action VARCHAR(255) NOT NULL, entity_type VARCHAR(255) NOT NULL, entity_id VARCHAR(255) NOT NULL, details LONGTEXT NOT NULL, timestamp DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', user_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE document_generations (id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', status VARCHAR(255) NOT NULL, output_format VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', user_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', template_id CHAR(36) DEFAULT NULL COMMENT \'(DC2Type:uuid)\', api_source_ids JSON NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE refresh_tokens (id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', token VARCHAR(255) NOT NULL, expires_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', revoked TINYINT(1) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE templates (id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', name VARCHAR(255) NOT NULL, content LONGTEXT NOT NULL, version INT NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', variables JSON NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE users (id CHAR(36) NOT NULL COMMENT \'(DC2Type:uuid)\', email VARCHAR(255) NOT NULL, password_hash VARCHAR(255) NOT NULL, role VARCHAR(255) NOT NULL, is_active TINYINT(1) NOT NULL, UNIQUE INDEX UNIQ_1483A5E9E7927C74 (email), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE api_sources');
        $this->addSql('DROP TABLE audit_logs');
        $this->addSql('DROP TABLE document_generations');
        $this->addSql('DROP TABLE refresh_tokens');
        $this->addSql('DROP TABLE templates');
        $this->addSql('DROP TABLE users');
    }
}
