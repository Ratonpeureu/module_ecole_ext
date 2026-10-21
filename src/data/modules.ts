import {
  BusIcon,
  CalendarCheckIcon,
  CalendarClockIcon,
  GraduationCapIcon,
  HeartPulseIcon,
  HomeIcon,
  IdCardIcon,
  LandmarkIcon,
  LibraryIcon,
  MegaphoneIcon,
  NotebookPenIcon,
  PenLineIcon,
  PresentationIcon,
  SchoolIcon,
  ScrollTextIcon,
  SettingsIcon,
  ShieldAlertIcon,
  TrendingUpIcon,
  UserPlusIcon,
  FileSpreadsheetIcon,
  UsersIcon,
  WalletIcon
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ModuleDef {
  path: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  pinned: boolean;
}

export const modules: ModuleDef[] = [
  { path: "/",                    label: "Accueil",           description: "Vue d'ensemble de l'établissement", icon: HomeIcon,           color: "#0067C0", pinned: true  },
  { path: "/eleves",              label: "Élèves",            description: "Dossiers, inscriptions et suivi",   icon: GraduationCapIcon,  color: "#0F7B6C", pinned: true  },
  { path: "/classes",             label: "Classes",           description: "Classes, matières et matériel",     icon: SchoolIcon,         color: "#4F6BED", pinned: true  },
  { path: "/enseignants",         label: "Enseignants",       description: "Équipe pédagogique et affectations",icon: PresentationIcon,   color: "#8764B8", pinned: true  },
  { path: "/parents",             label: "Parents",           description: "Comptes et liens familiaux",        icon: UsersIcon,          color: "#C239B3", pinned: true  },
  { path: "/emploi-du-temps",     label: "Emploi du temps",   description: "Créneaux et plannings",             icon: CalendarClockIcon,  color: "#0099BC", pinned: true  },
  { path: "/notes",               label: "Notes",             description: "Évaluations et appréciations",      icon: PenLineIcon,        color: "#CA5010", pinned: true  },
  { path: "/bulletins",           label: "Bulletins",         description: "Publication et classements",        icon: ScrollTextIcon,     color: "#E3008C", pinned: false },
  { path: "/presences",           label: "Présences",         description: "Appels et absences",                icon: CalendarCheckIcon,  color: "#107C10", pinned: true  },
  { path: "/devoirs",             label: "Devoirs",           description: "Travail à la maison",               icon: NotebookPenIcon,    color: "#B146C2", pinned: false },
  { path: "/finance",             label: "Finance",           description: "Paiements, frais et dépenses",      icon: WalletIcon,         color: "#1B7F3B", pinned: true  },
  { path: "/admissions",          label: "Admissions",        description: "Candidatures et places",            icon: UserPlusIcon,       color: "#DA3B01", pinned: false },
  { path: "/vie-scolaire",        label: "Vie scolaire",      description: "Événements, réunions, convocations",icon: MegaphoneIcon,      color: "#E74856", pinned: true  },
  { path: "/infirmerie",          label: "Infirmerie",        description: "Visites, protocoles, vaccins",      icon: HeartPulseIcon,     color: "#D13438", pinned: false },
  { path: "/discipline",          label: "Discipline",        description: "Sanctions disciplinaires",          icon: ShieldAlertIcon,    color: "#9A0089", pinned: false },
  { path: "/bibliotheque",        label: "Bibliothèque",      description: "Ouvrages et emprunts",              icon: LibraryIcon,        color: "#8E562E", pinned: false },
  { path: "/transport",           label: "Transport",         description: "Véhicules, circuits, pointage",     icon: BusIcon,            color: "#C19C00", pinned: false },
  { path: "/patrimoine",          label: "Patrimoine",        description: "Salles et matériel",                icon: LandmarkIcon,       color: "#486860", pinned: false },
  { path: "/cartes",              label: "Cartes scolaires",  description: "Modèles et impression",             icon: IdCardIcon,         color: "#005B70", pinned: false },
  { path: "/analyses",            label: "Analyses",          description: "Classements et statistiques",       icon: TrendingUpIcon,     color: "#3A5BD9", pinned: false },
  { path: "/parametres",          label: "Paramètres",        description: "Années, matières, barèmes",         icon: SettingsIcon,       color: "#5A6472", pinned: true  },
  { path: "/registres",           label: "Registres",         description: "Classeurs Excel des classes",       icon: FileSpreadsheetIcon, color: "#217346", pinned: false },
];