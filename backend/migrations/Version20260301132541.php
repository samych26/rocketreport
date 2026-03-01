<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260301132541 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE templates DROP FOREIGN KEY `FK_6F287D8EC33F7837`');
        $this->addSql('ALTER TABLE templates ADD name VARCHAR(255) DEFAULT NULL, ADD user_id INT DEFAULT NULL, CHANGE document_id document_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE templates ADD CONSTRAINT FK_6F287D8EC33F7837 FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE templates ADD CONSTRAINT FK_6F287D8EA76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('CREATE INDEX IDX_6F287D8EA76ED395 ON templates (user_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE templates DROP FOREIGN KEY FK_6F287D8EC33F7837');
        $this->addSql('ALTER TABLE templates DROP FOREIGN KEY FK_6F287D8EA76ED395');
        $this->addSql('DROP INDEX IDX_6F287D8EA76ED395 ON templates');
        $this->addSql('ALTER TABLE templates DROP name, DROP user_id, CHANGE document_id document_id INT NOT NULL');
        $this->addSql('ALTER TABLE templates ADD CONSTRAINT `FK_6F287D8EC33F7837` FOREIGN KEY (document_id) REFERENCES documents (id) ON UPDATE NO ACTION ON DELETE CASCADE');
    }
}
