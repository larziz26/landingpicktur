import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Camera, Zap, Star, ArrowRight, Check, ChevronDown,
  Globe, Play, ScanFace, BookOpen, Sparkles, Award, Heart,
  TrendingUp, Gift
} from "lucide-react";

// ─── Types & i18n ─────────────────────────────────────────────────────────────
type Lang = "fr" | "en";

const copy = {
  fr: {
    nav: { features: "Fonctionnalités", pricing: "Tarifs", faq: "FAQ", login: "Connexion", cta: "Essai gratuit" },
    hero: {
      badge: "Spécialement conçu pour les photographes de mariage",
      h1a: "La plateforme qui",
      h1b: "révèle chaque mariage.",
      sub: "Tri IA, galeries premium, reconnaissance faciale, albums physiques — tout ce dont vos clients ont besoin, dans un seul endroit.",
      cta1: "Commencer gratuitement",
      cta2: "Voir la démo",
      proof: "+200 photographes l'utilisent déjà",
      videoLabel: "Démo en 90 secondes",
    },
    stats: [
      { value: "8h", label: "économisées par mariage en moyenne" },
      { value: "94%", label: "de satisfaction client" },
      { value: "2 min", label: "pour livrer une galerie" },
      { value: "0 effort", label: "de tri manuel" },
    ],
    aiSection: {
      badge: "Tri IA intelligent",
      h2: "Vos 4 847 photos triées pendant que vous dormez.",
      sub: "Notre moteur Gemini analyse chaque photo sur 26 critères — netteté, expression, composition, lumière. Les meilleures remontent automatiquement.",
      pill1: "✨ Top shot — 94/100",
      pill2: "😑 Yeux fermés — 31/100",
      pill3: "🔴 Flou — 23/100",
      pill4: "🏆 Chef-d'œuvre — 98/100",
      cta: "Voir comment ça marche",
    },
    faceSection: {
      badge: "Reconnaissance faciale",
      h2: "Chaque invité retrouve ses photos. En un selfie.",
      sub: "Partagez le lien de la galerie. Vos clients font un selfie. Picktur identifie toutes leurs photos en quelques secondes. Magie.",
      faces: [
        { name: "Sophie", role: "Mariée", count: 127, color: "#E879A0", bg: "from-pink-100 to-rose-50" },
        { name: "Thomas", role: "Marié", count: 98, color: "#6366F1", bg: "from-indigo-100 to-blue-50" },
        { name: "Marie", role: "Témoin", count: 43, color: "#8B5CF6", bg: "from-violet-100 to-purple-50" },
        { name: "Pierre", role: "Famille", count: 31, color: "#10B981", bg: "from-emerald-100 to-teal-50" },
        { name: "Léa", role: "Amie", count: 28, color: "#F59E0B", bg: "from-amber-100 to-yellow-50" },
        { name: "Jules", role: "Famille", count: 22, color: "#06B6D4", bg: "from-cyan-100 to-blue-50" },
      ],
      cta: "Essayer la démo",
    },
    gallerySection: {
      badge: "Galeries premium",
      h2: "Des galeries à couper le souffle. À votre image.",
      sub: "Vos couleurs, votre logo, vos liens personnalisés. Une expérience que vos clients n'oublieront pas.",
      features: ["Lien personnalisé picktur.fr/votre-nom", "Téléchargement HD en un clic", "Protection par mot de passe", "Navigation intuitive"],
    },
    albumSection: {
      badge: "Album physique",
      h2: "Du numérique à l'album. En quelques clics.",
      sub: "Sélectionnez les photos, organisez les spreads, exportez vers votre imprimeur. Votre client reçoit un souvenir éternel.",
      steps: ["Sélectionnez vos meilleures photos", "Arrangez les spreads par glisser-déposer", "Exportez et commandez"],
    },
    coupleSection: {
      badge: "Pour les mariés",
      h2: "Votre photographe n'est pas encore sur Picktur ?",
      sub: "Pas de problème. Offrez-lui la plateforme pour votre grand jour — un paiement unique, pas d'abonnement.",
      cards: [
        { icon: "gift", title: "Galerie mariage", price: "499€", priceLabel: "paiement unique", desc: "Votre photographe accède à Picktur pour votre mariage. Galerie premium, tri IA, reconnaissance faciale pour tous vos invités. Valable 1 an.", tag: "Idéal pour les couples" },
        { icon: "trending", title: "Parrainez & gagnez", price: "10%", priceLabel: "de commission", desc: "Partagez votre lien à votre photographe. S'il prend un abonnement mensuel, vous touchez 10% pendant 12 mois — soit jusqu'à 58€ reversés.", tag: "Jusqu'à 58€" },
      ],
    },
    pricing: {
      badge: "Tarifs photographes",
      h2: "Un abonnement qui s'adapte à votre volume.",
      sub: "Choisissez selon votre stockage. Changez de plan à tout moment.",
      toggle: ["Mensuel", "Annuel"],
      save: "−2 mois offerts",
      plans: [
        {
          name: "Essentiel", storage: "120 Go",
          price: { m: "15€", y: "129€" }, period: { m: "/ mois", y: "/ an" },
          badge: null, highlight: false,
          desc: "Pour démarrer sereinement.",
          features: ["120 Go de stockage", "Mariages illimités", "Tri IA inclus", "Galeries partageables", "Reconnaissance faciale", "Lien personnalisé"],
          cta: "Démarrer",
        },
        {
          name: "Pro", storage: "360 Go",
          price: { m: "29€", y: "249€" }, period: { m: "/ mois", y: "/ an" },
          badge: "Le plus populaire", highlight: true,
          desc: "Le choix des photographes actifs.",
          features: ["360 Go de stockage", "Tout Essentiel +", "Sélection dynamique", "Album physique", "Support prioritaire", "Statistiques détaillées"],
          cta: "Commencer Pro",
        },
        {
          name: "Studio", storage: "720 Go",
          price: { m: "49€", y: "419€" }, period: { m: "/ mois", y: "/ an" },
          badge: null, highlight: false,
          desc: "Pour les photographes intensifs.",
          features: ["720 Go de stockage", "Tout Pro +", "Multi-utilisateurs", "API & webhooks", "Accompagnement dédié"],
          cta: "Démarrer Studio",
        },
      ],
      coupleOffer: {
        label: "Pour les couples",
        title: "Offrir à mon photographe",
        price: "499€",
        period: "pour un mariage · valable 1 an",
        desc: "Votre photographe n'est pas encore sur Picktur ? Offrez-lui la plateforme pour votre grand jour. Paiement unique, zéro abonnement.",
        features: ["1 galerie premium · valable 1 an", "Tri IA de toutes les photos", "Reconnaissance faciale pour tous les invités", "Téléchargements HD illimités", "Accès photographe inclus"],
        cta: "Offrir maintenant",
        note: "Paiement unique · Pas d'abonnement",
      },
      referral: {
        title: "Programme de parrainage",
        desc: "Recommandez Picktur à votre photographe. S'il prend un abonnement mensuel via votre lien, vous touchez 10% de sa cotisation pendant 12 mois.",
        commission: "10%",
        commissionLabel: "reversés chaque mois",
        max: "Jusqu'à 58€",
        period: "sur 12 mois",
        steps: ["Créez votre lien gratuit", "Partagez-le à votre photographe", "S'il s'abonne, vous êtes récompensé automatiquement"],
        cta: "Obtenir mon lien",
        widget: {
          placeholder: "Votre prénom ou pseudo…",
          btn: "Créer mon lien",
          success: "Lien prêt ! Copiez-le et envoyez-le à votre photographe.",
          copy: "Copier",
          copied: "Copié !",
          note: "Gratuit · Sans compte · Valable immédiatement",
        },
      },
    },
    faq: {
      h2: "Questions fréquentes",
      items: [
        { q: "Où sont stockées mes photos ?", a: "Picktur se connecte à votre serveur Immich (auto-hébergé ou hébergé). Vos photos restent sur votre infrastructure. Nous sommes juste l'interface intelligente par-dessus." },
        { q: "Est-ce que le tri IA est vraiment automatique ?", a: "Oui. Vous importez, vous lancez l'analyse, et l'IA score chaque photo sur 26 critères. Vous pouvez affiner la sélection, mais vous n'avez pas à le faire." },
        { q: "La reconnaissance faciale fonctionne comment ?", a: "Vos invités accèdent à la galerie et font un selfie. Picktur compare leur visage aux photos du mariage et affiche uniquement les leurs. Simple, rapide, magique." },
        { q: "Puis-je annuler mon abonnement ?", a: "Oui, à tout moment et sans engagement. Votre accès reste actif jusqu'à la fin de la période en cours." },
        { q: "Quelle est la différence entre l'offre couple et l'abonnement photographe ?", a: "L'abonnement photographe (15€–49€/mois) est fait pour les pros qui gèrent plusieurs mariages. L'offre couple (499€) est un paiement unique qui offre à votre photographe un accès Picktur pour votre mariage uniquement, valable 1 an." },
        { q: "Comment fonctionne le parrainage ?", a: "Vous obtenez un lien d'affiliation unique. Si votre photographe prend un abonnement mensuel via votre lien, vous touchez 10% de sa cotisation chaque mois pendant 12 mois — soit jusqu'à 58€." },
      ],
    },
    finalCta: {
      h2: "Prêt à transformer votre workflow ?",
      sub: "Rejoignez les photographes qui livrent plus vite, mieux, avec moins de stress.",
      cta: "Commencer gratuitement",
      sub2: "Essai 14 jours · Pas de CB requise",
    },
    footer: {
      tagline: "La plateforme des photographes de mariage modernes.",
      copyright: "© 2025 Picktur · picktur.fr",
    },
  },
  en: {
    nav: { features: "Features", pricing: "Pricing", faq: "FAQ", login: "Login", cta: "Start free" },
    hero: {
      badge: "Built for wedding photographers",
      h1a: "The platform that",
      h1b: "reveals every wedding.",
      sub: "AI culling, premium galleries, face recognition, physical albums — everything your clients need, in one place.",
      cta1: "Start for free",
      cta2: "Watch demo",
      proof: "200+ photographers already use it",
      videoLabel: "90-second demo",
    },
    stats: [
      { value: "8h", label: "saved per wedding on average" },
      { value: "94%", label: "client satisfaction" },
      { value: "2 min", label: "to deliver a gallery" },
      { value: "0 effort", label: "manual culling" },
    ],
    aiSection: {
      badge: "AI-powered culling",
      h2: "Your 4,847 photos sorted while you sleep.",
      sub: "Our Gemini engine analyzes every photo on 26 criteria — sharpness, expression, composition, light. The best ones surface automatically.",
      pill1: "✨ Top shot — 94/100",
      pill2: "😑 Eyes closed — 31/100",
      pill3: "🔴 Blurry — 23/100",
      pill4: "🏆 Masterpiece — 98/100",
      cta: "See how it works",
    },
    faceSection: {
      badge: "Face recognition",
      h2: "Every guest finds their photos. With one selfie.",
      sub: "Share the gallery link. Guests take a selfie. Picktur identifies all their photos in seconds. Magic.",
      faces: [
        { name: "Sophie", role: "Bride", count: 127, color: "#E879A0", bg: "from-pink-100 to-rose-50" },
        { name: "Thomas", role: "Groom", count: 98, color: "#6366F1", bg: "from-indigo-100 to-blue-50" },
        { name: "Marie", role: "Witness", count: 43, color: "#8B5CF6", bg: "from-violet-100 to-purple-50" },
        { name: "Pierre", role: "Family", count: 31, color: "#10B981", bg: "from-emerald-100 to-teal-50" },
        { name: "Lea", role: "Friend", count: 28, color: "#F59E0B", bg: "from-amber-100 to-yellow-50" },
        { name: "Jules", role: "Family", count: 22, color: "#06B6D4", bg: "from-cyan-100 to-blue-50" },
      ],
      cta: "Try the demo",
    },
    gallerySection: {
      badge: "Premium galleries",
      h2: "Breathtaking galleries. In your image.",
      sub: "Your colors, your logo, your custom links. An experience your clients won't forget.",
      features: ["Custom link picktur.fr/your-name", "One-click HD download", "Password protection", "Intuitive browsing"],
    },
    albumSection: {
      badge: "Physical album",
      h2: "From digital to album. In a few clicks.",
      sub: "Select photos, arrange spreads, export to your printer. Your client receives an eternal memory.",
      steps: ["Select your best photos", "Drag-and-drop spreads arrangement", "Export and order"],
    },
    coupleSection: {
      badge: "For couples",
      h2: "Your photographer not on Picktur yet?",
      sub: "No problem. Offer them the platform for your big day — one payment, no subscription.",
      cards: [
        { icon: "gift", title: "Wedding gallery", price: "€499", priceLabel: "one-time payment", desc: "Your photographer gets access to Picktur for your wedding. Premium gallery, AI culling, face recognition for all your guests. Valid 1 year.", tag: "Perfect for couples" },
        { icon: "trending", title: "Refer & earn", price: "10%", priceLabel: "commission", desc: "Share your link with your photographer. If they take a monthly plan, you earn 10% for 12 months — up to €58 back.", tag: "Up to €58" },
      ],
    },
    pricing: {
      badge: "Photographer plans",
      h2: "A subscription that fits your volume.",
      sub: "Choose by storage. Switch plans anytime.",
      toggle: ["Monthly", "Yearly"],
      save: "−2 months free",
      plans: [
        {
          name: "Essential", storage: "120 GB",
          price: { m: "€15", y: "€129" }, period: { m: "/ month", y: "/ year" },
          badge: null, highlight: false,
          desc: "Start without breaking the bank.",
          features: ["120 GB storage", "Unlimited weddings", "AI culling included", "Shareable galleries", "Face recognition", "Custom link"],
          cta: "Get started",
        },
        {
          name: "Pro", storage: "360 GB",
          price: { m: "€29", y: "€249" }, period: { m: "/ month", y: "/ year" },
          badge: "Most popular", highlight: true,
          desc: "The choice of active photographers.",
          features: ["360 GB storage", "Everything in Essential +", "Dynamic selection", "Physical album", "Priority support", "Detailed analytics"],
          cta: "Start Pro",
        },
        {
          name: "Studio", storage: "720 GB",
          price: { m: "€49", y: "€419" }, period: { m: "/ month", y: "/ year" },
          badge: null, highlight: false,
          desc: "For high-volume photographers.",
          features: ["720 GB storage", "Everything in Pro +", "Multi-user access", "API & webhooks", "Dedicated onboarding"],
          cta: "Start Studio",
        },
      ],
      coupleOffer: {
        label: "For couples",
        title: "Gift to my photographer",
        price: "€499",
        period: "for one wedding · valid 1 year",
        desc: "Your photographer not on Picktur yet? Offer them the platform for your big day. One-time payment, no subscription.",
        features: ["1 premium gallery · valid 1 year", "AI culling of all photos", "Face recognition for all guests", "Unlimited HD downloads", "Photographer access included"],
        cta: "Gift now",
        note: "One-time payment · No subscription",
      },
      referral: {
        title: "Referral program",
        desc: "Recommend Picktur to your photographer. If they take a monthly subscription through your link, you earn 10% of their plan for 12 months.",
        commission: "10%",
        commissionLabel: "back every month",
        max: "Up to €58",
        period: "over 12 months",
        steps: ["Create your free referral link", "Share it with your photographer", "When they subscribe, you earn automatically"],
        cta: "Get my link",
        widget: {
          placeholder: "Your first name or handle…",
          btn: "Create my link",
          success: "Link ready! Copy it and send it to your photographer.",
          copy: "Copy",
          copied: "Copied!",
          note: "Free · No account needed · Works immediately",
        },
      },
    },
    faq: {
      h2: "Frequently asked questions",
      items: [
        { q: "Where are my photos stored?", a: "Picktur connects to your Immich server (self-hosted or hosted). Your photos stay on your infrastructure. We're just the smart interface on top." },
        { q: "Is AI culling truly automatic?", a: "Yes. You import, start the analysis, and AI scores every photo on 26 criteria. You can refine the selection, but you don't have to." },
        { q: "How does face recognition work?", a: "Guests access the gallery and take a selfie. Picktur compares their face to the wedding photos and shows only theirs. Simple, fast, magical." },
        { q: "Can I cancel my subscription?", a: "Yes, anytime with no commitment. Your access remains active until the end of the current period." },
        { q: "What's the difference between the couple offer and a photographer subscription?", a: "The photographer subscription (€15–€49/month) is for pros managing multiple weddings. The couple offer (€499) is a one-time payment that gives your photographer Picktur access for your wedding only, valid 1 year." },
        { q: "How does the referral program work?", a: "You get a unique affiliate link. If your photographer takes a monthly subscription through your link, you earn 10% of their plan each month for 12 months — up to €58." },
      ],
    },
    finalCta: {
      h2: "Ready to transform your workflow?",
      sub: "Join photographers who deliver faster, better, with less stress.",
      cta: "Start for free",
      sub2: "14-day trial · No credit card required",
    },
    footer: {
      tagline: "The platform for modern wedding photographers.",
      copyright: "© 2025 Picktur · picktur.fr",
    },
  },
};


// ─── Referral Widget ──────────────────────────────────────────────────────────
function ReferralWidget({ labels }: { labels: { placeholder: string; btn: string; success: string; copy: string; copied: string; note: string } }) {
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<{ url: string; code: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setState("loading");
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);
      setState("done");
    } catch {
      setState("error");
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (state === "done" && result) {
    return (
      <div className="space-y-3">
        <div className="bg-white/70 rounded-xl border border-violet-200 p-3 flex items-center gap-2">
          <span className="text-xs text-stone-600 flex-1 truncate font-mono">{result.url}</span>
          <button
            onClick={handleCopy}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-all flex-shrink-0"
          >
            {copied ? labels.copied : labels.copy}
          </button>
        </div>
        <p className="text-xs text-violet-500 text-center">{labels.success}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setState("idle"); }}
          onKeyDown={e => e.key === "Enter" && handleCreate()}
          placeholder={labels.placeholder}
          className="flex-1 text-sm px-3 py-2.5 rounded-xl border border-violet-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-violet-300 placeholder:text-stone-300"
          maxLength={40}
        />
        <button
          onClick={handleCreate}
          disabled={state === "loading" || !name.trim()}
          className="text-sm font-semibold px-4 py-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition-all flex-shrink-0"
        >
          {state === "loading" ? "…" : labels.btn}
        </button>
      </div>
      {state === "error" && <p className="text-xs text-red-500">Une erreur s'est produite, réessayez.</p>}
      <p className="text-xs text-stone-400">{labels.note}</p>
    </div>
  );
}

function FaqItemFull({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-200">
      <button onClick={() => setOpen(!open)} className="w-full text-left py-5 flex justify-between items-center gap-4">
        <span className="font-medium text-stone-800 text-base">{q}</span>
        <ChevronDown className={`w-5 h-5 text-stone-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-stone-500 leading-relaxed text-sm">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── AI Scoring Demo ──────────────────────────────────────────────────────────
const SAMPLE_PHOTOS = [
  { score: 94, flag: "✨", label: "Top shot", good: true },
  { score: 31, flag: "😑", label: "Yeux fermés", good: false },
  { score: 87, flag: "💡", label: "Très bien", good: true },
  { score: 23, flag: "🔴", label: "Flou", good: false },
  { score: 98, flag: "🏆", label: "Chef-d'œuvre", good: true },
  { score: 76, flag: "🎯", label: "Bien", good: true },
  { score: 15, flag: "☀️", label: "Surexposé", good: false },
  { score: 91, flag: "✨", label: "Excellent", good: true },
  { score: 42, flag: "〰️", label: "Correct", good: false },
  { score: 88, flag: "😊", label: "Sourire parfait", good: true },
  { score: 55, flag: "📸", label: "Passable", good: false },
  { score: 95, flag: "💫", label: "Moment clé", good: true },
];

function AIScoringDemo() {
  const [scored, setScored] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || running) return;
    setRunning(true);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setScored(i);
      if (i >= SAMPLE_PHOTOS.length) clearInterval(interval);
    }, 180);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <div ref={ref} className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
      <div className="border-b border-stone-100 px-5 py-3 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 text-center text-xs text-stone-400 font-mono">
          Mariage Sophie & Thomas · Analyse IA en cours
        </div>
      </div>

      <div className="px-5 pt-4 pb-2">
        <div className="flex justify-between text-xs text-stone-500 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-violet-500" />
            {scored < SAMPLE_PHOTOS.length ? "Analyse en cours..." : "Analyse terminée ✓"}
          </span>
          <span className="font-mono text-violet-600">{scored * 404} / 4 847</span>
        </div>
        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-pink-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(scored / SAMPLE_PHOTOS.length) * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      <div className="p-4 grid grid-cols-4 gap-2">
        {SAMPLE_PHOTOS.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={scored > i ? { opacity: 1, scale: 1 } : { opacity: 0.2, scale: 0.85 }}
            transition={{ duration: 0.25 }}
            className={`relative rounded-xl overflow-hidden aspect-[3/4] border ${p.good ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-stone-50" : "border-red-100 bg-gradient-to-br from-red-50 to-stone-50"}`}
          >
            <div className="absolute inset-0 flex items-center justify-center text-2xl opacity-20">{p.flag}</div>
            {scored > i && (
              <motion.div
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="absolute bottom-0 inset-x-0 p-1.5 bg-white/80 backdrop-blur-sm"
              >
                <div className={`text-[10px] font-bold text-center ${p.good ? "text-emerald-700" : "text-red-500"}`}>
                  {p.score}/100
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {scored >= SAMPLE_PHOTOS.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-stone-100 px-5 py-3 grid grid-cols-3 gap-3 text-center"
        >
          {[
            { v: "847", l: "Sélectionnées", c: "text-emerald-600" },
            { v: "71", l: "Score moyen", c: "text-violet-600" },
            { v: "4 000", l: "Écartées", c: "text-stone-400" },
          ].map((s, i) => (
            <div key={i}>
              <div className={`font-bold text-base ${s.c}`}>{s.v}</div>
              <div className="text-[10px] text-stone-400">{s.l}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─── Face Recognition Demo ────────────────────────────────────────────────────
function FaceRecognitionDemo({ faces }: { faces: typeof copy.fr.faceSection.faces }) {
  const [active, setActive] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (i: number) => {
    if (active === i) { setActive(null); setRevealed(false); return; }
    setActive(i);
    setScanning(true);
    setRevealed(false);
    setTimeout(() => { setScanning(false); setRevealed(true); }, 1800);
  };

  const activeFace = active !== null ? faces[active] : null;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
      <div className="border-b border-stone-100 px-5 py-3 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        <div className="flex-1 text-center text-xs text-stone-400">
          <ScanFace className="inline w-3.5 h-3.5 mr-1" />
          Galerie Mariage Sophie & Thomas — Choisissez une personne
        </div>
      </div>

      <div className="px-4 pt-5 pb-4">
        <div className="flex gap-3 justify-center flex-wrap">
          {faces.map((f, i) => (
            <motion.button
              key={i}
              onClick={() => handleSelect(i)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${active === i ? "bg-stone-100 ring-2" : "hover:bg-stone-50"}`}
              style={active === i ? { outline: `2px solid ${f.color}`, outlineOffset: '2px' } : {}}
            >
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                  style={{ background: `linear-gradient(135deg, ${f.color}cc, ${f.color})` }}
                >
                  {f.name[0]}
                </div>
                {active === i && scanning && (
                  <>
                    {[1, 2].map(ring => (
                      <motion.div
                        key={ring}
                        className="absolute inset-0 rounded-full border-2"
                        style={{ borderColor: f.color }}
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 1 + ring * 0.25, opacity: 0 }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: ring * 0.3 }}
                      />
                    ))}
                  </>
                )}
                {active === i && revealed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </div>
              <div className="text-center">
                <div className="text-xs font-medium text-stone-700">{f.name}</div>
                <div className="text-[10px] text-stone-400">{f.role}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="border-t border-stone-100 min-h-[140px]">
        <AnimatePresence mode="wait">
          {active === null && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 text-stone-300 gap-2"
            >
              <ScanFace className="w-8 h-8" />
              <p className="text-sm">Cliquez sur un visage pour voir ses photos</p>
            </motion.div>
          )}

          {active !== null && scanning && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 gap-3"
            >
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: activeFace?.color }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                />
                Recherche des photos de {activeFace?.name}...
              </div>
            </motion.div>
          )}

          {active !== null && revealed && activeFace && (
            <motion.div
              key="revealed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: activeFace.color }}
                >
                  {activeFace.name[0]}
                </div>
                <div>
                  <span className="text-sm font-semibold text-stone-800">{activeFace.name}</span>
                  <span className="text-xs text-stone-400 ml-2">· {activeFace.count} photos trouvées</span>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {Array.from({ length: 10 }).map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: j * 0.04 }}
                    className="rounded-lg aspect-square flex items-center justify-center text-white/40 text-lg"
                    style={{ background: `${activeFace.color}22`, border: `1px solid ${activeFace.color}33` }}
                  >
                    <Camera className="w-3 h-3" style={{ color: activeFace.color }} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Gallery Mock ─────────────────────────────────────────────────────────────
function GalleryMock() {
  const items = [
    { h: 2, w: 2, tone: "from-stone-100 to-amber-50" },
    { h: 3, w: 1, tone: "from-pink-50 to-rose-100" },
    { h: 1, w: 1, tone: "from-violet-50 to-purple-50" },
    { h: 2, w: 2, tone: "from-amber-50 to-yellow-50" },
    { h: 1, w: 2, tone: "from-blue-50 to-indigo-50" },
    { h: 2, w: 1, tone: "from-rose-50 to-pink-50" },
    { h: 1, w: 1, tone: "from-stone-50 to-zinc-100" },
    { h: 2, w: 2, tone: "from-teal-50 to-emerald-50" },
  ];
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
      <div className="border-b border-stone-100 px-5 py-3 flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
        </div>
        <div className="text-xs text-stone-400 font-mono">picktur.fr/mariage-sophie-thomas</div>
        <div className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">Live</div>
      </div>
      <div className="p-4">
        <div className="text-center mb-4">
          <h3 className="font-serif text-stone-800 text-lg">Sophie & Thomas</h3>
          <p className="text-xs text-stone-400">14 juin 2025 · Paris · 847 photos</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-lg bg-gradient-to-br ${item.tone} border border-white/80 flex items-center justify-center`}
              style={{ gridRow: `span ${item.h}`, gridColumn: `span ${Math.min(item.w, 1)}`, aspectRatio: "1" }}
            >
              <Camera className="w-4 h-4 text-stone-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
// CTA URL — change this to your app signup URL
const APP_URL = "https://app.picktur.fr/auth";

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("fr");
  const [yearly, setYearly] = useState(false);
  const tr = copy[lang];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-900 antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-[#FAFAF8]/90 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-stone-900 flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-stone-900 text-lg tracking-tight">Picktur</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-stone-500">
            <a href="#features" className="hover:text-stone-900 transition-colors">{tr.nav.features}</a>
            <a href="#pricing" className="hover:text-stone-900 transition-colors">{tr.nav.pricing}</a>
            <a href="#faq" className="hover:text-stone-900 transition-colors">{tr.nav.faq}</a>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "fr" ? "en" : "fr")}
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-700 transition-colors px-2 py-1.5 rounded-lg hover:bg-stone-100"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === "fr" ? "EN" : "FR"}
            </button>
            <a href={APP_URL}>
              <button className="text-sm text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-all">
                {tr.nav.login}
              </button>
            </a>
            <a href={APP_URL}>
              <button className="text-sm bg-stone-900 text-white px-4 py-2 rounded-xl hover:bg-stone-800 transition-all font-medium">
                {tr.nav.cta}
              </button>
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-16 px-6">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-radial from-amber-100/60 via-rose-50/30 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white border border-stone-200 rounded-full px-4 py-1.5 text-xs text-stone-500 mb-8 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {tr.hero.badge}
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-stone-900 leading-[1.05] tracking-tight mb-6">
              {tr.hero.h1a}{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500">
                  {tr.hero.h1b}
                </span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-gradient-to-r from-rose-200/60 to-violet-200/60 -z-10 blur-sm rounded" />
              </span>
            </h1>

            <p className="text-lg md:text-xl text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              {tr.hero.sub}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <a href={APP_URL}>
                <button className="inline-flex items-center gap-2 bg-stone-900 text-white px-7 py-3.5 rounded-xl hover:bg-stone-800 transition-all font-medium text-base shadow-md hover:shadow-lg">
                  {tr.hero.cta1}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </a>
              <a href="#features">
                <button className="inline-flex items-center gap-2 bg-white text-stone-700 border border-stone-200 px-7 py-3.5 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all font-medium text-base shadow-sm">
                  <Play className="w-4 h-4 text-rose-500 fill-rose-500" />
                  {tr.hero.cta2}
                </button>
              </a>
            </div>

            <p className="text-xs text-stone-400 flex items-center gap-2 justify-center">
              <span className="flex -space-x-1.5">
                {["#E879A0","#6366F1","#10B981","#F59E0B"].map((c, i) => (
                  <span key={i} className="w-6 h-6 rounded-full border-2 border-[#FAFAF8] flex items-center justify-center text-[9px] font-bold text-white" style={{ background: c }}>
                    {String.fromCharCode(65+i)}
                  </span>
                ))}
              </span>
              {tr.hero.proof}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative max-w-4xl mx-auto mt-14"
        >
          <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-2xl bg-stone-900 aspect-video flex items-center justify-center cursor-pointer group">
            <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-900" />
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')]" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.08 }}
                className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/25 transition-all"
              >
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </motion.div>
              <span className="text-white/60 text-sm">{tr.hero.videoLabel}</span>
            </div>
          </div>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white border border-stone-200 rounded-full px-4 py-1.5 text-xs text-stone-500 shadow-md flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Tri IA · Galeries premium · Reconnaissance faciale · Albums physiques
          </div>
        </motion.div>
      </section>

      {/* ── Stats band ── */}
      <section className="py-16 px-6 border-y border-stone-100 bg-white mt-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {tr.stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-3xl font-black text-stone-900 mb-1">{s.value}</div>
              <div className="text-sm text-stone-400">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── AI Scoring ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-3 py-1 text-xs text-violet-600 mb-5">
              <Zap className="w-3.5 h-3.5" />
              {tr.aiSection.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 leading-tight mb-5">{tr.aiSection.h2}</h2>
            <p className="text-stone-500 leading-relaxed mb-8">{tr.aiSection.sub}</p>
            <div className="flex flex-wrap gap-2 mb-8">
              {[tr.aiSection.pill1, tr.aiSection.pill2, tr.aiSection.pill3, tr.aiSection.pill4].map((p, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">{p}</span>
              ))}
            </div>
            <a href={APP_URL}>
              <button className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 hover:gap-3 transition-all">
                {tr.aiSection.cta} <ArrowRight className="w-4 h-4" />
              </button>
            </a>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <AIScoringDemo />
          </motion.div>
        </div>
      </section>

      {/* ── Face Recognition ── */}
      <section className="py-24 px-6 bg-gradient-to-b from-white via-pink-50/30 to-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 md:order-1">
            <FaceRecognitionDemo faces={tr.faceSection.faces} />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 md:order-2">
            <div className="inline-flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-full px-3 py-1 text-xs text-pink-600 mb-5">
              <ScanFace className="w-3.5 h-3.5" />
              {tr.faceSection.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 leading-tight mb-5">{tr.faceSection.h2}</h2>
            <p className="text-stone-500 leading-relaxed mb-8">{tr.faceSection.sub}</p>
            <a href={APP_URL}>
              <button className="inline-flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-xl hover:bg-stone-800 transition-all font-medium text-sm">
                {tr.faceSection.cta} <ArrowRight className="w-4 h-4" />
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Beautiful Galleries ── */}
      <section className="py-24 px-6 border-t border-stone-100">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 text-xs text-emerald-600 mb-5">
              <Star className="w-3.5 h-3.5" />
              {tr.gallerySection.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 leading-tight mb-5">{tr.gallerySection.h2}</h2>
            <p className="text-stone-500 leading-relaxed mb-8">{tr.gallerySection.sub}</p>
            <ul className="space-y-3">
              {tr.gallerySection.features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-stone-600">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <GalleryMock />
          </motion.div>
        </div>
      </section>

      {/* ── Album ── */}
      <section className="py-24 px-6 bg-gradient-to-b from-white via-amber-50/20 to-white border-t border-stone-100">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 md:order-1">
            <div className="bg-gradient-to-br from-amber-50 to-rose-50 rounded-2xl border border-stone-200 shadow-lg p-10 flex flex-col items-center justify-center gap-6 min-h-[320px]">
              <div className="relative">
                <div className="w-48 h-32 bg-gradient-to-br from-stone-200 to-stone-300 rounded-lg shadow-xl transform -rotate-3 absolute -left-3 -top-3" />
                <div className="w-48 h-32 bg-gradient-to-br from-amber-100 to-rose-100 rounded-lg shadow-xl transform rotate-1 relative z-10 flex items-center justify-center border border-white/80">
                  <BookOpen className="w-10 h-10 text-stone-400" />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                {tr.albumSection.steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="bg-white border border-stone-200 rounded-full w-6 h-6 text-xs font-bold flex items-center justify-center text-stone-600 flex-shrink-0 shadow-sm">{i + 1}</div>
                    <span className="text-xs text-stone-500 hidden md:block">{s}</span>
                    {i < tr.albumSection.steps.length - 1 && <ArrowRight className="w-3 h-3 text-stone-300 flex-shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 md:order-2">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full px-3 py-1 text-xs text-amber-600 mb-5">
              <BookOpen className="w-3.5 h-3.5" />
              {tr.albumSection.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 leading-tight mb-5">{tr.albumSection.h2}</h2>
            <p className="text-stone-500 leading-relaxed">{tr.albumSection.sub}</p>
          </motion.div>
        </div>
      </section>

      {/* ── Couples / Affiliation ── */}
      <section className="py-24 px-6 border-t border-stone-100 bg-white">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-full px-3 py-1 text-xs text-rose-600 mb-5">
            <Heart className="w-3.5 h-3.5" />
            {tr.coupleSection.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">{tr.coupleSection.h2}</h2>
          <p className="text-stone-500 text-lg">{tr.coupleSection.sub}</p>
        </div>
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
          {tr.coupleSection.cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-stone-50 border border-stone-200 rounded-2xl p-7 hover:border-stone-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center mb-4 shadow-sm">
                {card.icon === "gift" ? <Gift className="w-5 h-5 text-rose-500" /> : <TrendingUp className="w-5 h-5 text-amber-500" />}
              </div>
              <h3 className="font-bold text-lg text-stone-900 mb-2">{card.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed mb-4">{card.desc}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-stone-900">{card.price}</span>
                {"priceLabel" in card && <span className="text-stone-400 text-sm">{card.priceLabel}</span>}
              </div>
              <div className="mt-3 text-xs text-stone-400 bg-white border border-stone-100 rounded-full px-3 py-1 inline-block">{card.tag}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6 border-t border-stone-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-3 py-1 text-xs text-violet-600 mb-5">
              <Award className="w-3.5 h-3.5" />
              {tr.pricing.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2">{tr.pricing.h2}</h2>
            <p className="text-stone-400 text-sm">{tr.pricing.sub}</p>
            <div className="flex items-center gap-3 justify-center mt-6">
              <span className={`text-sm ${!yearly ? "text-stone-900 font-medium" : "text-stone-400"}`}>{tr.pricing.toggle[0]}</span>
              <button
                onClick={() => setYearly(!yearly)}
                className={`relative w-11 h-6 rounded-full transition-colors ${yearly ? "bg-stone-900" : "bg-stone-200"}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${yearly ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className={`text-sm ${yearly ? "text-stone-900 font-medium" : "text-stone-400"}`}>{tr.pricing.toggle[1]}</span>
              {yearly && (
                <span className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">{tr.pricing.save}</span>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {tr.pricing.plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-7 flex flex-col ${plan.highlight ? "bg-stone-900 text-white shadow-2xl" : "bg-white border border-stone-200 shadow-sm"}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-rose-400 to-violet-500 text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow">{plan.badge}</span>
                  </div>
                )}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold text-lg ${plan.highlight ? "text-white" : "text-stone-900"}`}>{plan.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${plan.highlight ? "bg-white/15 text-white/80" : "bg-stone-100 text-stone-500"}`}>{(plan as any).storage}</span>
                  </div>
                  <p className={`text-sm ${plan.highlight ? "text-white/60" : "text-stone-400"}`}>{plan.desc}</p>
                </div>
                <div className="mb-6">
                  <span className={`text-4xl font-black ${plan.highlight ? "text-white" : "text-stone-900"}`}>{yearly ? plan.price.y : plan.price.m}</span>
                  <span className={`text-sm ml-1 ${plan.highlight ? "text-white/50" : "text-stone-400"}`}>{yearly ? plan.period.y : plan.period.m}</span>
                </div>
                <ul className="space-y-2.5 flex-1 mb-7">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-center gap-2.5 text-sm ${plan.highlight ? "text-white/80" : "text-stone-600"}`}>
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? "text-white/60" : "text-emerald-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href={APP_URL}>
                  <button className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all ${plan.highlight ? "bg-white text-stone-900 hover:bg-stone-100" : "bg-stone-900 text-white hover:bg-stone-800"}`}>
                    {plan.cta}
                  </button>
                </a>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-4 my-14">
            <div className="flex-1 h-px bg-stone-100" />
            <span className="flex items-center gap-2 text-sm font-medium text-stone-400 px-3">
              <Heart className="w-4 h-4 text-rose-400" />
              {tr.pricing.coupleOffer.label}
            </span>
            <div className="flex-1 h-px bg-stone-100" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-7 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-lg text-stone-900">{tr.pricing.coupleOffer.title}</h3>
              </div>
              <p className="text-sm text-stone-400 mb-5">{tr.pricing.coupleOffer.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-stone-900">{tr.pricing.coupleOffer.price}</span>
                <span className="text-sm ml-2 text-stone-400">{tr.pricing.coupleOffer.period}</span>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {tr.pricing.coupleOffer.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-sm text-stone-600">
                    <Check className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href={APP_URL}>
                <button className="w-full py-2.5 rounded-xl font-medium text-sm bg-rose-500 text-white hover:bg-rose-600 transition-all">{tr.pricing.coupleOffer.cta}</button>
              </a>
              <p className="text-center text-xs text-stone-400 mt-3">{tr.pricing.coupleOffer.note}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-7 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-violet-500" />
                <h3 className="font-bold text-lg text-stone-900">{tr.pricing.referral.title}</h3>
              </div>
              <p className="text-sm text-stone-400 mb-5">{tr.pricing.referral.desc}</p>
              <div className="flex items-end gap-3 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-black text-violet-600">{tr.pricing.referral.commission}</div>
                  <div className="text-xs text-stone-400">{tr.pricing.referral.commissionLabel}</div>
                </div>
                <div className="h-px flex-1 bg-violet-100 mb-3" />
                <div className="text-center">
                  <div className="text-lg font-bold text-stone-700">{tr.pricing.referral.max}</div>
                  <div className="text-xs text-stone-400">{tr.pricing.referral.period}</div>
                </div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {tr.pricing.referral.steps.map((s, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-sm text-stone-600">
                    <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{j + 1}</span>
                    {s}
                  </li>
                ))}
              </ul>
              <ReferralWidget labels={tr.pricing.referral.widget} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-6 border-t border-stone-100 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-stone-900 text-center mb-12">{tr.faq.h2}</h2>
          <div>
            {tr.faq.items.map((item, i) => (
              <FaqItemFull key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 px-6 border-t border-stone-100">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-500 via-transparent to-violet-600" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{tr.finalCta.h2}</h2>
              <p className="text-white/60 text-lg mb-10">{tr.finalCta.sub}</p>
              <a href={APP_URL}>
                <button className="bg-white text-stone-900 px-10 py-3.5 rounded-xl font-semibold hover:bg-stone-100 transition-all inline-flex items-center gap-2 shadow-lg">
                  {tr.finalCta.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </a>
              <p className="text-white/30 text-xs mt-5">{tr.finalCta.sub2}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-stone-100 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-stone-900 flex items-center justify-center">
              <Camera className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-stone-900 text-sm">Picktur</span>
            <span className="text-stone-300 text-sm mx-2">·</span>
            <span className="text-stone-400 text-xs">{tr.footer.tagline}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-stone-400">
            <a href="#" className="hover:text-stone-700 transition-colors">CGU</a>
            <a href="#" className="hover:text-stone-700 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-stone-700 transition-colors">RGPD</a>
            <span>{tr.footer.copyright}</span>
            <button onClick={() => setLang(lang === "fr" ? "en" : "fr")} className="hover:text-stone-700 transition-colors flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              {lang === "fr" ? "English" : "Français"}
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
