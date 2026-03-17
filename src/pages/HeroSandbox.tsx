import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useAnimation, animate } from "framer-motion";
import { Eye, Layers, User, Check, Zap, Star, Camera, ScanFace, RefreshCw } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONCEPT 1 — Vision Augmentée
// Photo plein-écran. Séquence animée : lignes fléchées → badges → score monte
// ─────────────────────────────────────────────────────────────────────────────

const ANNOTATIONS = [
  {
    // Point sur la photo (% du container)
    dot: { x: 37, y: 26 },
    // Coin du badge (% du container)
    badge: { x: 2, y: 5 },
    // Centre approximatif du badge pour la ligne
    lineEnd: { x: 18, y: 10 },
    label: "Yeux ouverts",
    value: "✓",
    detail: "Les deux sujets détectés",
    color: "#6366F1",
    bg: "from-indigo-600/90 to-violet-600/90",
    points: 15,
    delay: 0.6,
  },
  {
    dot: { x: 50, y: 48 },
    badge: { x: 2, y: 38 },
    lineEnd: { x: 18, y: 43 },
    label: "Netteté",
    value: "97%",
    detail: "Mise au point parfaite",
    color: "#8B5CF6",
    bg: "from-violet-600/90 to-purple-600/90",
    points: 18,
    delay: 1.6,
  },
  {
    dot: { x: 30, y: 32 },
    badge: { x: 68, y: 5 },
    lineEnd: { x: 72, y: 10 },
    label: "Mariée présente",
    value: "✓",
    detail: "Visage identifié",
    color: "#E879A0",
    bg: "from-pink-500/90 to-rose-600/90",
    points: 20,
    delay: 2.6,
  },
  {
    dot: { x: 64, y: 30 },
    badge: { x: 68, y: 38 },
    lineEnd: { x: 72, y: 43 },
    label: "Marié présent",
    value: "✓",
    detail: "Visage identifié",
    color: "#06B6D4",
    bg: "from-cyan-500/90 to-blue-600/90",
    points: 20,
    delay: 3.6,
  },
  {
    dot: { x: 50, y: 65 },
    badge: { x: 30, y: 82 },
    lineEnd: { x: 46, y: 85 },
    label: "Composition",
    value: "Règle des tiers",
    detail: "Cadrage excellent",
    color: "#10B981",
    bg: "from-emerald-500/90 to-teal-600/90",
    points: 23,
    delay: 4.6,
  },
];

const TOTAL_SCORE = ANNOTATIONS.reduce((s, a) => s + a.points, 0); // 96

function Concept1() {
  const [step, setStep] = useState(-1);
  const [displayScore, setDisplayScore] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-80px" });

  const cumulativeScore = (upTo: number) =>
    ANNOTATIONS.slice(0, upTo + 1).reduce((s, a) => s + a.points, 0);

  const runSequence = () => {
    if (running) return;
    setRunning(true);
    setStep(-1);
    setDisplayScore(0);

    ANNOTATIONS.forEach((a, i) => {
      setTimeout(() => {
        setStep(i);
        const target = cumulativeScore(i);
        animate(i === 0 ? 0 : cumulativeScore(i - 1), target, {
          duration: 0.7,
          ease: "easeOut",
          onUpdate: (v) => setDisplayScore(Math.round(v)),
        });
      }, a.delay * 1000);
    });

    // Final score reveal
    setTimeout(() => {
      setRunning(false);
    }, (ANNOTATIONS[ANNOTATIONS.length - 1].delay + 1.5) * 1000);
  };

  const handleReplay = () => {
    setStep(-1);
    setDisplayScore(0);
    setRunning(false);
    setTimeout(runSequence, 100);
  };

  useEffect(() => {
    if (inView && !running && step === -1) {
      setTimeout(runSequence, 400);
    }
  }, [inView]);

  const pct = Math.round((displayScore / TOTAL_SCORE) * 100);

  return (
    <div
      ref={ref}
      className="relative w-full rounded-3xl overflow-hidden select-none"
      style={{ height: "88vh", minHeight: 580 }}
    >
      {/* Background photo */}
      <img
        src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80"
        alt="Wedding couple"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40" />

      {/* ── SVG layer for lines + arrowheads ── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <marker id="arrow-white" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 z" fill="white" fillOpacity="0.85" />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {ANNOTATIONS.map((a, i) => {
          const visible = step >= i;
          // quadratic bezier midpoint
          const mx = (a.lineEnd.x + a.dot.x) / 2;
          const my = (a.lineEnd.y + a.dot.y) / 2 - 5;
          return (
            <motion.path
              key={i}
              d={`M ${a.lineEnd.x} ${a.lineEnd.y} Q ${mx} ${my} ${a.dot.x} ${a.dot.y}`}
              fill="none"
              stroke="white"
              strokeWidth="0.45"
              strokeOpacity="0.85"
              markerEnd="url(#arrow-white)"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={visible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeInOut" }}
            />
          );
        })}
      </svg>

      {/* ── Annotation dots on photo ── */}
      {ANNOTATIONS.map((a, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: `${a.dot.x}%`,
            top: `${a.dot.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={step >= i ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 400, damping: 20 }}
        >
          {/* Outer pulse */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              width: 24, height: 24,
              marginLeft: -12, marginTop: -12,
              background: a.color,
              opacity: 0.3,
            }}
            animate={{ scale: [1, 2.2, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Inner dot */}
          <div
            className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
            style={{ background: a.color, marginLeft: -8, marginTop: -8 }}
          />
        </motion.div>
      ))}

      {/* ── Glassmorphism annotation badges ── */}
      {ANNOTATIONS.map((a, i) => (
        <motion.div
          key={`badge-${i}`}
          className="absolute"
          style={{ left: `${a.badge.x}%`, top: `${a.badge.y}%` }}
          initial={{ opacity: 0, x: i < 2 ? -20 : 20, scale: 0.85 }}
          animate={
            step >= i
              ? { opacity: 1, x: 0, scale: 1 }
              : { opacity: 0, x: i < 2 ? -20 : 20, scale: 0.85 }
          }
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <div
            className="rounded-2xl px-3.5 py-2.5 shadow-2xl border border-white/20 backdrop-blur-md min-w-[140px]"
            style={{ background: `linear-gradient(135deg, ${a.color}cc, ${a.color}99)` }}
          >
            <div className="text-[9px] text-white/70 uppercase tracking-widest font-semibold mb-0.5">
              {a.label}
            </div>
            <div className="text-white font-bold text-base leading-tight">{a.value}</div>
            <div className="text-white/60 text-[10px] mt-0.5">{a.detail}</div>
          </div>
        </motion.div>
      ))}

      {/* ── Central score badge ── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2">
        <motion.div
          className="bg-black/50 backdrop-blur-xl border border-white/15 rounded-2xl px-5 py-3 text-center shadow-2xl"
          initial={{ opacity: 0, y: -10 }}
          animate={step >= 0 ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-white/50 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1.5 justify-center">
            <Zap className="w-3 h-3 text-amber-400" />
            Score Picktur — Analyse IA
          </div>
          <div className="flex items-end gap-1 justify-center">
            <span className="text-white font-black text-4xl tabular-nums leading-none">{displayScore}</span>
            <span className="text-white/40 text-xl font-bold mb-0.5">/ {TOTAL_SCORE}</span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden w-40 mx-auto">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      </div>

      {/* ── Replay button ── */}
      {!running && step >= 0 && (
        <motion.button
          onClick={handleReplay}
          className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:text-white px-3 py-1.5 rounded-full text-xs transition-all"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="w-3 h-3" />
          Rejouer
        </motion.button>
      )}

      {/* ── Bottom title ── */}
      <div className="absolute inset-x-0 bottom-0 p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
            La plateforme qui{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-300 to-violet-300">
              révèle chaque mariage.
            </span>
          </h2>
          <p className="text-white/50 text-base mt-2">
            26 critères analysés · Résultat en quelques secondes
          </p>
        </motion.div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// CONCEPT 2 — Masonry Chaos to Order
// ─────────────────────────────────────────────────────────────────────────────

const MASONRY_PHOTOS = [
  { id: 1, src: "photo-1519741497674-611481863552", good: true, span: "row-span-2" },
  { id: 2, src: "photo-1583939003579-730e3918a45a", good: false, span: "row-span-1" },
  { id: 3, src: "photo-1606800052052-a08af7148866", good: true, span: "row-span-2" },
  { id: 4, src: "photo-1511285560929-80b456fea0bc", good: false, span: "row-span-1" },
  { id: 5, src: "photo-1567521464027-f127ff144326", good: true, span: "row-span-2" },
  { id: 6, src: "photo-1469371670807-013ccf25f16a", good: false, span: "row-span-1" },
  { id: 7, src: "photo-1606216794074-735e91aa2c92", good: true, span: "row-span-1" },
  { id: 8, src: "photo-1580215268843-e01e32cfdb08", good: false, span: "row-span-2" },
  { id: 9, src: "photo-1530023367847-a683933f4172", good: true, span: "row-span-2" },
  { id: 10, src: "photo-1465495976277-4387d4b0b4c6", good: false, span: "row-span-1" },
  { id: 11, src: "photo-1504438190342-5951e134ffee", good: true, span: "row-span-1" },
  { id: 12, src: "photo-1513278974582-3e1b4a4fa21e", good: true, span: "row-span-2" },
];

function Concept2() {
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const scannerControls = useAnimation();

  useEffect(() => {
    if (!inView || phase !== "idle") return;
    const run = async () => {
      setPhase("scanning");
      await scannerControls.start({
        top: ["0%", "100%"],
        transition: { duration: 3, ease: "linear" },
      });
      setPhase("done");
    };
    const timer = setTimeout(run, 500);
    return () => clearTimeout(timer);
  }, [inView]);

  const visiblePhotos = phase === "done"
    ? MASONRY_PHOTOS.filter((p) => p.good)
    : MASONRY_PHOTOS;

  return (
    <div ref={ref} className="relative rounded-3xl overflow-hidden bg-stone-950 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
            <Camera className="w-3.5 h-3.5" />
            Mariage Sophie & Thomas · 4 847 photos importées
          </div>
          {phase === "scanning" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-amber-400 text-sm font-medium flex items-center gap-2"
            >
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}>⚡</motion.span>
              Analyse IA en cours…
            </motion.p>
          )}
          {phase === "done" && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-emerald-400 text-sm font-medium flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              847 meilleures photos sélectionnées — 4 000 écartées
            </motion.p>
          )}
        </div>
        {phase === "done" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1 text-emerald-400 text-xs font-semibold"
          >
            Score moyen : 71/100
          </motion.div>
        )}
      </div>

      <div className="relative">
        {phase === "scanning" && (
          <motion.div
            className="absolute left-0 right-0 z-20 pointer-events-none"
            animate={scannerControls}
            style={{ top: "0%" }}
          >
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-violet-400 to-transparent shadow-[0_0_12px_2px_rgba(167,139,250,0.8)]" />
            <div className="h-8 w-full bg-gradient-to-b from-violet-400/20 to-transparent" />
          </motion.div>
        )}

        <motion.div layout className="grid grid-cols-4 gap-2" style={{ gridAutoRows: "80px" }}>
          <AnimatePresence mode="popLayout">
            {visiblePhotos.map((photo) => (
              <motion.div
                key={photo.id}
                layout
                className={`relative rounded-xl overflow-hidden ${photo.span}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  filter: phase === "done" ? "none" : photo.good ? "none" : "blur(2px) grayscale(60%)",
                }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.4 } }}
                transition={{ duration: 0.5, layout: { type: "spring", stiffness: 200, damping: 25 } }}
              >
                <img
                  src={`https://images.unsplash.com/${photo.src}?w=400&q=70`}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {phase !== "done" && !photo.good && (
                  <div className="absolute inset-0 bg-red-900/20 flex items-end p-1.5">
                    <span className="text-[9px] bg-red-500/80 text-white px-1.5 py-0.5 rounded-full font-medium">✗ Écarté</span>
                  </div>
                )}
                {phase === "done" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.random() * 0.4 }}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {phase === "done" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-5 text-center"
        >
          <h3 className="text-white text-2xl font-serif font-bold mb-2">
            Vos 4 847 photos triées pendant que vous dormez.
          </h3>
          <p className="text-white/40 text-sm">Gemini analyse 26 critères par photo.</p>
        </motion.div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// CONCEPT 3 — Selfie Finder Simulation
// ─────────────────────────────────────────────────────────────────────────────

const FACES = [
  { name: "Sophie", role: "Mariée", x: 28, y: 32, color: "#E879A0", count: 127 },
  { name: "Thomas", role: "Marié", x: 52, y: 28, color: "#6366F1", count: 98 },
  { name: "Marie", role: "Témoin", x: 18, y: 40, color: "#8B5CF6", count: 43 },
  { name: "Luc", role: "Famille VIP", x: 70, y: 35, color: "#10B981", count: 31 },
  { name: "Emma", role: "Amie", x: 83, y: 26, color: "#F59E0B", count: 22 },
];

function Concept3() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [identified, setIdentified] = useState(false);
  const [foundFaces, setFoundFaces] = useState<number[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const cycleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!inView) return;
    let current = 0;

    const cycle = () => {
      setIdentified(false);
      cycleRef.current = setTimeout(() => {
        setIdentified(true);
        setFoundFaces((prev) => [...new Set([...prev, current])]);
        cycleRef.current = setTimeout(() => {
          current = (current + 1) % FACES.length;
          setActiveIndex(current);
          cycle();
        }, 2000);
      }, 1200);
    };

    const timer = setTimeout(cycle, 800);
    return () => {
      clearTimeout(timer);
      if (cycleRef.current) clearTimeout(cycleRef.current);
    };
  }, [inView]);

  const activeFace = FACES[activeIndex];

  return (
    <div
      ref={ref}
      className="relative w-full rounded-3xl overflow-hidden"
      style={{ height: "85vh", minHeight: 560 }}
    >
      <img
        src="https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=1920&q=80"
        alt="Wedding group"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Found face markers */}
      {FACES.map((face, i) =>
        foundFaces.includes(i) && i !== activeIndex ? (
          <motion.div
            key={face.name}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${face.x}%`, top: `${face.y}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: face.color, background: `${face.color}22` }}
            >
              <Check className="w-4 h-4" style={{ color: face.color }} />
            </div>
            <div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded-full"
              style={{ background: face.color, color: "white" }}
            >
              {face.name}
            </div>
          </motion.div>
        ) : null
      )}

      {/* Moving finder */}
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        animate={{ left: `${activeFace.x}%`, top: `${activeFace.y}%` }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
        style={{ left: `${activeFace.x}%`, top: `${activeFace.y}%` }}
      >
        {/* Scanning ring */}
        <motion.div
          className="absolute rounded-full border-2 border-white/60"
          style={{ width: 80, height: 80, margin: -40 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.15, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
        {/* Crosshair corners */}
        {["tl", "tr", "bl", "br"].map((pos) => (
          <div
            key={pos}
            className={`absolute w-4 h-4 border-white border-2 ${
              pos === "tl" ? "border-r-0 border-b-0 rounded-tl top-0 left-0" :
              pos === "tr" ? "border-l-0 border-b-0 rounded-tr top-0 right-0" :
              pos === "bl" ? "border-r-0 border-t-0 rounded-bl bottom-0 left-0" :
                             "border-l-0 border-t-0 rounded-br bottom-0 right-0"
            }`}
            style={{ margin: -40 + (pos.includes("b") ? 72 : 0) + (pos.includes("r") ? 72 : 0) }}
          />
        ))}
        {/* Center dot */}
        <div className="absolute w-2 h-2 rounded-full bg-white" style={{ margin: -4 }} />

        {/* Label */}
        <AnimatePresence>
          {identified && (
            <motion.div
              key={activeFace.name}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap"
              style={{ top: 50 }}
            >
              <div
                className="rounded-xl px-3 py-2 shadow-xl backdrop-blur-md border border-white/20"
                style={{ background: `${activeFace.color}dd` }}
              >
                <div className="flex items-center gap-1.5">
                  <ScanFace className="w-3.5 h-3.5 text-white" />
                  <span className="text-white font-bold text-xs">{activeFace.name}</span>
                  <span className="text-white/70 text-[10px]">· {activeFace.role}</span>
                </div>
                <div className="text-white/80 text-[10px] mt-0.5 pl-5">
                  {activeFace.count} photos trouvées
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom */}
      <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 }}>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5">
              <motion.div className="w-2 h-2 rounded-full bg-emerald-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
              <span className="text-white text-xs font-medium">{foundFaces.length} / {FACES.length} personnes identifiées</span>
            </div>
            <div className="flex -space-x-2">
              {FACES.map((f, i) => (
                <motion.div
                  key={f.name}
                  className="w-7 h-7 rounded-full border-2 border-black/30 flex items-center justify-center text-white text-[9px] font-bold"
                  style={{ background: f.color }}
                  animate={foundFaces.includes(i) ? { scale: [1.2, 1] } : { opacity: 0.4 }}
                >
                  {f.name[0]}
                </motion.div>
              ))}
            </div>
          </div>
          <h3 className="text-white text-3xl md:text-5xl font-serif font-bold mb-2">
            Chaque invité retrouve{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-violet-300">
              ses photos. En un selfie.
            </span>
          </h3>
          <p className="text-white/50 text-base">Picktur identifie tous les visages. Vos clients n'ont plus qu'à sourire.</p>
        </motion.div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// HERO SANDBOX
// ─────────────────────────────────────────────────────────────────────────────

function ConceptLabel({ number, title, description }: { number: string; title: string; description: string }) {
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

export default function HeroSandbox() {
  return (
    <div className="min-h-screen bg-[#F5F4F2]">
      <div className="bg-stone-900 text-white px-8 py-5 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold">Picktur</span>
          <span className="text-white/30 mx-2">·</span>
          <span className="text-white/50 text-sm">Hero Banner Sandbox — 3 concepts</span>
        </div>
        <a href="/" className="text-white/40 hover:text-white text-sm transition-colors">← Landing page</a>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-24">

        <ConceptLabel
          number="01"
          title="Vision Augmentée"
          description="Photo plein-écran. L'IA scanne la photo en direct : lignes fléchées animées vers chaque point d'analyse, badge qui apparaît, score qui monte critère par critère jusqu'à 96/100."
        />
        <Concept1 />

        <ConceptLabel
          number="02"
          title="Masonry Chaos → Order"
          description="Grille de 12 photos mélangées. Un scanner IA violet descend. Les mauvaises photos s'estompent, les bonnes restent avec un checkmark vert — la grille se réorganise parfaitement."
        />
        <Concept2 />

        <ConceptLabel
          number="03"
          title="Selfie Finder Simulation"
          description="Photo de groupe cocktail. Un finder circulaire se déplace de visage en visage, identifie chaque personne avec son rôle et le nombre de photos trouvées."
        />
        <Concept3 />

        <div className="mt-16 p-6 bg-white rounded-2xl border border-stone-200 text-center">
          <p className="text-stone-400 text-sm">Sandbox — Picktur Hero Banner · 3 concepts à comparer</p>
        </div>
      </div>
    </div>
  );
}
