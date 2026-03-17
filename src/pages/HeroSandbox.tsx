import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useAnimation } from "framer-motion";
import { Eye, Layers, User, Check, Zap, Star, Camera, ScanFace } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONCEPT 1 — Vision Augmentée
// Full-screen hero with animated AI annotation lines + glassmorphism badges
// ─────────────────────────────────────────────────────────────────────────────

const ANNOTATIONS = [
  {
    // Dot on the photo (% of container)
    dot: { x: 38, y: 34 },
    // Badge position
    badge: { x: 5, y: 12 },
    label: "Netteté",
    value: "98%",
    icon: Eye,
    color: "from-violet-500/80 to-violet-600/80",
    delay: 0.4,
  },
  {
    dot: { x: 74, y: 26 },
    badge: { x: 72, y: 8 },
    label: "Isolation sujet",
    value: "Haute",
    icon: Layers,
    color: "from-emerald-500/80 to-emerald-600/80",
    delay: 0.8,
  },
  {
    dot: { x: 50, y: 62 },
    badge: { x: 38, y: 78 },
    label: "Score Picktur",
    value: "96 / 100",
    icon: Star,
    color: "from-amber-500/80 to-orange-500/80",
    delay: 1.2,
  },
];

function Concept1() {
  const [step, setStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const timers = ANNOTATIONS.map((a, i) =>
      setTimeout(() => setStep(i + 1), a.delay * 1000 + 600)
    );
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-3xl"
      style={{ height: "90vh", minHeight: 600 }}
    >
      {/* Background photo */}
      <img
        src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80"
        alt="Wedding portrait"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

      {/* SVG annotation lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {ANNOTATIONS.map((a, i) => {
          // Mid-point for a slight curve
          const mx = (a.dot.x + a.badge.x) / 2;
          const my = (a.dot.y + a.badge.y) / 2 - 4;
          return (
            <motion.path
              key={i}
              d={`M ${a.badge.x + 6} ${a.badge.y + 3} Q ${mx} ${my} ${a.dot.x} ${a.dot.y}`}
              fill="none"
              stroke="white"
              strokeWidth="0.3"
              strokeDasharray="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={
                inView ? { pathLength: 1, opacity: 0.6 } : {}
              }
              transition={{ duration: 0.6, delay: a.delay }}
            />
          );
        })}
      </svg>

      {/* Annotation dots */}
      {ANNOTATIONS.map((a, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${a.dot.x}%`, top: `${a.dot.y}%` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: a.delay - 0.1, type: "spring", stiffness: 300 }}
        >
          <div className="w-3 h-3 rounded-full bg-white shadow-lg ring-2 ring-white/40" />
          <motion.div
            className="absolute inset-0 rounded-full bg-white/30"
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: a.delay }}
          />
        </motion.div>
      ))}

      {/* Glassmorphism badges */}
      {ANNOTATIONS.map((a, i) => {
        const Icon = a.icon;
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${a.badge.x}%`, top: `${a.badge.y}%` }}
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={step > i ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 shadow-2xl min-w-[130px]">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${a.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-white/70 text-[10px] font-medium uppercase tracking-wider">{a.label}</span>
              </div>
              <div className="text-white font-bold text-lg leading-none pl-7">{a.value}</div>
            </div>
          </motion.div>
        );
      })}

      {/* Central title */}
      <div className="absolute inset-x-0 bottom-0 p-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-white/80 text-xs mb-4">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Analyse IA en temps réel — Gemini 2.0
          </div>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight mb-3">
            La plateforme qui<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-300 to-violet-300">
              révèle chaque mariage.
            </span>
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Chaque photo analysée. Chaque moment préservé.
          </p>
        </motion.div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// CONCEPT 2 — Masonry Chaos to Order
// AI scanner descends → bad photos fade out → grid reorders into perfection
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
      {/* Header */}
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
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >⚡</motion.span>
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

      {/* Grid */}
      <div className="relative">
        {/* Scanner line */}
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

        <motion.div
          layout
          className="grid grid-cols-4 gap-2"
          style={{ gridAutoRows: "80px" }}
        >
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
                {/* Bad photo overlay */}
                {phase !== "done" && !photo.good && (
                  <div className="absolute inset-0 bg-red-900/20 flex items-end p-1.5">
                    <span className="text-[9px] bg-red-500/80 text-white px-1.5 py-0.5 rounded-full font-medium">
                      ✗ Écarté
                    </span>
                  </div>
                )}
                {/* Good photo badge after scan */}
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

      {/* Bottom CTA */}
      {phase === "done" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-5 text-center"
        >
          <h3 className="text-white text-2xl font-serif font-bold mb-2">
            Vos 4 847 photos triées<br />pendant que vous dormez.
          </h3>
          <p className="text-white/40 text-sm">Gemini analyse 26 critères par photo — netteté, expression, composition, lumière.</p>
        </motion.div>
      )}
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// CONCEPT 3 — Selfie Finder Simulation
// Circular finder moves across a group photo, identifying faces
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

  useEffect(() => {
    if (!inView) return;
    let current = 0;

    const cycle = () => {
      setIdentified(false);
      setTimeout(() => {
        setIdentified(true);
        setFoundFaces((prev) => [...new Set([...prev, current])]);
        setTimeout(() => {
          current = (current + 1) % FACES.length;
          setActiveIndex(current);
          cycle();
        }, 2000);
      }, 1200);
    };

    const timer = setTimeout(cycle, 800);
    return () => clearTimeout(timer);
  }, [inView]);

  const activeFace = FACES[activeIndex];

  return (
    <div
      ref={ref}
      className="relative w-full rounded-3xl overflow-hidden"
      style={{ height: "85vh", minHeight: 560 }}
    >
      {/* Group photo */}
      <img
        src="https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=1920&q=80"
        alt="Wedding cocktail group"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Already-found face markers */}
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

      {/* Moving finder circle */}
      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        animate={{ left: `${activeFace.x}%`, top: `${activeFace.y}%` }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
        style={{ left: `${activeFace.x}%`, top: `${activeFace.y}%` }}
      >
        {/* Outer scanning ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/60"
          style={{ width: 80, height: 80, margin: -40 }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
        {/* Corner brackets */}
        {[
          "top-0 left-0 border-t-2 border-l-2 rounded-tl-sm",
          "top-0 right-0 border-t-2 border-r-2 rounded-tr-sm",
          "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-sm",
          "bottom-0 right-0 border-b-2 border-r-2 rounded-br-sm",
        ].map((cls, i) => (
          <div
            key={i}
            className={`absolute w-4 h-4 border-white ${cls}`}
            style={{ margin: -40 + (i < 2 ? 0 : 66) + (i % 2 === 0 ? 0 : 66) - (i < 2 ? 0 : 0) }}
          />
        ))}
        {/* Center dot */}
        <div
          className="absolute w-2 h-2 rounded-full bg-white"
          style={{ margin: -4 }}
        />

        {/* Identified label */}
        <AnimatePresence>
          {identified && (
            <motion.div
              key={activeFace.name}
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-1/2 whitespace-nowrap"
              style={{ top: 52, marginLeft: -40 }}
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
              {/* Connector dot */}
              <div
                className="w-1.5 h-1.5 rounded-full mx-auto -mt-0.5"
                style={{ background: activeFace.color }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom overlay */}
      <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
        >
          {/* Live counter */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5">
              <motion.div
                className="w-2 h-2 rounded-full bg-emerald-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
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
            Chaque invité retrouve<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-violet-300">
              ses photos. En un selfie.
            </span>
          </h3>
          <p className="text-white/50 text-base">
            Picktur identifie tous les visages. Vos clients n'ont plus qu'à sourire.
          </p>
        </motion.div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// HERO SANDBOX — renders all 3 concepts for comparison
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
      {/* Header */}
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

        {/* Concept 1 */}
        <ConceptLabel
          number="01"
          title="Vision Augmentée"
          description="Photo plein-écran avec lignes d'annotation animées et badges glassmorphism. Montre l'IA qui analyse la photo en direct."
        />
        <Concept1 />

        {/* Concept 2 */}
        <ConceptLabel
          number="02"
          title="Masonry Chaos → Order"
          description="Grille de photos, scanner IA qui descend. Les mauvaises photos s'estompent, les bonnes se réorganisent parfaitement."
        />
        <Concept2 />

        {/* Concept 3 */}
        <ConceptLabel
          number="03"
          title="Selfie Finder Simulation"
          description="Photo de groupe cocktail. Un finder circulaire se déplace et identifie chaque visage avec une animation pulsée."
        />
        <Concept3 />

        {/* Footer note */}
        <div className="mt-16 p-6 bg-white rounded-2xl border border-stone-200 text-center">
          <p className="text-stone-400 text-sm">
            Sandbox de comparaison — Picktur Hero Banner · 3 concepts
          </p>
          <p className="text-stone-300 text-xs mt-1">
            Chaque concept peut être raffiné ou combiné avant intégration dans la landing page finale.
          </p>
        </div>
      </div>
    </div>
  );
}
