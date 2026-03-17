import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "picktur_cookie_consent";

type ConsentState = "accepted" | "refused" | null;

// Load GA4 dynamically after consent
function loadGA4() {
  const gaId = (window as any).__GA_ID;
  if (!gaId || gaId === "G-XXXXXXXXXX") return;
  if ((window as any).gaLoaded) return;
  (window as any).gaLoaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) { (window as any).dataLayer.push(args); }
  (window as any).gtag = gtag;
  gtag("js", new Date());
  gtag("config", gaId, { anonymize_ip: true });
}

const labels = {
  fr: {
    title: "Nous respectons votre vie privée",
    desc: "Nous utilisons des cookies pour analyser le trafic et améliorer votre expérience. Plausible Analytics (sans cookies) est toujours actif. Google Analytics n'est chargé qu'avec votre consentement.",
    accept: "Accepter",
    refuse: "Refuser",
    link: "En savoir plus",
  },
  en: {
    title: "We respect your privacy",
    desc: "We use analytics to understand traffic and improve your experience. Plausible Analytics (cookieless) is always active. Google Analytics is only loaded with your consent.",
    accept: "Accept",
    refuse: "Decline",
    link: "Learn more",
  },
};

export function CookieBanner({ lang = "fr" }: { lang?: "fr" | "en" }) {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [visible, setVisible] = useState(false);
  const t = labels[lang];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentState;
    if (stored === "accepted") {
      loadGA4();
      setConsent(stored);
    } else if (stored === "refused") {
      setConsent(stored);
    } else {
      // Show banner after short delay
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
    setVisible(false);
    loadGA4();
  };

  const handleRefuse = () => {
    localStorage.setItem(STORAGE_KEY, "refused");
    setConsent("refused");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50"
        >
          <div className="bg-white border border-stone-200 rounded-2xl shadow-2xl p-5">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-xl">🍪</span>
              <div>
                <p className="font-semibold text-stone-900 text-sm mb-1">{t.title}</p>
                <p className="text-xs text-stone-500 leading-relaxed">{t.desc}</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleRefuse}
                className="text-xs text-stone-500 px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 transition-all"
              >
                {t.refuse}
              </button>
              <button
                onClick={handleAccept}
                className="text-xs font-semibold text-white px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 transition-all"
              >
                {t.accept}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useCookieConsent() {
  const stored = localStorage.getItem(STORAGE_KEY) as ConsentState;
  return stored;
}
