import { Link } from 'react-router-dom';
import {
  ArrowRight, BarChart3, Bell, Bot, Check, Zap, Building2, Star,
  ChevronDown, TrendingUp, Shield, Clock, Users,
} from 'lucide-react';
import { useState } from 'react';

/* ── FAQ data ──────────────────────────────────────────────────── */
const FAQS = [
  {
    q: 'Comment fonctionne le scraping automatique ?',
    a: "Kronyx visite les pages de vos concurrents à intervalles réguliers via un moteur Playwright headless. Chaque visite est comparée à la précédente par empreinte cryptographique — si un changement est détecté, notre IA l'analyse et vous envoie un rapport.",
  },
  {
    q: 'Mes concurrents sauront-ils que je les surveille ?',
    a: "Non. Kronyx respecte les robots.txt et utilise des navigateurs headless standard, indiscernables d'un visiteur humain. Votre veille reste totalement invisible.",
  },
  {
    q: 'Combien de temps avant de voir les premiers résultats ?',
    a: "Le premier scraping démarre dans les 2 heures après l'ajout d'une page. Les changements détectés apparaissent immédiatement dans votre dashboard et dans le rapport email du lendemain matin.",
  },
  {
    q: 'Puis-je surveiller n\'importe quel type de page ?',
    a: "Oui : pages de tarifs, pages produit, blogs, pages carrières, changelog, landing pages promotionnelles — tout ce qui est accessible publiquement sur le web.",
  },
  {
    q: "L'offre Starter est-elle vraiment gratuite ?",
    a: "Oui, sans carte bancaire. Vous pouvez surveiller 3 concurrents et 10 pages indéfiniment. Le passage au plan Pro se fait en un clic depuis votre espace compte.",
  },
];

/* ── Testimonials ──────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: 'Sophie Marchand',
    role: 'CMO · Spendesk',
    avatar: 'SM',
    text: "On a détecté une baisse tarifaire d'un concurrent 4 heures après sa mise en ligne. Sans Kronyx on l'aurait su une semaine plus tard.",
  },
  {
    name: 'Thomas Girard',
    role: 'Head of Growth · Pennylane',
    avatar: 'TG',
    text: "Le rapport IA du matin est devenu une lecture incontournable dans notre équipe. C'est dense, pertinent, et ça remplace 2h de veille manuelle.",
  },
  {
    name: 'Amina Benali',
    role: 'Product Lead · Qonto',
    avatar: 'AB',
    text: "On surveille 15 concurrents en Europe. Kronyx nous a alertés d'un lancement produit avant même le communiqué de presse officiel.",
  },
];

/* ── Steps ──────────────────────────────────────────────────────── */
const STEPS = [
  { num: '01', title: 'Ajoutez vos concurrents', desc: "Entrez le nom et l'URL. Kronyx détecte automatiquement les pages clés à surveiller." },
  { num: '02', title: 'Kronyx surveille 24h/24', desc: "Notre moteur scrape, compare et analyse chaque changement en continu, sans intervention de votre part." },
  { num: '03', title: 'Recevez vos insights', desc: "Chaque matin, un rapport IA dans votre boîte mail. Alertes instantanées pour les changements critiques." },
];

/* ── FAQ Item ────────────────────────────────────────────────────── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="text-white font-medium text-sm sm:text-base">{q}</span>
        <ChevronDown
          className={`h-4 w-4 text-blue-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="text-blue-200/60 text-sm pb-5 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export function Landing() {
  return (
    <div className="min-h-screen bg-[#060E1C] text-white overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-20 border-b border-white/5 bg-[#060E1C]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="text-blue-500">KRO</span><span className="text-white">NYX</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-blue-200/50">
            <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#how" className="hover:text-white transition-colors">Comment ça marche</a>
            <a href="#pricing" className="hover:text-white transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block text-sm text-blue-200/60 hover:text-white transition-colors px-3 py-1.5">
              Connexion
            </Link>
            <Link to="/register" className="text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-600/20">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative px-6 pt-24 pb-16 overflow-hidden">
        {/* BG glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/8 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-700/10 rounded-full blur-3xl" />
          <div className="absolute top-10 right-1/4 w-56 h-56 bg-blue-400/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-xs font-medium text-blue-400 mb-8 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Surveillance concurrentielle propulsée par l'IA
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-6">
            Vos concurrents bougent.
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Kronyx vous prévient.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-blue-200/55 mb-10 max-w-2xl mx-auto leading-relaxed">
            Surveillance automatique des sites concurrents, alertes en temps réel et rapports IA chaque matin — sans aucune intervention manuelle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-xl shadow-blue-600/25 hover:shadow-blue-500/30 text-base"
            >
              Commencer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-blue-200/60 hover:text-white px-7 py-3.5 rounded-xl border border-white/10 hover:border-white/20 transition-all text-base"
            >
              Se connecter
            </Link>
          </div>

          {/* Dashboard mockup */}
          <div className="relative mx-auto max-w-4xl">
            {/* Glow behind mockup */}
            <div className="absolute inset-0 bg-blue-600/10 blur-3xl rounded-3xl scale-95" />
            <div className="relative bg-[#0D1B35] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
              {/* Window bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/2">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <div className="flex-1 mx-4 bg-white/5 rounded-md h-5 flex items-center px-3">
                  <span className="text-[10px] text-white/30">app.kronyx.io/dashboard</span>
                </div>
              </div>

              {/* Mock dashboard */}
              <div className="flex h-64 sm:h-80">
                {/* Sidebar */}
                <div className="hidden sm:flex flex-col w-48 border-r border-white/5 p-3 gap-1 shrink-0">
                  <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
                    <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-white">K</span>
                    </div>
                    <span className="text-xs font-bold text-white/80">KRONYX</span>
                  </div>
                  {['Dashboard', 'Concurrents', 'Historique', 'Rapports'].map((item, i) => (
                    <div key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${i === 0 ? 'bg-blue-600/20 text-blue-400' : 'text-white/30'}`}>
                      <div className="w-3 h-3 rounded-sm bg-current opacity-50" />
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 p-4 overflow-hidden">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: 'Concurrents', val: '5', color: 'text-blue-400' },
                      { label: 'Changements', val: '23', color: 'text-emerald-400' },
                      { label: 'Pages actives', val: '41', color: 'text-violet-400' },
                    ].map((s) => (
                      <div key={s.label} className="bg-white/5 rounded-lg p-2.5 border border-white/5">
                        <div className={`text-lg font-bold ${s.color}`}>{s.val}</div>
                        <div className="text-[10px] text-white/30 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Changes list */}
                  <div className="space-y-1.5">
                    {[
                      { name: 'HubSpot', page: 'Pricing', impact: 'high', time: '2h' },
                      { name: 'Salesforce', page: 'Features', impact: 'medium', time: '5h' },
                      { name: 'Notion', page: 'Blog', impact: 'low', time: '8h' },
                      { name: 'Pipedrive', page: 'Pricing', impact: 'high', time: '12h' },
                    ].map((c) => (
                      <div key={c.name + c.time} className="flex items-center gap-2 bg-white/3 rounded-lg px-3 py-2 border border-white/5">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.impact === 'high' ? 'bg-red-400' : c.impact === 'medium' ? 'bg-yellow-400' : 'bg-emerald-400'}`} />
                        <span className="text-xs text-white/70 font-medium">{c.name}</span>
                        <span className="text-[10px] text-white/30">·</span>
                        <span className="text-[10px] text-white/40">{c.page}</span>
                        <div className="ml-auto text-[10px] text-white/25">{c.time} ago</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[
            { val: '500+', label: 'Entreprises actives', icon: <Users className="h-4 w-4" /> },
            { val: '2M+', label: 'Pages analysées', icon: <BarChart3 className="h-4 w-4" /> },
            { val: '< 2h', label: 'Délai de détection', icon: <Clock className="h-4 w-4" /> },
            { val: '99.8%', label: 'Disponibilité', icon: <Shield className="h-4 w-4" /> },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-blue-400 mb-1">
                {s.icon}
              </div>
              <div className="text-3xl font-bold text-white mb-1">{s.val}</div>
              <div className="text-xs text-blue-200/40">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LOGOS ── */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-blue-200/30 mb-8">Ils utilisent Kronyx pour rester compétitifs</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {['Contentsquare', 'Doctolib', 'Mirakl', 'Ledger', 'Payfit', 'Spendesk'].map((name) => (
              <span key={name} className="text-base font-semibold text-white/15 hover:text-white/30 transition-colors tracking-tight">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Tout ce qu'il faut pour ne jamais être surpris</h2>
            <p className="text-blue-200/50 max-w-xl mx-auto">De la surveillance automatique à l'analyse stratégique, Kronyx fait le travail à votre place.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <BarChart3 className="h-5 w-5 text-blue-400" />,
                bg: 'bg-blue-500/10 border-blue-500/20',
                title: 'Scraping automatique',
                desc: 'Pages produits, tarifs, blog — surveillés 24h/24 par un moteur Playwright headless sans intervention.',
              },
              {
                icon: <Bell className="h-5 w-5 text-indigo-400" />,
                bg: 'bg-indigo-500/10 border-indigo-500/20',
                title: 'Alertes instantanées',
                desc: "Notification immédiate dès qu'un changement critique est détecté. Réagissez avant vos concurrents.",
              },
              {
                icon: <Bot className="h-5 w-5 text-violet-400" />,
                bg: 'bg-violet-500/10 border-violet-500/20',
                title: 'Analyse IA DeepSeek',
                desc: 'Chaque changement est résumé, catégorisé et assorti d'une recommandation stratégique actionnable.',
              },
              {
                icon: <TrendingUp className="h-5 w-5 text-emerald-400" />,
                bg: 'bg-emerald-500/10 border-emerald-500/20',
                title: 'Rapports quotidiens',
                desc: 'Un email chaque matin avec tous les changements de la veille, classés par niveau d'impact.',
              },
              {
                icon: <Shield className="h-5 w-5 text-cyan-400" />,
                bg: 'bg-cyan-500/10 border-cyan-500/20',
                title: 'Respect du robots.txt',
                desc: 'Kronyx respecte les règles de crawl. Votre veille est éthique et invisible pour vos concurrents.',
              },
              {
                icon: <Zap className="h-5 w-5 text-yellow-400" />,
                bg: 'bg-yellow-500/10 border-yellow-500/20',
                title: 'Dashboard temps réel',
                desc: "Interface claire pour explorer l'historique des changements, filtrer par concurrent ou par impact.",
              },
            ].map((f) => (
              <div key={f.title} className={`bg-white/3 border ${f.bg} rounded-2xl p-6 hover:bg-white/5 transition-colors`}>
                <div className={`w-10 h-10 rounded-xl border ${f.bg} flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-blue-200/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">En route en 3 étapes</h2>
            <p className="text-blue-200/50">Opérationnel en moins de 5 minutes.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.num} className="relative text-center">
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-7 left-[60%] w-full h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
                )}
                <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-500">{s.num}</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-blue-200/50 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ce qu'en disent nos clients</h2>
            <p className="text-blue-200/50">Des équipes qui ont transformé leur veille concurrentielle.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white/3 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-blue-200/70 leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-blue-200/40">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Tarifs transparents</h2>
            <p className="text-blue-200/50">Commencez gratuitement · Aucune carte bancaire requise</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="bg-white/3 border border-white/10 rounded-2xl p-7 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="font-semibold text-white">Starter</span>
              </div>
              <div className="mb-1"><span className="text-4xl font-bold">Gratuit</span></div>
              <p className="text-xs text-blue-200/40 mb-7">Pour démarrer</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['3 concurrents', '10 pages', 'Rapports hebdomadaires', 'Support email'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-blue-200/65">
                    <Check className="h-3.5 w-3.5 text-blue-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="text-center text-sm border border-white/15 hover:border-white/30 hover:bg-white/5 text-white py-3 rounded-xl transition-all font-medium">
                Commencer gratuitement
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-b from-blue-600/15 to-blue-700/5 border border-blue-500/30 rounded-2xl p-7 flex flex-col relative shadow-xl shadow-blue-900/20">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-semibold px-4 py-1 rounded-full tracking-wide">
                LE PLUS POPULAIRE
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-blue-400" />
                <span className="font-semibold text-white">Pro</span>
              </div>
              <div className="mb-1">
                <span className="text-4xl font-bold">49€</span>
                <span className="text-base text-blue-200/40 ml-1">/mois</span>
              </div>
              <p className="text-xs text-blue-200/40 mb-7">Pour les équipes sérieuses</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['20 concurrents', 'Pages illimitées', 'Rapports quotidiens', 'Alertes en temps réel', 'Analyse IA avancée', 'Support prioritaire'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-blue-200/65">
                    <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="text-center text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                Démarrer en Pro
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white/3 border border-white/10 rounded-2xl p-7 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-purple-400" />
                <span className="font-semibold text-white">Enterprise</span>
              </div>
              <div className="mb-1"><span className="text-4xl font-bold">Sur mesure</span></div>
              <p className="text-xs text-blue-200/40 mb-7">Pour les grandes équipes</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['Concurrents illimités', 'Pages illimitées', 'Rapports temps réel', 'API dédiée', 'CSM dédié', 'SLA garanti'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-blue-200/65">
                    <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <a href="mailto:contact@kronyx.app" className="text-center text-sm border border-white/15 hover:border-white/30 hover:bg-white/5 text-white py-3 rounded-xl transition-all font-medium">
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Questions fréquentes</h2>
            <p className="text-blue-200/50">Tout ce que vous voulez savoir avant de vous lancer.</p>
          </div>
          <div className="bg-white/3 border border-white/8 rounded-2xl px-6">
            {FAQS.map((f) => <FaqItem key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/8 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Prêt à prendre l'avantage ?</h2>
          <p className="text-blue-200/50 mb-8 leading-relaxed">
            Rejoignez les équipes qui utilisent Kronyx pour réagir plus vite que leurs concurrents.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-xl shadow-blue-600/25 text-base"
          >
            Commencer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-blue-200/30 mt-4">Aucune carte bancaire · Gratuit à vie sur Starter</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">K</span>
              </div>
              <span className="text-sm font-bold">
                <span className="text-blue-500">KRO</span><span className="text-white">NYX</span>
              </span>
            </div>
            <p className="text-xs text-blue-200/25">© 2026 Kronyx. Tous droits réservés.</p>
            <div className="flex gap-6">
              <Link to="/login" className="text-xs text-blue-200/35 hover:text-white transition-colors">Connexion</Link>
              <Link to="/register" className="text-xs text-blue-200/35 hover:text-white transition-colors">Inscription</Link>
              <a href="mailto:contact@kronyx.app" className="text-xs text-blue-200/35 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
