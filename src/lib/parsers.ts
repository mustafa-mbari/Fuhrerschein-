import fs from "fs";
import path from "path";
import type {
  VocabularyItem,
  TrafficSign,
  TheoryQuestion,
  PersonalNote,
} from "@/types";

function readDataFile(filename: string): string {
  const filePath = path.join(process.cwd(), "src", "data", filename);
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}

function parseLines(content: string): string[] {
  return content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}

export function parseVocabulary(): VocabularyItem[] {
  const content = readDataFile("vocabulary.txt");
  const lines = parseLines(content);
  const items: VocabularyItem[] = [];

  for (const line of lines) {
    const parts = line.split("|");
    if (parts.length >= 6) {
      items.push({
        id: parts[0],
        german: parts[1],
        arabic: parts[2],
        germanExample: parts[3],
        arabicExample: parts[4],
        category: parts[5] as VocabularyItem["category"],
        isFavorite: false,
      });
    }
  }

  return items;
}

export function parseTrafficSigns(): TrafficSign[] {
  const content = readDataFile("traffic-signs.txt");
  const lines = parseLines(content);
  const signs: TrafficSign[] = [];

  for (const line of lines) {
    const parts = line.split("|");
    if (parts.length >= 10) {
      signs.push({
        id: parts[0],
        germanName: parts[1],
        arabicName: parts[2],
        description: parts[3],
        arabicDescription: parts[4],
        rules: parts[5].split(";").filter(Boolean),
        arabicRules: parts[6].split(";").filter(Boolean),
        examples: parts[7].split(";").filter(Boolean),
        arabicExamples: parts[8].split(";").filter(Boolean),
        category: parts[9].trim() as TrafficSign["category"],
        isFavorite: false,
      });
    }
  }

  return signs;
}

export function parseTheoryQuestions(): TheoryQuestion[] {
  const content = readDataFile("theory-questions.txt");
  const lines = parseLines(content);
  const questions: TheoryQuestion[] = [];

  for (const line of lines) {
    const parts = line.split("|");
    if (parts.length >= 9) {
      questions.push({
        id: parts[0],
        question: parts[1],
        germanQuestion: parts[2] || undefined,
        answers: parts[3].split(";").filter(Boolean),
        correctAnswer: parseInt(parts[4], 10),
        explanation: parts[5],
        germanExplanation: parts[6] || undefined,
        category: parts[7] as TheoryQuestion["category"],
        difficulty: parts[8].trim() as TheoryQuestion["difficulty"],
        isFavorite: false,
      });
    }
  }

  return questions;
}

export function parsePersonalNotes(): PersonalNote[] {
  const content = readDataFile("personal-notes.txt");
  const lines = parseLines(content);
  const notes: PersonalNote[] = [];

  for (const line of lines) {
    const parts = line.split("|");
    if (parts.length >= 7) {
      notes.push({
        id: parts[0],
        title: parts[1],
        content: parts[2],
        category: parts[3],
        isSolved: parts[4] === "true",
        createdAt: parts[5],
        updatedAt: parts[6],
      });
    }
  }

  return notes;
}
