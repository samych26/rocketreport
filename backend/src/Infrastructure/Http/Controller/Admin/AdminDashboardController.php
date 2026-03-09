<?php

namespace App\Infrastructure\Http\Controller\Admin;

use App\Domain\Entity\ApiSource;
use App\Domain\Entity\Document;
use App\Domain\Entity\DocumentGeneration;
use App\Domain\Entity\Template;
use App\Domain\Entity\User;
use App\Infrastructure\Http\Controller\Admin\ApiSourceCrudController;
use App\Infrastructure\Http\Controller\Admin\DocumentCrudController;
use App\Infrastructure\Http\Controller\Admin\DocumentGenerationCrudController;
use App\Infrastructure\Http\Controller\Admin\TemplateCrudController;
use App\Infrastructure\Http\Controller\Admin\UserCrudController;
use Doctrine\ORM\EntityManagerInterface;
use EasyCorp\Bundle\EasyAdminBundle\Attribute\AdminDashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\Dashboard;
use EasyCorp\Bundle\EasyAdminBundle\Config\MenuItem;
use EasyCorp\Bundle\EasyAdminBundle\Controller\AbstractDashboardController;
use Symfony\Component\HttpFoundation\Response;

#[AdminDashboard(routePath: '/admin', routeName: 'admin')]
class AdminDashboardController extends AbstractDashboardController
{
    public function __construct(private EntityManagerInterface $em) {}

    public function index(): Response
    {
        return $this->render('admin/dashboard.html.twig', [
            'users_count'       => $this->em->getRepository(User::class)->count([]),
            'sources_count'     => $this->em->getRepository(ApiSource::class)->count([]),
            'documents_count'   => $this->em->getRepository(Document::class)->count([]),
            'generations_count' => $this->em->getRepository(DocumentGeneration::class)->count([]),
        ]);
    }

    public function configureDashboard(): Dashboard
    {
        return Dashboard::new()
            ->setTitle('🚀 RocketReport Admin')
            ->setFaviconPath('favicon.ico')
            ->renderContentMaximized();
    }

    public function configureMenuItems(): iterable
    {
        yield MenuItem::linkToDashboard('Dashboard', 'fa-solid fa-house');

        yield MenuItem::section('Utilisateurs');
        yield MenuItem::linkToRoute('Utilisateurs', 'fa-solid fa-users', 'admin_user_index');

        yield MenuItem::section('Contenu');
        yield MenuItem::linkToRoute('Sources API', 'fa-solid fa-plug', 'admin_api_source_index');
        yield MenuItem::linkToRoute('Documents', 'fa-solid fa-file-lines', 'admin_document_index');
        yield MenuItem::linkToRoute('Templates', 'fa-solid fa-paintbrush', 'admin_template_index');

        yield MenuItem::section('Activité');
        yield MenuItem::linkToRoute('Générations', 'fa-solid fa-gears', 'admin_document_generation_index');

        yield MenuItem::section('');
        yield MenuItem::linkToUrl('← Retour au site', 'fa-solid fa-arrow-left', '/');
    }
}
