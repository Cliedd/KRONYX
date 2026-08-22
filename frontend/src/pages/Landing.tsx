import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Bell, Bot, Check, Zap, Building2, Star } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      {/* Navbar */}
      <nav className="border-b border-white/5 px-6 py-4 sticky top-0 bg-[#0A1628]/80 backdrop-blur-sm z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="text-blue-500">KRO</span>
              <span className="text-white">NYX</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-blue-200/60 hover:text-white transition-colors px-4 py-2"
            >
              Se connecter
            </Link>
            <Link
              to="/register"
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 py-28 text-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-800/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-800/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-8">
            <Zap className="h-3.5 w-3.5" />
            Veille concurrentielle propulsée par l'IA
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6 tracking-tight">
            Surveillez vos concurrents.
            <br />
            <span className="text-blue-500">Gardez une longueur d'avance.</span>
          </h1>
          <p className="text-xl text-blue-200/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            Kronyx scrape et analyse automatiquement les sites de vos concurrents. Recevez des alertes instantanées et des rapports IA chaque matin.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-base"
            >
              Commencer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-blue-200/70 hover:text-white px-7 py-3.5 rounded-xl border border-white/10 hover:border-white/25 transition-colors text-base"
            >
              Se connecter
            </Link>
          </div>
          <p className="text-xs text-blue-200/30 mt-5">Gratuit pour démarrer · Aucune carte bancaire requise</p>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Tout pour ne jamais rater une opportunité</h2>
            <p className="text-blue-200/50 text-base max-w-xl mx-auto">
              De la surveillance automatique à l'analyse stratégique, Kronyx fait le travail à votre place.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <BarChart3 className="h-6 w-6 text-blue-400" />,
                title: 'Scraping automatique',
                desc: 'Pages produits, tarifs, blog — Kronyx surveille chaque recoin des sites de vos concurrents 24h/24, 7j/7 sans intervention humaine.',
                color: 'bg-blue-600/10',
              },
              {
                icon: <Bell className="h-6 w-6 text-indigo-400" />,
                title: 'Alertes en temps réel',
                desc: "Recevez une notification dès qu'un changement critique est détecté. Réagissez avant vos concurrents, toujours.",
                color: 'bg-indigo-600/10',
              },
              {
                icon: <Bot className="h-6 w-6 text-violet-400" />,
                title: 'Analyse IA',
                desc: "Notre IA résume chaque changement, évalue son niveau d'impact et formule des recommandations stratégiques actionnables.",
                color: 'bg-violet-600/10',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:border-white/20 transition-colors"
              >
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-5`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-blue-200/55 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Tarifs simples et transparents</h2>
            <p className="text-blue-200/50 text-base">Commencez gratuitement, évoluez selon vos besoins.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-7 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="font-semibold text-white">Starter</span>
              </div>
              <div className="mt-3 mb-1">
                <span className="text-4xl font-bold text-white">Gratuit</span>
              </div>
              <p className="text-xs text-blue-200/40 mb-7">Pour démarrer sereinement</p>
              <ul className="space-y-3 mb-8 flex-1">
                {['3 concurrents', '10 pages surveillées', 'Rapports hebdomadaires', 'Support email'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-blue-200/70">
                    <Check className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="text-center text-sm border border-white/20 hover:border-white/40 hover:bg-white/5 text-white py-3 rounded-xl transition-colors font-medium"
              >
                Commencer gratuitement
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-blue-600/10 border border-blue-500/40 rounded-2xl p-7 flex flex-col relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                Le plus populaire
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-blue-400" />
                <span className="font-semibold text-white">Pro</span>
              </div>
              <div className="mt-3 mb-1">
                <span className="text-4xl font-bold text-white">49€</span>
                <span className="text-base font-normal text-blue-200/50 ml-1">/mois</span>
              </div>
              <p className="text-xs text-blue-200/40 mb-7">Pour les équipes sérieuses</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  '20 concurrents',
                  'Pages illimitées',
                  'Rapports quotidiens',
                  'Alertes en temps réel',
                  'Support prioritaire',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-blue-200/70">
                    <Check className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="text-center text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Démarrer en Pro
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-7 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-purple-400" />
                <span className="font-semibold text-white">Enterprise</span>
              </div>
              <div className="mt-3 mb-1">
                <span className="text-4xl font-bold text-white">Sur mesure</span>
              </div>
              <p className="text-xs text-blue-200/40 mb-7">Pour les grandes organisations</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Concurrents illimités',
                  'Pages illimitées',
                  'Rapports temps réel',
                  'API dédiée',
                  'CSM dédié',
                  'SLA garanti',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-blue-200/70">
                    <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:contact@kronyx.app"
                className="text-center text-sm border border-white/20 hover:border-white/40 hover:bg-white/5 text-white py-3 rounded-xl transition-colors font-medium"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à prendre l'avantage ?</h2>
          <p className="text-blue-200/50 mb-8">
            Rejoignez les équipes qui utilisent Kronyx pour rester toujours un coup d'avance.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
          >
            Commencer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">K</span>
            </div>
            <span className="text-sm font-bold">
              <span className="text-blue-500">KRO</span>
              <span className="text-white">NYX</span>
            </span>
          </div>
          <p className="text-xs text-blue-200/30">© 2026 Kronyx. Tous droits réservés.</p>
          <div className="flex gap-5">
            <Link to="/login" className="text-xs text-blue-200/40 hover:text-white transition-colors">
              Connexion
            </Link>
            <Link to="/register" className="text-xs text-blue-200/40 hover:text-white transition-colors">
              Inscription
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
