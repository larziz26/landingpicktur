import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useAnimation, animate } from "framer-motion";
import { Eye, Layers, User, Check, Zap, Camera, ScanFace, Images } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONCEPT 1+3 FUSION — Vision Augmentée × Selfie Finder
//
// This photo shows a wedding couple: bride left (~x30%), groom right (~x62%)
// Faces are in upper-center zone, ~y22-36%
//
// PHASE 1 (0→6s): AI quality analysis — arrows + score
// PHASE 2 (6→12s): Face recognition — detection boxes + guest galleries
// ─────────────────────────────────────────────────────────────────────────────

// Image: 2752×1536px landscape (Gemini château wedding, watermark removed)
// Coordinates from Gemini bbox [y1, x1, y2, x2] normalized 0-1000:
//   Sophie: [224,169,1000,370] → x:16.9-37%, y_top:22.4% | eyes x=29.1%,y=35.1%
//   Thomas: [136,638,1000,856] → x:63.8-85.6%, y_top:13.6%
//   Marie:  [333,40,1000,182]  → x:4-18.2%, y_top:33.3%
//   Luc:    [319,834,1000,999] → x:83.4-99.9%, y_top:31.9%
//   Bouquet:[804,388,994,532]  → x:38.8-53.2%, y:80.4-99.4%
const HERO_PHOTO = "/hero-wedding.png";

// Phase 1 — quality annotations
// Badges layout: i=0,1 slide from LEFT (x=2%), i=2,3,4 slide from RIGHT (x=42%, center gap)
// Center badges at x=42% sit between Sophie (ends ~37%) and Thomas (starts ~67%) — château bg
const QUALITY_ANNOTATIONS = [
  {
    dot: { x: 30, y: 34 },         // Sophie's face center (575/1920=30%, 365/1080=34%)
    badge: { x: 2, y: 8 },
    lineEnd: { x: 20, y: 24 },
    label: "Yeux ouverts",
    value: "✓",
    detail: "Les deux sujets",
    color: "#6366F1",
    bg: "from-indigo-600/90 to-violet-700/90",
    points: 15,
    delay: 0.84,
  },
  {
    dot: { x: 35, y: 68 },         // bouquet / focus plane (Sophie holding bouquet)
    badge: { x: 2, y: 52 },
    lineEnd: { x: 20, y: 58 },
    label: "Netteté",
    value: "97%",
    detail: "Mise au point parfaite",
    color: "#8B5CF6",
    bg: "from-violet-600/90 to-purple-700/90",
    points: 18,
    delay: 2.04,
  },
  {
    dot: { x: 30, y: 25 },         // Sophie face top (center-x of her box)
    badge: { x: 42, y: 3 },
    lineEnd: { x: 42, y: 13 },
    label: "Mariée détectée",
    value: "✓",
    detail: "Visage identifié",
    color: "#E879A0",
    bg: "from-pink-500/90 to-rose-600/90",
    points: 20,
    delay: 3.24,
  },
  {
    dot: { x: 70.6, y: 28.7 },     // Thomas face center (1355/1920=70.6%, 310/1080=28.7%)
    badge: { x: 42, y: 37 },
    lineEnd: { x: 54, y: 28 },
    label: "Marié détecté",
    value: "✓",
    detail: "Visage identifié",
    color: "#06B6D4",
    bg: "from-cyan-500/90 to-blue-600/90",
    points: 20,
    delay: 4.44,
  },
  {
    dot: { x: 46, y: 87 },         // bouquet center (Gemini: x=46%, y=89.9%)
    badge: { x: 42, y: 56 },
    lineEnd: { x: 47, y: 72 },
    label: "Bouquet de fleurs",
    value: "Détecté",
    detail: "Élément clé identifié",
    color: "#10B981",
    bg: "from-emerald-500/90 to-teal-600/90",
    points: 23,
    delay: 5.64,
  },
];

const TOTAL_SCORE = QUALITY_ANNOTATIONS.reduce((s, a) => s + a.points, 0); // 96

// Phase 2 — face detection boxes (perfect squares from Gemini, on 1920×1080)
// Format: [Y_top, X_left, Y_bottom, X_right] → converted to SVG % of container
// Container aspect: 2752:1536 ≈ 1920:1080 (same 16:9)
const FACE_DETECTIONS = [
  {
    // Sophie [230,440,500,710] → 270×270px square
    // x=440/1920=22.9%, y=230/1080=21.3%, w=270/1920=14.1%, h=270/1080=25.0%
    box: { x: 22.9, y: 21.3, w: 14.1, h: 25 },
    name: "Sophie",
    role: "Mariée",
    color: "#E879A0",
    photo: "/face-sophie.png",
    photos: 127,
    delay: 0.36,
    labelBelow: false,
  },
  {
    // Thomas [175,1220,445,1490] → 270×270px square
    // x=1220/1920=63.5%, y=175/1080=16.2%, w=14.1%, h=25.0%
    box: { x: 63.5, y: 16.2, w: 14.1, h: 25 },
    name: "Thomas",
    role: "Marié",
    color: "#6366F1",
    photo: "/face-thomas.png",
    photos: 98,
    delay: 1.08,
    labelBelow: true,
  },
  {
    // Marie [365,135,515,285] → 150×150px square
    // x=135/1920=7.0%, y=365/1080=33.8%, w=150/1920=7.8%, h=150/1080=13.9%
    box: { x: 7, y: 33.8, w: 7.8, h: 13.9 },
    name: "Marie",
    role: "Témoin",
    color: "#10B981",
    photo: "/face-marie.png",
    photos: 43,
    delay: 1.8,
    labelBelow: false,
  },
  {
    // Luc [340,1650,490,1800] → 150×150px square
    // x=1650/1920=85.9%, y=340/1080=31.5%, w=7.8%, h=13.9%
    box: { x: 85.9, y: 31.5, w: 7.8, h: 13.9 },
    name: "Luc",
    role: "Famille",
    color: "#F59E0B",
    photo: "/face-luc.png",
    photos: 31,
    delay: 2.52,
    labelBelow: false,
  },
];

type Phase = "idle" | "quality" | "transition" | "faces" | "done";
type Phase2 = "idle" | "scanning" | "done";
type Lang = "fr" | "en";

const T = {
  fr: {
    annotations: [
      { label: "Yeux ouverts", value: "✓", detail: "Les deux sujets" },
      { label: "Netteté", value: "97%", detail: "Mise au point parfaite" },
      { label: "Mariée détectée", value: "✓", detail: "Visage identifié" },
      { label: "Marié détecté", value: "✓", detail: "Visage identifié" },
      { label: "Bouquet de fleurs", value: "Détecté", detail: "Élément clé identifié" },
    ],
    roles: ["Mariée", "Marié", "Témoin", "Famille"],
    scoreBadge: "Scoring de la photo",
    transitionTitle: "Analyse qualité terminée",
    transitionSub: "Reconnaissance des personnes en cours…",
    identified: "identifiées",
    selfieAccess: "Accès selfie activé",
    selfieGallery: "Galerie perso. par invité",
    titleQuality: "La plateforme qui",
    titleQualityAccent: "révèle chaque mariage.",
    titleQualitySub: "26 critères analysés · Score en quelques secondes",
    titleFaces: "Chaque invité retrouve",
    titleFacesAccent: "ses photos. En un selfie.",
    titleFacesSub: "Picktur identifie automatiquement chaque personne · Galerie personnelle instantanée",
  },
  en: {
    annotations: [
      { label: "Eyes open", value: "✓", detail: "Both subjects" },
      { label: "Sharpness", value: "97%", detail: "Perfect focus" },
      { label: "Bride detected", value: "✓", detail: "Face identified" },
      { label: "Groom detected", value: "✓", detail: "Face identified" },
      { label: "Flower bouquet", value: "Detected", detail: "Key element found" },
    ],
    roles: ["Bride", "Groom", "Witness", "Family"],
    scoreBadge: "Photo scoring",
    transitionTitle: "Quality analysis complete",
    transitionSub: "Identifying people…",
    identified: "identified",
    selfieAccess: "Selfie access enabled",
    selfieGallery: "Personal gallery per guest",
    titleQuality: "The platform that",
    titleQualityAccent: "reveals every wedding.",
    titleQualitySub: "26 criteria analyzed · Score in seconds",
    titleFaces: "Every guest finds",
    titleFacesAccent: "their photos. In one selfie.",
    titleFacesSub: "Picktur automatically identifies each person · Instant personal gallery",
  },
};

export function Concept1Fusion({ lang = "fr" }: { lang?: Lang }) {
  const tr = T[lang];
  const [phase, setPhase] = useState<Phase>("idle");
  const [visibleAnnotations, setVisibleAnnotations] = useState<number[]>([]);
  const [displayScore, setDisplayScore] = useState(0);
  const [visibleFaces, setVisibleFaces] = useState<number[]>([]);
  const [activeGallery, setActiveGallery] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-60px" });
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

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
          duration: 0.84,
          ease: "easeOut",
          onUpdate: (v) => setDisplayScore(Math.round(v)),
        });
      }, a.delay * 1000);
    });

    // Transition between phases (+20% pause)
    const transitionAt = (QUALITY_ANNOTATIONS[QUALITY_ANNOTATIONS.length - 1].delay + 1.44) * 1000;
    t(() => setPhase("transition"), transitionAt);

    // Phase 2: face recognition (+20%)
    const facesAt = transitionAt + 960;
    t(() => {
      setPhase("faces");
      FACE_DETECTIONS.forEach((f, i) => {
        t(() => setVisibleFaces((prev) => [...prev, i]), f.delay * 1000);
      });
    }, facesAt);

    // Done — pause 3s then restart automatically (+20%)
    t(() => {
      setPhase("done");
      t(() => {
        setPhase("idle");
        setVisibleAnnotations([]);
        setDisplayScore(0);
        setVisibleFaces([]);
        setActiveGallery(null);
        t(runSequence, 360);
      }, 3000);
    }, facesAt + 4200);
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
      style={{ aspectRatio: "2752 / 1536" }}
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
            style={{
              left: `${a.badge.x}%`,
              top: `${isMobile && i === 4 ? 43 : isMobile && i === 3 ? 20 : a.badge.y}%`,
            }}
            initial={{ opacity: 0, x: i < 2 ? -18 : 18, scale: 0.85 }}
            animate={visibleAnnotations.includes(i) ? { opacity: 1, x: 0, scale: 1 } : {}}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.4 } }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <div
              className="rounded-xl md:rounded-2xl px-2 py-1 md:px-3.5 md:py-2.5 shadow-2xl border border-white/20 backdrop-blur-md min-w-[72px] md:min-w-[138px]"
              style={{ background: `linear-gradient(135deg, ${a.color}cc, ${a.color}88)` }}
            >
              <div className="text-[7px] md:text-[9px] text-white/70 uppercase tracking-widest font-semibold mb-0.5 hidden md:block">{tr.annotations[i].label}</div>
              {(!isMobile || tr.annotations[i].value !== "✓") && (
                <div className="text-white font-bold text-[10px] md:text-base leading-tight">{tr.annotations[i].value}</div>
              )}
              <div className="text-white/80 text-[8px] md:text-[9px] font-semibold md:font-normal md:text-white/60 mt-0 md:mt-0.5 md:max-w-none whitespace-normal break-words max-w-[80px]">{tr.annotations[i].label}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── PHASE 1 — live score badge (top center) ── */}
      <AnimatePresence>
        {showQuality && (
          <motion.div
            key="score-badge"
            className="absolute top-4 right-4 z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.5 } }}
          >
            <div className="bg-black/55 backdrop-blur-xl border border-white/15 rounded-xl md:rounded-2xl px-2 py-1 md:px-5 md:py-3 text-center shadow-2xl">
              <div className="text-white/50 text-[8px] md:text-[10px] uppercase tracking-widest mb-0.5 md:mb-1 flex items-center gap-1 md:gap-1.5 justify-center">
                <Zap className="w-2 h-2 md:w-3 md:h-3 text-amber-400" />
                <span className="hidden md:inline">{tr.scoreBadge}</span>
                <span className="md:hidden">Score</span>
              </div>
              <div className="flex items-end gap-0.5 md:gap-1 justify-center">
                <span className="text-white font-black text-base md:text-4xl tabular-nums leading-none">{displayScore}</span>
                <span className="text-white/40 text-[10px] md:text-xl font-bold mb-0.5">/{TOTAL_SCORE}</span>
              </div>
              <div className="mt-1 md:mt-2 h-1 md:h-1.5 bg-white/10 rounded-full overflow-hidden w-12 md:w-36 mx-auto">
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
            <div className="bg-black/70 backdrop-blur-xl border border-violet-400/30 rounded-2xl px-4 py-3 md:px-8 md:py-5 text-center shadow-2xl">
              <div className="flex items-center gap-2 justify-center mb-1">
                <motion.div
                  className="w-2 h-2 rounded-full bg-violet-400"
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
                <span className="text-violet-300 text-xs md:text-sm font-semibold">{tr.transitionTitle}</span>
              </div>
              <p className="text-white/50 text-[10px] md:text-xs">{tr.transitionSub}</p>
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

      {/* ── PHASE 2 — face labels (above or below box; mobile: spread across top) ── */}
      <AnimatePresence>
        {showFaces && FACE_DETECTIONS.map((f, i) => {
          const MOBILE_LABEL_POS = [
            { left: "3%",  top: "1%" },
            { left: "20%", top: "1%" },
            { left: "67%", top: "1%" },
            { left: "84%", top: "1%" },
          ];
          return visibleFaces.includes(i) ? (
            <motion.div
              key={`face-label-${f.name}`}
              className="absolute"
              style={isMobile ? {
                left: MOBILE_LABEL_POS[i].left,
                top: MOBILE_LABEL_POS[i].top,
                transform: "none",
              } : {
                left: `${f.box.x + f.box.w / 2}%`,
                top: f.labelBelow
                  ? `${f.box.y + f.box.h + 1}%`
                  : `${f.box.y - 1}%`,
                transform: f.labelBelow
                  ? "translate(-50%, 0%)"
                  : "translate(-50%, -100%)",
              }}
              initial={{ opacity: 0, y: f.labelBelow ? -8 : 8, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.3 }}
            >
              {f.labelBelow && !isMobile && <div className="w-px h-2 mx-auto" style={{ background: f.color }} />}
              <div
                className="rounded-xl px-2 py-1 md:px-3 md:py-2 shadow-xl border border-white/20 backdrop-blur-md text-center min-w-[60px] md:min-w-[90px]"
                style={{ background: `${f.color}cc` }}
              >
                <div className="text-white font-bold text-[10px] md:text-xs">{f.name}</div>
                <div className="text-white/70 text-[8px] md:text-[10px]">{tr.roles[i]}</div>
              </div>
              {!f.labelBelow && !isMobile && <div className="w-px h-2 mx-auto" style={{ background: f.color }} />}
            </motion.div>
          ) : null;
        })}
      </AnimatePresence>

      {/* ── PHASE 2 — gallery cards in safe zone [50,800,400,1130] on 1920×1080 ── */}
      {/* That's the column between Sophie's right shoulder and Thomas's left arm */}
      <AnimatePresence>
        {showFaces && (
          <motion.div
            className="absolute flex flex-col gap-1 md:gap-1.5 z-10"
            style={isMobile
              ? { left: "34%", top: "4.6%", width: "32%" }
              : { left: "41.7%", top: "4.6%", width: "17.2%" }
            }
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Counter badge */}
            <div className="bg-black/55 backdrop-blur-xl border border-emerald-400/30 rounded-lg px-1.5 py-1 md:px-2.5 md:py-1.5 flex items-center gap-1 md:gap-1.5">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="text-emerald-300 text-[9px] font-semibold">
                {visibleFaces.length} / {FACE_DETECTIONS.length} {tr.identified}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1 md:flex md:flex-col md:gap-1.5">
              {FACE_DETECTIONS.map((f, i) =>
                visibleFaces.includes(i) ? (
                  <motion.div
                    key={`gallery-${f.name}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: f.delay * 0.5 + 0.4, type: "spring", stiffness: 280, damping: 22 }}
                    className="bg-black/55 backdrop-blur-xl border border-white/15 rounded-lg md:rounded-xl px-1.5 py-1 md:px-2 md:py-1.5 flex items-center gap-1 md:gap-2 cursor-pointer hover:bg-black/70 transition-all"
                    onClick={() => setActiveGallery(activeGallery === i ? null : i)}
                  >
                    {/* Face photo avatar */}
                    <div
                      className="w-5 h-5 md:w-7 md:h-7 rounded-full flex-shrink-0 shadow-lg overflow-hidden border-[1.5px]"
                      style={{ borderColor: f.color }}
                    >
                      <img src={f.photo} alt={f.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-white font-semibold text-[8px] md:text-[10px] leading-tight truncate">{f.name}</div>
                      <div className="text-white/50 text-[7px] md:text-[8px] truncate hidden md:block">{tr.roles[i]} · {f.photos} photos</div>
                    </div>
                  </motion.div>
                ) : <div key={`gallery-empty-${i}`} />
              )}
            </div>

            {/* Selfie prompt */}
            {visibleFaces.length === FACE_DETECTIONS.length && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-violet-600/80 to-pink-600/80 backdrop-blur-xl border border-white/20 rounded-lg md:rounded-xl px-1 py-0.5 md:px-2 md:py-1.5"
              >
                <div className="flex items-center gap-1 md:gap-1.5">
                  <ScanFace className="w-2 h-2 md:w-3.5 md:h-3.5 text-white flex-shrink-0" />
                  <div>
                    <div className="text-white font-bold text-[7px] md:text-[9px]">{tr.selfieAccess}</div>
                    <div className="text-white/60 text-[7px] md:text-[8px] hidden md:block">{tr.selfieGallery}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>


      {/* ── Bottom title ── */}
      <div className="absolute inset-x-0 bottom-0 p-3 md:p-8">
        <AnimatePresence mode="wait">
          {showQuality && (
            <motion.div
              key="title-quality"
              className="text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
                {tr.titleQuality}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-300 to-violet-300">
                  {tr.titleQualityAccent}
                </span>
              </h2>
              <p className="text-white/50 text-[10px] sm:text-sm md:text-base mt-1 md:mt-2">{tr.titleQualitySub}</p>
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
              <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
                {tr.titleFaces}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-violet-300">
                  {tr.titleFacesAccent}
                </span>
              </h2>
              <p className="text-white/50 text-[10px] sm:text-sm md:text-base mt-1 md:mt-2">
                {tr.titleFacesSub}
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
          <p className="text-white/40 text-sm">L'IA analyse 26 critères par photo.</p>
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
