import { Link } from 'react-router-dom';

const LINKS = [
  { to: '/faq',         label: 'FAQ' },
  { to: '/help',        label: 'Hilfe' },
  { to: '/feedback',    label: 'Feedback' },
  { to: '/impressum',   label: 'Impressum' },
  { to: '/datenschutz', label: 'Datenschutz' },
];

export default function Footer() {
  return (
    <footer className="bg-stone-950 border-t border-stone-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-stone-600 text-xs">
          © {new Date().getFullYear()} ArrowFormance
        </p>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1">
          {LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-stone-400 hover:text-amber-500 text-xs transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
