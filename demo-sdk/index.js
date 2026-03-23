import { RocketReport } from 'rocketreport';

/**
 * RocketReport SDK Demo
 * 
 * Cette démo montre comment :
 * 1. Initialiser le client
 * 2. Créer une Source API
 * 3. Créer un Document (anciennement Endpoint)
 * 4. Tester la récupération des données
 * 5. Générer un rapport
 */

async function runDemo() {
  console.log('🚀 Démarrage de la démo RocketReport SDK...');

  // 1. Initialiser le client (utilisez votre clé API générée sur le dashboard)
  const client = new RocketReport('df7b801cff423d7971dc8977356916c6140965d03d6c32ceb328711fc9857aee', 'https://major-elissa-rocketreport-dbf39593.koyeb.app/');

  try {
    // 2. Créer une source de données API
    console.log('\n📡 Création d\'une source API (ex: JSONPlaceholder)...');
    const sourceRes = await client.createApiSource({
      name: 'JSONPlaceholder API',
      url_base: 'https://jsonplaceholder.typicode.com',
      auth_type: 'none'
    });
    const source = sourceRes.data; // L'API Symfony renvoie { data: { ... } }
    console.log('✅ Source créée avec succès. ID:', source.id);

    // 3. Créer un Document (ex: Liste des utilisateurs)
    console.log('\n📄 Configuration d\'un nouveau Document...');
    const document = await client.createApiDocument(source.id, {
      name: 'Liste des Utilisateurs',
      path: '/users',
      method: 'GET',
      variables: [],
      description: 'Récupère les informations essentielles des utilisateurs'
    });
    // Note: createApiDocument dans votre contrôleur renvoie l'objet directement sans wrapper 'data'
    console.log('✅ Document configuré. ID:', document.id);

    // 4. Tester la récupération des données
    console.log('\n🧪 Test du Document (vérification du filtrage des variables)...');
    const test = await client.testApiDocument(source.id, document.id);
    
    if (test.success) {
      console.log('✅ Test réussi ! Données filtrées reçues :');
      // Afficher les deux premiers résultats
      console.log(JSON.stringify(test.data.slice(0, 2), null, 2));
    } else {
      console.log('❌ Échec du test :', test.error);
      if (test.missing_variables?.length > 0) {
        console.log('⚠️ Variables manquantes :', test.missing_variables.join(', '));
      }
    }

    // 5. Générer un rapport final
    console.log('\n🖨️ Génération du rapport...');
    const generation = await client.generate(document.id, {
      title: 'Rapport Annuel des Utilisateurs',
      show_date: true
    });
    console.log('✅ Rapport généré avec succès !');
    console.log('🔗 URL de téléchargement :', generation.download_url || 'Disponible sur le dashboard');

  } catch (error) {
    console.error('\n❌ Erreur pendant la démo :', error.message);
    if (error.details) {
      console.error('Détails API :', JSON.stringify(error.details, null, 2));
    }
  }
}

runDemo();
