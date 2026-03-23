<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration pour nettoyer les données obsolètes tout en conservant les Users et les API Sources.
 */
final class Version20260323192426 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Supprime les données des documents, templates, générations et tokens pour repartir sur une base propre.';
    }

    public function up(Schema $schema): void
    {
        // Désactiver les contraintes de clés étrangères pour vider les tables sans erreur
        $this->addSql('SET FOREIGN_KEY_CHECKS = 0');

        // Vider les tables liées aux anciennes versions et aux données dynamiques
        $this->addSql('TRUNCATE TABLE document_generations');
        $this->addSql('TRUNCATE TABLE document_variables');
        $this->addSql('TRUNCATE TABLE code_processors');
        $this->addSql('TRUNCATE TABLE templates');
        $this->addSql('TRUNCATE TABLE documents');
        $this->addSql('TRUNCATE TABLE api_endpoints');
        $this->addSql('TRUNCATE TABLE refresh_tokens');

        // Réactiver les contraintes
        $this->addSql('SET FOREIGN_KEY_CHECKS = 1');
    }

    public function down(Schema $schema): void
    {
        // Pas de retour en arrière possible pour un TRUNCATE sans backup
    }
}
