export interface Subject {
  id: string;
  name: string;
  hindiName: string;
  icon: string; // Lucide icon identifier
  description: string;
  hindiDescription: string;
  topics: string[];
}

export interface Stream {
  id: "science" | "commerce" | "arts" | "general";
  name: string;
  hindiName: string;
  subjects: Subject[];
}

export interface Question {
  id: number;
  questionText: string;
  options: string[]; // Always 4 options
  correctOption: string; // "A", "B", "C", "D"
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface MockTest {
  subject: string;
  className: string;
  stream?: string;
  questions: Question[];
}

export interface DailyRoutineItem {
  timeSlot: string;
  activity: string;
  focusArea: string;
  tip: string;
}

export interface SubjectStrategy {
  subject: string;
  strategy: string;
  priorityTopics: string[];
}

export interface StudySchedule {
  title: string;
  overview: string;
  dailyRoutine: DailyRoutineItem[];
  subjectWiseStrategy: SubjectStrategy[];
  weeklyChecklist: string[];
  importantTips: string[];
}

export interface SavedScheduleInput {
  className: string;
  stream: string;
  availableHours: number;
  examDate: string;
  weakSubjects: string;
  strongSubjects: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  rank: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  className: "10th" | "12th";
  stream?: string;
  district: string;
  subjectName: string;
  isCurrentUser?: boolean;
  timestamp: string;
}

export interface SavedTest {
  id: string;
  subject: string;
  className: string;
  stream?: string;
  questions: Question[];
  selectedAnswers: Record<number, string>;
  score: number;
  totalQuestions: number;
  percentage: number;
  timestamp: string;
}

export interface PersonalNote {
  id: string;
  title: string;
  content: string;
  subject?: string;
  timestamp: string;
}


