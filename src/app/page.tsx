"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/appStore";
import { Navbar } from "@/components/layout/Navbar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  BookOpen,
  SignpostBig,
  FileQuestion,
  NotebookPen,
  TrendingUp,
  Award,
  Target,
  Zap,
  ChevronRight,
  Star,
} from "lucide-react";

export default function HomePage() {
  const { stats, vocabulary, trafficSigns, theoryQuestions, personalNotes, setVocabulary, setTrafficSigns, setTheoryQuestions, setPersonalNotes, learnedVocab, learnedSigns } = useAppStore();

  useEffect(() => {
    const load = async () => {
      if (vocabulary.length === 0) {
        const [vocab, signs, questions, notes] = await Promise.all([
          fetch("/api/vocabulary").then((r) => r.json()),
          fetch("/api/traffic-signs").then((r) => r.json()),
          fetch("/api/theory-questions").then((r) => r.json()),
          fetch("/api/personal-notes").then((r) => r.json()),
        ]);
        setVocabulary(vocab);
        setTrafficSigns(signs);
        setTheoryQuestions(questions);
        if (notes && Array.isArray(notes) && personalNotes.length === 0) {
          setPersonalNotes(notes);
        }
      }
    };
    load();
  }, [vocabulary.length, personalNotes.length, setVocabulary, setTrafficSigns, setTheoryQuestions, setPersonalNotes]);

  const sections = [
    {
      href: "/vocabulary",
      title: "المفردات",
      titleDe: "Vokabeln & Kommunikation",
      description: "تعلم الكلمات والعبارات الضرورية للتواصل مع المدرب والممتحن",
      icon: BookOpen,
      color: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      count: vocabulary.length,
      learned: learnedVocab.size,
      unit: "مفردة",
    },
    {
      href: "/signs",
      title: "علامات المرور",
      titleDe: "Verkehrszeichen",
      description: "تعلم أهم 50 علامة مرورية مع الشرح التفصيلي بالعربية",
      icon: SignpostBig,
      color: "from-green-500 to-green-600",
      bgLight: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      count: trafficSigns.length,
      learned: learnedSigns.size,
      unit: "علامة",
    },
    {
      href: "/theory",
      title: "أسئلة النظري",
      titleDe: "Theorie Prüfung",
      description: "أهم الأسئلة في امتحان النظري مع الإجابات والشرح",
      icon: FileQuestion,
      color: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      count: theoryQuestions.length,
      learned: stats.quizzesCompleted,
      unit: "سؤال",
    },
    {
      href: "/notes",
      title: "ملاحظاتي",
      titleDe: "Meine Notizen",
      description: "احفظ ملاحظاتك وأسئلتك الشخصية وتابع تقدمك",
      icon: NotebookPen,
      color: "from-orange-500 to-orange-600",
      bgLight: "bg-orange-50 dark:bg-orange-900/20",
      textColor: "text-orange-600 dark:text-orange-400",
      count: personalNotes.length,
      learned: personalNotes.filter((n) => n.isSolved).length,
      unit: "ملاحظة",
    },
  ];

  const statCards = [
    { label: "مفردات تعلمتها", value: stats.vocabularyLearned, icon: BookOpen, color: "text-blue-500" },
    { label: "علامات تعلمتها", value: stats.signsLearned, icon: Target, color: "text-green-500" },
    { label: "اختبارات أكملتها", value: stats.quizzesCompleted, icon: Award, color: "text-purple-500" },
    { label: "مجموع النقاط", value: stats.totalScore, icon: TrendingUp, color: "text-orange-500" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            <span className="arabic-text">استعد لرخصة القيادة الألمانية</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Führerschein
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 arabic-text max-w-2xl mx-auto">
            منصتك الشاملة لتعلم واجتياز امتحان رخصة القيادة الألمانية 🇩🇪
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="section-card text-center">
                <Icon className={`w-6 h-6 ${s.color} mx-auto mb-2`} />
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
                <p className="text-xs text-slate-500 arabic-text">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Section Cards */}
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const pct = sec.count > 0 ? Math.round((sec.learned / sec.count) * 100) : 0;
            return (
              <Link
                key={sec.href}
                href={sec.href}
                className="group section-card card-hover block"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${sec.bgLight} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${sec.textColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 arabic-text">
                        {sec.title}
                      </h2>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{sec.titleDe}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 arabic-text mb-3 line-clamp-2">
                      {sec.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="arabic-text">{sec.count} {sec.unit}</span>
                      <span className="arabic-text">{pct}% مكتمل</span>
                    </div>
                    <ProgressBar value={sec.learned} max={sec.count} color="blue" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick tip */}
        <div className="section-card bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-100 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 arabic-text mb-1">نصيحة اليوم</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 arabic-text">
                ابدأ بتعلم المفردات الأساسية لفهم تعليمات الممتحن، ثم انتقل لعلامات المرور. حاول 10 دقائق يومياً للحصول على نتائج أفضل.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
