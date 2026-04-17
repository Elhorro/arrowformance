export interface BannerData {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  gradient: string;
  emoji: string;
}

export const BANNERS: BannerData[] = [
  {
    id: 'coaching-banner',
    title: 'Professionelles Coaching',
    subtitle: 'Lass deine Technik von einem zertifizierten Trainer analysieren und gezielt verbessern.',
    cta: 'Termin buchen',
    href: 'https://www.bogensport.de/',
    gradient: 'from-amber-600 to-orange-600',
    emoji: '🎯',
  },
  {
    id: 'equipment-banner',
    title: 'Equipment-Tipps',
    subtitle: 'Die richtige Ausrüstung für dein Level – Bogen, Pfeile & Zubehör im Überblick.',
    cta: 'Entdecken',
    href: 'https://www.bogensport.de/',
    gradient: 'from-sky-600 to-blue-700',
    emoji: '🏹',
  },
  {
    id: 'course-banner',
    title: 'Online-Kurs: Bogenschießen',
    subtitle: 'Von der Grundhaltung zur perfekten Ausführung – strukturiert, Schritt für Schritt.',
    cta: 'Kurs starten',
    href: 'https://www.bogensport.de/',
    gradient: 'from-emerald-600 to-teal-700',
    emoji: '🎓',
  },
];
