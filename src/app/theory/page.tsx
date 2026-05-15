"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppStore } from "@/store/appStore";
import { Navbar } from "@/components/layout/Navbar";
import { SearchBar } from "@/components/ui/SearchBar";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { TheoryQuestion, TheoryCategory } from "@/types";
import { shuffleArray } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Heart, CheckCircle, Play, RotateCcw, ChevronRight, ChevronLeft,
  Trophy, AlertCircle, FileQuestion, BookOpen, Clock
} from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES: { value: TheoryCategory | "all"; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "traffic-rules", label: "قواعد المرور" },
  { value: "road-signs", label: "علامات الطريق" },
  { value: "vehicle-safety", label: "سلامة المركبة" },
  { value: "first-aid", label: "الإسعافات الأولية" },
  { value: "environment", label: "البيئة" },
  { value: "driving-behavior", label: "سلوك القيادة" },
];

const DIFFICULTY_BADGE: Record<string, "success" | "warning" | "error"> = {
  easy: "success",
  medium: "warning",
  hard: "error",
};

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "سهل",
  medium: "متوسط",
  hard: "صعب",
};

// Quiz Mode component
function QuizMode({
  questions,
  onFinish,
}: {
  questions: TheoryQuestion[];
  onFinish: (score: number, total: number) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (showResult) return;
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [showResult, startTime]);

  const q = questions[current];
  const isAnswered = current in answers;
  const isLast = current === questions.length - 1;

  const handleSelect = (i: number) => {
    if (isAnswered) return;
    setSelected(i);
    setAnswers({ ...answers, [current]: i });
  };

  const handleNext = () => {
    if (isLast) {
      const correct = Object.entries(answers).filter(
        ([idx, ans]) => questions[parseInt(idx)].correctAnswer === ans
      ).length;
      setShowResult(true);
      onFinish(correct, questions.length);
    } else {
      setCurrent(current + 1);
      setSelected(null);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const score = Object.entries(answers).filter(
    ([idx, ans]) => questions[parseInt(idx)].correctAnswer === ans
  ).length;

  if (showResult) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="section-card text-center animate-fade-in">
        <div className={cn("w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center", pct >= 70 ? "bg-green-100" : "bg-red-100")}>
          {pct >= 70 ? <Trophy className="w-10 h-10 text-green-600" /> : <AlertCircle className="w-10 h-10 text-red-600" />}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 arabic-text mb-2">
          {pct >= 70 ? "أحسنت!" : "حاول مرة أخرى"}
        </h2>
        <p className="text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">{pct}%</p>
        <p className="text-slate-500 arabic-text mb-1">{score} من {questions.length} إجابة صحيحة</p>
        <p className="text-slate-400 text-sm mb-6">الوقت: {formatTime(elapsed)}</p>

        <div className="space-y-3 text-left max-h-80 overflow-y-auto mb-6">
          {questions.map((q, i) => {
            const userAns = answers[i];
            const correct = q.correctAnswer;
            const isCorrect = userAns === correct;
            return (
              <div key={q.id} className={cn("p-3 rounded-xl text-sm", isCorrect ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20")}>
                <p className="font-medium arabic-text mb-1">{q.question}</p>
                {!isCorrect && (
                  <p className="text-green-700 dark:text-green-300 arabic-text text-xs">الصواب: {q.answers[correct]}</p>
                )}
                <p className={cn("text-xs arabic-text mt-1", isCorrect ? "text-green-600" : "text-red-600")}>
                  {isCorrect ? "✓ صحيح" : `✗ أجبت: ${q.answers[userAns] ?? "—"}`}
                </p>
              </div>
            );
          })}
        </div>

        <button onClick={() => window.location.reload()} className="btn-primary flex items-center gap-2 mx-auto">
          <RotateCcw className="w-4 h-4" />
          <span className="arabic-text">إعادة الاختبار</span>
        </button>
      </div>
    );
  }

  return (
    <div className="section-card animate-fade-in">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-500 arabic-text">
          سؤال {current + 1} من {questions.length}
        </span>
        <div className="flex items-center gap-1 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          <span>{formatTime(elapsed)}</span>
        </div>
      </div>
      <ProgressBar value={current + 1} max={questions.length} className="mb-6" color="blue" />

      {/* Question */}
      <div className="mb-6">
        <p className="text-lg font-bold text-slate-900 dark:text-slate-100 arabic-text mb-1">{q.question}</p>
        {q.germanQuestion && (
          <p className="text-sm text-slate-500 italic">{q.germanQuestion}</p>
        )}
      </div>

      {/* Answers */}
      <div className="space-y-3 mb-6">
        {q.answers.map((ans, i) => {
          const isSelected = selected === i;
          const isCorrect = i === q.correctAnswer;
          const showCorrect = isAnswered;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={cn(
                "w-full text-right p-4 rounded-xl border-2 transition-all arabic-text text-sm font-medium",
                !isAnswered && "border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                isAnswered && isCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300",
                isAnswered && isSelected && !isCorrect && "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
                isAnswered && !isSelected && !isCorrect && "border-slate-200 dark:border-slate-700 opacity-60",
                !isAnswered && isSelected && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              )}
            >
              <span className="inline-block w-6 h-6 rounded-full bg-current opacity-10 mr-2" />
              <span className="text-right">{ans}</span>
              {showCorrect && isCorrect && " ✓"}
              {showCorrect && isSelected && !isCorrect && " ✗"}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {isAnswered && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mb-4 animate-fade-in">
          <h4 className="font-bold text-blue-700 dark:text-blue-300 arabic-text text-sm mb-1">الشرح</h4>
          <p className="text-slate-700 dark:text-slate-300 arabic-text text-sm">{q.explanation}</p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={() => { if (current > 0) { setCurrent(current - 1); setSelected(answers[current - 1] ?? null); } }}
          disabled={current === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4" />
          <span className="arabic-text">السابق</span>
        </button>
        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          <span className="arabic-text">{isLast ? "إنهاء الاختبار" : "التالي"}</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function TheoryPage() {
  const { theoryQuestions, setTheoryQuestions, favoriteQuestions, toggleQuestionFavorite, incrementQuizCompleted } = useAppStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<TheoryCategory | "all">("all");
  const [activeDifficulty, setActiveDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [selected, setSelected] = useState<TheoryQuestion | null>(null);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<TheoryQuestion[]>([]);

  useEffect(() => {
    if (theoryQuestions.length === 0) {
      fetch("/api/theory-questions")
        .then((r) => r.json())
        .then(setTheoryQuestions);
    }
  }, [theoryQuestions.length, setTheoryQuestions]);

  const filtered = useMemo(() => {
    let qs = theoryQuestions;
    if (activeCategory !== "all") qs = qs.filter((q) => q.category === activeCategory);
    if (activeDifficulty !== "all") qs = qs.filter((q) => q.difficulty === activeDifficulty);
    if (showFavOnly) qs = qs.filter((q) => favoriteQuestions.has(q.id));
    if (search.trim()) {
      const s = search.toLowerCase();
      qs = qs.filter((q) => q.question.includes(s) || (q.germanQuestion || "").toLowerCase().includes(s));
    }
    return qs;
  }, [theoryQuestions, activeCategory, activeDifficulty, search, showFavOnly, favoriteQuestions]);

  const startQuiz = (count = 10) => {
    const qs = shuffleArray(filtered).slice(0, count);
    if (qs.length < 2) { toast.error("لا يوجد أسئلة كافية للاختبار"); return; }
    setQuizQuestions(qs);
    setQuizMode(true);
  };

  const handleQuizFinish = (score: number, total: number) => {
    incrementQuizCompleted(score);
    toast.success(`أكملت الاختبار: ${score}/${total}`, { duration: 4000 });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 arabic-text mb-2">
            أسئلة النظري
          </h1>
          <p className="text-slate-500 arabic-text">Theorie Prüfung — {theoryQuestions.length} سؤال</p>
        </div>

        {/* Quiz start button */}
        {!quizMode && (
          <div className="section-card bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-100 dark:border-purple-800 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-100 arabic-text text-lg">وضع الاختبار</h2>
                <p className="text-slate-500 arabic-text text-sm">اختبر نفسك بأسئلة عشوائية من القائمة المفلترة</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[5, 10, 15, 20].map((n) => (
                  <button key={n} onClick={() => startQuiz(n)} className="btn-primary flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    <span className="arabic-text">{n} أسئلة</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quiz mode */}
        {quizMode && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 arabic-text">وضع الاختبار</h2>
              <button
                onClick={() => setQuizMode(false)}
                className="btn-secondary flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="arabic-text">إنهاء الاختبار</span>
              </button>
            </div>
            <QuizMode questions={quizQuestions} onFinish={handleQuizFinish} />
          </div>
        )}

        {!quizMode && (
          <>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <SearchBar value={search} onChange={setSearch} placeholder="ابحث عن سؤال..." className="flex-1" />
              <button
                onClick={() => setShowFavOnly(!showFavOnly)}
                className={cn("btn-secondary flex items-center gap-2", showFavOnly && "bg-red-100 text-red-600 dark:bg-red-900/30")}
              >
                <Heart className={cn("w-4 h-4", showFavOnly && "fill-red-500 text-red-500")} />
                <span className="arabic-text">المفضلة</span>
              </button>
            </div>

            {/* Category & Difficulty filters */}
            <div className="space-y-3 mb-6">
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button key={cat.value} onClick={() => setActiveCategory(cat.value)}
                    className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-colors arabic-text",
                      activeCategory === cat.value ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    )}>
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {(["all", "easy", "medium", "hard"] as const).map((d) => (
                  <button key={d} onClick={() => setActiveDifficulty(d)}
                    className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-colors arabic-text",
                      activeDifficulty === d ? "bg-slate-700 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200"
                    )}>
                    {d === "all" ? "كل المستويات" : DIFFICULTY_LABEL[d]}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-sm text-slate-500 mb-4 arabic-text">
              عرض {filtered.length} من {theoryQuestions.length} سؤال
            </p>

            {/* Question cards */}
            <div className="space-y-4">
              {filtered.map((q) => (
                <div
                  key={q.id}
                  className="section-card card-hover cursor-pointer"
                  onClick={() => setSelected(q)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-slate-100 arabic-text mb-1">{q.question}</p>
                      {q.germanQuestion && (
                        <p className="text-sm text-slate-500 italic mb-2">{q.germanQuestion}</p>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant={DIFFICULTY_BADGE[q.difficulty]}>{DIFFICULTY_LABEL[q.difficulty]}</Badge>
                        <Badge variant="default">{CATEGORIES.find((c) => c.value === q.category)?.label}</Badge>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleQuestionFavorite(q.id); }}
                      className="p-1.5 text-slate-400 flex-shrink-0"
                    >
                      <Heart className={cn("w-4 h-4", favoriteQuestions.has(q.id) && "fill-red-500 text-red-500")} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <FileQuestion className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="arabic-text">لا توجد أسئلة في هذا الفلتر</p>
              </div>
            )}
          </>
        )}

        {/* Detail Modal */}
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="تفاصيل السؤال" size="lg">
          {selected && (
            <div className="space-y-4">
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100 arabic-text mb-1">{selected.question}</p>
                {selected.germanQuestion && <p className="text-sm text-slate-500 italic">{selected.germanQuestion}</p>}
              </div>

              <div className="flex gap-2">
                <Badge variant={DIFFICULTY_BADGE[selected.difficulty]}>{DIFFICULTY_LABEL[selected.difficulty]}</Badge>
                <Badge variant="default">{CATEGORIES.find((c) => c.value === selected.category)?.label}</Badge>
              </div>

              <div className="space-y-2">
                {selected.answers.map((ans, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-3 rounded-xl text-sm arabic-text font-medium",
                      i === selected.correctAnswer
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700"
                        : "bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    {i === selected.correctAnswer && <CheckCircle className="w-4 h-4 inline mr-1 text-green-600" />}
                    {ans}
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <h3 className="font-bold text-blue-700 dark:text-blue-300 arabic-text text-sm mb-1">الشرح</h3>
                <p className="text-slate-700 dark:text-slate-300 arabic-text text-sm">{selected.explanation}</p>
              </div>

              {selected.germanExplanation && (
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-1">Erklärung</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{selected.germanExplanation}</p>
                </div>
              )}

              <button
                onClick={() => toggleQuestionFavorite(selected.id)}
                className={cn("btn-secondary flex items-center gap-2", favoriteQuestions.has(selected.id) && "text-red-500")}
              >
                <Heart className={cn("w-4 h-4", favoriteQuestions.has(selected.id) && "fill-red-500")} />
                <span className="arabic-text">{favoriteQuestions.has(selected.id) ? "إزالة من المفضلة" : "إضافة للمفضلة"}</span>
              </button>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}
