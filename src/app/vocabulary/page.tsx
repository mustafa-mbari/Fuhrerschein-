"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppStore } from "@/store/appStore";
import { Navbar } from "@/components/layout/Navbar";
import { SearchBar } from "@/components/ui/SearchBar";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { VocabularyItem, VocabularyCategory } from "@/types";
import { Heart, Volume2, CheckCircle, Grid3X3, List, BookOpen, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { shuffleArray } from "@/lib/utils";
import toast from "react-hot-toast";

const CATEGORIES: { value: VocabularyCategory | "all"; label: string; labelDe: string }[] = [
  { value: "all", label: "الكل", labelDe: "Alle" },
  { value: "car-interior", label: "داخل السيارة", labelDe: "Fahrzeuginneres" },
  { value: "driving-actions", label: "أفعال القيادة", labelDe: "Fahrmanöver" },
  { value: "traffic-instructions", label: "تعليمات المرور", labelDe: "Verkehrsanweisungen" },
  { value: "parking", label: "الركن", labelDe: "Parken" },
  { value: "emergency", label: "الطوارئ", labelDe: "Notfall" },
  { value: "examiner-phrases", label: "عبارات الممتحن", labelDe: "Prüferaussagen" },
];

const CATEGORY_COLORS: Record<string, "default" | "success" | "warning" | "error" | "info"> = {
  "car-interior": "info",
  "driving-actions": "success",
  "traffic-instructions": "warning",
  "parking": "default",
  "emergency": "error",
  "examiner-phrases": "info",
};

// Flashcard mode component
function FlashCard({ item, onNext, total, current }: { item: VocabularyItem; onNext: () => void; total: number; current: number }) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => setFlipped(false), [item.id]);

  const speak = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utt = new SpeechSynthesisUtterance(item.german);
      utt.lang = "de-DE";
      window.speechSynthesis.speak(utt);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-slate-500 arabic-text">{current + 1} / {total}</p>
      <div
        className="w-full max-w-md cursor-pointer"
        onClick={() => setFlipped(!flipped)}
        style={{ perspective: 1000 }}
      >
        <div
          className="relative h-56 transition-transform duration-500"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex flex-col items-center justify-center p-6 shadow-xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-white text-3xl font-bold mb-2">{item.german}</p>
            <p className="text-blue-100 text-sm">{item.germanExample}</p>
            <p className="text-blue-200 text-xs mt-3">انقر لرؤية الترجمة</p>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex flex-col items-center justify-center p-6 shadow-xl"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-white text-3xl font-bold arabic-text mb-2">{item.arabic}</p>
            <p className="text-green-100 text-sm arabic-text">{item.arabicExample}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={speak} className="btn-secondary flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          <span>نطق</span>
        </button>
        <button onClick={onNext} className="btn-primary">
          التالي ←
        </button>
      </div>
    </div>
  );
}

export default function VocabularyPage() {
  const { vocabulary, setVocabulary, favoriteVocab, toggleVocabFavorite, learnedVocab, markVocabLearned } = useAppStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<VocabularyCategory | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "flashcard">("grid");
  const [selected, setSelected] = useState<VocabularyItem | null>(null);
  const [flashIndex, setFlashIndex] = useState(0);
  const [showFavOnly, setShowFavOnly] = useState(false);

  useEffect(() => {
    if (vocabulary.length === 0) {
      fetch("/api/vocabulary")
        .then((r) => r.json())
        .then(setVocabulary);
    }
  }, [vocabulary.length, setVocabulary]);

  const filtered = useMemo(() => {
    let items = vocabulary;
    if (activeCategory !== "all") items = items.filter((v) => v.category === activeCategory);
    if (showFavOnly) items = items.filter((v) => favoriteVocab.has(v.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (v) => v.german.toLowerCase().includes(q) || v.arabic.includes(q) || v.germanExample.toLowerCase().includes(q)
      );
    }
    return items;
  }, [vocabulary, activeCategory, search, showFavOnly, favoriteVocab]);

  const flashItems = useMemo(() => shuffleArray(filtered), [filtered]);

  const speak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "de-DE";
      window.speechSynthesis.speak(utt);
    }
  };

  const handleLearn = (id: string) => {
    markVocabLearned(id);
    toast.success("تمت إضافتها للمُتعلَّم! 🎉", { icon: "✅" });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 arabic-text mb-2">
            المفردات والعبارات
          </h1>
          <p className="text-slate-500 arabic-text">Vokabeln & Kommunikation — {vocabulary.length} مفردة</p>
          <ProgressBar
            value={learnedVocab.size}
            max={vocabulary.length}
            showLabel
            className="mt-3 max-w-sm"
            color="blue"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="ابحث عن مفردة..."
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
              {([["grid", Grid3X3], ["list", List], ["flashcard", BookOpen]] as const).map(([mode, Icon]) => (
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
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors arabic-text",
                activeCategory === cat.value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Flashcard mode */}
        {viewMode === "flashcard" && flashItems.length > 0 && (
          <div className="section-card mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Shuffle className="w-5 h-5 text-blue-500" />
              <h2 className="font-bold text-slate-900 dark:text-slate-100 arabic-text">وضع البطاقات التعليمية</h2>
            </div>
            <FlashCard
              item={flashItems[flashIndex % flashItems.length]}
              onNext={() => setFlashIndex((i) => i + 1)}
              total={flashItems.length}
              current={flashIndex % flashItems.length}
            />
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-slate-500 mb-4 arabic-text">
          عرض {filtered.length} من {vocabulary.length} مفردة
        </p>

        {/* Grid view */}
        {viewMode === "grid" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="section-card card-hover cursor-pointer group animate-fade-in"
                onClick={() => setSelected(item)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{item.german}</p>
                    <p className="text-base text-blue-600 dark:text-blue-400 arabic-text">{item.arabic}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); speak(item.german); }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleVocabFavorite(item.id); }}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400"
                    >
                      <Heart className={cn("w-4 h-4", favoriteVocab.has(item.id) && "fill-red-500 text-red-500")} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 italic mb-2 line-clamp-2">{item.germanExample}</p>
                <div className="flex items-center justify-between">
                  <Badge variant={CATEGORY_COLORS[item.category] || "default"}>
                    {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                  </Badge>
                  {learnedVocab.has(item.id) && <CheckCircle className="w-4 h-4 text-green-500" />}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List view */}
        {viewMode === "list" && (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelected(item)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{item.german}</span>
                    <span className="text-blue-600 dark:text-blue-400 arabic-text">{item.arabic}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-1">{item.germanExample}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={CATEGORY_COLORS[item.category] || "default"}>
                    {CATEGORIES.find((c) => c.value === item.category)?.label}
                  </Badge>
                  <button onClick={(e) => { e.stopPropagation(); speak(item.german); }} className="p-1.5 text-slate-400 hover:text-blue-500">
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); toggleVocabFavorite(item.id); }} className="p-1.5 text-slate-400">
                    <Heart className={cn("w-4 h-4", favoriteVocab.has(item.id) && "fill-red-500 text-red-500")} />
                  </button>
                  {learnedVocab.has(item.id) && <CheckCircle className="w-4 h-4 text-green-500" />}
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="arabic-text">لا توجد نتائج للبحث</p>
          </div>
        )}

        {/* Detail Modal */}
        <Modal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={selected?.german}
          size="md"
        >
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 arabic-text">{selected.arabic}</p>
                <button onClick={() => speak(selected.german)} className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <p className="font-medium text-slate-700 dark:text-slate-300 mb-1 text-sm">مثال بالألمانية:</p>
                <p className="italic text-slate-600 dark:text-slate-400">{selected.germanExample}</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="font-medium text-blue-700 dark:text-blue-300 mb-1 text-sm arabic-text">الترجمة والمثال بالعربية:</p>
                <p className="text-slate-700 dark:text-slate-300 arabic-text">{selected.arabicExample}</p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Badge variant={CATEGORY_COLORS[selected.category] || "default"}>
                  {CATEGORIES.find((c) => c.value === selected.category)?.label}
                </Badge>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleVocabFavorite(selected.id)}
                    className={cn("btn-secondary flex items-center gap-2", favoriteVocab.has(selected.id) && "text-red-500")}
                  >
                    <Heart className={cn("w-4 h-4", favoriteVocab.has(selected.id) && "fill-red-500")} />
                    <span className="arabic-text">{favoriteVocab.has(selected.id) ? "إزالة من المفضلة" : "إضافة للمفضلة"}</span>
                  </button>
                  {!learnedVocab.has(selected.id) && (
                    <button onClick={() => handleLearn(selected.id)} className="btn-primary flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span className="arabic-text">تعلمتها</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}
