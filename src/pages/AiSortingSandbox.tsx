import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, animate } from "framer-motion";
import {
  Camera, Zap, Check, X, Award, Star, ScanSearch,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONCEPT 1 — "Le Scanner"
//
// Une seule photo de mariage est analysée en profondeur.
// Un faisceau de scan traverse l'image. Des badges de critères apparaissent
// un par un avec leur impact sur le score. Verdict final : "Top Shot 94/100".
// ─────────────────────────────────────────────────────────────────────────────

const SCAN_PHOTO = "photo-1519741497674-611481863552";

// Impacts summed = 94 (clean "score out of 94 → 100%" mapping)
const SCAN_CRITERIA = [
  {
    label: "Netteté sur les yeux",
    impact: 12,
    category: "Technique",
    color: "#06B6D4",
    dot: { x: 43, y: 42 },
    badge: { x: 3, y: 7 },
    lineEnd: { x: 22, y: 20 },
    delay: 0.9,
  },
  {
    label: "Lumière sublimée",
    impact: 14,
    category: "Technique",
    color: "#F59E0B",
    dot: { x: 68, y: 22 },
    badge: { x: 3, y: 28 },
    lineEnd: { x: 22, y: 34 },
    delay: 1.9,
  },
  {
    label: "Émotion de pointe",
    impact: 18,
    category: "Expression",
    color: "#EC4899",
    dot: { x: 46, y: 50 },
    badge: { x: 3, y: 49 },
    lineEnd: { x: 22, y: 52 },
    delay: 2.9,
  },
  {
    label: "2 sourires authentiques",
    impact: 10,
    category: "Expression",
    color: "#8B5CF6",
    dot: { x: 50, y: 58 },
    badge: { x: 3, y: 70 },
    lineEnd: { x: 22, y: 67 },
    delay: 3.9,
  },
  {
    label: "Composition experte",
    impact: 14,
    category: "Composition",
    color: "#10B981",
    dot: { x: 52, y: 38 },
    badge: { x: 60, y: 7 },
    lineEnd: { x: 60, y: 20 },
    delay: 4.9,
  },
  {
    label: "Mariée : souriante & nette",
    impact: 26,
    category: "Mariée",
    color: "#E879A0",
    dot: { x: 37, y: 44 },
    badge: { x: 60, y: 38 },
    lineEnd: { x: 58, y: 42 },
    delay: 5.9,
  },
];

const SCAN_TOTAL = SCAN_CRITERIA.reduce((s, c) => s + c.impact, 0); // 94

const MINI_GALLERY = [
  { src: "photo-1519741497674-611481863552", score: 94, verdict: "top" },
  { src: "photo-1606800052052-a08af7148866", score: 87, verdict: "top" },
  { src: "photo-1567521464027-f127ff144326", score: 79, verdict: "select" },
  { src: "photo-1583939003579-730e3918a45a", score: 47, verdict: "reject" },
  { src: "photo-1511285560929-80b456fea0bc", score: 34, verdict: "reject" },
];

type ScanPhase = "idle" | "scanning" | "verdict";

function Concept1Scanner() {
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [visibleCriteria, setVisibleCriteria] = useState<number[]>([]);
  const [displayScore, setDisplayScore] = useState(0);
  const [showVerdict, setShowVerdict] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-60px" });
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const t = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const runSequence = () => {
    setPhase("scanning");
    setVisibleCriteria([]);
    setDisplayScore(0);
    setShowVerdict(false);
    setShowGallery(false);

    let scoreSoFar = 0;
    SCAN_CRITERIA.forEach((c, i) => {
      t(() => {
        setVisibleCriteria((prev) => [...prev, i]);
        const from = scoreSoFar;
        const to = scoreSoFar + c.impact;
        scoreSoFar = to;
        animate(from, to, {
          duration: 0.7,
          ease: "easeOut",
          onUpdate: (v) => setDisplayScore(Math.round(v)),
        });
      }, c.delay * 1000);
    });

    // Verdict
    t(() => {
      setPhase("verdict");
      setShowVerdict(true);
    }, 7600);
    t(() => setShowGallery(true), 8400);

    // Loop
    t(() => {
      setPhase("idle");
      setVisibleCriteria([]);
      setDisplayScore(0);
      setShowVerdict(false);
      setShowGallery(false);
      t(runSequence, 400);
    }, 13500);
  };

  useEffect(() => {
    if (inView && phase === "idle") {
      t(runSequence, 600);
    }
    return clearAllTimers;
  }, [inView]);

  const pct = Math.round((displayScore / SCAN_TOTAL) * 100);
  const showAnnotations = phase === "scanning" || phase === "verdict";

  return (
    <div
      ref={ref}
      className="relative w-full rounded-3xl overflow-hidden select-none"
      style={{ aspectRatio: "16/9" }}
    >
      {/* Photo */}
      <img
        src={`https://images.unsplash.com/${SCAN_PHOTO}?w=1400&q=80`}
        alt="Wedding photo analysis"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40" />

      {/* ── Scanning beam ── */}
      <AnimatePresence>
        {phase === "scanning" && (
          <motion.div
            key="beam"
            className="absolute top-0 bottom-0 w-px pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(180deg, transparent 0%, #a78bfa 25%, #e879f9 50%, #a78bfa 75%, transparent 100%)",
              boxShadow: "0 0 18px 4px rgba(167,139,250,0.5)",
            }}
            initial={{ left: "0%" }}
            animate={{ left: "100%" }}
            transition={{ duration: 7, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      {/* ── SVG annotation lines ── */}
      <AnimatePresence>
        {showAnnotations && (
          <motion.svg
            key="scan-svg"
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <defs>
              <marker id="arrow-c1" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                <path d="M 0 0 L 5 2.5 L 0 5 z" fill="white" fillOpacity="0.7" />
              </marker>
              <filter id="glow-c1">
                <feGaussianBlur stdDeviation="0.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {SCAN_CRITERIA.map((c, i) => {
              if (!visibleCriteria.includes(i)) return null;
              const mx = (c.lineEnd.x + c.dot.x) / 2;
              const my = (c.lineEnd.y + c.dot.y) / 2 - 3;
              return (
                <motion.path
                  key={i}
                  d={`M ${c.lineEnd.x} ${c.lineEnd.y} Q ${mx} ${my} ${c.dot.x} ${c.dot.y}`}
                  fill="none"
                  stroke="white"
                  strokeWidth="0.35"
                  strokeOpacity="0.7"
                  markerEnd="url(#arrow-c1)"
                  filter="url(#glow-c1)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              );
            })}
          </motion.svg>
        )}
      </AnimatePresence>

      {/* ── Annotation dots ── */}
      <AnimatePresence>
        {showAnnotations &&
          SCAN_CRITERIA.map((c, i) =>
            visibleCriteria.includes(i) ? (
              <motion.div
                key={`dot-c1-${i}`}
                className="absolute pointer-events-none"
                style={{ left: `${c.dot.x}%`, top: `${c.dot.y}%`, transform: "translate(-50%,-50%)" }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <motion.div
                  className="absolute rounded-full"
                  style={{ width: 26, height: 26, marginLeft: -13, marginTop: -13, background: c.color, opacity: 0.3 }}
                  animate={{ scale: [1, 2.4, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div
                  className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg"
                  style={{ background: c.color, marginLeft: -7, marginTop: -7 }}
                />
              </motion.div>
            ) : null
          )}
      </AnimatePresence>

      {/* ── Criteria badges ── */}
      <AnimatePresence>
        {showAnnotations &&
          SCAN_CRITERIA.map((c, i) =>
            visibleCriteria.includes(i) ? (
              <motion.div
                key={`badge-c1-${i}`}
                className="absolute"
                style={{ left: `${c.badge.x}%`, top: `${c.badge.y}%` }}
                initial={{ opacity: 0, x: i < 4 ? -20 : 20, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              >
                <div
                  className="rounded-2xl px-3.5 py-2.5 shadow-2xl border border-white/20 backdrop-blur-md min-w-[148px]"
                  style={{ background: `linear-gradient(135deg, ${c.color}cc, ${c.color}88)` }}
                >
                  <div className="text-[9px] text-white/70 uppercase tracking-widest font-semibold mb-0.5">
                    {c.category}
                  </div>
                  <div className="text-white font-bold text-sm leading-tight">{c.label}</div>
                  <div className="text-white/80 text-[11px] font-bold mt-1">
                    <span className="text-white/90">+{c.impact} pts</span>
                  </div>
                </div>
              </motion.div>
            ) : null
          )}
      </AnimatePresence>

      {/* ── Score counter top-right ── */}
      <AnimatePresence>
        {showAnnotations && (
          <motion.div
            key="score-c1"
            className="absolute top-4 right-4 z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.4 } }}
          >
            <div className="bg-black/55 backdrop-blur-xl border border-white/15 rounded-2xl px-5 py-3 text-center shadow-2xl">
              <div className="text-white/50 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1.5 justify-center">
                <Zap className="w-3 h-3 text-amber-400" />
                Score IA
              </div>
              <div className="flex items-end gap-1 justify-center">
                <span className="text-white font-black text-4xl tabular-nums leading-none">{displayScore}</span>
                <span className="text-white/40 text-xl font-bold mb-0.5">/ {SCAN_TOTAL}</span>
              </div>
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden w-36 mx-auto">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400"
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Verdict overlay ── */}
      <AnimatePresence>
        {showVerdict && (
          <motion.div
            key="verdict"
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="bg-black/70 backdrop-blur-2xl border border-amber-400/40 rounded-3xl px-12 py-8 text-center shadow-2xl"
            >
              <div className="text-amber-400 text-xs uppercase tracking-[0.25em] font-bold mb-3 flex items-center gap-2 justify-center">
                <Award className="w-4 h-4" />
                TOP SHOT
              </div>
              <div className="text-white font-black text-8xl leading-none mb-1">{SCAN_TOTAL}</div>
              <div className="text-white/40 text-lg font-bold">/ {SCAN_TOTAL} pts</div>
              <div className="mt-4 flex gap-2 justify-center flex-wrap">
                <span className="text-[10px] bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 rounded-full px-2.5 py-1">
                  Technique ✓
                </span>
                <span className="text-[10px] bg-pink-500/20 border border-pink-400/30 text-pink-300 rounded-full px-2.5 py-1">
                  Expression ✓
                </span>
                <span className="text-[10px] bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-full px-2.5 py-1">
                  Composition ✓
                </span>
                <span className="text-[10px] bg-rose-500/20 border border-rose-400/30 text-rose-300 rounded-full px-2.5 py-1">
                  Mariée ✓
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mini gallery strip ── */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            key="gallery-strip"
            className="absolute bottom-20 inset-x-0 flex justify-center gap-2.5 z-10 px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            {MINI_GALLERY.map((photo, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 24 }}
                className={`relative rounded-xl overflow-hidden border-2 shadow-xl ${
                  photo.verdict === "top"
                    ? "border-amber-400/60"
                    : photo.verdict === "select"
                    ? "border-emerald-400/40"
                    : "border-stone-600/40"
                }`}
                style={{ width: "9%", aspectRatio: "2/3" }}
              >
                <img
                  src={`https://images.unsplash.com/${photo.src}?w=180&q=70`}
                  alt=""
                  className={`w-full h-full object-cover ${photo.verdict === "reject" ? "grayscale opacity-40" : ""}`}
                />
                <div
                  className={`absolute inset-0 ${
                    photo.verdict === "top"
                      ? "bg-amber-500/10"
                      : photo.verdict === "select"
                      ? "bg-emerald-500/10"
                      : "bg-black/40"
                  }`}
                />
                {/* Score label */}
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-center py-0.5">
                  <span className="text-white font-black text-[11px]">{photo.score}</span>
                </div>
                {/* Icon */}
                <div
                  className={`absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center ${
                    photo.verdict === "top"
                      ? "bg-amber-500"
                      : photo.verdict === "select"
                      ? "bg-emerald-500"
                      : "bg-stone-600"
                  }`}
                >
                  {photo.verdict === "reject" ? (
                    <X className="w-2 h-2 text-white" />
                  ) : photo.verdict === "top" ? (
                    <Star className="w-2 h-2 text-white fill-white" />
                  ) : (
                    <Check className="w-2 h-2 text-white" />
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom title ── */}
      <div className="absolute inset-x-0 bottom-0 p-8">
        <AnimatePresence mode="wait">
          {phase === "scanning" && (
            <motion.div
              key="title-scan"
              className="text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                L'IA analyse{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-pink-300">
                  chaque détail.
                </span>
              </h2>
              <p className="text-white/50 text-base mt-2">
                26 critères · Technique, expression, composition, rôles
              </p>
            </motion.div>
          )}
          {phase === "verdict" && (
            <motion.div
              key="title-verdict"
              className="text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                Vos{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-rose-300">
                  meilleures photos
                </span>{" "}
                remontent seules.
              </h2>
              <p className="text-white/50 text-base mt-2">
                Top shots identifiés automatiquement · Sélection album en 2 minutes
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// CONCEPT 2 — "La Cascade"
//
// Une grille de 12 photos. Un faisceau descend rangée par rangée.
// Chaque photo révèle son score en direct. Verdict final avec comptage.
// ─────────────────────────────────────────────────────────────────────────────

const GRID_PHOTOS = [
  // Row 0
  { src: "photo-1519741497674-611481863552", score: 94, verdict: "top" as const },
  { src: "photo-1606800052052-a08af7148866", score: 87, verdict: "top" as const },
  { src: "photo-1530023367847-a683933f4172", score: 89, verdict: "top" as const },
  { src: "photo-1583939003579-730e3918a45a", score: 61, verdict: "review" as const },
  // Row 1
  { src: "photo-1567521464027-f127ff144326", score: 82, verdict: "top" as const },
  { src: "photo-1606216794074-735e91aa2c92", score: 75, verdict: "select" as const },
  { src: "photo-1511285560929-80b456fea0bc", score: 34, verdict: "reject" as const },
  { src: "photo-1504438190342-5951e134ffee", score: 71, verdict: "select" as const },
  // Row 2
  { src: "photo-1469371670807-013ccf25f16a", score: 43, verdict: "reject" as const },
  { src: "photo-1513278974582-3e1b4a4fa21e", score: 68, verdict: "select" as const },
  { src: "photo-1465495976277-4387d4b0b4c6", score: 38, verdict: "reject" as const },
  { src: "photo-1580215268843-e01e32cfdb08", score: 55, verdict: "review" as const },
];

type GridPhase = "idle" | "scanning" | "sorted";
type Verdict = "top" | "select" | "review" | "reject";

const VERDICT_STYLE: Record<Verdict, { label: string; badgeBg: string; textColor: string; iconBg: string }> = {
  top:    { label: "Top Shot",  badgeBg: "bg-amber-500/90",   textColor: "text-amber-50",   iconBg: "bg-amber-500" },
  select: { label: "Sélection", badgeBg: "bg-emerald-600/90", textColor: "text-emerald-50", iconBg: "bg-emerald-500" },
  review: { label: "À revoir",  badgeBg: "bg-stone-700/90",   textColor: "text-stone-200",  iconBg: "bg-stone-500" },
  reject: { label: "Écarté",    badgeBg: "bg-red-900/90",     textColor: "text-red-200",    iconBg: "bg-red-600" },
};

function Concept2Cascade() {
  const [phase, setPhase] = useState<GridPhase>("idle");
  const [revealedScores, setRevealedScores] = useState<Set<number>>(new Set());
  const [photoScores, setPhotoScores] = useState<number[]>(new Array(12).fill(0));
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-60px" });
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const t = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  const revealPhoto = (idx: number, targetScore: number) => {
    setRevealedScores((prev) => new Set([...prev, idx]));
    animate(0, targetScore, {
      duration: 0.55,
      ease: "easeOut",
      onUpdate: (v) =>
        setPhotoScores((prev) => {
          const next = [...prev];
          next[idx] = Math.round(v);
          return next;
        }),
    });
  };

  const runSequence = () => {
    setPhase("scanning");
    setRevealedScores(new Set());
    setPhotoScores(new Array(12).fill(0));

    // Row 0 (indices 0-3): reveal at t=700ms, stagger 220ms
    [0, 1, 2, 3].forEach((i, j) =>
      t(() => revealPhoto(i, GRID_PHOTOS[i].score), 700 + j * 220)
    );
    // Row 1 (indices 4-7): t=2200ms
    [4, 5, 6, 7].forEach((i, j) =>
      t(() => revealPhoto(i, GRID_PHOTOS[i].score), 2200 + j * 220)
    );
    // Row 2 (indices 8-11): t=3700ms
    [8, 9, 10, 11].forEach((i, j) =>
      t(() => revealPhoto(i, GRID_PHOTOS[i].score), 3700 + j * 220)
    );

    t(() => setPhase("sorted"), 5400);

    // Loop
    t(() => {
      setPhase("idle");
      setRevealedScores(new Set());
      setPhotoScores(new Array(12).fill(0));
      t(runSequence, 400);
    }, 11500);
  };

  useEffect(() => {
    if (inView && phase === "idle") {
      t(runSequence, 600);
    }
    return clearAllTimers;
  }, [inView]);

  const topCount = GRID_PHOTOS.filter((p) => p.verdict === "top").length;
  const selectCount = GRID_PHOTOS.filter((p) => p.verdict === "select").length;
  const reviewCount = GRID_PHOTOS.filter((p) => p.verdict === "review").length;
  const rejectCount = GRID_PHOTOS.filter((p) => p.verdict === "reject").length;
  const processedCount = revealedScores.size;

  return (
    <div ref={ref} className="relative rounded-3xl overflow-hidden bg-stone-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
            <Camera className="w-3.5 h-3.5" />
            Mariage Sophie &amp; Thomas · 4&nbsp;847 photos importées
          </div>
          <AnimatePresence mode="wait">
            {phase === "scanning" && (
              <motion.p
                key="status-scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-violet-300 text-sm font-semibold flex items-center gap-2"
              >
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                >
                  <ScanSearch className="w-4 h-4 inline" />
                </motion.span>
                Analyse IA en cours · {processedCount} / {GRID_PHOTOS.length} photos traitées
              </motion.p>
            )}
            {phase === "sorted" && (
              <motion.p
                key="status-done"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-emerald-400 text-sm font-semibold flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Tri terminé · {topCount + selectCount} sélectionnées · {rejectCount} écartées · 8h économisées
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {phase === "sorted" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-1.5 flex-wrap justify-end"
            >
              <div className="bg-amber-500/20 border border-amber-500/30 rounded-full px-2.5 py-1 text-amber-400 text-xs font-semibold">
                {topCount} Top
              </div>
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-full px-2.5 py-1 text-emerald-400 text-xs font-semibold">
                {selectCount} Sélection
              </div>
              <div className="bg-stone-500/20 border border-stone-500/30 rounded-full px-2.5 py-1 text-stone-400 text-xs font-semibold">
                {reviewCount} À revoir
              </div>
              <div className="bg-red-900/30 border border-red-700/30 rounded-full px-2.5 py-1 text-red-400 text-xs font-semibold">
                {rejectCount} Écartées
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid */}
      <div className="relative">
        {/* Scanner beam */}
        {phase === "scanning" && (
          <motion.div
            className="absolute left-0 right-0 z-20 pointer-events-none"
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 5, ease: "linear" }}
            style={{ top: "0%" }}
          >
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-violet-400 to-transparent shadow-[0_0_12px_2px_rgba(167,139,250,0.8)]" />
            <div className="h-10 w-full bg-gradient-to-b from-violet-400/15 to-transparent" />
          </motion.div>
        )}

        <div className="grid grid-cols-4 gap-2" style={{ gridAutoRows: "90px" }}>
          {GRID_PHOTOS.map((photo, i) => {
            const isRevealed = revealedScores.has(i);
            const style = VERDICT_STYLE[photo.verdict];
            const currentScore = photoScores[i];
            const isDimmed = photo.verdict === "reject" && phase === "sorted";

            return (
              <motion.div
                key={i}
                className="relative rounded-xl overflow-hidden"
                animate={{
                  opacity: isDimmed ? 0.35 : 1,
                  scale: isDimmed ? 0.96 : 1,
                  filter: isDimmed ? "grayscale(90%)" : "none",
                }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <img
                  src={`https://images.unsplash.com/${photo.src}?w=300&q=70`}
                  alt=""
                  className="w-full h-full object-cover"
                />

                {/* Unrevealed overlay */}
                {!isRevealed && (
                  <div className="absolute inset-0 bg-black/65 flex items-center justify-center">
                    <motion.div
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                      className="w-5 h-5 rounded-full border-2 border-white/30"
                    />
                  </div>
                )}

                {/* Score badge (revealed) */}
                {isRevealed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    {/* Colored border glow */}
                    <div
                      className={`absolute inset-0 rounded-xl border-2 ${
                        photo.verdict === "top"
                          ? "border-amber-400/70"
                          : photo.verdict === "select"
                          ? "border-emerald-400/60"
                          : photo.verdict === "review"
                          ? "border-stone-400/30"
                          : "border-red-700/40"
                      }`}
                    />
                    {/* Bottom bar */}
                    <div
                      className={`absolute bottom-0 inset-x-0 ${style.badgeBg} border-t border-white/10 backdrop-blur-sm px-1.5 py-1 flex items-center justify-between`}
                    >
                      <span className={`${style.textColor} text-[9px] font-bold truncate`}>
                        {style.label}
                      </span>
                      <span className={`${style.textColor} text-sm font-black tabular-nums`}>
                        {currentScore}
                      </span>
                    </div>
                    {/* Corner badge */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.3 }}
                      className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full ${style.iconBg} flex items-center justify-center shadow-lg`}
                    >
                      {photo.verdict === "top" && <Star className="w-2.5 h-2.5 text-white fill-white" />}
                      {photo.verdict === "select" && <Check className="w-2.5 h-2.5 text-white" />}
                      {photo.verdict === "review" && (
                        <span className="text-white text-[8px] font-black">?</span>
                      )}
                      {photo.verdict === "reject" && <X className="w-2.5 h-2.5 text-white" />}
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom title */}
      <AnimatePresence>
        {phase === "sorted" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-5 text-center"
          >
            <h3 className="text-white text-2xl font-serif font-bold mb-1">
              Vos 4&nbsp;847 photos triées en 2 minutes.
            </h3>
            <p className="text-white/40 text-sm">
              26 critères par photo · Vous ne regardez que les meilleures
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// SANDBOX PAGE
// ─────────────────────────────────────────────────────────────────────────────

function ConceptLabel({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 py-8">
      <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-white font-black text-sm flex-shrink-0 mt-0.5">
        {number}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-stone-900">{title}</h2>
        <p className="text-stone-400 text-sm mt-1">{description}</p>
      </div>
    </div>
  );
}

export default function AiSortingSandbox() {
  return (
    <div className="min-h-screen bg-[#F5F4F2]">
      <div className="bg-stone-900 text-white px-8 py-5 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold">Picktur</span>
          <span className="text-white/30 mx-2">·</span>
          <span className="text-white/50 text-sm">AI Sorting Sandbox</span>
        </div>
        <div className="flex gap-4 text-sm">
          <a href="/sandbox" className="text-white/40 hover:text-white transition-colors">
            ← Hero Sandbox
          </a>
          <a href="/" className="text-white/40 hover:text-white transition-colors">
            Landing page →
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-24">
        <ConceptLabel
          number="01"
          title="Le Scanner — Analyse Profonde"
          description="Une photo est scannée en temps réel. Les critères IA apparaissent un par un avec leur impact sur le score. Verdict final : Top Shot avec score et catégories."
        />
        <Concept1Scanner />

        <ConceptLabel
          number="02"
          title="La Cascade — Tri en Grille"
          description="12 photos défilent sous le faisceau IA. Chaque photo révèle son score en direct. Les Top Shots brillent, les mauvaises s'estompent. Comptage final automatique."
        />
        <Concept2Cascade />

        <div className="mt-16 p-6 bg-white rounded-2xl border border-stone-200 text-center">
          <p className="text-stone-400 text-sm">
            Sandbox — Picktur AI Sorting · Section "Tri IA intelligent"
          </p>
        </div>
      </div>
    </div>
  );
}
