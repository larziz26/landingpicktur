import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useAnimation, animate } from "framer-motion";
import { Eye, Layers, User, Check, Zap, Camera, ScanFace, RefreshCw, Images } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONCEPT 1+3 FUSION — Vision Augmentée × Selfie Finder
//
// This photo shows a wedding couple: bride left (~x30%), groom right (~x62%)
// Faces are in upper-center zone, ~y22-36%
//
// PHASE 1 (0→6s): AI quality analysis — arrows + score
// PHASE 2 (6→12s): Face recognition — detection boxes + guest galleries
// ─────────────────────────────────────────────────────────────────────────────

// Photo used: couple centered, bride left, groom right
// https://images.unsplash.com/photo-1583939003579-730e3918a45a — bride closeup
// Better: photo-1519741497674-611481863552 — couple embracing (canonical Unsplash wedding)
const HERO_PHOTO = "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1920&q=80";

// Phase 1 — quality annotations
// Coordinates calibrated for photo-1606800052052 (bride+groom formal portrait)
const QUALITY_ANNOTATIONS = [
  {
    dot: { x: 35, y: 24 },         // bride's eyes
    badge: { x: 2, y: 6 },
    lineEnd: { x: 20, y: 11 },
    label: "Yeux ouverts",
    value: "✓",
    detail: "Les deux sujets",
    color: "#6366F1",
    bg: "from-indigo-600/90 to-violet-700/90",
    points: 15,
    delay: 0.7,
  },
  {
    dot: { x: 50, y: 50 },         // body sharpness
    badge: { x: 2, y: 40 },
    lineEnd: { x: 20, y: 45 },
    label: "Netteté",
    value: "97%",
    detail: "Mise au point parfaite",
    color: "#8B5CF6",
    bg: "from-violet-600/90 to-purple-700/90",
    points: 18,
    delay: 1.7,
  },
  {
    dot: { x: 28, y: 30 },         // bride face
    badge: { x: 66, y: 6 },
    lineEnd: { x: 70, y: 11 },
    label: "Mariée détectée",
    value: "✓",
    detail: "Visage identifié",
    color: "#E879A0",
    bg: "from-pink-500/90 to-rose-600/90",
    points: 20,
    delay: 2.7,
  },
  {
    dot: { x: 64, y: 26 },         // groom face
    badge: { x: 66, y: 40 },
    lineEnd: { x: 70, y: 45 },
    label: "Marié détecté",
    value: "✓",
    detail: "Visage identifié",
    color: "#06B6D4",
    bg: "from-cyan-500/90 to-blue-600/90",
    points: 20,
    delay: 3.7,
  },
  {
    dot: { x: 50, y: 68 },         // composition / overall frame
    badge: { x: 30, y: 82 },
    lineEnd: { x: 46, y: 86 },
    label: "Composition",
    value: "Règle des tiers",
    detail: "Cadrage excellent",
    color: "#10B981",
    bg: "from-emerald-500/90 to-teal-600/90",
    points: 23,
    delay: 4.7,
  },
];

const TOTAL_SCORE = QUALITY_ANNOTATIONS.reduce((s, a) => s + a.points, 0); // 96

// Phase 2 — face detection boxes
// Calibrated on same photo: bride ~left 20-40%, groom ~left 55-72%
const FACE_DETECTIONS = [
  {
    // Bride face box
    box: { x: 22, y: 16, w: 16, h: 20 },
    name: "Sophie",
    role: "Mariée",
    color: "#E879A0",
    photos: 127,
    delay: 0.3,
  },
  {
    // Groom face box
    box: { x: 57, y: 13, w: 14, h: 18 },
    name: "Thomas",
    role: "Marié",
    color: "#6366F1",
    photos: 98,
    delay: 0.9,
  },
  {
    // Guest suggested in background left
    box: { x: 5, y: 22, w: 10, h: 13 },
    name: "Marie",
    role: "Témoin",
    color: "#10B981",
    photos: 43,
    delay: 1.5,
  },
  {
    // Guest suggested in background right
    box: { x: 80, y: 20, w: 10, h: 13 },
    name: "Luc",
    role: "Famille",
    color: "#F59E0B",
    photos: 31,
    delay: 2.1,
  },
];

type Phase = "idle" | "quality" | "transition" | "faces" | "done";
type Phase2 = "idle" | "scanning" | "done";

function Concept1Fusion() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [visibleAnnotations, setVisibleAnnotations] = useState<number[]>([]);
  const [displayScore, setDisplayScore] = useState(0);
  const [visibleFaces, setVisibleFaces] = useState<number[]>([]);
  const [activeGallery, setActiveGallery] = useState<number | null>(null);
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

  const cumulativeScore = (upTo: number) =>
    QUALITY_ANNOTATIONS.slice(0, upTo + 1).reduce((s, a) => s + a.points, 0);

  const runSequence = () => {
    setPhase("quality");
    setVisibleAnnotations([]);
    setDisplayScore(0);
    setVisibleFaces([]);
    setActiveGallery(null);

    // Phase 1: reveal quality annotations one by one
    QUALITY_ANNOTATIONS.forEach((a, i) => {
      t(() => {
        setVisibleAnnotations((prev) => [...prev, i]);
        const from = i === 0 ? 0 : cumulativeScore(i - 1);
        const to = cumulativeScore(i);
        animate(from, to, {
          duration: 0.7,
          ease: "easeOut",
          onUpdate: (v) => setDisplayScore(Math.round(v)),
        });
      }, a.delay * 1000);
    });

    // Transition between phases
    const transitionAt = (QUALITY_ANNOTATIONS[QUALITY_ANNOTATIONS.length - 1].delay + 1.2) * 1000;
    t(() => setPhase("transition"), transitionAt);

    // Phase 2: face recognition
    const facesAt = transitionAt + 800;
    t(() => {
      setPhase("faces");
      FACE_DETECTIONS.forEach((f, i) => {
        t(() => setVisibleFaces((prev) => [...prev, i]), f.delay * 1000);
      });
    }, facesAt);

    // Done
    t(() => setPhase("done"), facesAt + 3500);
  };

  const handleReplay = () => {
    clearAllTimers();
    setPhase("idle");
    setVisibleAnnotations([]);
    setDisplayScore(0);
    setVisibleFaces([]);
    setActiveGallery(null);
    setTimeout(runSequence, 150);
  };

  useEffect(() => {
    if (inView && phase === "idle") {
      t(runSequence, 500);
    }
    return clearAllTimers;
  }, [inView]);

  const pct = Math.round((displayScore / TOTAL_SCORE) * 100);
  const showQuality = phase === "quality" || phase === "transition";
  const showFaces = phase === "faces" || phase === "done";

  return (
    <div
      ref={ref}
      className="relative w-full rounded-3xl overflow-hidden select-none"
      style={{ height: "90vh", minHeight: 600 }}
    >
      {/* Photo */}
      <img
        src={HERO_PHOTO}
        alt="Wedding couple"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/45" />

      {/* ── PHASE 1 SVG — quality annotation lines ── */}
      <AnimatePresence>
        {showQuality && (
          <motion.svg
            key="quality-svg"
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <defs>
              <marker id="arrow-w" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 z" fill="white" fillOpacity="0.9" />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="0.25" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {QUALITY_ANNOTATIONS.map((a, i) => {
              const visible = visibleAnnotations.includes(i);
              const mx = (a.lineEnd.x + a.dot.x) / 2;
              const my = (a.lineEnd.y + a.dot.y) / 2 - 4;
              return (
                <motion.path
                  key={i}
                  d={`M ${a.lineEnd.x} ${a.lineEnd.y} Q ${mx} ${my} ${a.dot.x} ${a.dot.y}`}
                  fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.9"
                  markerEnd="url(#arrow-w)" filter="url(#glow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={visible ? { pathLength: 1, opacity: 1 } : {}}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              );
            })}
          </motion.svg>
        )}
      </AnimatePresence>

      {/* ── PHASE 1 — annotation dots ── */}
      <AnimatePresence>
        {showQuality && QUALITY_ANNOTATIONS.map((a, i) => (
          <motion.div
            key={`dot-${i}`}
            className="absolute pointer-events-none"
            style={{ left: `${a.dot.x}%`, top: `${a.dot.y}%`, transform: "translate(-50%,-50%)" }}
            initial={{ scale: 0, opacity: 0 }}
            animate={visibleAnnotations.includes(i) ? { scale: 1, opacity: 1 } : {}}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <motion.div
              className="absolute rounded-full"
              style={{ width: 28, height: 28, marginLeft: -14, marginTop: -14, background: a.color, opacity: 0.3 }}
              animate={{ scale: [1, 2.4, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
              style={{ background: a.color, marginLeft: -8, marginTop: -8 }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── PHASE 1 — glassmorphism badges ── */}
      <AnimatePresence>
        {showQuality && QUALITY_ANNOTATIONS.map((a, i) => (
          <motion.div
            key={`badge-${i}`}
            className="absolute"
            style={{ left: `${a.badge.x}%`, top: `${a.badge.y}%` }}
            initial={{ opacity: 0, x: i < 2 ? -18 : 18, scale: 0.85 }}
            animate={visibleAnnotations.includes(i) ? { opacity: 1, x: 0, scale: 1 } : {}}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.4 } }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <div
              className="rounded-2xl px-3.5 py-2.5 shadow-2xl border border-white/20 backdrop-blur-md min-w-[138px]"
              style={{ background: `linear-gradient(135deg, ${a.color}cc, ${a.color}88)` }}
            >
              <div className="text-[9px] text-white/70 uppercase tracking-widest font-semibold mb-0.5">{a.label}</div>
              <div className="text-white font-bold text-base leading-tight">{a.value}</div>
              <div className="text-white/60 text-[10px] mt-0.5">{a.detail}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── PHASE 1 — live score badge (top center) ── */}
      <AnimatePresence>
        {showQuality && (
          <motion.div
            key="score-badge"
            className="absolute top-4 left-1/2 -translate-x-1/2 z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.5 } }}
          >
            <div className="bg-black/55 backdrop-blur-xl border border-white/15 rounded-2xl px-5 py-3 text-center shadow-2xl">
              <div className="text-white/50 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1.5 justify-center">
                <Zap className="w-3 h-3 text-amber-400" />
                Analyse IA — Gemini 2.0
              </div>
              <div className="flex items-end gap-1 justify-center">
                <span className="text-white font-black text-4xl tabular-nums leading-none">{displayScore}</span>
                <span className="text-white/40 text-xl font-bold mb-0.5">/ {TOTAL_SCORE}</span>
              </div>
              <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden w-36 mx-auto">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400"
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TRANSITION banner ── */}
      <AnimatePresence>
        {phase === "transition" && (
          <motion.div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center z-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-black/70 backdrop-blur-xl border border-violet-400/30 rounded-2xl px-8 py-5 text-center shadow-2xl">
              <div className="flex items-center gap-2 justify-center mb-1">
                <motion.div
                  className="w-2 h-2 rounded-full bg-violet-400"
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
                <span className="text-violet-300 text-sm font-semibold">Analyse qualité terminée</span>
              </div>
              <p className="text-white/50 text-xs">Reconnaissance des personnes en cours…</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PHASE 2 SVG — face detection boxes ── */}
      <AnimatePresence>
        {showFaces && (
          <motion.svg
            key="face-svg"
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {FACE_DETECTIONS.map((f, i) =>
              visibleFaces.includes(i) ? (
                <g key={f.name}>
                  {/* Main detection rectangle */}
                  <motion.rect
                    x={f.box.x} y={f.box.y} width={f.box.w} height={f.box.h}
                    fill="none" stroke={f.color} strokeWidth="0.4" strokeOpacity="0.85"
                    strokeDasharray="1.5 0.8"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  />
                  {/* Corner brackets — top-left */}
                  <motion.path
                    d={`M ${f.box.x} ${f.box.y + 2.5} L ${f.box.x} ${f.box.y} L ${f.box.x + 2.5} ${f.box.y}`}
                    fill="none" stroke={f.color} strokeWidth="0.7"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  />
                  {/* Corner brackets — top-right */}
                  <motion.path
                    d={`M ${f.box.x + f.box.w - 2.5} ${f.box.y} L ${f.box.x + f.box.w} ${f.box.y} L ${f.box.x + f.box.w} ${f.box.y + 2.5}`}
                    fill="none" stroke={f.color} strokeWidth="0.7"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  />
                  {/* Corner brackets — bottom-left */}
                  <motion.path
                    d={`M ${f.box.x} ${f.box.y + f.box.h - 2.5} L ${f.box.x} ${f.box.y + f.box.h} L ${f.box.x + 2.5} ${f.box.y + f.box.h}`}
                    fill="none" stroke={f.color} strokeWidth="0.7"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  />
                  {/* Corner brackets — bottom-right */}
                  <motion.path
                    d={`M ${f.box.x + f.box.w - 2.5} ${f.box.y + f.box.h} L ${f.box.x + f.box.w} ${f.box.y + f.box.h} L ${f.box.x + f.box.w} ${f.box.y + f.box.h - 2.5}`}
                    fill="none" stroke={f.color} strokeWidth="0.7"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  />
                </g>
              ) : null
            )}
          </motion.svg>
        )}
      </AnimatePresence>

      {/* ── PHASE 2 — face labels (floating cards above boxes) ── */}
      <AnimatePresence>
        {showFaces && FACE_DETECTIONS.map((f, i) =>
          visibleFaces.includes(i) ? (
            <motion.div
              key={`face-label-${f.name}`}
              className="absolute"
              style={{
                left: `${f.box.x + f.box.w / 2}%`,
                top: `${f.box.y - 1}%`,
                transform: "translate(-50%, -100%)",
              }}
              initial={{ opacity: 0, y: 8, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.3 }}
            >
              <div
                className="rounded-xl px-3 py-2 shadow-xl border border-white/20 backdrop-blur-md text-center min-w-[110px]"
                style={{ background: `${f.color}cc` }}
              >
                <div className="text-white font-bold text-xs">{f.name}</div>
                <div className="text-white/70 text-[10px]">{f.role}</div>
              </div>
              {/* Connector */}
              <div className="w-px h-2 mx-auto" style={{ background: f.color }} />
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* ── PHASE 2 — gallery cards (right side panel) ── */}
      <AnimatePresence>
        {showFaces && (
          <motion.div
            className="absolute top-4 right-4 flex flex-col gap-2 z-10"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
          >
            {FACE_DETECTIONS.map((f, i) =>
              visibleFaces.includes(i) ? (
                <motion.div
                  key={`gallery-${f.name}`}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: f.delay * 0.5 + 0.4, type: "spring", stiffness: 280, damping: 22 }}
                  className="bg-black/55 backdrop-blur-xl border border-white/15 rounded-2xl px-3.5 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-black/70 transition-all group"
                  onClick={() => setActiveGallery(activeGallery === i ? null : i)}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow"
                    style={{ background: f.color }}
                  >
                    {f.name[0]}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-xs">{f.name} · {f.role}</div>
                    <div className="text-white/50 text-[10px] flex items-center gap-1">
                      <Images className="w-3 h-3" />
                      {f.photos} photos · Galerie personnelle
                    </div>
                  </div>
                  <motion.div
                    className="ml-auto w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: f.color }}
                    whileHover={{ scale: 1.15 }}
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                </motion.div>
              ) : null
            )}

            {/* Selfie prompt */}
            {visibleFaces.length === FACE_DETECTIONS.length && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-violet-600/80 to-pink-600/80 backdrop-blur-xl border border-white/20 rounded-2xl px-3.5 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <ScanFace className="w-4 h-4 text-white flex-shrink-0" />
                  <div>
                    <div className="text-white font-bold text-xs">Accès par selfie activé</div>
                    <div className="text-white/60 text-[10px]">Chaque invité retrouve ses photos</div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top indicator — phase label ── */}
      <AnimatePresence>
        {showFaces && (
          <motion.div
            className="absolute top-4 left-4 z-10"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-black/55 backdrop-blur-xl border border-emerald-400/30 rounded-xl px-3.5 py-2 flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="text-emerald-300 text-xs font-semibold">
                {visibleFaces.length} / {FACE_DETECTIONS.length} personnes identifiées
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Replay button ── */}
      {(phase === "done") && (
        <motion.button
          onClick={handleReplay}
          className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:text-white px-3 py-1.5 rounded-full text-xs transition-all z-20"
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
      <div className="absolute inset-x-0 bottom-0 p-8">
        <AnimatePresence mode="wait">
          {showQuality && (
            <motion.div
              key="title-quality"
              className="text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                La plateforme qui{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-300 to-violet-300">
                  révèle chaque mariage.
                </span>
              </h2>
              <p className="text-white/50 text-base mt-2">26 critères analysés · Score en quelques secondes</p>
            </motion.div>
          )}
          {showFaces && (
            <motion.div
              key="title-faces"
              className="text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
                Chaque invité retrouve{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-violet-300">
                  ses photos. En un selfie.
                </span>
              </h2>
              <p className="text-white/50 text-base mt-2">
                Picktur identifie automatiquement chaque personne · Galerie personnelle instantanée
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// CONCEPT 2 — Masonry Chaos to Order (unchanged)
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
      await scannerControls.start({ top: ["0%", "100%"], transition: { duration: 3, ease: "linear" } });
      setPhase("done");
    };
    const timer = setTimeout(run, 500);
    return () => clearTimeout(timer);
  }, [inView]);

  const visiblePhotos = phase === "done" ? MASONRY_PHOTOS.filter((p) => p.good) : MASONRY_PHOTOS;

  return (
    <div ref={ref} className="relative rounded-3xl overflow-hidden bg-stone-950 p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
            <Camera className="w-3.5 h-3.5" />
            Mariage Sophie & Thomas · 4 847 photos importées
          </div>
          {phase === "scanning" && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-amber-400 text-sm font-medium flex items-center gap-2">
              <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}>⚡</motion.span>
              Analyse IA en cours…
            </motion.p>
          )}
          {phase === "done" && (
            <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-emerald-400 text-sm font-medium flex items-center gap-2">
              <Check className="w-4 h-4" />
              847 meilleures photos sélectionnées — 4 000 écartées
            </motion.p>
          )}
        </div>
        {phase === "done" && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1 text-emerald-400 text-xs font-semibold">
            Score moyen : 71/100
          </motion.div>
        )}
      </div>

      <div className="relative">
        {phase === "scanning" && (
          <motion.div className="absolute left-0 right-0 z-20 pointer-events-none" animate={scannerControls} style={{ top: "0%" }}>
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-violet-400 to-transparent shadow-[0_0_12px_2px_rgba(167,139,250,0.8)]" />
            <div className="h-8 w-full bg-gradient-to-b from-violet-400/20 to-transparent" />
          </motion.div>
        )}
        <motion.div layout className="grid grid-cols-4 gap-2" style={{ gridAutoRows: "80px" }}>
          <AnimatePresence mode="popLayout">
            {visiblePhotos.map((photo) => (
              <motion.div
                key={photo.id} layout
                className={`relative rounded-xl overflow-hidden ${photo.span}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1, filter: phase === "done" ? "none" : photo.good ? "none" : "blur(2px) grayscale(60%)" }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.4 } }}
                transition={{ duration: 0.5, layout: { type: "spring", stiffness: 200, damping: 25 } }}
              >
                <img src={`https://images.unsplash.com/${photo.src}?w=400&q=70`} alt="" className="w-full h-full object-cover" />
                {phase !== "done" && !photo.good && (
                  <div className="absolute inset-0 bg-red-900/20 flex items-end p-1.5">
                    <span className="text-[9px] bg-red-500/80 text-white px-1.5 py-0.5 rounded-full font-medium">✗ Écarté</span>
                  </div>
                )}
                {phase === "done" && (
                  <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: Math.random() * 0.4 }} className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {phase === "done" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-5 text-center">
          <h3 className="text-white text-2xl font-serif font-bold mb-2">Vos 4 847 photos triées pendant que vous dormez.</h3>
          <p className="text-white/40 text-sm">Gemini analyse 26 critères par photo.</p>
        </motion.div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// HERO SANDBOX
// ─────────────────────────────────────────────────────────────────────────────

function ConceptLabel({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 py-8">
      <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-white font-black text-sm flex-shrink-0 mt-0.5">{number}</div>
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
          <span className="text-white/50 text-sm">Hero Banner Sandbox</span>
        </div>
        <a href="/" className="text-white/40 hover:text-white text-sm transition-colors">← Landing page</a>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-24">

        <ConceptLabel
          number="01"
          title="Vision Augmentée × Selfie Finder (Fusion)"
          description="Phase 1 : analyse qualité IA avec flèches + score qui monte. Phase 2 : cadres de détection faciale sur les vrais visages + galeries personnelles par invité + accès selfie."
        />
        <Concept1Fusion />

        <ConceptLabel
          number="02"
          title="Masonry Chaos → Order"
          description="Grille de 12 photos. Scanner IA descend → mauvaises photos disparaissent → grille se réorganise en sélection parfaite."
        />
        <Concept2 />

        <div className="mt-16 p-6 bg-white rounded-2xl border border-stone-200 text-center">
          <p className="text-stone-400 text-sm">Sandbox — Picktur Hero Banner · Concepts à comparer</p>
        </div>
      </div>
    </div>
  );
}
