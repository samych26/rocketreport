<?php

namespace App\Infrastructure\Http\Controller\Admin;

use App\Domain\Entity\ApiSource;
use EasyCorp\Bundle\EasyAdminBundle\Config\Crud;
use EasyCorp\Bundle\EasyAdminBundle\Config\Filters;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractCrudController;
use EasyCorp\Bundle\EasyAdminBundle\Field\AssociationField;
use EasyCorp\Bundle\EasyAdminBundle\Field\ChoiceField;
use EasyCorp\Bundle\EasyAdminBundle\Field\DateTimeField;
use EasyCorp\Bundle\EasyAdminBundle\Field\IdField;
use EasyCorp\Bundle\EasyAdminBundle\Field\TextField;
use EasyCorp\Bundle\EasyAdminBundle\Filter\ChoiceFilter;
use EasyCorp\Bundle\EasyAdminBundle\Filter\TextFilter;

class ApiSourceCrudController extends AbstractCrudController
{
    public static function getEntityFqcn(): string
    {
        return ApiSource::class;
    }

    public function configureCrud(Crud $crud): Crud
    {
        return $crud
            ->setEntityLabelInSingular('Source API')
            ->setEntityLabelInPlural('Sources API')
            ->setDefaultSort(['created_at' => 'DESC'])
            ->setSearchFields(['name', 'url_base']);
    }

    public function configureFields(string $pageName): iterable
    {
        yield IdField::new('id')->hideOnForm();
        yield AssociationField::new('user', 'Utilisateur');
        yield TextField::new('name', 'Nom');
        yield TextField::new('url_base', 'URL de base');
        yield ChoiceField::new('auth_type', 'Authentification')
            ->setChoices(['Aucune' => 'none', 'Bearer' => 'bearer', 'Basic' => 'basic', 'API Key' => 'api_key']);
        yield ChoiceField::new('status', 'Statut')
            ->setChoices(['Actif' => 'active', 'Inactif' => 'inactive'])
            ->renderAsBadges(['active' => 'success', 'inactive' => 'danger']);
        yield DateTimeField::new('created_at', 'Créé le')->hideOnForm();
    }

    public function configureFilters(Filters $filters): Filters
    {
        return $filters
            ->add(TextFilter::new('name', 'Nom'))
            ->add(ChoiceFilter::new('status', 'Statut')->setChoices(['Actif' => 'active', 'Inactif' => 'inactive']));
    }
}
