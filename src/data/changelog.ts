/**
 * Changelog Data for Werte•Kreis App
 * 
 * This file contains the update history and feature changes for the app.
 * Updates are displayed in the "Neu in der App" page in reverse chronological order.
 */

export interface ChangelogEntry {
  date: string; // YYYY-MM-DD format
  version?: string;
  title: Record<string, string>; // Multilingual title
  description: Record<string, string>; // Multilingual description
  benefits: Record<string, string[]>; // Multilingual benefits
  type: 'feature' | 'improvement' | 'bugfix' | 'security';
}

export const changelog: ChangelogEntry[] = [
  {
    date: '2025-08-06',
    version: '2.1.0',
    title: {
      de: 'Verbesserte Benutzeroberfläche und Design-Optimierungen',
      en: 'Improved User Interface and Design Optimizations',
      fr: 'Interface Utilisateur Améliorée et Optimisations de Conception'
    },
    description: {
      de: 'Die App wurde mit modernen Design-Verbesserungen und einer optimierten Benutzeroberfläche aktualisiert.',
      en: 'The app has been updated with modern design enhancements and an optimized user interface.',
      fr: 'L\'application a été mise à jour avec des améliorations de conception modernes et une interface utilisateur optimisée.'
    },
    benefits: {
      de: [
        'Kleinere, runde Icons in den Feature-Karten für ein moderneres Erscheinungsbild',
        'Hellerer Hintergrund in der App-Übersicht für bessere Lesbarkeit',
        'Leichte Transparenz-Effekte für eine elegantere Optik',
        'Verbesserte visuelle Hierarchie und Kontraste',
        'Optimierte Farbgebung für bessere Zugänglichkeit',
        'Modernisierte Gestaltung der Hauptseite mit subtilen Verbesserungen'
      ],
      en: [
        'Smaller, round icons in feature cards for a more modern look',
        'Brighter background in the app overview for better readability',
        'Subtle transparency effects for a more elegant appearance',
        'Improved visual hierarchy and contrasts',
        'Optimized color scheme for better accessibility',
        'Modernized main page design with subtle enhancements'
      ],
      fr: [
        'Icônes plus petites et rondes dans les cartes de fonctionnalités pour un look plus moderne',
        'Fond plus clair dans l\'aperçu de l\'application pour une meilleure lisibilité',
        'Effets de transparence légers pour une apparence plus élégante',
        'Hiérarchie visuelle et contrastes améliorés',
        'Palette de couleurs optimisée pour une meilleure accessibilité',
        'Conception de la page principale modernisée avec des améliorations subtiles'
      ]
    },
    type: 'improvement'
  },
  {
    date: '2025-08-05',
    version: '2.0.0',
    title: { de: 'Komplett überarbeitetes Profil mit Beitragsfunktion', en: 'Completely Redesigned Profile with Contribution Feature', fr: 'Profil Entièrement Repensé avec Fonction de Contribution' },
    description: { de: 'Das "Mein Profil" wurde von Grund auf neu entwickelt und bietet jetzt eine strukturierte Möglichkeit, deinen Beitrag zur Community zu definieren.', en: 'The "My Profile" section has been completely redesigned and now offers a structured way to define your contribution to the community.', fr: 'La section "Mon Profil" a été entièrement repensée et offre désormais un moyen structuré de définir votre contribution à la communauté.' },
    benefits: {
      de: [
        'Du kannst jetzt strukturiert beschreiben: "Ich kann [Fähigkeit] und helfe damit [Zielgruppe] dabei, [Problem zu lösen]"',
        'Alle deine erstellten Events werden übersichtlich in deinem Profil angezeigt',
        'Du kannst Events direkt aus deinem Profil heraus bearbeiten und verwalten',
        'Deine Event-Teilnahmen (RSVPs) sind jetzt zentral in deinem Profil einsehbar',
        'Das Profil ist jetzt vollständig responsive und funktioniert perfekt auf allen Geräten',
        'Verbesserte Benutzerführung mit klaren Bereichen für persönliche Daten, Beitrag und Events'
      ],
      en: [
        'You can now describe in a structured way: "I can [skill] and help [target group] to [solve problem]"',
        'All your created events are clearly displayed in your profile',
        'You can edit and manage your events directly from your profile',
        'Your event participations (RSVPs) are now centrally viewable in your profile',
        'The profile is now fully responsive and works perfectly on all devices',
        'Improved user guidance with clear sections for personal data, contribution, and events'
      ],
      fr: [
        'Vous pouvez maintenant décrire de manière structurée : "Je peux [compétence] et aider [groupe cible] à [résoudre un problème]"',
        'Tous vos événements créés sont clairement affichés dans votre profil',
        'Vous pouvez modifier et gérer vos événements directement depuis votre profil',
        'Vos participations aux événements (RSVP) sont désormais consultables de manière centralisée dans votre profil',
        'Le profil est désormais entièrement réactif et fonctionne parfaitement sur tous les appareils',
        'Guidage utilisateur amélioré avec des sections claires pour les données personnelles, la contribution et les événements'
      ]
    },
    type: 'feature'
  },
  {
    date: '2025-08-04',
    version: '1.2.0',
    title: { de: 'Verbesserte Chat-Funktionalität', en: 'Improved Chat Functionality', fr: 'Fonctionnalité de Chat Améliorée' },
    description: { de: 'Die Nachrichtenfunktion wurde komplett überarbeitet für eine bessere Nutzererfahrung.', en: 'The messaging function has been completely revamped for a better user experience.', fr: 'La fonction de messagerie a été entièrement remaniée pour une meilleure expérience utilisateur.' },
    benefits: {
      de: [
        'Du kannst jetzt Nachrichten in Echtzeit senden und empfangen',
        'Nachrichten werden automatisch als gelesen markiert',
        'Die Chat-Oberfläche ist jetzt mobilfreundlicher',
        'Verbesserte Benachrichtigungen für neue Nachrichten'
      ],
      en: [
        'You can now send and receive messages in real-time',
        'Messages are automatically marked as read',
        'The chat interface is now more mobile-friendly',
        'Improved notifications for new messages'
      ],
      fr: [
        'Vous pouvez désormais envoyer et recevoir des messages en temps réel',
        'Les messages sont automatiquement marqués comme lus',
        'L\'interface de chat est désormais plus adaptée aux mobiles',
        'Notifications améliorées pour les nouveaux messages'
      ]
    },
    type: 'feature'
  },
  {
    date: '2025-08-03',
    version: '1.1.5',
    title: { de: 'Erweiterte Suchfilter für Events', en: 'Extended Search Filters for Events', fr: 'Filtres de Recherche Étendus pour les Événements' },
    description: { de: 'Die Event-Suche wurde um neue Filter und Sortieroptionen erweitert.', en: 'Event search has been extended with new filters and sorting options.', fr: 'La recherche d\'événements a été étendue avec de nouveaux filtres et options de tri.' },
    benefits: {
      de: [
        'Du kannst Events jetzt nach Kategorie und Datum filtern',
        'Die Suche funktioniert jetzt auch in Event-Beschreibungen',
        'Events werden automatisch nach Relevanz sortiert',
        'Bessere Übersicht über kommende Veranstaltungen'
      ],
      en: [
        'You can now filter events by category and date',
        'Search now also works in event descriptions',
        'Events are automatically sorted by relevance',
        'Better overview of upcoming events'
      ],
      fr: [
        'Vous pouvez désormais filtrer les événements par catégorie et par date',
        'La recherche fonctionne désormais également dans les descriptions d\'événements',
        'Les événements sont automatiquement triés par pertinence',
        'Meilleure vue d\'ensemble des événements à venir'
      ]
    },
    type: 'improvement'
  },
  {
    date: '2025-08-02',
    version: '1.1.0',
    title: { de: 'Neue Profil-Privatsphäre Einstellungen', en: 'New Profile Privacy Settings', fr: 'Nouveaux Paramètres de Confidentialité du Profil' },
    description: { de: 'Mehr Kontrolle über die Sichtbarkeit deines Profils und deiner Daten.', en: 'More control over the visibility of your profile and data.', fr: 'Plus de contrôle sur la visibilité de votre profil et de vos données.' },
    benefits: {
      de: [
        'Du kannst jetzt wählen, wer dein Profil sehen kann',
        'Neue Optionen für E-Mail-Benachrichtigungen',
        'Verbesserte Datenschutz-Kontrollen',
        'Einfachere Verwaltung deiner Privatsphäre-Einstellungen'
      ],
      en: [
        'You can now choose who can see your profile',
        'New options for email notifications',
        'Improved data protection controls',
        'Easier management of your privacy settings'
      ],
      fr: [
        'Vous pouvez désormais choisir qui peut voir votre profil',
        'Nouvelles options pour les notifications par e-mail',
        'Contrôles de protection des données améliorés',
        'Gestion simplifiée de vos paramètres de confidentialité'
      ]
    },
    type: 'feature'
  },
  {
    date: '2025-08-01',
    version: '1.0.8',
    title: { de: 'Optimierte Kartenansicht', en: 'Optimized Map View', fr: 'Vue Cartographique Optimisée' },
    description: { de: 'Die Umkreissuche und Kartennavigation wurden deutlich verbessert.', en: 'The proximity search and map navigation have been significantly improved.', fr: 'La recherche de proximité et la navigation cartographique ont été considérablement améliorées.' },
    benefits: {
      de: [
        'Die Karte lädt jetzt schneller und flüssiger',
        'Bessere Standorterkennung für präzisere Ergebnisse',
        'Neue Marker-Symbole für verschiedene Interessensbereiche',
        'Verbesserte Touch-Bedienung auf mobilen Geräten'
      ],
      en: [
        'The map now loads faster and smoother',
        'Better location detection for more precise results',
        'New marker symbols for different areas of interest',
        'Improved touch operation on mobile devices'
      ],
      fr: [
        'La carte se charge désormais plus rapidement et plus fluidement',
        'Meilleure détection de la localisation pour des résultats plus précis',
        'Nouveaux symboles de marqueur pour différents domaines d\'intérêt',
        'Opération tactile améliorée sur les appareils mobiles'
      ]
    },
    type: 'improvement'
  },
  {
    date: '2025-07-31',
    version: '1.0.5',
    title: { de: 'Sicherheits-Updates', en: 'Security Updates', fr: 'Mises à Jour de Sécurité' },
    description: { de: 'Wichtige Sicherheitsverbesserungen für den Schutz deiner Daten.', en: 'Important security enhancements for the protection of your data.', fr: 'Améliorations importantes de la sécurité pour la protection de vos données.' },
    benefits: {
      de: [
        'Verstärkte Verschlüsselung für alle Nachrichten',
        'Verbesserte Authentifizierung beim Login',
        'Automatische Abmeldung bei Inaktivität',
        'Erweiterte Spam-Schutz Maßnahmen'
      ],
      en: [
        'Enhanced encryption for all messages',
        'Improved authentication during login',
        'Automatic logout on inactivity',
        'Extended spam protection measures'
      ],
      fr: [
        'Chiffrement renforcé pour tous les messages',
        'Authentification améliorée lors de la connexion',
        'Déconnexion automatique en cas d\'inactivité',
        'Mesures de protection anti-spam étendues'
      ]
    },
    type: 'security'
  }
];

// Helper function to get the most recent update date
export const getLastUpdateDate = (): string => {
  if (changelog.length === 0) return new Date().toISOString().split('T')[0];
  return changelog[0].date;
};

// Helper function to get recent updates (default: last 5)
export const getRecentUpdates = (count: number = 5): ChangelogEntry[] => {
  return changelog.slice(0, count);
};

// Helper function to format date in German
export const formatGermanDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};