export interface Banner {
  id: string;
  image: string;
  link: string;
  alt: string;
}

export const BANNERS: Banner[] = [
  {
    id: 'claude',
    image: '/ads/claude-banner.svg',
    link: 'https://claude.ai',
    alt: 'Analysiert mit KI von Claude.ai'
  },
  {
    id: 'zsammsitzn',
    image: '/ads/zsammsitzn-banner.svg',
    link: 'https://zsammsitzn.com',
    alt: 'Präsentiert von Zsammsitzn.com'
  },
  {
    id: 'flohmarktguide',
    image: '/ads/flohmarktguide-banner.svg',
    link: 'https://flohmarktguide.org',
    alt: 'Mehr regionale Projekte auf FlohmarktGuide.org'
  }
];
