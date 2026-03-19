import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Camera, Heart, Users } from "lucide-react";

// ─── Shared data ──────────────────────────────────────────────────────────────

const testimonials = [
  {
    initials: "A.M.",
    name: "Antoine M.",
    role: "Photographe de mariage",
    location: "Lyon",
    color: "#6366F1",
    bg: "from-indigo-100 to-violet-50",
    icon: "camera",
    quote:
      "J'ai livré la galerie de Sarah et Thomas le lendemain du mariage à 10h du matin. Mes clients n'en revenaient pas. Avant Picktur, j'avais besoin d'une semaine entière pour trier 4 000 photos — maintenant l'IA le fait pendant que je dors.",
    shortQuote: "Livraison le lendemain. Mes clients n'en revenaient pas.",
    detail: "4 200 photos · Mariage à Lyon · Livré en 18h",
  },
  {
    initials: "J.P.",
    name: "Jennifer P.",
    role: "Mariée",
    location: "Paris",
    color: "#E879A0",
    bg: "from-pink-100 to-rose-50",
    icon: "heart",
    quote:
      "Ça fait un an que je me suis mariée et je n'avais toujours pas ouvert le WeTransfer de mon photographe — pourtant j'avais déjà payé pour des albums physiques. La vie après le mariage a fait que je n'ai tout simplement pas eu le temps. Picktur m'a non seulement permis de voir les photos de mon mariage d'une façon différente et innovante, mais en plus de les partager à mes invités — et cerise sur le gâteau, de pouvoir trier les plus belles et enfin constituer mon album.",
    shortQuote: "Un an après, j'ai enfin vu mes photos de mariage grâce à Picktur.",
    detail: "Mariée · Paris · Mars 2025",
  },
  {
    initials: "M.L.",
    name: "Marc L.",
    role: "Invité",
    location: "Bordeaux",
    color: "#10B981",
    bg: "from-emerald-100 to-teal-50",
    icon: "users",
    quote:
      "Je ne m'attendais vraiment pas à retrouver mes photos aussi facilement. Un selfie depuis mon téléphone, et j'avais accès à toutes les photos où j'apparais — en HD. J'en ai retrouvé que je n'aurais jamais pensé voir.",
    shortQuote: "Un selfie. Toutes mes photos. En HD.",
    detail: "Invité · Mariage en Gironde",
  },
];

const STARS = [1, 2, 3, 4, 5];

function StarRow({ highlight = false }: { highlight?: boolean }) {
  return (
    <div className="flex gap-0.5 mb-4">
      {STARS.map((s) => (
        <Star key={s} className={`w-4 h-4 fill-current ${highlight ? "text-amber-300" : "text-amber-400"}`} />
      ))}
    </div>
  );
}

function Avatar({ t, size = "md" }: { t: typeof testimonials[0]; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-14 h-14 text-base" : size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ background: t.color }}
    >
      {t.initials}
    </div>
  );
}

// ─── Option A — 3 cartes en grille ────────────────────────────────────────────

function OptionA() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {testimonials.map((t, i) => {
        const highlight = i === 0; // photographe highlighted
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl p-7 flex flex-col ${
              highlight
                ? "bg-stone-900 text-white shadow-2xl"
                : "bg-white border border-stone-200 shadow-sm"
            }`}
          >
            <StarRow highlight={highlight} />
            <p className={`text-sm leading-relaxed flex-1 mb-6 ${highlight ? "text-white/80" : "text-stone-600"}`}>
              "{t.quote}"
            </p>
            <div className="flex items-center gap-3">
              <Avatar t={t} />
              <div>
                <div className={`font-semibold text-sm ${highlight ? "text-white" : "text-stone-900"}`}>
                  {t.name}
                </div>
                <div className={`text-xs ${highlight ? "text-white/50" : "text-stone-400"}`}>
                  {t.role} · {t.location}
                </div>
              </div>
            </div>
            <div className={`mt-4 text-xs px-3 py-1.5 rounded-full border inline-block self-start ${
              highlight ? "border-white/20 text-white/40" : "border-stone-100 text-stone-300"
            }`}>
              {t.detail}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Option B — Featured large + 2 petites ────────────────────────────────────

function OptionB() {
  const [main, rest] = [testimonials[0], testimonials.slice(1)];
  return (
    <div className="space-y-6">
      {/* Featured */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-10 flex flex-col md:flex-row gap-8 items-start shadow-2xl"
      >
        <div className="flex-1">
          <StarRow highlight />
          <p className="text-white/90 text-lg leading-relaxed mb-8">"{main.quote}"</p>
          <div className="flex items-center gap-4">
            <Avatar t={main} size="lg" />
            <div>
              <div className="text-white font-bold text-base">{main.name}</div>
              <div className="text-white/50 text-sm">{main.role} · {main.location}</div>
            </div>
          </div>
        </div>
        <div className="md:w-56 bg-white/8 border border-white/10 rounded-xl p-5 flex-shrink-0">
          <Camera className="w-6 h-6 text-indigo-400 mb-3" />
          <div className="text-white font-bold text-sm mb-1">Ce que ça change</div>
          <div className="text-white/50 text-xs leading-relaxed">{main.detail}</div>
        </div>
      </motion.div>

      {/* 2 petites */}
      <div className="grid md:grid-cols-2 gap-6">
        {rest.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm"
          >
            <StarRow />
            <p className="text-stone-600 text-sm leading-relaxed flex-1 mb-5">"{t.quote}"</p>
            <div className="flex items-center gap-3">
              <Avatar t={t} />
              <div>
                <div className="font-semibold text-sm text-stone-900">{t.name}</div>
                <div className="text-xs text-stone-400">{t.role} · {t.location}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Option C — Carousel ──────────────────────────────────────────────────────

const AUTOPLAY_DELAY = 3000;

function OptionC() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const t = testimonials[active];

  const next = () => {
    setActive((a) => (a + 1) % testimonials.length);
    setProgress(0);
  };

  // Autoplay
  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(next, AUTOPLAY_DELAY);
    return () => clearInterval(intervalRef.current!);
  }, [active, paused]);

  // Progress bar tick
  useEffect(() => {
    if (paused) return;
    setProgress(0);
    const step = 100 / (AUTOPLAY_DELAY / 50);
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + step, 100));
    }, 50);
    return () => clearInterval(progressRef.current!);
  }, [active, paused]);

  const goTo = (i: number) => {
    setActive(i);
    setProgress(0);
  };

  return (
    <div
      className="max-w-2xl mx-auto"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Tabs */}
      <div className="flex justify-center gap-3 mb-8">
        {testimonials.map((item, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              active === i
                ? "bg-stone-900 text-white shadow-md"
                : "bg-white border border-stone-200 text-stone-500 hover:border-stone-300"
            }`}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ background: item.color }}
            >
              {item.initials.split(".")[0]}
            </span>
            {item.role.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="bg-white border border-stone-200 rounded-2xl p-10 shadow-sm overflow-hidden relative"
        >
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 h-0.5 bg-stone-100 w-full">
            <motion.div
              className="h-full bg-stone-400"
              style={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>

          <StarRow />
          <p className="text-stone-700 text-xl leading-relaxed mb-8 font-light">"{t.quote}"</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar t={t} size="lg" />
              <div>
                <div className="font-bold text-stone-900">{t.name}</div>
                <div className="text-sm text-stone-400">{t.role} · {t.location}</div>
              </div>
            </div>
            <div className="text-xs text-stone-300 border border-stone-100 rounded-full px-3 py-1.5 hidden md:block">
              {t.detail}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav arrows */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={() => goTo((active - 1 + testimonials.length) % testimonials.length)}
          className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:border-stone-400 transition-all bg-white"
        >
          <ChevronLeft className="w-4 h-4 text-stone-600" />
        </button>
        <div className="flex items-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all ${
                active === i ? "w-6 h-2 bg-stone-900" : "w-2 h-2 bg-stone-200 hover:bg-stone-300"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => goTo((active + 1) % testimonials.length)}
          className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:border-stone-400 transition-all bg-white"
        >
          <ChevronRight className="w-4 h-4 text-stone-600" />
        </button>
      </div>
    </div>
  );
}

// ─── Option D — Double marquee infini ─────────────────────────────────────────

const marqueeCards = [
  {
    initials: "A.M.", name: "Antoine M.", role: "Photographe", location: "Lyon", color: "#6366F1",
    headline: "Livré le lendemain à 10h.",
    quote: "Avant Picktur, j'avais besoin d'une semaine pour trier 4 000 photos. Maintenant l'IA le fait pendant que je dors.",
  },
  {
    initials: "J.P.", name: "Jennifer P.", role: "Mariée", location: "Paris", color: "#E879A0",
    headline: "Un an après, j'ai enfin vu mes photos.",
    quote: "Je n'avais toujours pas ouvert le WeTransfer de mon photographe. Picktur m'a permis de voir mes photos, les partager, et enfin constituer mon album.",
  },
  {
    initials: "M.L.", name: "Marc L.", role: "Invité", location: "Bordeaux", color: "#10B981",
    headline: "Un selfie. Toutes mes photos.",
    quote: "Je ne m'attendais pas à retrouver mes photos aussi facilement. Un selfie depuis mon téléphone et j'avais tout, en HD.",
  },
  {
    initials: "S.R.", name: "Sophie R.", role: "Photographe", location: "Bordeaux", color: "#8B5CF6",
    headline: "Mes clients sélectionnent leur album tout seuls.",
    quote: "Plus besoin de passer des heures au téléphone pour valider chaque photo. Le client ouvre sa galerie, sélectionne, et me renvoie sa liste.",
  },
  {
    initials: "T.B.", name: "Thomas B.", role: "Marié", location: "Nice", color: "#F59E0B",
    headline: "Nos invités ont adoré retrouver leurs photos.",
    quote: "On a partagé le lien au dessert. Le lendemain matin, les messages de nos invités ne s'arrêtaient plus — ils adoraient retrouver leurs moments.",
  },
  {
    initials: "L.D.", name: "Lucas D.", role: "Photographe", location: "Paris", color: "#06B6D4",
    headline: "Le tri IA m'a changé la vie.",
    quote: "Picktur analyse mes photos sur 26 critères pendant que je conduis pour rentrer chez moi. En arrivant, la sélection est prête.",
  },
];

function MarqueeRow({ cards, reverse = false }: { cards: typeof marqueeCards; reverse?: boolean }) {
  const doubled = [...cards, ...cards];
  return (
    <div className="overflow-hidden">
      <div
        className="flex gap-5"
        style={{
          animation: `marquee${reverse ? "R" : "L"} 28s linear infinite`,
          width: "max-content",
        }}
      >
        {doubled.map((c, i) => (
          <div
            key={i}
            className="bg-white border border-stone-200 rounded-2xl p-7 shadow-sm flex-shrink-0"
            style={{ width: 340 }}
          >
            {/* Stars */}
            <div className="flex gap-0.5 mb-3">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            {/* Headline */}
            <div className="font-bold text-stone-900 text-base mb-2">{c.headline}</div>
            {/* Quote */}
            <p className="text-stone-500 text-sm leading-relaxed mb-6">"{c.quote}"</p>
            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: c.color }}>
                {c.initials}
              </div>
              <div>
                <div className="font-semibold text-sm text-stone-900">{c.name}</div>
                <div className="text-xs text-stone-400">{c.role} · {c.location}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OptionD() {
  return (
    <div className="relative">
      <style>{`
        @keyframes marqueeL {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marqueeR {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FAFAF8] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#FAFAF8] to-transparent z-10 pointer-events-none" />

      <div className="space-y-5">
        <MarqueeRow cards={marqueeCards} />
        <MarqueeRow cards={[...marqueeCards].reverse()} reverse />
      </div>
    </div>
  );
}

// ─── Sandbox wrapper ──────────────────────────────────────────────────────────

export default function TestimonialSandbox() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] antialiased" style={{ fontFamily: "'Open Sauce Sans', system-ui, sans-serif" }}>
      <div className="py-16 space-y-24">

        {/* Header */}
        <div className="text-center px-6">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Testimonials — 4 options</h1>
          <p className="text-stone-400 text-sm">Accès via <code className="bg-stone-100 px-1.5 py-0.5 rounded text-xs">/testimonials</code></p>
        </div>

        {/* Option D — en premier car c'est le nouveau */}
        <section>
          <div className="flex items-center gap-4 mb-8 px-6">
            <div className="bg-violet-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">Option D ✨ Nouveau</div>
            <div>
              <div className="font-semibold text-stone-900">Double marquee infini</div>
              <div className="text-xs text-stone-400">2 rangées · sens opposés · cartes larges · défilement continu · style taap.it</div>
            </div>
          </div>
          <OptionD />
        </section>

        <div className="h-px bg-stone-200 mx-6" />

        {/* Option A */}
        <section className="px-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">Option A</div>
            <div>
              <div className="font-semibold text-stone-900">3 cartes en grille</div>
              <div className="text-xs text-stone-400">Photographe mis en avant (carte foncée) · Simple · Consistant avec la page</div>
            </div>
          </div>
          <OptionA />
        </section>

        <div className="h-px bg-stone-200 mx-6" />

        {/* Option B */}
        <section className="px-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">Option B</div>
            <div>
              <div className="font-semibold text-stone-900">Featured large + 2 petites</div>
              <div className="text-xs text-stone-400">Photographe en vedette · Plus d'impact · Prend plus de place</div>
            </div>
          </div>
          <OptionB />
        </section>

        <div className="h-px bg-stone-200 mx-6" />

        {/* Option C */}
        <section className="px-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-stone-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">Option C</div>
            <div>
              <div className="font-semibold text-stone-900">Carousel avec tabs</div>
              <div className="text-xs text-stone-400">Une citation à la fois · Focus sur le texte · Interactif · Idéal mobile</div>
            </div>
          </div>
          <OptionC />
        </section>

        <div className="pb-16 px-6" />
      </div>
    </div>
  );
}
