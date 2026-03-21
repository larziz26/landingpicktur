import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Camera, Zap, Star, ArrowRight, Check, ChevronDown,
  Globe, Play, ScanFace, BookOpen, Sparkles, Award, Heart,
  TrendingUp, Gift, ChevronLeft, ChevronRight, Quote, X, Loader2, CheckCircle2, AlertCircle
} from "lucide-react";
import { Concept1Fusion } from "./pages/HeroSandbox";

// ─── Types & i18n ─────────────────────────────────────────────────────────────
type Lang = "fr" | "en";

const copy = {
  fr: {
    nav: { features: "Fonctionnalités", pricing: "Tarifs", faq: "FAQ", login: "Connexion", cta: "Essai gratuit" },
    hero: {
      badge: "Spécialement conçu pour les photographes de mariage",
      h1a: "Livrez plus vite.",
      h1b: "L'expérience que vos clients n'oublieront pas.",
      sub: "Picktur score vos photos par IA, identifie chaque visage et génère vos galeries. Livrez dès le lendemain : vos invités se retrouvent par selfie et vos clients sélectionnent leurs favoris pour l'album en un clic.",
      cta1: "Commencer gratuitement",
      cta2: "Explorer les fonctionnalités",
      proof: "Rejoignez les premiers photographes",
      videoLabel: "Démo en 90 secondes",
    },
    stats: [
      { value: "26", label: "critères analysés par photo" },
      { value: "< 5 min", label: "pour livrer une galerie" },
      { value: "1 selfie", label: "pour retrouver toutes ses photos" },
      { value: "1 week-end", label: "pour réaliser un album" },
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
    howItWorks: {
      badge: "Comment ça marche",
      h2: "De l'appareil à la galerie livrée. En quelques heures.",
      steps: [
        {
          num: "01",
          title: "Créez votre collection",
          desc: "Nommez le mariage, ajoutez la date et le lieu. Votre espace de travail est prêt en 30 secondes.",
        },
        {
          num: "02",
          title: "Uploadez par événement",
          desc: "Mairie, vin d'honneur, soirée — importez les photos par séquence et taguez chaque lot. La galerie se structure seule.",
        },
        {
          num: "03",
          title: "Lancez le Smart Scoring",
          desc: "L'IA analyse chaque photo sur 26 critères pendant que vous faites autre chose. Les meilleures remontent automatiquement.",
        },
        {
          num: "04",
          title: "Partagez — c'est fait",
          desc: "Envoyez le lien protégé dès le lendemain. Vos invités retrouvent leurs photos en selfie. Votre client sélectionne ses favoris pour l'album.",
        },
      ],
    },
    comparison: {
      badge: "Pourquoi changer ?",
      h2: "Picktur vs Pixieset",
      sub: "Pixieset fait de belles galeries. Picktur transforme l'expérience entière — avant, pendant et après la livraison.",
      rows: [
        { feature: "Tri IA sur 26 critères", picktur: true, pixieset: false, wetransfer: false },
        { feature: "Reconnaissance faciale", picktur: true, pixieset: false, wetransfer: false },
        { feature: "Galerie personnelle par selfie", picktur: true, pixieset: false, wetransfer: false },
        { feature: "Sélection album par le client", picktur: true, pixieset: true, wetransfer: false },
        { feature: "Galeries protégées par mot de passe", picktur: true, pixieset: true, wetransfer: false },
        { feature: "Lien personnalisé", picktur: true, pixieset: true, wetransfer: false },
        { feature: "Prix de départ", picktur: "19€/mois", pixieset: "~25€/mois", wetransfer: "Gratuit limité" },
      ],
      cta: "Essayer Picktur gratuitement",
    },
    testimonials: {
      badge: "Ils en parlent",
      h2: "Des centaines de photographes. Une seule plateforme.",
      items: [
        { name: "Mathilde C.", role: "Photographe de mariage · Lyon", text: "J'ai livré ma première galerie en moins de 24h après le mariage. Mes clients n'en revenaient pas.", avatar: "M", color: "#E879A0" },
        { name: "Lucas B.", role: "Photographe · Paris", text: "Le tri IA m'a économisé 4h sur mon dernier mariage. Je n'imagine plus travailler sans.", avatar: "L", color: "#6366F1" },
        { name: "Camille R.", role: "Studio photo · Bordeaux", text: "Mes clients adorent retrouver leurs photos en selfie. C'est devenu mon argument de vente numéro 1.", avatar: "C", color: "#10B981" },
        { name: "Antoine D.", role: "Photographe indépendant · Nantes", text: "Picktur m'a permis de passer de 3 jours à 6h de travail post-production. Bluffant.", avatar: "A", color: "#F59E0B" },
        { name: "Sophie L.", role: "Photographe · Marseille", text: "L'interface est tellement claire. Même mes clients les moins technophiles s'en sortent parfaitement.", avatar: "S", color: "#8B5CF6" },
        { name: "Julien M.", role: "Photographe de mariage · Lille", text: "Le scoring IA est redoutablement précis. Je valide les sélections sans presque y toucher.", avatar: "J", color: "#06B6D4" },
        { name: "Eléonore T.", role: "Photographe · Strasbourg", text: "Mes mariées reçoivent leur galerie le lendemain. La reconnaissance faciale les sidère à chaque fois.", avatar: "E", color: "#EC4899" },
        { name: "Pierre G.", role: "Studio · Toulouse", text: "J'ai migré depuis Pixieset. À fonctionnalités équivalentes, Picktur est bien moins cher — et en plus, y'a l'IA.", avatar: "P", color: "#84CC16" },
      ],
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
      save: "−1 mois offert",
      aiToggle: ["Sans tri IA", "Tri IA activé"],
      aiNote: "Option non désactivable après souscription",
      plans: [
        {
          name: "Essentiel", slug: "starter", storage: "120 Go",
          price: { m: "19€", y: "209€" }, priceAi: { m: "25€", y: "275€" }, period: { m: "/ mois", y: "/ an" },
          badge: null, highlight: false,
          desc: "Pour démarrer sereinement.",
          features: ["120 Go de stockage", "Mariages illimités", "Galeries partageables", "Reconnaissance faciale", "Lien personnalisé"],
          cta: "Démarrer",
        },
        {
          name: "Pro", slug: "pro", storage: "360 Go",
          price: { m: "35€", y: "385€" }, priceAi: { m: "46€", y: "506€" }, period: { m: "/ mois", y: "/ an" },
          badge: "Le plus populaire", highlight: true,
          desc: "Le choix des photographes actifs.",
          features: ["360 Go de stockage", "Tout Essentiel +", "Sélection dynamique", "Album physique", "Support prioritaire", "Statistiques détaillées"],
          cta: "Commencer Pro",
        },
        {
          name: "Studio", slug: "studio", storage: "720 Go",
          price: { m: "59€", y: "649€" }, priceAi: { m: "77€", y: "847€" }, period: { m: "/ mois", y: "/ an" },
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
        { q: "Est-ce que je dois quand même vérifier toutes les photos après l'IA ?", a: "L'IA fait la présélection — vous gardez le contrôle. Vous pouvez affiner ou valider en quelques minutes, mais vous ne partez plus de zéro face à 5 000 photos. La plupart des photographes valident sans toucher à la sélection." },
        { q: "J'envoie mes photos par WeTransfer ou Dropbox, pourquoi je changerais ?", a: "Tu t'es déjà demandé combien de temps ton client a mis à télécharger 50 Go — si son ordinateur avait même la place ? Combien de temps avant qu'il ouvre le dossier, cherche une photo sympa parmi 2 000, essaie d'en envoyer quelques-unes à sa famille sans savoir où chercher ? C'est ça, la réalité d'un transfert de fichiers brut. Avec Picktur, le client ouvre une galerie soignée depuis son téléphone, retrouve ses photos en un selfie et sélectionne ses favoris pour l'album en quelques minutes. Pas de ZIP, pas de galère, pas d'ordinateur requis." },
        { q: "La reconnaissance faciale fonctionne en basse lumière ou en soirée ?", a: "Oui. La reconnaissance faciale de Picktur est entraînée sur des photos réelles dans des conditions variées — salle de réception, lumière tamisée, contre-jour. Elle fonctionne là où vous travaillez vraiment." },
        { q: "Si j'arrête Picktur, je perds mes photos ?", a: "Oui — et c'est important de le savoir. Picktur n'est pas un outil de stockage cloud : en cas d'arrêt d'abonnement, votre accès est coupé et au bout d'un mois, votre espace est supprimé définitivement. Vos données ne sont pas récupérables après cette date. Gardez toujours vos backups personnels sur vos disques durs externes ou vos cartes SD — c'est votre filet de sécurité. Picktur est l'interface qui rend vos photos intelligentes et partageables, pas leur lieu de sauvegarde." },
        { q: "Je suis déjà client chez Pixieset, pourquoi je changerais ?", a: "Parce que pour moins cher, vous avez beaucoup plus. Pixieset livre de belles galeries — mais sans tri IA, sans scoring photo, sans reconnaissance faciale par selfie. Avec Picktur, vos photos sont analysées sur 26 critères avant même que vous ouvriez la galerie, chaque invité retrouve les siennes en un selfie, et vos clients sélectionnent leurs favoris pour l'album sans vous solliciter. Même prix, expérience 10 fois plus premium." },
        { q: "Les galeries sont disponibles combien de temps pour mes clients ?", a: "Les galeries sont accessibles pendant 1 an à partir de la livraison. Vos clients peuvent consulter et télécharger leurs photos en HD à tout moment pendant cette période. Vous pouvez prolonger l'accès à tout moment — 6 mois, 1 an ou la durée de votre choix — soit à votre charge, soit en le facturant directement à votre client." },
      ],
    },
    finalCta: {
      h2: "Votre prochain mariage mérite mieux.",
      sub: "Rejoignez les photographes qui livrent leurs galeries dès le lendemain — et dont les clients en parlent encore.",
      cta: "Commencer gratuitement",
      sub2: "Essai 14 jours · Pas de CB requise",
    },
    signup: {
      title: "Créez votre studio",
      subtitle: "Votre galerie en ligne en 2 minutes",
      slugLabel: "Identifiant (nom business)",
      slugPlaceholder: "marie-photo",
      slugPreviewPrefix: "Votre future galerie :",
      slugAvailable: "Disponible !",
      slugTaken: "Déjà pris",
      slugInvalid: "3-30 caractères, lettres/chiffres/tirets uniquement",
      emailLabel: "Email professionnel",
      emailPlaceholder: "marie@studio.fr",
      passwordLabel: "Mot de passe",
      passwordPlaceholder: "Minimum 6 caractères",
      submit: "Créer mon studio et payer →",
      submitting: "Création en cours...",
      loginLink: "Déjà un compte ?",
      loginCta: "Se connecter",
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
      h1a: "Deliver faster.",
      h1b: "The experience your clients will never forget.",
      sub: "Picktur scores your photos with AI, identifies every face and generates your galleries. Deliver the next day: guests find themselves by selfie and clients pick their album favorites in one click.",
      cta1: "Start for free",
      cta2: "Explore features",
      proof: "Join the first photographers",
      videoLabel: "90-second demo",
    },
    stats: [
      { value: "26", label: "criteria analyzed per photo" },
      { value: "< 5 min", label: "to deliver a gallery" },
      { value: "1 selfie", label: "to find all your photos" },
      { value: "1 weekend", label: "to create an album" },
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
    howItWorks: {
      badge: "How it works",
      h2: "From camera to delivered gallery. In a few hours.",
      steps: [
        {
          num: "01",
          title: "Create your collection",
          desc: "Name the wedding, add the date and venue. Your workspace is ready in 30 seconds.",
        },
        {
          num: "02",
          title: "Upload by event",
          desc: "City hall, cocktail hour, reception — import photos by sequence and tag each batch. The gallery structures itself.",
        },
        {
          num: "03",
          title: "Launch Smart Scoring",
          desc: "AI analyzes every photo on 26 criteria while you do something else. The best ones surface automatically.",
        },
        {
          num: "04",
          title: "Share — done",
          desc: "Send the protected link the next day. Guests find their photos by selfie. Your client picks their album favorites.",
        },
      ],
    },
    comparison: {
      badge: "Why switch?",
      h2: "Picktur vs Pixieset",
      sub: "Pixieset makes beautiful galleries. Picktur transforms the entire experience — before, during and after delivery.",
      rows: [
        { feature: "AI culling on 26 criteria", picktur: true, pixieset: false, wetransfer: false },
        { feature: "Face recognition", picktur: true, pixieset: false, wetransfer: false },
        { feature: "Personal gallery by selfie", picktur: true, pixieset: false, wetransfer: false },
        { feature: "Album selection by client", picktur: true, pixieset: true, wetransfer: false },
        { feature: "Password-protected galleries", picktur: true, pixieset: true, wetransfer: false },
        { feature: "Custom link", picktur: true, pixieset: true, wetransfer: false },
        { feature: "Starting price", picktur: "€19/mo", pixieset: "~€25/mo", wetransfer: "Free limited" },
      ],
      cta: "Try Picktur for free",
    },
    testimonials: {
      badge: "What they say",
      h2: "Hundreds of photographers. One platform.",
      items: [
        { name: "Mathilde C.", role: "Wedding photographer · Lyon", text: "I delivered my first gallery less than 24h after the wedding. My clients couldn't believe it.", avatar: "M", color: "#E879A0" },
        { name: "Lucas B.", role: "Photographer · Paris", text: "AI culling saved me 4 hours on my last wedding. I can't imagine working without it anymore.", avatar: "L", color: "#6366F1" },
        { name: "Camille R.", role: "Photo studio · Bordeaux", text: "My clients love finding their photos with a selfie. It's become my #1 sales argument.", avatar: "C", color: "#10B981" },
        { name: "Antoine D.", role: "Freelance photographer · Nantes", text: "Picktur took me from 3 days to 6 hours of post-production work. Mind-blowing.", avatar: "A", color: "#F59E0B" },
        { name: "Sophie L.", role: "Photographer · Marseille", text: "The interface is so clear. Even my least tech-savvy clients navigate it perfectly.", avatar: "S", color: "#8B5CF6" },
        { name: "Julien M.", role: "Wedding photographer · Lille", text: "The AI scoring is incredibly accurate. I approve selections with almost no changes.", avatar: "J", color: "#06B6D4" },
        { name: "Eléonore T.", role: "Photographer · Strasbourg", text: "My brides get their gallery the next day. The face recognition amazes them every time.", avatar: "E", color: "#EC4899" },
        { name: "Pierre G.", role: "Studio · Toulouse", text: "I migrated from Pixieset. Same features, cheaper — and on top of that, there's AI.", avatar: "P", color: "#84CC16" },
      ],
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
      save: "−1 month free",
      aiToggle: ["No AI culling", "AI culling on"],
      aiNote: "Cannot be deactivated after subscribing",
      plans: [
        {
          name: "Essential", slug: "starter", storage: "120 GB",
          price: { m: "€19", y: "€209" }, priceAi: { m: "€25", y: "€275" }, period: { m: "/ month", y: "/ year" },
          badge: null, highlight: false,
          desc: "Start without breaking the bank.",
          features: ["120 GB storage", "Unlimited weddings", "Shareable galleries", "Face recognition", "Custom link"],
          cta: "Get started",
        },
        {
          name: "Pro", slug: "pro", storage: "360 GB",
          price: { m: "€35", y: "€385" }, priceAi: { m: "€46", y: "€506" }, period: { m: "/ month", y: "/ year" },
          badge: "Most popular", highlight: true,
          desc: "The choice of active photographers.",
          features: ["360 GB storage", "Everything in Essential +", "Dynamic selection", "Physical album", "Priority support", "Detailed analytics"],
          cta: "Start Pro",
        },
        {
          name: "Studio", slug: "studio", storage: "720 GB",
          price: { m: "€59", y: "€649" }, priceAi: { m: "€77", y: "€847" }, period: { m: "/ month", y: "/ year" },
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
        { q: "Do I still need to review every photo after the AI?", a: "The AI does the pre-selection — you stay in control. You can refine or validate in minutes, but you're no longer starting from scratch with 5,000 photos. Most photographers approve the selection without changing a thing." },
        { q: "I send photos via WeTransfer or Dropbox — why would I change?", a: "Have you ever wondered how long your client spent downloading 50GB — if their computer even had the space? How long before they actually opened the folder, searched for a good photo among 2,000, or tried to send a few to family without knowing where to look? That's the reality of a raw file transfer. With Picktur, the client opens a beautiful gallery from their phone, finds their photos with a selfie and picks album favorites in minutes. No ZIP, no hassle, no computer needed." },
        { q: "Does face recognition work in low light or evening settings?", a: "Yes. Picktur's face recognition is trained on real photos in varied conditions — reception halls, dim lighting, backlighting. It works where you actually shoot." },
        { q: "If I stop using Picktur, do I lose my photos?", a: "Yes — and this is important to know. Picktur is not a cloud storage tool: if you cancel your subscription, your access is cut off and after one month, your space is permanently deleted. Your data cannot be recovered after that point. Always keep your own personal backups on external hard drives or memory cards — that's your safety net. Picktur is the interface that makes your photos smart and shareable, not their storage home." },
        { q: "I'm already a Pixieset customer — why would I switch?", a: "Because for less money, you get a lot more. Pixieset delivers beautiful galleries — but without AI culling, photo scoring, or selfie-based face recognition. With Picktur, your photos are analyzed on 26 criteria before you even open the gallery, every guest finds their photos with a selfie, and clients pick their album favorites without bothering you. Same price range, 10x more premium experience." },
        { q: "How long are galleries available to my clients?", a: "Galleries are accessible for 1 year from delivery. Your clients can browse and download their photos in HD at any time during that period. You can extend access at any time — 6 months, 1 year, or any duration you choose — either at your own cost or billed directly to your client." },
      ],
    },
    finalCta: {
      h2: "Your next wedding deserves better.",
      sub: "Join photographers who deliver their galleries the next day — and whose clients never stop talking about it.",
      cta: "Start for free",
      sub2: "14-day trial · No credit card required",
    },
    signup: {
      title: "Create your studio",
      subtitle: "Your gallery online in 2 minutes",
      slugLabel: "Identifier (business name)",
      slugPlaceholder: "marie-photo",
      slugPreviewPrefix: "Your future gallery:",
      slugAvailable: "Available!",
      slugTaken: "Already taken",
      slugInvalid: "3-30 characters, letters/numbers/hyphens only",
      emailLabel: "Professional email",
      emailPlaceholder: "marie@studio.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Minimum 6 characters",
      submit: "Create my studio & pay →",
      submitting: "Creating...",
      loginLink: "Already have an account?",
      loginCta: "Log in",
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
      const apiBase = (import.meta.env.VITE_API_URL as string) || "";
      const res = await fetch(`${apiBase}/api/referrals`, {
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

// ─── Testimonials Double Marquee ──────────────────────────────────────────────
type TestimonialItem = { name: string; role: string; text: string; avatar: string; color: string };

function MarqueeRow({ items, reverse = false }: { items: TestimonialItem[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex gap-4 w-max"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
      >
        {doubled.map((t, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-80 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: t.color }}
              >
                {t.avatar}
              </div>
              <div>
                <div className="text-sm font-semibold text-stone-900">{t.name}</div>
                <div className="text-xs text-stone-400">{t.role}</div>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function TestimonialsMarquee({ data }: { data: { badge: string; h2: string; items: TestimonialItem[] } }) {
  const row1 = data.items.slice(0, 4);
  const row2 = data.items.slice(4, 8);
  return (
    <section className="py-24 border-t border-stone-100 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full px-3 py-1 text-xs text-amber-600 mb-5">
          <Heart className="w-3.5 h-3.5" />
          {data.badge}
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-stone-900">{data.h2}</h2>
      </div>
      <div className="space-y-4">
        <MarqueeRow items={row1} reverse={false} />
        <MarqueeRow items={row2} reverse={true} />
      </div>
    </section>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
const APP_URL = "https://picktur.com/auth";
const API_BASE = "https://picktur.com";

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("fr");
  const [yearly, setYearly] = useState(false);
  const [aiCulling, setAiCulling] = useState(true);
  const tr = copy[lang];

  // ── Signup modal state ──
  const [showSignup, setShowSignup] = useState(false);
  const [signupData, setSignupData] = useState({ username: "", email: "", password: "" });
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const slugTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced slug availability check
  useEffect(() => {
    const slug = signupData.username.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!slug) { setSlugStatus("idle"); return; }
    if (!/^[a-z0-9-]{3,30}$/.test(slug)) { setSlugStatus("invalid"); return; }
    setSlugStatus("checking");
    if (slugTimerRef.current) clearTimeout(slugTimerRef.current);
    slugTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/check-slug/${encodeURIComponent(slug)}`);
        const data = await res.json();
        setSlugStatus(data.available ? "available" : "taken");
      } catch { setSlugStatus("idle"); }
    }, 500);
    return () => { if (slugTimerRef.current) clearTimeout(slugTimerRef.current); };
  }, [signupData.username]);

  const handleSignup = async () => {
    setSignupLoading(true);
    setSignupError("");
    try {
      const regRes = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: signupData.username.toLowerCase().replace(/[^a-z0-9-]/g, ""),
          email: signupData.email,
          password: signupData.password,
        }),
      });
      if (!regRes.ok) {
        const err = await regRes.json();
        throw new Error(err.message || (lang === "fr" ? "Erreur lors de l'inscription" : "Registration error"));
      }
      const { sessionToken, user } = await regRes.json();

      // Store session before Stripe redirect so auth page can auto-connect on return
      localStorage.setItem("picktur_session_token", sessionToken);
      localStorage.setItem("picktur_pending_slug", user.username);

      const checkRes = await fetch(`${API_BASE}/api/subscribe/create-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-session-token": sessionToken },
      });
      if (!checkRes.ok) throw new Error(lang === "fr" ? "Erreur lors de la création du paiement" : "Payment setup error");
      const { url } = await checkRes.json();

      window.location.href = url;
    } catch (err: any) {
      setSignupError(err.message);
      setSignupLoading(false);
    }
  };

  const openSignup = () => {
    setSignupData({ username: "", email: "", password: "" });
    setSlugStatus("idle");
    setSignupError("");
    setShowSignup(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-900 antialiased" style={{ fontFamily: "'Open Sauce Sans', system-ui, sans-serif" }}>

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
            <button onClick={openSignup} className="text-sm bg-stone-900 text-white px-4 py-2 rounded-xl hover:bg-stone-800 transition-all font-medium">
              {tr.nav.cta}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero — titre + CTA + animation ── */}
      <section className="relative overflow-hidden pt-20 pb-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-radial from-amber-100/60 via-rose-50/30 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Titre + CTA */}
        <div className="relative max-w-4xl mx-auto text-center px-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white border border-stone-200 rounded-full px-4 py-1.5 text-xs text-stone-500 mb-7 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {tr.hero.badge}
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-stone-900 leading-[1.08] tracking-tight mb-4">
              {tr.hero.h1a}<br />
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500">
                  {tr.hero.h1b}
                </span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-gradient-to-r from-rose-200/60 to-violet-200/60 -z-10 blur-sm rounded" />
              </span>
            </h1>

            <p className="text-lg text-stone-500 max-w-2xl mx-auto mb-8 leading-relaxed">
              {tr.hero.sub}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
              <button onClick={openSignup} className="inline-flex items-center gap-2 bg-stone-900 text-white px-7 py-3.5 rounded-xl hover:bg-stone-800 transition-all font-medium text-base shadow-md hover:shadow-lg">
                {tr.hero.cta1}
                <ArrowRight className="w-4 h-4" />
              </button>
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

        {/* Animation hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="relative max-w-6xl mx-auto px-4 pb-12"
        >
          <Concept1Fusion lang={lang} />
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

      {/* ── How it works ── */}
      <section className="py-24 px-6 bg-white border-t border-stone-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-full px-3 py-1 text-xs text-stone-600 mb-5">
              <Zap className="w-3.5 h-3.5" />
              {tr.howItWorks.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900">{tr.howItWorks.h2}</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {tr.howItWorks.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {i < tr.howItWorks.steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(100%-12px)] w-6 h-px bg-stone-200 z-10" />
                )}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 h-full hover:border-stone-300 hover:shadow-sm transition-all">
                  <div className="text-3xl font-black text-stone-200 mb-3">{step.num}</div>
                  <h3 className="font-bold text-stone-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
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
            <button onClick={openSignup} className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 hover:gap-3 transition-all">
              {tr.aiSection.cta} <ArrowRight className="w-4 h-4" />
            </button>
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
            <button onClick={openSignup} className="inline-flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-xl hover:bg-stone-800 transition-all font-medium text-sm">
              {tr.faceSection.cta} <ArrowRight className="w-4 h-4" />
            </button>
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

      {/* ── Comparison ── */}
      <section className="py-24 px-6 border-t border-stone-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-full px-3 py-1 text-xs text-rose-600 mb-5">
              <Star className="w-3.5 h-3.5" />
              {tr.comparison.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-3">{tr.comparison.h2}</h2>
            <p className="text-stone-500">{tr.comparison.sub}</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-4 bg-stone-50 border-b border-stone-200">
              <div className="p-4 text-sm font-semibold text-stone-500">Fonctionnalité</div>
              <div className="p-4 text-sm font-bold text-stone-900 text-center border-l border-stone-200 bg-stone-900 text-white">Picktur</div>
              <div className="p-4 text-sm font-semibold text-stone-500 text-center border-l border-stone-200">Pixieset</div>
              <div className="p-4 text-sm font-semibold text-stone-400 text-center border-l border-stone-200">WeTransfer</div>
            </div>
            {/* Rows */}
            {tr.comparison.rows.map((row, i) => (
              <div key={i} className={`grid grid-cols-4 border-b border-stone-100 last:border-0 ${i % 2 === 0 ? "" : "bg-stone-50/50"}`}>
                <div className="p-4 text-sm text-stone-700 flex items-center">{row.feature}</div>
                <div className="p-4 flex items-center justify-center border-l border-stone-200 bg-stone-900/5">
                  {typeof row.picktur === "boolean" ? (
                    row.picktur ? <Check className="w-5 h-5 text-emerald-500" /> : <span className="w-5 h-5 flex items-center justify-center text-stone-300 text-lg">—</span>
                  ) : (
                    <span className="text-xs font-semibold text-stone-900">{row.picktur}</span>
                  )}
                </div>
                <div className="p-4 flex items-center justify-center border-l border-stone-200">
                  {typeof row.pixieset === "boolean" ? (
                    row.pixieset ? <Check className="w-5 h-5 text-stone-400" /> : <span className="w-5 h-5 flex items-center justify-center text-stone-200 text-lg">—</span>
                  ) : (
                    <span className="text-xs text-stone-500">{row.pixieset}</span>
                  )}
                </div>
                <div className="p-4 flex items-center justify-center border-l border-stone-200">
                  {typeof row.wetransfer === "boolean" ? (
                    row.wetransfer ? <Check className="w-5 h-5 text-stone-400" /> : <span className="w-5 h-5 flex items-center justify-center text-stone-200 text-lg">—</span>
                  ) : (
                    <span className="text-xs text-stone-400">{row.wetransfer}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button onClick={openSignup} className="inline-flex items-center gap-2 bg-stone-900 text-white px-7 py-3.5 rounded-xl hover:bg-stone-800 transition-all font-medium text-base shadow-md hover:shadow-lg">
              {tr.comparison.cta} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <TestimonialsMarquee data={tr.testimonials} />

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

      {/* ── Testimonials ── */}
      <TestimonialsMarquee data={tr.testimonials} />

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
            <div className="flex flex-col items-center gap-3 mt-6">
              <div className="flex items-center gap-3">
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
              <div className="flex items-center gap-3">
                <span className={`text-sm ${!aiCulling ? "text-stone-900 font-medium" : "text-stone-400"}`}>{tr.pricing.aiToggle[0]}</span>
                <button
                  onClick={() => setAiCulling(!aiCulling)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${aiCulling ? "bg-violet-600" : "bg-stone-200"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${aiCulling ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className={`text-sm ${aiCulling ? "text-violet-700 font-medium" : "text-stone-400"}`}>{tr.pricing.aiToggle[1]}</span>
                {aiCulling && (
                  <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">{tr.pricing.aiNote}</span>
                )}
              </div>
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
                  <span className={`text-4xl font-black ${plan.highlight ? "text-white" : "text-stone-900"}`}>{aiCulling ? (yearly ? (plan as any).priceAi.y : (plan as any).priceAi.m) : (yearly ? plan.price.y : plan.price.m)}</span>
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
                <button onClick={openSignup} className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all ${plan.highlight ? "bg-white text-stone-900 hover:bg-stone-100" : "bg-stone-900 text-white hover:bg-stone-800"}`}>
                  {plan.cta}
                </button>
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
              <button onClick={openSignup} className="bg-white text-stone-900 px-10 py-3.5 rounded-xl font-semibold hover:bg-stone-100 transition-all inline-flex items-center gap-2 shadow-lg">
                {tr.finalCta.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
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

      {/* ── Signup Modal ── */}
      <AnimatePresence>
        {showSignup && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSignup(false)} />

            {/* Card */}
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <button onClick={() => setShowSignup(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all">
                <X className="w-4 h-4" />
              </button>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md bg-stone-900 flex items-center justify-center">
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-bold text-stone-900">Picktur</span>
                </div>
                <h2 className="text-xl font-bold text-stone-900 mt-3">{tr.signup.title}</h2>
                <p className="text-sm text-stone-500 mt-0.5">{tr.signup.subtitle}</p>
              </div>

              <div className="space-y-4">
                {/* Slug field */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">{tr.signup.slugLabel}</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={tr.signup.slugPlaceholder}
                      value={signupData.username}
                      onChange={e => setSignupData(d => ({ ...d, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {slugStatus === "checking" && <Loader2 className="w-4 h-4 text-stone-400 animate-spin" />}
                      {slugStatus === "available" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {(slugStatus === "taken" || slugStatus === "invalid") && <AlertCircle className="w-4 h-4 text-rose-500" />}
                    </div>
                  </div>
                  {/* Live slug preview */}
                  {signupData.username && (
                    <div className={`mt-1.5 text-xs flex items-center gap-1.5 ${slugStatus === "available" ? "text-emerald-600" : slugStatus === "taken" ? "text-rose-500" : slugStatus === "invalid" ? "text-rose-500" : "text-stone-400"}`}>
                      {slugStatus === "available" && (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{tr.signup.slugAvailable}</span>
                          <span className="text-stone-400 mx-1">·</span>
                          <span className="text-stone-500">{tr.signup.slugPreviewPrefix} <strong className="text-stone-800">{signupData.username}</strong>.picktur.com</span>
                        </>
                      )}
                      {slugStatus === "taken" && <><AlertCircle className="w-3 h-3" />{tr.signup.slugTaken}</>}
                      {slugStatus === "invalid" && <><AlertCircle className="w-3 h-3" />{tr.signup.slugInvalid}</>}
                      {slugStatus === "checking" && <span className="text-stone-400">{signupData.username}.picktur.com</span>}
                      {slugStatus === "idle" && <span>{signupData.username}.picktur.com</span>}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">{tr.signup.emailLabel}</label>
                  <input
                    type="email"
                    placeholder={tr.signup.emailPlaceholder}
                    value={signupData.email}
                    onChange={e => setSignupData(d => ({ ...d, email: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">{tr.signup.passwordLabel}</label>
                  <input
                    type="password"
                    placeholder={tr.signup.passwordPlaceholder}
                    value={signupData.password}
                    onChange={e => setSignupData(d => ({ ...d, password: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/20 focus:border-stone-400 transition-all"
                  />
                </div>

                {/* Error */}
                {signupError && (
                  <div className="flex items-start gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {signupError}
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSignup}
                  disabled={signupLoading || slugStatus !== "available" || !signupData.email || signupData.password.length < 6}
                  className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium text-sm hover:bg-stone-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {signupLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />{tr.signup.submitting}</>
                  ) : (
                    tr.signup.submit
                  )}
                </button>

                <p className="text-center text-xs text-stone-400">
                  {tr.signup.loginLink}{" "}
                  <a href={APP_URL} className="text-stone-600 underline underline-offset-2 hover:text-stone-900">{tr.signup.loginCta}</a>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
