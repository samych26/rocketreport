<?php

namespace App\Infrastructure\Http\Controller\Admin;

use App\Domain\Entity\ApiSource;
use App\Domain\Entity\Document;
use App\Domain\Entity\DocumentGeneration;
use App\Domain\Entity\Template;
use App\Domain\Entity\User;
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
        yield MenuItem::linkToDashboard('Dashboard', 'fa fa-home');

        yield MenuItem::section('Utilisateurs');
        yield MenuItem::linkToCrud('Utilisateurs', 'fa fa-users', User::class);

        yield MenuItem::section('Contenu');
        yield MenuItem::linkToCrud('Sources API', 'fa fa-plug', ApiSource::class);
        yield MenuItem::linkToCrud('Documents', 'fa fa-file-alt', Document::class);
        yield MenuItem::linkToCrud('Templates', 'fa fa-paint-brush', Template::class);

        yield MenuItem::section('Activité');
        yield MenuItem::linkToCrud('Générations', 'fa fa-cogs', DocumentGeneration::class);

        yield MenuItem::section('');
        yield MenuItem::linkToUrl('← Retour au site', 'fa fa-arrow-left', '/');
    }
}
