export interface Banner {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  gradient: string;
}

export const BANNERS: Banner[] = [
  {
    id: 'claude',
    emoji: '🤖',
    title: 'Analysiert mit KI von Claude',
    subtitle: 'Moderne Pose-Erkennung powered by Anthropic',
    cta: 'Mehr erfahren',
    href: 'https://claude.ai',
    gradient: 'from-orange-600 to-orange-700'
  },
  {
    id: 'zsammsitzn',
    emoji: '🍷',
    title: 'Präsentiert von Zsammsitzn',
    subtitle: 'Regionale Events und gemütliche Zusammenkünfte',
    cta: 'Entdecken',
    href: 'https://zsammsitzn.com',
    gradient: 'from-amber-700 to-amber-800'
  },
  {
    id: 'flohmarktguide',
    emoji: '🏷️',
    title: 'Mehr regionale Projekte',
    subtitle: 'Flohmärkte und lokale Veranstaltungen in deiner Nähe',
    cta: 'Besuchen',
    href: 'https://flohmarktguide.org',
    gradient: 'from-emerald-700 to-emerald-800'
  }
];