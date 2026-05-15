"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppStore } from "@/store/appStore";
import { Navbar } from "@/components/layout/Navbar";
import { SearchBar } from "@/components/ui/SearchBar";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import type { PersonalNote } from "@/types";
import { cn } from "@/lib/utils";
import {
  Plus, Edit3, Trash2, CheckCircle, Circle, Search,
  StickyNote, Download, Upload, Tag, Calendar
} from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = [
  "عام",
  "قواعد المرور",
  "علامات الطريق",
  "سلامة المركبة",
  "الإسعافات الأولية",
  "مفردات",
  "أخرى",
];

function NoteForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<PersonalNote>;
  onSave: (data: Omit<PersonalNote, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [category, setCategory] = useState(initial?.category ?? "عام");
  const [isSolved, setIsSolved] = useState(initial?.isSolved ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("يرجى إدخال العنوان"); return; }
    onSave({ title: title.trim(), content: content.trim(), category, isSolved });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 arabic-text mb-1">
          العنوان *
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="عنوان الملاحظة..."
          className="input-base arabic-text"
          dir="rtl"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 arabic-text mb-1">
          المحتوى
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="اكتب ملاحظتك هنا..."
          rows={5}
          className="input-base arabic-text resize-none"
          dir="rtl"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 arabic-text mb-1">
          التصنيف
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-base arabic-text"
          dir="rtl"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isSolved}
          onChange={(e) => setIsSolved(e.target.checked)}
          className="w-4 h-4 rounded text-green-600"
        />
        <span className="text-sm text-slate-700 dark:text-slate-300 arabic-text">تم حلها / إنجازها</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1 arabic-text">
          حفظ الملاحظة
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1 arabic-text">
          إلغاء
        </button>
      </div>
    </form>
  );
}

function NoteCard({
  note,
  onEdit,
  onDelete,
  onToggleSolved,
  onClick,
}: {
  note: PersonalNote;
  onEdit: () => void;
  onDelete: () => void;
  onToggleSolved: () => void;
  onClick: () => void;
}) {
  const formattedDate = new Date(note.createdAt).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={cn(
        "section-card card-hover cursor-pointer animate-fade-in",
        note.isSolved && "opacity-75 border-green-200 dark:border-green-800"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3
          className={cn(
            "font-bold text-slate-900 dark:text-slate-100 arabic-text text-base",
            note.isSolved && "line-through text-slate-500"
          )}
        >
          {note.title}
        </h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSolved(); }}
            className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-400"
            title="تبديل الحل"
          >
            {note.isSolved
              ? <CheckCircle className="w-4 h-4 text-green-500" />
              : <Circle className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-500"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {note.content && (
        <p className="text-sm text-slate-600 dark:text-slate-400 arabic-text line-clamp-3 mb-3">
          {note.content}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-3 h-3 text-slate-400" />
          <Badge variant={note.isSolved ? "success" : "default"}>{note.category}</Badge>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Calendar className="w-3 h-3" />
          <span className="arabic-text">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const { personalNotes, setPersonalNotes, addNote, updateNote, deleteNote, toggleNoteSolved } = useAppStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showSolvedOnly, setShowSolvedOnly] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<PersonalNote | null>(null);
  const [viewingNote, setViewingNote] = useState<PersonalNote | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load initial notes from API if store is empty
  useEffect(() => {
    if (personalNotes.length === 0) {
      fetch("/api/personal-notes")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setPersonalNotes(data);
          }
        })
        .catch(() => {});
    }
  }, [personalNotes.length, setPersonalNotes]);

  const filtered = useMemo(() => {
    let notes = personalNotes;
    if (activeCategory !== "all") notes = notes.filter((n) => n.category === activeCategory);
    if (showSolvedOnly) notes = notes.filter((n) => n.isSolved);
    if (search.trim()) {
      const q = search.toLowerCase();
      notes = notes.filter(
        (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }
    return [...notes].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [personalNotes, activeCategory, showSolvedOnly, search]);

  const solvedCount = personalNotes.filter((n) => n.isSolved).length;

  const handleAdd = (data: Omit<PersonalNote, "id" | "createdAt" | "updatedAt">) => {
    addNote(data);
    setAddModalOpen(false);
    toast.success("تمت إضافة الملاحظة! 📝");
  };

  const handleEdit = (data: Omit<PersonalNote, "id" | "createdAt" | "updatedAt">) => {
    if (!editingNote) return;
    updateNote(editingNote.id, data);
    setEditingNote(null);
    toast.success("تم تحديث الملاحظة!");
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    setDeleteConfirm(null);
    setViewingNote(null);
    toast.success("تم حذف الملاحظة");
  };

  const handleToggleSolved = (id: string) => {
    toggleNoteSolved(id);
    const note = personalNotes.find((n) => n.id === id);
    toast.success(note?.isSolved ? "تم تحديدها كغير منجزة" : "تم تحديدها كمنجزة ✓");
  };

  const exportNotes = () => {
    const content = personalNotes
      .map(
        (n) =>
          `# ${n.title}\nالتصنيف: ${n.category}\nالحالة: ${n.isSolved ? "منجز" : "قيد العمل"}\n\n${n.content}\n\n---`
      )
      .join("\n\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fuhrerschein-notes.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير الملاحظات!");
  };

  const importNotes = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (Array.isArray(data)) {
            data.forEach((n) => addNote(n));
            toast.success(`تم استيراد ${data.length} ملاحظة!`);
          }
        } catch {
          toast.error("ملف غير صالح");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 arabic-text mb-2">
              ملاحظاتي
            </h1>
            <p className="text-slate-500 arabic-text">
              {personalNotes.length} ملاحظة — {solvedCount} منجزة
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <button onClick={exportNotes} className="btn-secondary flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              <span className="arabic-text hidden sm:inline">تصدير</span>
            </button>
            <button onClick={importNotes} className="btn-secondary flex items-center gap-2 text-sm">
              <Upload className="w-4 h-4" />
              <span className="arabic-text hidden sm:inline">استيراد</span>
            </button>
            <button
              onClick={() => setAddModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="arabic-text">إضافة ملاحظة</span>
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="section-card text-center py-3">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{personalNotes.length}</p>
            <p className="text-xs text-slate-500 arabic-text">إجمالي الملاحظات</p>
          </div>
          <div className="section-card text-center py-3">
            <p className="text-2xl font-bold text-green-600">{solvedCount}</p>
            <p className="text-xs text-slate-500 arabic-text">منجزة</p>
          </div>
          <div className="section-card text-center py-3">
            <p className="text-2xl font-bold text-orange-600">{personalNotes.length - solvedCount}</p>
            <p className="text-xs text-slate-500 arabic-text">قيد العمل</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="ابحث في الملاحظات..."
            className="flex-1"
          />
          <button
            onClick={() => setShowSolvedOnly(!showSolvedOnly)}
            className={cn(
              "btn-secondary flex items-center gap-2",
              showSolvedOnly && "bg-green-100 text-green-700 dark:bg-green-900/30"
            )}
          >
            <CheckCircle className={cn("w-4 h-4", showSolvedOnly && "text-green-600")} />
            <span className="arabic-text">المنجزة فقط</span>
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors arabic-text",
              activeCategory === "all"
                ? "bg-orange-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            )}
          >
            الكل
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors arabic-text",
                activeCategory === cat
                  ? "bg-orange-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <p className="text-sm text-slate-500 mb-4 arabic-text">
          عرض {filtered.length} من {personalNotes.length} ملاحظة
        </p>

        {/* Notes grid */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => setViewingNote(note)}
                onEdit={() => setEditingNote(note)}
                onDelete={() => setDeleteConfirm(note.id)}
                onToggleSolved={() => handleToggleSolved(note.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <StickyNote className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="arabic-text mb-4">
              {search || activeCategory !== "all" ? "لا توجد ملاحظات تطابق البحث" : "لا توجد ملاحظات بعد"}
            </p>
            {!search && activeCategory === "all" && (
              <button onClick={() => setAddModalOpen(true)} className="btn-primary">
                <Plus className="w-4 h-4 inline mr-1" />
                <span className="arabic-text">إضافة أول ملاحظة</span>
              </button>
            )}
          </div>
        )}

        {/* Add Modal */}
        <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="إضافة ملاحظة جديدة" size="md">
          <NoteForm onSave={handleAdd} onCancel={() => setAddModalOpen(false)} />
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={!!editingNote} onClose={() => setEditingNote(null)} title="تعديل الملاحظة" size="md">
          {editingNote && (
            <NoteForm
              initial={editingNote}
              onSave={handleEdit}
              onCancel={() => setEditingNote(null)}
            />
          )}
        </Modal>

        {/* View Modal */}
        <Modal isOpen={!!viewingNote} onClose={() => setViewingNote(null)} title={viewingNote?.title} size="md">
          {viewingNote && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={viewingNote.isSolved ? "success" : "warning"}>
                  {viewingNote.isSolved ? "منجزة" : "قيد العمل"}
                </Badge>
                <Badge variant="default">{viewingNote.category}</Badge>
              </div>
              {viewingNote.content ? (
                <p className="text-slate-700 dark:text-slate-300 arabic-text whitespace-pre-wrap leading-relaxed">
                  {viewingNote.content}
                </p>
              ) : (
                <p className="text-slate-400 arabic-text italic">لا يوجد محتوى</p>
              )}
              <div className="text-xs text-slate-400 arabic-text">
                أُنشئت: {new Date(viewingNote.createdAt).toLocaleDateString("ar-SA")}
                {" · "}
                آخر تعديل: {new Date(viewingNote.updatedAt).toLocaleDateString("ar-SA")}
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setViewingNote(null); setEditingNote(viewingNote); }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="arabic-text">تعديل</span>
                </button>
                <button
                  onClick={() => handleToggleSolved(viewingNote.id)}
                  className={cn("btn-secondary flex items-center gap-2", viewingNote.isSolved && "text-green-600")}
                >
                  {viewingNote.isSolved ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4" />}
                  <span className="arabic-text">{viewingNote.isSolved ? "تحديدها كغير منجزة" : "تحديدها كمنجزة"}</span>
                </button>
                <button
                  onClick={() => { setDeleteConfirm(viewingNote.id); setViewingNote(null); }}
                  className="btn-secondary flex items-center gap-2 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="arabic-text">حذف</span>
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Confirm Modal */}
        <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="تأكيد الحذف" size="sm">
          <div className="text-center">
            <p className="text-slate-700 dark:text-slate-300 arabic-text mb-6">
              هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg arabic-text transition-colors"
              >
                حذف
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-secondary arabic-text">
                إلغاء
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
}
