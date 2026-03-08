<?php

namespace App\Infrastructure\Http\Controller\Admin;

use App\Domain\Entity\DocumentGeneration;
use EasyCorp\Bundle\EasyAdminBundle\Config\Action;
use EasyCorp\Bundle\EasyAdminBundle\Config\Actions;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Filter\ChoiceFilter;

class DocumentGenerationCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return DocumentGeneration::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Génération')
            ->setEntityLabelInPlural('Générations')
            ->setDefaultSort(['created_at' => 'DESC']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield AssociationField::new('document', 'Document');
        yield ChoiceField::new('output_format', 'Format')
            ->setChoices(['HTML' => 'html', 'PDF' => 'pdf', 'Excel' => 'xlsx', 'Texte' => 'txt'])
            ->renderAsBadges();
        yield ChoiceField::new('status', 'Statut')
            ->setChoices(['En attente' => 'pending', 'Succès' => 'success', 'Échec' => 'failed'])
            ->renderAsBadges(['pending' => 'warning', 'success' => 'success', 'failed' => 'danger']);
        yield TextField::new('error_message', 'Erreur')->hideOnIndex();
        yield DateTimeField::new('created_at', 'Créé le')->hideOnForm();
    }

    public function configureActions(Actions $actions): Actions
    {
        // Générations = lecture seule, pas de création/édition
        return $actions
            ->add(Crud::PAGE_INDEX, Action::DETAIL)
            ->remove(Crud::PAGE_INDEX, Action::NEW)
            ->remove(Crud::PAGE_INDEX, Action::EDIT)
            ->remove(Crud::PAGE_DETAIL, Action::EDIT);
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters
            ->add(ChoiceFilter::new('status', 'Statut')->setChoices(['En attente' => 'pending', 'Succès' => 'success', 'Échec' => 'failed']))
            ->add(ChoiceFilter::new('output_format', 'Format')->setChoices(['HTML' => 'html', 'PDF' => 'pdf', 'Excel' => 'xlsx']));
    }
}
