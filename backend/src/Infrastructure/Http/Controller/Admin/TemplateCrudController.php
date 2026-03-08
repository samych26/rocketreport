<?php

namespace App\Infrastructure\Http\Controller\Admin;

use App\Domain\Entity\Template;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\CodeEditorField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Filter\ChoiceFilter;
use EasyCorp\Bundle\EasyAdminBundle\Filter\TextFilter;

class TemplateCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return Template::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Template')
            ->setEntityLabelInPlural('Templates')
            ->setDefaultSort(['created_at' => 'DESC'])
            ->setSearchFields(['name']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield AssociationField::new('user', 'Utilisateur');
        yield TextField::new('name', 'Nom');
        yield ChoiceField::new('output_format', 'Format')
            ->setChoices(['HTML' => 'html', 'PDF' => 'pdf', 'Excel' => 'xlsx', 'Texte' => 'txt'])
            ->renderAsBadges();
        yield ChoiceField::new('status', 'Statut')
            ->setChoices(['Actif' => 'active', 'Inactif' => 'inactive'])
            ->renderAsBadges(['active' => 'success', 'inactive' => 'danger']);
        yield CodeEditorField::new('content', 'Contenu')->hideOnIndex();
        yield DateTimeField::new('created_at', 'Créé le')->hideOnForm();
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters
            ->add(TextFilter::new('name', 'Nom'))
            ->add(ChoiceFilter::new('output_format', 'Format')->setChoices(['HTML' => 'html', 'PDF' => 'pdf', 'Excel' => 'xlsx']));
    }
}
