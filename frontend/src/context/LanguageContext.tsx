import { createContext, useState } from 'react';
import type { ReactNode } from 'react';

// Real RocketReport translations
const translations = {
    fr: {
        loading: 'Chargement en cours...',
        language: 'Langue',
        theme: 'Thème',
        welcome: 'Connexion à RocketReport',
        preparing: 'Vérification de l\'espace de travail...',

        // Hero Section
        tagline: '🚀 Génération de PDF automatisée',
        hero_title: 'Vos données API, transformées en rapports de génie',
        hero_subtitle: 'Connectez vos sources de données, injectez-les dans des templates personnalisés, exécutez votre propre logique JS/Python, et générez des PDF à la volée.',
        get_started: 'Créer un document',
        request_demo: 'Voir la documentation',

        // Features Section
        why_choose: 'Les super-pouvoirs de RocketReport',
        feat1_title: '📡 Connexion Sources API',
        feat1_desc: 'Récupérez dynamiquement vos données depuis n\'importe quelle API REST pour nourrir vos documents sans effort manuel.',
        feat2_title: '🎨 Templates Flexibles',
        feat2_desc: 'Concevez des modèles de documents intelligents et réutilisables qui s\'adaptent automatiquement aux données entrantes.',
        feat3_title: '⚙️ Code Processors Intégrés',
        feat3_desc: 'Transformez, filtrez et préparez vos données avec des scripts personnalisés avant leur injection dans le PDF final.',
        feat4_title: '📄 Génération Rapide',
        feat4_desc: 'Générez et téléchargez vos rapports PDF en un clin d\'œil avec notre moteur de rendu haute performance.',

        // How It Works
        how_title: 'Comment ça marche ?',
        step1_title: '1. Connecter l\'API',
        step1_desc: 'Ajoutez votre source de données REST.',
        step2_title: '2. Créer les Templates',
        step2_desc: 'Créez vos modèles avec vos variables.',
        step3_title: '3. Processeur de Données',
        step3_desc: 'Manipulez la data avant injection.',
        step4_title: '4. Générer le PDF',
        step4_desc: 'Générez et téléchargez le rapport final.',

        // Auth Section
        login_title: 'Se connecter',
        register_title: 'S\'inscrire',
        email_label: 'Adresse E-mail',
        email_placeholder: 'vous@entreprise.com',
        password_label: 'Mot de passe',
        password_placeholder: '••••••••',
        name_label: 'Nom complet',
        name_placeholder: 'Jean Dupont',
        confirm_password_label: 'Confirmer le mot de passe',
        forgot_password: 'Mot de passe oublié ?',
        login_submit: 'Connexion',
        register_submit: 'Créer un compte',
        no_account: 'Pas encore de compte ?',
        have_account: 'Déjà un compte ?',
        sign_up_link: 'S\'inscrire',
        sign_in_link: 'Se connecter',

        // Navigation
        nav_dashboard: 'Dashboard',
        nav_templates: 'Templates',
        nav_api_sources: 'API Sources',
        nav_build: 'Build',
        nav_generations: 'Générations',

        // Footer
        footer_text: '© 2026 RocketReport. Construit pour l\'automatisation.',
        footer_links: 'Documentation | API | Contact'
    },
    en: {
        loading: 'Loading...',
        language: 'Language',
        theme: 'Theme',
        welcome: 'Connecting to RocketReport',
        preparing: 'Verifying workspace...',

        // Hero Section
        tagline: '🚀 Automated PDF Generation',
        hero_title: 'Your API Data, Transformed into Genius Reports',
        hero_subtitle: 'Connect your data sources, inject them into custom templates, run your own JS/Python logic, and generate PDFs on the fly.',
        get_started: 'Create a Document',
        request_demo: 'View Documentation',

        // Features Section
        why_choose: 'RocketReport Superpowers',
        feat1_title: '📡 API Sources Connection',
        feat1_desc: 'Dynamically fetch your data from any REST API to feed your documents without any manual effort.',
        feat2_title: '🎨 Flexible Templates',
        feat2_desc: 'Design smart, reusable document templates that automatically adapt to incoming data.',
        feat3_title: '⚙️ Integrated Code Processors',
        feat3_desc: 'Transform, filter, and prepare your data with custom scripts before injecting it into the final PDF.',
        feat4_title: '📄 Lightning Fast Generation',
        feat4_desc: 'Generate and download your PDF reports in the blink of an eye with our high-performance rendering engine.',

        // How It Works
        how_title: 'How It Works?',
        step1_title: '1. Connect API',
        step1_desc: 'Add your REST data source.',
        step2_title: '2. Create Templates',
        step2_desc: 'Build templates with your variables.',
        step3_title: '3. Data Processor',
        step3_desc: 'Manipulate data before injection.',
        step4_title: '4. Generate PDF',
        step4_desc: 'Generate and download the final report.',

        // Auth Section
        login_title: 'Sign In',
        register_title: 'Sign Up',
        email_label: 'Email Address',
        email_placeholder: 'you@company.com',
        password_label: 'Password',
        password_placeholder: '••••••••',
        name_label: 'Full Name',
        name_placeholder: 'John Doe',
        confirm_password_label: 'Confirm Password',
        forgot_password: 'Forgot Password?',
        login_submit: 'Sign In',
        register_submit: 'Create Account',
        no_account: 'Don\'t have an account?',
        have_account: 'Already have an account?',
        sign_up_link: 'Sign Up',
        sign_in_link: 'Sign In',

        // Navigation
        nav_dashboard: 'Dashboard',
        nav_templates: 'Templates',
        nav_api_sources: 'API Sources',
        nav_build: 'Build',
        nav_generations: 'Generations',

        // Footer
        footer_text: '© 2026 RocketReport. Built for automation.',
        footer_links: 'Documentation | API | Contact'
    }
};

export type Language = keyof typeof translations;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations['en']) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const savedLang = localStorage.getItem('app-lang') as Language;
        if (savedLang && ['fr', 'en'].includes(savedLang)) return savedLang;
        return 'fr';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('app-lang', lang);
    };

    const t = (key: keyof typeof translations['en']) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
