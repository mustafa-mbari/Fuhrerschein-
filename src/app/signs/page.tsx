"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppStore } from "@/store/appStore";
import { Navbar } from "@/components/layout/Navbar";
import { SearchBar } from "@/components/ui/SearchBar";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { TrafficSign, TrafficSignCategory } from "@/types";
import { Heart, CheckCircle, Grid3X3, List, AlertTriangle, Info, Ban, ArrowRight, Shield, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const CATEGORIES: { value: TrafficSignCategory | "all"; label: string; labelDe: string; icon: React.ElementType; color: string }[] = [
  { value: "all", label: "الكل", labelDe: "Alle", icon: Grid3X3, color: "text-slate-600" },
  { value: "warning", label: "تحذير", labelDe: "Warnung", icon: AlertTriangle, color: "text-yellow-600" },
  { value: "regulatory", label: "تنظيمي", labelDe: "Regulativ", icon: Shield, color: "text-blue-600" },
  { value: "information", label: "معلومات", labelDe: "Information", icon: Info, color: "text-green-600" },
  { value: "priority", label: "الأولوية", labelDe: "Vorfahrt", icon: ArrowRight, color: "text-orange-600" },
  { value: "prohibition", label: "حظر", labelDe: "Verbot", icon: Ban, color: "text-red-600" },
  { value: "direction", label: "اتجاه", labelDe: "Richtung", icon: Navigation, color: "text-purple-600" },
];

const CATEGORY_BADGE: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
  warning: "warning",
  regulatory: "info",
  information: "success",
  priority: "warning",
  prohibition: "error",
  direction: "info",
};

// SVG sign shapes for visual representation
function SignVisual({ sign }: { sign: TrafficSign }) {
  const shapes: Record<string, React.ReactNode> = {
    warning: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon points="50,8 95,88 5,88" fill="#fff" stroke="#e53e3e" strokeWidth="4" />
        <polygon points="50,15 90,82 10,82" fill="#ffd700" />
        <text x="50" y="72" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#1a1a1a">!</text>
      </svg>
    ),
    regulatory: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="44" fill="#fff" stroke="#3182ce" strokeWidth="4" />
        <circle cx="50" cy="50" r="36" fill="#ebf8ff" />
        <text x="50" y="62" textAnchor="middle" fontSize="26" fontWeight="bold" fill="#2b6cb0">50</text>
      </svg>
    ),
    information: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="5" y="5" width="90" height="90" rx="8" fill="#3182ce" />
        <text x="50" y="68" textAnchor="middle" fontSize="52" fontWeight="bold" fill="#fff">i</text>
      </svg>
    ),
    priority: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="20" y="20" width="60" height="60" fill="#ffd700" stroke="#e53e3e" strokeWidth="3" transform="rotate(45 50 50)" />
      </svg>
    ),
    prohibition: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="44" fill="#fff" stroke="#e53e3e" strokeWidth="6" />
        <line x1="20" y1="50" x2="80" y2="50" stroke="#e53e3e" strokeWidth="8" />
      </svg>
    ),
    direction: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="5" y="25" width="90" height="50" rx="6" fill="#3182ce" />
        <polygon points="50,10 85,50 50,90 15,50" fill="#3182ce" />
        <text x="50" y="58" textAnchor="middle" fontSize="28" fill="#fff">→</text>
      </svg>
    ),
  };

  return (
    <div className="w-16 h-16 flex items-center justify-center">
      {shapes[sign.category] || shapes.information}
    </div>
  );
}

export default function SignsPage() {
  const { trafficSigns, setTrafficSigns, favoriteSigns, toggleSignFavorite, learnedSigns, markSignLearned } = useAppStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<TrafficSignCategory | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<TrafficSign | null>(null);
  const [showFavOnly, setShowFavOnly] = useState(false);

  useEffect(() => {
    if (trafficSigns.length === 0) {
      fetch("/api/traffic-signs")
        .then((r) => r.json())
        .then(setTrafficSigns);
    }
  }, [trafficSigns.length, setTrafficSigns]);

  const filtered = useMemo(() => {
    let signs = trafficSigns;
    if (activeCategory !== "all") signs = signs.filter((s) => s.category === activeCategory);
    if (showFavOnly) signs = signs.filter((s) => favoriteSigns.has(s.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      signs = signs.filter(
        (s) =>
          s.germanName.toLowerCase().includes(q) ||
          s.arabicName.includes(q) ||
          s.arabicDescription.includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }
    return signs;
  }, [trafficSigns, activeCategory, search, showFavOnly, favoriteSigns]);

  const handleLearn = (id: string) => {
    markSignLearned(id);
    toast.success("تمت إضافتها للمُتعلَّم! 🎉");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 arabic-text mb-2">
            علامات المرور
          </h1>
          <p className="text-slate-500 arabic-text">Verkehrszeichen — {trafficSigns.length} علامة</p>
          <ProgressBar
            value={learnedSigns.size}
            max={trafficSigns.length}
            showLabel
            className="mt-3 max-w-sm"
            color="green"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="ابحث عن علامة..."
            className="flex-1"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowFavOnly(!showFavOnly)}
              className={cn("btn-secondary flex items-center gap-2", showFavOnly && "bg-red-100 text-red-600 dark:bg-red-900/30")}
            >
              <Heart className={cn("w-4 h-4", showFavOnly && "fill-red-500 text-red-500")} />
              <span className="arabic-text">المفضلة</span>
            </button>
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              {([["grid", Grid3X3], ["list", List]] as const).map(([mode, Icon]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === mode
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                  )}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors arabic-text",
                  activeCategory === cat.value
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-slate-500 mb-4 arabic-text">
          عرض {filtered.length} من {trafficSigns.length} علامة
        </p>

        {/* Grid view */}
        {viewMode === "grid" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((sign) => (
              <div
                key={sign.id}
                className="section-card card-hover cursor-pointer group animate-fade-in"
                onClick={() => setSelected(sign)}
              >
                <div className="flex items-center gap-4 mb-3">
                  <SignVisual sign={sign} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{sign.germanName}</p>
                    <p className="text-blue-600 dark:text-blue-400 arabic-text text-sm">{sign.arabicName}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 arabic-text line-clamp-2 mb-3">{sign.arabicDescription}</p>
                <div className="flex items-center justify-between">
                  <Badge variant={CATEGORY_BADGE[sign.category] || "default"}>
                    {CATEGORIES.find((c) => c.value === sign.category)?.label || sign.category}
                  </Badge>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSignFavorite(sign.id); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400"
                    >
                      <Heart className={cn("w-3.5 h-3.5", favoriteSigns.has(sign.id) && "fill-red-500 text-red-500")} />
                    </button>
                    {learnedSigns.has(sign.id) && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List view */}
        {viewMode === "list" && (
          <div className="space-y-2">
            {filtered.map((sign) => (
              <div
                key={sign.id}
                className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelected(sign)}
              >
                <SignVisual sign={sign} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{sign.germanName}</span>
                    <span className="text-blue-600 dark:text-blue-400 arabic-text">{sign.arabicName}</span>
                  </div>
                  <p className="text-xs text-slate-400 arabic-text truncate mt-1">{sign.arabicDescription}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={CATEGORY_BADGE[sign.category] || "default"}>
                    {CATEGORIES.find((c) => c.value === sign.category)?.label}
                  </Badge>
                  <button onClick={(e) => { e.stopPropagation(); toggleSignFavorite(sign.id); }} className="p-1.5 text-slate-400">
                    <Heart className={cn("w-4 h-4", favoriteSigns.has(sign.id) && "fill-red-500 text-red-500")} />
                  </button>
                  {learnedSigns.has(sign.id) && <CheckCircle className="w-4 h-4 text-green-500" />}
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="arabic-text">لا توجد نتائج للبحث</p>
          </div>
        )}

        {/* Detail Modal */}
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.germanName} size="lg">
          {selected && (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <SignVisual sign={selected} />
                <div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 arabic-text">{selected.arabicName}</p>
                  <Badge variant={CATEGORY_BADGE[selected.category] || "default"}>
                    {CATEGORIES.find((c) => c.value === selected.category)?.label}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Beschreibung</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">{selected.description}</p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <h3 className="font-bold text-blue-700 dark:text-blue-300 arabic-text mb-1">الوصف بالعربية</h3>
                <p className="text-slate-700 dark:text-slate-300 arabic-text text-sm">{selected.arabicDescription}</p>
              </div>

              {selected.arabicRules.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 arabic-text mb-2">قواعد المرور المتعلقة</h3>
                  <ul className="space-y-1">
                    {selected.arabicRules.map((rule, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 arabic-text">
                        <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.arabicExamples.length > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <h3 className="font-bold text-green-700 dark:text-green-300 arabic-text mb-2">أمثلة عملية</h3>
                  <ul className="space-y-1">
                    {selected.arabicExamples.map((ex, i) => (
                      <li key={i} className="text-sm text-slate-600 dark:text-slate-400 arabic-text">
                        <span className="text-green-500 mr-1">✓</span> {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => toggleSignFavorite(selected.id)}
                  className={cn("btn-secondary flex items-center gap-2", favoriteSigns.has(selected.id) && "text-red-500")}
                >
                  <Heart className={cn("w-4 h-4", favoriteSigns.has(selected.id) && "fill-red-500")} />
                  <span className="arabic-text">{favoriteSigns.has(selected.id) ? "إزالة من المفضلة" : "إضافة للمفضلة"}</span>
                </button>
                {!learnedSigns.has(selected.id) && (
                  <button onClick={() => handleLearn(selected.id)} className="btn-primary flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="arabic-text">تعلمتها</span>
                  </button>
                )}
                {learnedSigns.has(selected.id) && (
                  <span className="flex items-center gap-2 text-green-600 text-sm arabic-text">
                    <CheckCircle className="w-4 h-4" /> تعلمتها بالفعل
                  </span>
                )}
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}
