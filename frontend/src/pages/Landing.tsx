import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

/* ── Live terminal feed data ── */
const FEED_ITEMS = [
  { time: '09:42:01', co: 'HubSpot', page: '/pricing', tag: 'PRIX', msg: 'Plan Pro +12%', alert: true },
  { time: '09:42:38', co: 'Salesforce', page: '/features', tag: 'PRODUIT', msg: 'Nouvelle fonctionnalité IA', alert: false },
  { time: '09:43:15', co: 'Notion', page: '/pricing', tag: 'PRIX', msg: 'Plan Starter supprimé', alert: true },
  { time: '09:44:02', co: 'Pipedrive', page: '/blog', tag: 'CONTENU', msg: '8 nouvelles pages publiées', alert: false },
  { time: '09:44:41', co: 'Monday.com', page: '/pricing', tag: 'PRIX', msg: '-15% remise lancement', alert: true },
  { time: '09:45:19', co: 'Intercom', page: '/home', tag: 'DESIGN', msg: 'Header redesigné', alert: false },
  { time: '09:46:03', co: 'HubSpot', page: '/careers', tag: 'EMPLOI', msg: '+12 offres publiées', alert: false },
  { time: '09:47:11', co: 'Salesforce', page: '/pricing', tag: 'PRIX', msg: 'Remise fin de trimestre', alert: true },
];

function TerminalFeed() {
  const [visible, setVisible] = useState(2);

  useEffect(() => {
    if (visible >= FEED_ITEMS.length) return;
    const t = setTimeout(() => setVisible((v) => v + 1), 900);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div className="bg-[#0D0D0F] border border-[#27272A] rounded-xl overflow-hidden font-mono text-xs">
      {/* Title bar */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#27272A] bg-[#111113]">
        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-3 text-[#52525B] text-[10px] tracking-wider">kronyx — surveillance · 8 concurrents actifs</span>
        <span className="ml-auto flex items-center gap-1.5 text-[#A3E635] text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635] animate-pulse inline-block" />
          LIVE
        </span>
      </div>
      {/* Feed lines */}
      <div className="p-4 space-y-2 min-h-[280px]">
        {FEED_ITEMS.slice(0, visible).map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 leading-relaxed"
            style={{ opacity: i === visible - 1 ? 1 : 0.55 }}
          >
            <span className="text-[#3F3F46] shrink-0 tabular-nums">{item.time}</span>
            <span
              className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                item.alert ? 'bg-red-950 text-red-400' : 'bg-[#1C1C1E] text-[#71717A]'
              }`}
            >
              {item.tag}
            </span>
            <span className="text-[#71717A]">
              <span className={item.alert ? 'text-[#A3E635] font-semibold' : 'text-[#D4D4D8]'}>
                {item.co}
              </span>
              <span className="text-[#3F3F46]">{item.page}</span>
              {' → '}
              <span className={item.alert ? 'text-red-400' : 'text-[#71717A]'}>{item.msg}</span>
            </span>
          </div>
        ))}
        {visible < FEED_ITEMS.length && (
          <span className="text-[#A3E635] animate-pulse text-sm">▊</span>
        )}
      </div>
    </div>
  );
}

/* ── Scrolling logos ── */
const LOGOS = ['Contentsquare', 'Doctolib', 'Mirakl', 'Ledger', 'Payfit', 'Spendesk', 'Alan', 'Pennylane', 'Qonto', 'Swile'];

/* ── FAQ ── */
const FAQS = [
  {
    q: 'Comment fonctionne la détection de changements ?',
    a: "Kronyx visite vos pages surveillées à intervalles réguliers via un moteur Playwright headless. Chaque snapshot est comparé par empreinte cryptographique — le moindre changement déclenche une alerte immédiate.",
  },
  {
    q: "Mes concurrents sauront-ils qu'ils sont surveillés ?",
    a: "Non. Kronyx utilise des navigateurs headless standard, respecte les robots.txt et reste totalement invisible pour vos concurrents.",
  },
  {
    q: 'Combien de temps pour les premiers résultats ?',
    a: "Premier scraping dans les 2h après ajout. Changements visibles dans le dashboard en temps réel, rapport email dès le lendemain matin.",
  },
  {
    q: "L'offre Starter est-elle vraiment gratuite ?",
    a: "Oui, sans carte bancaire. 3 concurrents, 10 pages, à vie. Upgrade en un clic depuis votre compte.",
  },
  {
    q: "Puis-je surveiller n'importe quel type de page ?",
    a: "Tarifs, produits, blogs, carrières, changelogs, landing pages promo — tout ce qui est accessible publiquement.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#27272A] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
      >
        <span className="text-[#FAFAF9] text-sm sm:text-base font-medium group-hover:text-[#A3E635] transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180 text-[#A3E635]' : 'text-[#52525B]'
          }`}
        />
      </button>
      {open && <p className="text-[#71717A] text-sm pb-5 leading-relaxed">{a}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export function Landing() {
  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAF9] overflow-x-hidden">
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track { animation: marquee 24s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-30 border-b border-[#27272A]/60 bg-[#09090B]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#A3E635] flex items-center justify-center">
              <span className="text-black font-black text-xs">K</span>
            </div>
            <span className="font-bold text-sm tracking-widest uppercase text-[#FAFAF9]">Kronyx</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-bold text-[#52525B] uppercase tracking-widest">
            <a href="#features" className="hover:text-[#A3E635] transition-colors">Fonctionnalités</a>
            <a href="#how" className="hover:text-[#A3E635] transition-colors">Process</a>
            <a href="#pricing" className="hover:text-[#A3E635] transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-[#A3E635] transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block text-[10px] font-bold text-[#52525B] hover:text-white transition-colors uppercase tracking-widest">
              Connexion
            </Link>
            <Link
              to="/register"
              className="text-[10px] font-black bg-[#A3E635] hover:bg-[#BEF264] text-black px-4 py-2 rounded transition-colors uppercase tracking-widest"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 border border-[#A3E635]/25 bg-[#A3E635]/5 rounded-full px-3 py-1 text-[10px] font-bold text-[#A3E635] uppercase tracking-widest mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635] animate-pulse" />
              Veille concurrentielle autonome
            </div>

            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black leading-[0.92] tracking-tighter mb-6">
              Vos concurrents<br />
              <span className="text-[#A3E635]">bougent.</span><br />
              Vous le savez.
            </h1>

            <p className="text-[#71717A] text-lg leading-relaxed mb-10 max-w-md">
              Kronyx surveille automatiquement les sites de vos concurrents et vous alerte dès qu'un changement est détecté — prix, produit, contenu.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-[#A3E635] hover:bg-[#BEF264] text-black font-black px-6 py-3.5 rounded transition-colors uppercase tracking-wider text-sm"
              >
                Commencer gratuitement
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 border border-[#27272A] hover:border-[#52525B] text-[#71717A] hover:text-white px-6 py-3.5 rounded transition-colors text-sm"
              >
                Se connecter
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-[#1C1C1E] grid grid-cols-3 gap-6">
              {[
                { val: '500+', label: 'entreprises' },
                { val: '< 2h', label: 'délai détection' },
                { val: '99.8%', label: 'disponibilité' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-[#FAFAF9] tabular-nums">{s.val}</div>
                  <div className="text-[9px] text-[#52525B] uppercase tracking-widest mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Animated terminal */}
          <div className="relative">
            <div className="absolute -inset-6 bg-[#A3E635]/3 rounded-3xl blur-2xl" />
            <div className="relative">
              <TerminalFeed />
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="border-y border-[#1C1C1E] py-4 overflow-hidden">
        <div className="flex">
          <div className="marquee-track flex items-center gap-14 whitespace-nowrap">
            {[...LOGOS, ...LOGOS].map((name, i) => (
              <span
                key={i}
                className="text-[#2A2A2E] font-semibold text-sm tracking-widest uppercase px-2"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES BENTO ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-[10px] font-bold text-[#A3E635] uppercase tracking-widest mb-3">Fonctionnalités</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none">
              Tout ce qu'il faut<br />
              <span className="text-[#3F3F46]">pour ne jamais être surpris.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large: Scraping */}
            <div className="md:col-span-2 bg-[#111113] border border-[#27272A] rounded-xl p-8 hover:border-[#A3E635]/20 transition-colors group">
              <div className="w-10 h-10 bg-[#A3E635]/8 border border-[#A3E635]/15 rounded-lg flex items-center justify-center mb-5">
                <span className="text-[#A3E635] font-mono font-black text-xs">01</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Scraping automatique 24h/24</h3>
              <p className="text-[#71717A] text-sm leading-relaxed mb-6">
                Moteur Playwright headless qui visite et compare chaque page cible à intervalles réguliers. Détection par empreinte cryptographique — zéro faux positif, zéro intervention manuelle.
              </p>
              <div className="bg-[#0D0D0F] border border-[#1C1C1E] rounded-lg p-3 font-mono text-[11px] text-[#52525B]">
                <span className="text-[#A3E635]">✓</span>{' '}
                HubSpot/pricing — diff détectée ·{' '}
                <span className="text-red-400">impact: HIGH</span>{' '}
                · il y a 4 min
              </div>
            </div>

            {/* Small: Alertes */}
            <div className="bg-[#111113] border border-[#27272A] rounded-xl p-7 hover:border-[#A3E635]/20 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-red-950/60 border border-red-900/20 rounded-lg flex items-center justify-center mb-5">
                  <span className="text-red-400 text-lg">⚡</span>
                </div>
                <h3 className="text-lg font-bold mb-2">Alertes instantanées</h3>
                <p className="text-[#71717A] text-sm leading-relaxed">
                  Notification immédiate dès qu'un changement critique est détecté. Réagissez avant vos concurrents.
                </p>
              </div>
            </div>

            {/* Small: IA */}
            <div className="bg-[#111113] border border-[#27272A] rounded-xl p-7 hover:border-[#A3E635]/20 transition-colors">
              <div className="w-10 h-10 bg-violet-950/60 border border-violet-900/20 rounded-lg flex items-center justify-center mb-5">
                <span className="text-violet-400 text-lg">◈</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Analyse IA DeepSeek</h3>
              <p className="text-[#71717A] text-sm leading-relaxed">
                Chaque changement catégorisé, résumé et assorti d'une recommandation stratégique actionnable.
              </p>
            </div>

            {/* Large: Rapport */}
            <div className="md:col-span-2 bg-[#111113] border border-[#27272A] rounded-xl p-8 hover:border-[#A3E635]/20 transition-colors">
              <div className="w-10 h-10 bg-blue-950/60 border border-blue-900/20 rounded-lg flex items-center justify-center mb-5">
                <span className="text-blue-400 text-lg">◎</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Rapport quotidien dans votre boîte mail</h3>
              <p className="text-[#71717A] text-sm leading-relaxed mb-6">
                Chaque matin, tous les changements de la nuit classés par niveau d'impact. L'équivalent de 2h de veille manuelle, en 2 minutes de lecture.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Tarifs', 'Produit', 'Contenu', 'Design', 'Recrutement'].map((tag) => (
                  <span
                    key={tag}
                    className="border border-[#27272A] text-[#3F3F46] text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-24 px-6 border-t border-[#1C1C1E]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-[10px] font-bold text-[#A3E635] uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none">
              Opérationnel<br />
              <span className="text-[#3F3F46]">en 5 minutes.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-[#1C1C1E]">
            {[
              {
                n: '—01',
                label: 'Ajoutez vos concurrents',
                desc: "Entrez les URLs. Kronyx détecte les pages clés et commence la surveillance immédiatement.",
              },
              {
                n: '—02',
                label: 'Kronyx veille 24h/24',
                desc: "Scraping continu, comparaison cryptographique, analyse IA — sans intervention de votre part.",
              },
              {
                n: '—03',
                label: 'Recevez vos insights',
                desc: "Dashboard temps réel + rapport email matinal. Réagissez avant vos concurrents.",
              },
            ].map((s) => (
              <div key={s.n} className="bg-[#09090B] p-9">
                <p className="font-mono text-[#27272A] text-xs mb-6 font-bold">{s.n}</p>
                <h3 className="text-base font-bold mb-3 text-[#FAFAF9]">{s.label}</h3>
                <p className="text-[#71717A] text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-6 border-t border-[#1C1C1E]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-[10px] font-bold text-[#A3E635] uppercase tracking-widest mb-3">Témoignages</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter">Ce qu'ils en disent.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: 'Sophie Marchand',
                role: 'CMO · Spendesk',
                text: "On a détecté une baisse tarifaire d'un concurrent 4h après sa mise en ligne. Sans Kronyx on l'aurait su une semaine plus tard.",
                av: 'SM',
              },
              {
                name: 'Thomas Girard',
                role: 'Head of Growth · Pennylane',
                text: "Le rapport du matin est devenu une lecture incontournable dans notre équipe. Dense, pertinent, ça remplace 2h de veille manuelle.",
                av: 'TG',
              },
              {
                name: 'Amina Benali',
                role: 'Product Lead · Qonto',
                text: "On surveille 15 concurrents en Europe. Kronyx nous a alertés d'un lancement produit avant le communiqué de presse officiel.",
                av: 'AB',
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-[#111113] border border-[#27272A] rounded-xl p-7 flex flex-col gap-6 hover:border-[#A3E635]/20 transition-colors"
              >
                <p className="text-[#A1A1AA] text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 border-t border-[#1C1C1E] pt-5">
                  <div className="w-9 h-9 rounded bg-[#A3E635]/8 border border-[#A3E635]/15 flex items-center justify-center text-xs font-black text-[#A3E635]">
                    {t.av}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#FAFAF9]">{t.name}</p>
                    <p className="text-[9px] text-[#52525B] uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-6 border-t border-[#1C1C1E]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <p className="text-[10px] font-bold text-[#A3E635] uppercase tracking-widest mb-3">Tarifs</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none">
              Simple.<br />
              <span className="text-[#3F3F46]">Transparent.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {/* Starter */}
            <div className="border border-[#27272A] rounded-xl p-8 flex flex-col">
              <p className="text-[9px] font-black text-[#52525B] uppercase tracking-widest mb-5">Starter</p>
              <div className="mb-1">
                <span className="text-4xl font-black">Gratuit</span>
              </div>
              <p className="text-[#52525B] text-xs mb-8 uppercase tracking-wider">Pour évaluer</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['3 concurrents', '10 pages', 'Rapports hebdomadaires', 'Support email'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#71717A]">
                    <Check className="h-3.5 w-3.5 text-[#A3E635] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="text-center text-[10px] font-black border border-[#27272A] hover:border-[#52525B] hover:text-white text-[#52525B] py-3 rounded transition-all uppercase tracking-widest"
              >
                Commencer
              </Link>
            </div>

            {/* Pro */}
            <div className="border border-[#A3E635]/35 bg-[#A3E635]/4 rounded-xl p-8 flex flex-col relative">
              <div className="absolute -top-3 left-7 bg-[#A3E635] text-black text-[9px] font-black px-3 py-1 rounded uppercase tracking-widest">
                Populaire
              </div>
              <p className="text-[9px] font-black text-[#A3E635] uppercase tracking-widest mb-5">Pro</p>
              <div className="mb-1">
                <span className="text-4xl font-black">49€</span>
                <span className="text-[#52525B] text-sm ml-1">/mois</span>
              </div>
              <p className="text-[#52525B] text-xs mb-8 uppercase tracking-wider">Pour les équipes sérieuses</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  '20 concurrents',
                  'Pages illimitées',
                  'Rapports quotidiens',
                  'Alertes temps réel',
                  'Analyse IA avancée',
                  'Support prioritaire',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#A1A1AA]">
                    <Check className="h-3.5 w-3.5 text-[#A3E635] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="text-center text-[10px] font-black bg-[#A3E635] hover:bg-[#BEF264] text-black py-3 rounded transition-all uppercase tracking-widest"
              >
                Démarrer en Pro
              </Link>
            </div>

            {/* Enterprise */}
            <div className="border border-[#27272A] rounded-xl p-8 flex flex-col">
              <p className="text-[9px] font-black text-[#52525B] uppercase tracking-widest mb-5">Enterprise</p>
              <div className="mb-1">
                <span className="text-4xl font-black">Sur mesure</span>
              </div>
              <p className="text-[#52525B] text-xs mb-8 uppercase tracking-wider">Pour les grandes orgas</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Concurrents illimités',
                  'Pages illimitées',
                  'Alertes temps réel',
                  'API dédiée',
                  'CSM dédié',
                  'SLA garanti',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#71717A]">
                    <Check className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:contact@kronyx.app"
                className="text-center text-[10px] font-black border border-[#27272A] hover:border-[#52525B] hover:text-white text-[#52525B] py-3 rounded transition-all uppercase tracking-widest"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-6 border-t border-[#1C1C1E]">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <p className="text-[10px] font-bold text-[#A3E635] uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-4xl font-black tracking-tighter">Questions fréquentes.</h2>
          </div>
          <div className="border-t border-[#27272A]">
            {FAQS.map((f) => (
              <FaqItem key={f.q} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 border-t border-[#1C1C1E]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
          <div>
            <p className="text-[10px] font-bold text-[#A3E635] uppercase tracking-widest mb-3">Prêt ?</p>
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.92]">
              Prenez l'avantage<br />
              <span className="text-[#3F3F46]">dès aujourd'hui.</span>
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-[#A3E635] hover:bg-[#BEF264] text-black font-black px-8 py-4 rounded transition-colors uppercase tracking-wider text-sm"
            >
              Commencer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-[9px] text-[#3F3F46] uppercase tracking-widest">Aucune carte · Starter gratuit à vie</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#1C1C1E] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-[#A3E635] flex items-center justify-center">
              <span className="text-black font-black text-[10px]">K</span>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-[#FAFAF9]">Kronyx</span>
          </div>
          <p className="text-[9px] text-[#27272A] uppercase tracking-widest">© 2026 Kronyx. Tous droits réservés.</p>
          <div className="flex gap-6">
            {[
              { label: 'Connexion', href: '/login' },
              { label: 'Inscription', href: '/register' },
              { label: 'Contact', href: 'mailto:contact@kronyx.app' },
            ].map((l) =>
              l.href.startsWith('/') ? (
                <Link
                  key={l.label}
                  to={l.href}
                  className="text-[9px] text-[#3F3F46] hover:text-[#A3E635] transition-colors uppercase tracking-widest font-bold"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-[9px] text-[#3F3F46] hover:text-[#A3E635] transition-colors uppercase tracking-widest font-bold"
                >
                  {l.label}
                </a>
              )
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
