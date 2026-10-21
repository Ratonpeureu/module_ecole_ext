import { 
  Users, Wallet, School, Calendar, FileSpreadsheet, Settings, 
  GraduationCap, Activity, ShieldAlert, BookOpen, Bus, 
  Landmark, IdCard, TrendingUp, HeartPulse, ClipboardList,
  HelpCircle, FileText, Lock, Presentation, Megaphone, 
  Library, UserPlus, CreditCard, Layers, Clock, CheckCircle2
} from 'lucide-react';

export interface DocAction {
  title: string;
  description: string;
  badge?: 'Nouveau' | 'Astuce' | 'Attention';
}

export interface DocSection {
  title: string;
  icon: any;
  items: DocAction[];
}

export interface PageDoc {
  title: string;
  description: string;
  sections: DocSection[];
}

export const DOCUMENTATION: Record<string, PageDoc> = {
  // ── DASHBOARD ──────────────────────────────────────────────────────────
  '/': {
    title: 'Tableau de bord',
    description: 'Vue d\'ensemble de votre établissement. Suivez les indicateurs clés en temps réel.',
    sections: [
      {
        title: 'Indicateurs financiers & effectifs',
        icon: Wallet,
        items: [
          { title: 'Recouvrement', description: 'Suivez le pourcentage des frais scolaires encaissés par rapport au total dû. La barre de progression se met à jour automatiquement dès qu\'un paiement est validé.', badge: 'Astuce' },
          { title: 'Effectifs', description: 'Consultez le nombre total d\'élèves et d\'enseignants inscrits pour l\'année scolaire actuellement active.' },
          { title: 'Remplissage des classes', description: 'Une jauge visuelle par classe. Rouge = effectif complet, Jaune = presque plein, Bleu = places disponibles.' }
        ]
      },
      {
        title: 'Actions rapides',
        icon: Activity,
        items: [
          { title: 'Valider les paiements', description: 'Les paiements déclarés par les parents apparaissent dans la section "Paiements à valider". Cliquez sur "Traiter" pour ouvrir le module Finance.' },
          { title: 'Sanctions récentes', description: 'Consultez les 5 dernières sanctions disciplinaires pour garder un œil sur le climat scolaire.' },
          { title: 'Seed Démo', description: 'Uniquement pour les environnements de test : génère 16 classes, ~600 élèves et toutes les données de démonstration.', badge: 'Attention' }
        ]
      }
    ]
  },

  // ── ÉLÈVES ─────────────────────────────────────────────────────────────
  '/eleves': {
    title: 'Gestion des Élèves',
    description: 'Le cœur de votre établissement. Gérez les dossiers, la scolarité, la santé et la finance des élèves.',
    sections: [
      {
        title: 'Inscriptions & Dossiers',
        icon: GraduationCap,
        items: [
          { title: 'Nouvel élève', description: 'Créez un élève et inscrivez-le dans une classe en une seule étape. Un matricule unique lui sera attribué automatiquement.' },
          { title: 'Fiche Détaillée (Panneau)', description: 'Cliquez sur une ligne pour ouvrir le panneau latéral. Il contient 5 onglets : Profil, Scolarité, Finance, Suivi (Santé) et Documents.', badge: 'Astuce' },
          { title: 'Code d\'accès Parent', description: 'Générez un code unique depuis l\'onglet Profil. Ce code permettra au parent de lier son compte à l\'élève via le portail parent.' }
        ]
      },
      {
        title: 'Actions sur le dossier élève',
        icon: ClipboardList,
        items: [
          { title: 'Scolarité', description: 'Inscrivez l\'élève dans une nouvelle classe, clôturez son année (Passage, Redoublement, Orientation) ou consultez son livret complet.' },
          { title: 'Finance', description: 'Encaissez des paiements, consultez l\'échéancier et l\'historique des avoirs (crédits).' },
          { title: 'Suivi & Santé', description: 'Gérez les visites à l\'infirmerie, les protocoles d\'urgence (allergies, asthme) et les contacts d\'urgence.' },
          { title: 'Documents', description: 'Téléversez et stockez les actes de naissance, certificats médicaux et pièces d\'identité (PDF/JPG).' }
        ]
      }
    ]
  },

  // ── CLASSES ────────────────────────────────────────────────────────────
  '/app/ecole/classes': {
    title: 'Gestion des Classes',
    description: 'Structure pédagogique, emplois du temps et gestion du matériel par classe.',
    sections: [
      {
        title: 'Organisation Pédagogique',
        icon: School,
        items: [
          { title: 'Matières', description: 'Affectez les matières à la classe et attribuez un enseignant. Définissez les coefficients pour le calcul des moyennes.' },
          { title: 'Emploi du temps', description: 'Basculez entre un horaire fixe (hebdomadaire) ou variable. Visualisez la grille avec les couleurs par matière.' },
          { title: 'Changer d\'enseignant', description: 'Remplacez un enseignant en cours d\'année depuis l\'onglet "Matières" avec un historique des changements.' }
        ]
      },
      {
        title: 'Vie de la classe',
        icon: Users,
        items: [
          { title: 'Matériel de la classe', description: 'Inventoriez le matériel (tables, chaises, ordinateurs) affecté spécifiquement à cette classe.' },
          { title: 'Photos de classe', description: 'Téléversez les photos de classe annuelles pour les garder dans les archives.' },
          { title: 'Cartes scolaires', description: 'Générez et imprimez les planches de cartes d\'identité pour tous les élèves de la classe.' }
        ]
      }
    ]
  },

  // ── ENSEIGNANTS ────────────────────────────────────────────────────────
  '/app/ecole/enseignants': {
    title: 'Équipe Pédagogique',
    description: 'Gérez les enseignants, leurs affectations, leurs charges horaires et leurs accès au portail.',
    sections: [
      {
        title: 'Dossiers Enseignants',
        icon: Presentation,
        items: [
          { title: 'Nouveau dossier', description: 'Créez un profil enseignant avec ses spécialités et son volume horaire contractuel.' },
          { title: 'Affectations', description: 'Attribuez des matières à des classes. Le système détecte automatiquement les conflits d\'horaires.' },
          { title: 'Charge Horaire', description: 'Visualisez le total d\'heures par semaine de l\'enseignant. Une alerte apparaît s\'il dépasse son contrat.', badge: 'Attention' }
        ]
      },
      {
        title: 'Accès & Portail',
        icon: Lock,
        items: [
          { title: 'Code d\'activation', description: 'Générez un code unique pour que l\'enseignant puisse créer son compte sur le portail.' },
          { title: 'Révoquer l\'accès', description: 'En cas de départ, révoquez immédiatement l\'accès de l\'enseignant au système.' }
        ]
      }
    ]
  },

  // ── PARENTS ────────────────────────────────────────────────────────────
  '/app/ecole/parents': {
    title: 'Comptes Parents',
    description: 'Gestion des familles et des liens de parenté avec les élèves.',
    sections: [
      {
        title: 'Gestion des comptes',
        icon: Users,
        items: [
          { title: 'Créer un compte', description: 'Ajoutez un parent avec son téléphone et son email. Le compte est inactif jusqu\'à la liaison d\'un enfant.' },
          { title: 'Rattacher un enfant', description: 'Liez un élève à un parent en utilisant le "code d\'accès élève" généré depuis le dossier de l\'élève.' },
          { title: 'Code d\'activation', description: 'Générez un code sous enveloppe pour que le parent puisse activer son compte en toute sécurité.' }
        ]
      }
    ]
  },

  // ── EMPLOI DU TEMPS ────────────────────────────────────────────────────
  '/app/ecole/emploi-du-temps': {
    title: 'Emploi du Temps',
    description: 'Planification des cours par classe et par enseignant.',
    sections: [
      {
        title: 'Vue Globale',
        icon: Calendar,
        items: [
          { title: 'Par classe', description: 'Consultez la grille hebdomadaire. Vous pouvez voyager dans le temps en choisissant une date passée pour voir l\'ancien EDT.' },
          { title: 'Par enseignant', description: 'Visualisez le planning d\'un enseignant spécifique pour vérifier sa disponibilité.' },
          { title: 'Vérification de conflits', description: 'Avant de créer un créneau, le système vous avertit si l\'enseignant ou la salle est déjà occupé(e).', badge: 'Attention' }
        ]
      }
    ]
  },

  // ── NOTES & BULLETINS ──────────────────────────────────────────────────
  '/app/ecole/notes': {
    title: 'Notes & Évaluations',
    description: 'Saisie des notes, évaluations et appréciations.',
    sections: [
      {
        title: 'Saisie',
        icon: ClipboardList,
        items: [
          { title: 'Évaluations', description: 'Créez des évaluations (Devoirs, Compositions) avec leur date, note maximale et coefficient.' },
          { title: 'Saisie des notes', description: 'Entrez les notes élève par élève. Les notes absentes (absent) sont exclues du calcul de la moyenne.' },
          { title: 'Appréciations', description: 'Ajoutez un commentaire qualitatif pour chaque élève par matière et par période.' }
        ]
      }
    ]
  },

  '/app/ecole/bulletins': {
    title: 'Bulletins & Classements',
    description: 'Génération, aperçu et publication des bulletins.',
    sections: [
      {
        title: 'Publication',
        icon: FileText,
        items: [
          { title: 'Aperçu', description: 'Visualisez le bulletin d\'un élève en PDF avant publication pour vérifier les moyennes.' },
          { title: 'Publier', description: 'Publiez un seul bulletin ou toute la classe. Une notification sera envoyée aux parents si configuré.', badge: 'Attention' },
          { title: 'Classement', description: 'Générez le classement de la classe avec les rangs, les moyennes et les mentions.' }
        ]
      }
    ]
  },

  // ── PRÉSENCES & DEVOIRS ────────────────────────────────────────────────
  '/app/ecole/presences': {
    title: 'Présences',
    description: 'Appels en classe et suivi de l\'absentéisme.',
    sections: [
      {
        title: 'Gestion des appels',
        icon: CheckCircle2,
        items: [
          { title: 'Faire l\'appel', description: 'Sélectionnez la classe, la matière et l\'heure. Marquez les élèves comme Présent, Absent, Retard ou Absence justifiée.' },
          { title: 'Justifications', description: 'Pour un retard, saisissez le nombre de minutes. Pour une absence justifiée, notez le motif.' }
        ]
      }
    ]
  },

  '/app/ecole/devoirs': {
    title: 'Devoirs',
    description: 'Publication des travaux à faire à la maison.',
    sections: [
      {
        title: 'Actions',
        icon: FileText,
        items: [
          { title: 'Créer un devoir', description: 'Choisissez une classe, une matière, saisissez les consignes et la date limite.' },
          { title: 'Transmission', description: 'Une fois publié, le devoir est visible par les élèves et les parents concernés.' }
        ]
      }
    ]
  },

  // ── VIE SCOLAIRE & SERVICES ────────────────────────────────────────────
  '/app/ecole/vie-scolaire': {
    title: 'Vie Scolaire',
    description: 'Événements, réunions, convocations et communications.',
    sections: [
      {
        title: 'Gestion',
        icon: Megaphone,
        items: [
          { title: 'Événements & Réunions', description: 'Planifiez des événements pour l\'école entière ou pour une classe spécifique. Gérez les convocations des parents.' },
          { title: 'Signatures', description: 'Demandez aux parents de signer électroniquement des documents (règlement intérieur, autorisations).' },
          { title: 'Messages', description: 'Consultez le journal des notifications envoyées par SMS ou Email.' }
        ]
      }
    ]
  },

  '/app/ecole/infirmerie': {
    title: 'Infirmerie',
    description: 'Suivi médical, urgences et vaccinations.',
    sections: [
      {
        title: 'Santé des élèves',
        icon: HeartPulse,
        items: [
          { title: 'Visites', description: 'Enregistrez les passages à l\'infirmerie, les symptômes, les soins donnés et si le parent a été contacté.' },
          { title: 'Protocoles d\'urgence', description: 'Fiche médicale critique (allergies sévères, asthme) avec les consignes à suivre en cas de crise.', badge: 'Attention' },
          { title: 'Vaccins', description: 'Suivez les rappels de vaccins et générez la liste des élèves à relancer.' }
        ]
      }
    ]
  },

  '/discipline': {
    title: 'Discipline',
    description: 'Gestion des sanctions et du climat scolaire.',
    sections: [
      {
        title: 'Sanctions',
        icon: ShieldAlert,
        items: [
          { title: 'Nouvelle sanction', description: 'Enregistrez un avertissement, un blâme, une retenue ou une exclusion. Précisez le motif et la durée.' },
          { title: 'Historique', description: 'Consultez l\'historique disciplinaire complet par élève.' }
        ]
      }
    ]
  },

  '/app/ecole/bibliotheque': {
    title: 'Bibliothèque',
    description: 'Gestion du fonds documentaire et des emprunts.',
    sections: [
      {
        title: 'Catalogue & Prêts',
        icon: Library,
        items: [
          { title: 'Ouvrages', description: 'Ajoutez des livres avec leur auteur, ISBN et nombre d\'exemplaires disponibles.' },
          { title: 'Emprunts', description: 'Prêtez un livre à un élève ou un enseignant. Enregistrez le retour pour remettre l\'ouvrage en rayon.' }
        ]
      }
    ]
  },

  '/app/ecole/transport': {
    title: 'Transport Scolaire',
    description: 'Gestion des bus, circuits et pointage des élèves.',
    sections: [
      {
        title: 'Logistique',
        icon: Bus,
        items: [
          { title: 'Véhicules & Circuits', description: 'Enregistrez les bus, leur capacité et les circuits (arrêts, heures de passage).' },
          { title: 'Abonnements', description: 'Affectez un élève à un circuit (aller/retour).' },
          { title: 'Pointage', description: 'Contrôlez la montée et la descente des élèves. Le système détecte les anomalies (élève non monté à l\'aller, etc.).' }
        ]
      }
    ]
  },

  '/app/ecole/patrimoine': {
    title: 'Patrimoine',
    description: 'Inventaire des salles et du matériel pédagogique.',
    sections: [
      {
        title: 'Gestion',
        icon: Landmark,
        items: [
          { title: 'Salles', description: 'Listez les salles avec leur type (classe, labo, informatique) et leur capacité.' },
          { title: 'Matériel', description: 'Suivez l\'état du matériel (neuf, usé, hors service), sa quantité et sa salle d\'affectation.' }
        ]
      }
    ]
  },

  '/app/ecole/cartes': {
    title: 'Cartes Scolaires',
    description: 'Personnalisation et impression des cartes d\'élèves.',
    sections: [
      {
        title: 'Impression',
        icon: IdCard,
        items: [
          { title: 'Modèles', description: 'Choisissez le design de la carte (couleurs, logo, disposition).' },
          { title: 'Génération', description: 'Lancez l\'impression d\'une planche PDF pour toute une classe ou un élève spécifique.' }
        ]
      }
    ]
  },

  '/app/ecole/analyses': {
    title: 'Analyses & Statistiques',
    description: 'Classements de performance et indicateurs de réussite.',
    sections: [
      {
        title: 'Performance',
        icon: TrendingUp,
        items: [
          { title: 'Classement Enseignants', description: 'Comparez les enseignants par score de performance, moyenne des élèves ou taux de réussite.' },
          { title: 'Classement Classes', description: 'Identifiez les classes avec les meilleures moyennes ou les taux d\'absentéisme les plus élevés.' }
        ]
      }
    ]
  },

  // ── PARAMÈTRES & REGISTRES ─────────────────────────────────────────────
  '/parametres': {
    title: 'Paramètres',
    description: 'Configuration de l\'année, du référentiel et de l\'abonnement.',
    sections: [
      {
        title: 'Année Scolaire',
        icon: Calendar,
        items: [
          { title: 'Année Active', description: 'Une seule année peut être active. Elle sert de contexte par défaut pour tous les modules.', badge: 'Astuce' },
          { title: 'Périodes', description: 'Découpez l\'année en 3 trimestres ou 2 semestres pour les bulletins.' },
          { title: 'Promotion', description: 'En fin d\'année, utilisez cet outil pour inscrire automatiquement les élèves dans la classe de niveau supérieur.' }
        ]
      },
      {
        title: 'Référentiel & Abonnement',
        icon: Settings,
        items: [
          { title: 'Matières & Barèmes', description: 'Ajoutez les matières, définissez les règles de notation (note maximale, seuil de réussite).' },
          { title: 'Abonnement', description: 'Gérez votre formule (Forfait ou Par Employé), consultez vos paiements et prolongez votre accès.' },
          { title: 'Initialisation', description: 'Remplit la base de données avec les catalogues de base. À faire une seule fois au début.' }
        ]
      }
    ]
  },

  '/app/ecole/registres': {
    title: 'Registres Excel',
    description: 'Une interface tableur complète pour gérer les notes, appels et finances.',
    sections: [
      {
        title: 'Fonctionnement',
        icon: FileSpreadsheet,
        items: [
          { title: 'Téléchargement / Téléversement', description: 'Le système génère un fichier Excel. Modifiez-le hors ligne, puis téléversez-le. Les modifications sont synchronisées.', badge: 'Attention' },
          { title: 'Édition en ligne', description: 'Double-cliquez sur une cellule pour la modifier. Le bouton Enregistrer (Ctrl+S) sauvegarde dans la base de données.' },
          { title: 'Formules', description: 'Le tableur supporte les formules basiques (SOMME, MOYENNE). Les cellules avec formules sont en bleu.' },
          { title: 'Synchronisation', description: 'Forcez le recalcul du registre depuis la base de données pour récupérer les dernières données.' }
        ]
      }
    ]
  },

  // ── ABONNEMENT ─────────────────────────────────────────────────────────
  '/abonnement': {
    title: 'Mon Abonnement',
    description: 'Gérez votre accès, vos paiements et vos factures.',
    sections: [
      {
        title: 'Statut',
        icon: CreditCard,
        items: [
          { title: 'Formule', description: 'Consultez votre formule actuelle (Forfait illimité ou Par Employé) et le nombre d\'employés actifs.' },
          { title: 'Échéances', description: 'Suivez la date de renouvellement et les mois prépayés restants.' },
          { title: 'Paiements', description: 'Consultez l\'historique complet de vos transactions et téléchargez vos reçus.' }
        ]
      }
    ]
  },

  '/abonnement/upgrade': {
    title: 'Changer de Formule',
    description: 'Activer ou prolonger votre abonnement.',
    sections: [
      {
        title: 'Options',
        icon: Layers,
        items: [
          { title: 'Forfait Illimité', description: 'Un prix fixe par mois, quel que soit le nombre d\'employés.' },
          { title: 'Par Employé', description: 'Choisissez un palier (1, 3, 6, 12 employés) et une durée. Le tarif s\'ajuste selon vos besoins.' },
          { title: 'Paiement', description: 'Payez par virement bancaire (FCFA) ou par carte bancaire via PayPal (EUR).' }
        ]
      }
    ]
  }
};

export const DEFAULT_DOC: PageDoc = {
  title: 'Centre d\'aide',
  description: 'Retrouvez ici toutes les informations sur l\'utilisation de l\'application.',
  sections: [
    {
      title: 'Navigation',
      icon: HelpCircle,
      items: [
        { title: 'Barre des tâches', description: 'Utilisez les icônes en bas pour naviguer. Faites un clic-droit pour détacher une icône.' },
        { title: 'Menu Démarrer', description: 'Cliquez sur l\'icône Windows pour voir tous les modules.' }
      ]
    },
    {
      title: 'Support',
      icon: Clock,
      items: [
        { title: 'Aide contextuelle', description: 'Ce panneau s\'adapte automatiquement à la page sur laquelle vous vous trouvez.' }
      ]
    }
  ]
};