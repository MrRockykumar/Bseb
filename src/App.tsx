import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Book,
  Brain,
  Calculator,
  Calendar,
  ChevronRight,
  Clock,
  Compass,
  Cpu,
  Dna,
  FileText,
  FlaskConical,
  Globe,
  Languages,
  Lightbulb,
  Loader2,
  Map,
  Percent,
  Play,
  Printer,
  RefreshCw,
  RotateCcw,
  Scroll,
  Search,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertTriangle,
  Check,
  Bookmark,
  Briefcase,
  Send,
  MessageSquare,
  Headphones,
  X,
  Zap
} from "lucide-react";

import { STREAMS_12TH, SUBJECTS_10TH, PRE_BAKED_QUESTIONS } from "./data";
import { Subject, Stream, Question, MockTest, StudySchedule, SavedScheduleInput, LeaderboardEntry } from "./types";
import { generateDailyQuestions } from "./questionGenerator";

// Helper to render Lucide icon by string name
const IconRenderer = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case "FlaskConical": return <FlaskConical className={className} />;
    case "Calculator": return <Calculator className={className} />;
    case "Binary": return <Brain className={className} />;
    case "Dna": return <Dna className={className} />;
    case "BookOpen": return <BookOpen className={className} />;
    case "Languages": return <Languages className={className} />;
    case "Briefcase": return <Briefcase className={className} />;
    case "TrendingUp": return <TrendingUp className={className} />;
    case "Lightbulb": return <Lightbulb className={className} />;
    case "Scroll": return <Scroll className={className} />;
    case "Globe": return <Globe className={className} />;
    case "Map": return <Map className={className} />;
    case "Users": return <Users className={className} />;
    case "Percent": return <Percent className={className} />;
    case "Compass": return <Compass className={className} />;
    case "Book": return <Book className={className} />;
    default: return <BookOpen className={className} />;
  }
};

// Helper to get Featured Subject based on day of week
const getFeaturedSubjectForDay = (classLevel: "10th" | "12th", streamId: string) => {
  const day = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  if (classLevel === "10th") {
    switch (day) {
      case 1: return SUBJECTS_10TH[0]; // Science
      case 2: return SUBJECTS_10TH[1]; // Maths
      case 3: return SUBJECTS_10TH[2]; // Social Sci
      case 4: return SUBJECTS_10TH[3]; // Hindi
      case 5: return SUBJECTS_10TH[4]; // Sanskrit
      case 6: return SUBJECTS_10TH[5] || SUBJECTS_10TH[0]; // English
      default: return SUBJECTS_10TH[0]; // Sunday - default to Science
    }
  } else {
    const currentStream = STREAMS_12TH.find(s => s.id === streamId);
    if (!currentStream) return STREAMS_12TH[0].subjects[0];
    
    const count = currentStream.subjects.length;
    const index = day % count;
    return currentStream.subjects[index] || currentStream.subjects[0];
  }
};

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: "top-1",
    name: "Sneha Kumari",
    rank: 1,
    score: 15,
    totalQuestions: 15,
    percentage: 100,
    className: "10th",
    district: "Patna (पटना)",
    subjectName: "All Subjects",
    timestamp: "2 mins ago"
  },
  {
    id: "top-2",
    name: "Aman Raj",
    rank: 2,
    score: 15,
    totalQuestions: 15,
    percentage: 100,
    className: "12th",
    stream: "Science",
    district: "Gaya (गया)",
    subjectName: "Physics",
    timestamp: "12 mins ago"
  },
  {
    id: "top-3",
    name: "Priyanshu Kumar",
    rank: 3,
    score: 14,
    totalQuestions: 15,
    percentage: 93,
    className: "12th",
    stream: "Science",
    district: "Muzaffarpur (मुजफ्फरपुर)",
    subjectName: "All Subjects",
    timestamp: "25 mins ago"
  },
  {
    id: "top-4",
    name: "Ananya Singh",
    rank: 4,
    score: 14,
    totalQuestions: 15,
    percentage: 93,
    className: "10th",
    district: "Darbhanga (दरभंगा)",
    subjectName: "Mathematics",
    timestamp: "45 mins ago"
  },
  {
    id: "top-5",
    name: "Vikash Kumar",
    rank: 5,
    score: 13,
    totalQuestions: 15,
    percentage: 87,
    className: "12th",
    stream: "Commerce",
    district: "Bhagalpur (भागलपुर)",
    subjectName: "Accountancy",
    timestamp: "1 hour ago"
  },
  {
    id: "top-6",
    name: "Priya Raj",
    rank: 6,
    score: 13,
    totalQuestions: 15,
    percentage: 87,
    className: "12th",
    stream: "Arts",
    district: "Nalanda (नालंदा)",
    subjectName: "History",
    timestamp: "2 hours ago"
  },
  {
    id: "top-7",
    name: "Rishi Dev",
    rank: 7,
    score: 12,
    totalQuestions: 15,
    percentage: 80,
    className: "10th",
    district: "Arrah (आरा)",
    subjectName: "Social Science",
    timestamp: "3 hours ago"
  },
  {
    id: "top-8",
    name: "Karan Kumar",
    rank: 8,
    score: 12,
    totalQuestions: 15,
    percentage: 80,
    className: "12th",
    stream: "Science",
    district: "Saran (सारण)",
    subjectName: "Chemistry",
    timestamp: "4 hours ago"
  }
];

export default function App() {
  // Navigation / Tabs state
  const [activeTab, setActiveTab] = useState<"tests" | "schedule" | "chat">("tests");
  const [selectedClass, setSelectedClass] = useState<"12th" | "10th">("12th");
  const [selectedStreamId, setSelectedStreamId] = useState<string>("science"); // Default 12th stream
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Test state
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isConfiguringTest, setIsConfiguringTest] = useState(false);
  const [directGenerateMode, setDirectGenerateMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("bseb_direct_generate") === "true";
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("bseb_direct_generate", String(directGenerateMode));
    } catch (e) {}
  }, [directGenerateMode]);
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [selectedYear, setSelectedYear] = useState<string>("2026 (New PYQ)");
  const [testLanguage, setTestLanguage] = useState<string>("Bilingual (Hindi & English)");
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const [currentTest, setCurrentTest] = useState<MockTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [testSource, setTestSource] = useState<string>("Google Search Grounding AI");

  // Schedule/Planner form state
  const [scheduleInput, setScheduleInput] = useState<SavedScheduleInput>({
    className: "12th",
    stream: "Science",
    availableHours: 4,
    examDate: "February 2026",
    weakSubjects: "Physics, Mathematics",
    strongSubjects: "Chemistry, English"
  });
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState<StudySchedule | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem("bseb_mock_leaderboard");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("localStorage read denied for bseb_mock_leaderboard:", e);
    }
    return INITIAL_LEADERBOARD;
  });

  const [leaderboardClassFilter, setLeaderboardClassFilter] = useState<"All" | "10th" | "12th">("All");
  const [leaderboardSearchQuery, setLeaderboardSearchQuery] = useState("");
  const [showLeaderboardSubmit, setShowLeaderboardSubmit] = useState(false);
  const [leaderboardFormName, setLeaderboardFormName] = useState("");
  const [leaderboardFormDistrict, setLeaderboardFormDistrict] = useState("Patna (पटना)");
  const [wasLeaderboardSubmitted, setWasLeaderboardSubmitted] = useState(false);
  const [latestUserRankId, setLatestUserRankId] = useState<string | null>(null);

  // Chatting Room state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatUserId] = useState(() => {
    try {
      let id = localStorage.getItem("bseb_chat_userid");
      if (!id) {
        id = `user-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        localStorage.setItem("bseb_chat_userid", id);
      }
      return id;
    } catch (e) {
      return `user-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
  });

  const [chatNickname, setChatNickname] = useState(() => {
    try {
      const saved = localStorage.getItem("bseb_chat_nickname");
      if (saved) return saved;
    } catch (e) {}
    const adjectives = ["Topper", "Scholar", "Warrior", "Champion", "Superb", "Bright", "Honest", "Curious"];
    const names = ["Ankit", "Vikram", "Sneha", "Karan", "Priya", "Rahul", "Aarti", "Sumit", "Deepak", "Riya"];
    const randAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randName = names[Math.floor(Math.random() * names.length)];
    const randNum = Math.floor(100 + Math.random() * 900);
    return `${randAdj} ${randName} #${randNum}`;
  });

  const [chatDistrict, setChatDistrict] = useState(() => {
    try {
      return localStorage.getItem("bseb_chat_district") || "Patna (पटना)";
    } catch (e) {
      return "Patna (पटना)";
    }
  });

  const [chatClass, setChatClass] = useState<"10th" | "12th" | "All">(() => {
    try {
      return (localStorage.getItem("bseb_chat_class") as any) || "All";
    } catch (e) {
      return "All";
    }
  });

  const [chatNewMessage, setChatNewMessage] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatFilter, setChatFilter] = useState<"All" | "10th" | "12th">("All");
  const [chatError, setChatError] = useState<string | null>(null);

  // Sync profile details to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("bseb_chat_nickname", chatNickname);
    } catch (e) {}
  }, [chatNickname]);

  useEffect(() => {
    try {
      localStorage.setItem("bseb_chat_district", chatDistrict);
    } catch (e) {}
  }, [chatDistrict]);

  useEffect(() => {
    try {
      localStorage.setItem("bseb_chat_class", chatClass);
    } catch (e) {}
  }, [chatClass]);

  // Chat window auto-scroll ref
  const chatBottomRef = React.useRef<HTMLDivElement>(null);

  const scrollChatToBottom = () => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll to bottom when messages list updates or activeTab becomes chat
  useEffect(() => {
    if (activeTab === "chat" && chatMessages.length > 0) {
      // Small timeout to allow render completion
      const timer = setTimeout(scrollChatToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [chatMessages, activeTab]);

  // Load and poll chat messages
  useEffect(() => {
    if (activeTab !== "chat") return;

    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/chat/messages");
        if (res.ok) {
          const data = await res.json();
          setChatMessages(data);
          setChatError(null);
        } else {
          setChatError("Failed to fetch recent messages. Refreshing...");
        }
      } catch (err) {
        console.error("Error loading chat messages:", err);
        setChatError("Network issue: Unable to connect to the topper discussion server.");
      }
    };

    fetchMessages();

    // Poll every 5 seconds for fresh community messages (more efficient)
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatNewMessage.trim()) return;

    const sender = chatNickname.trim() || "Anonym Topper";
    setIsSendingChat(true);
    setChatError(null);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: chatUserId,
          senderName: sender,
          className: chatClass,
          district: chatDistrict,
          message: chatNewMessage
        })
      });

      if (res.ok) {
        const msg = await res.json();
        setChatMessages(prev => [...prev, msg]);
        setChatNewMessage("");
        setChatError(null);
      } else {
        const errData = await res.json();
        setChatError(errData.error || "Failed to broadcast message to student group.");
      }
    } catch (err) {
      console.error("Error sending chat message:", err);
      setChatError("Unable to post. Please verify your internet connection and try again.");
    } finally {
      setIsSendingChat(false);
    }
  };

  // Search filter for subjects
  const [subjectSearchQuery, setSubjectSearchQuery] = useState("");

  // Statistics tracker (saved locally for active session)
  const [attemptedCount, setAttemptedCount] = useState<number>(0);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [savedTimetable, setSavedTimetable] = useState<StudySchedule | null>(null);

  // Quick tests listed in today's mock schedule
  const quickScheduleTests = [
    { id: "physics", title: "Physics - Previous Year Series", stream: "12th Science", marks: 70, time: "3 Hours", timeSlot: "09:00 AM", color: "indigo" },
    { id: "accountancy", title: "Accountancy - Official PYQ Set", stream: "12th Commerce", marks: 100, time: "3 Hours", timeSlot: "01:30 PM", color: "orange" },
    { id: "matric_science", title: "Science - Board Exam Special", stream: "10th Matric", marks: 80, time: "2.5 Hours", timeSlot: "04:00 PM", color: "emerald" },
  ];

  // Load from local storage
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem("bseb_stats");
      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        if (parsed && typeof parsed === "object") {
          setAttemptedCount(typeof parsed.attempted === "number" ? parsed.attempted : 0);
          setAverageScore(typeof parsed.avgScore === "number" ? parsed.avgScore : 0);
        }
      }
    } catch (e) {
      console.warn("localStorage read denied for bseb_stats:", e);
    }

    try {
      const savedSched = localStorage.getItem("bseb_saved_schedule");
      if (savedSched) {
        const parsed = JSON.parse(savedSched);
        if (parsed && typeof parsed === "object") {
          setSavedTimetable(parsed);
        }
      }
    } catch (e) {
      console.warn("localStorage read denied for bseb_saved_schedule:", e);
    }
  }, []);

  // Save stats
  const saveStats = (newCount: number, scorePercentage: number) => {
    const totalScore = averageScore * attemptedCount + scorePercentage;
    const nextCount = newCount;
    const nextAvg = Math.round(totalScore / nextCount);
    setAttemptedCount(nextCount);
    setAverageScore(nextAvg);
    try {
      localStorage.setItem("bseb_stats", JSON.stringify({ attempted: nextCount, avgScore: nextAvg }));
    } catch (e) {
      console.warn("localStorage write denied for bseb_stats:", e);
    }
  };

  // Trigger test setup for a subject
  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    if (directGenerateMode) {
      triggerTestGeneration(subject, numQuestions, testLanguage, selectedYear);
    } else {
      setIsConfiguringTest(true);
    }
  };

  // Trigger combined (all subjects) test setup
  const handleStartCombinedTest = () => {
    const virtualSubject: Subject = {
      id: "all_subjects",
      name: "All Subjects",
      hindiName: "सभी विषय संयुक्त",
      icon: "Sparkles",
      description: `A master exam covering questions from all major core subjects of Bihar Board Class ${selectedClass} ${selectedClass === "12th" ? `(${selectedStreamId.toUpperCase()})` : ""}.`,
      hindiDescription: `बिहार बोर्ड कक्षा ${selectedClass === "10th" ? "10वीं" : "12वीं"} के सभी मुख्य विषयों के प्रश्नों का एक संयुक्त मॉक टेस्ट।`,
      topics: ["Full Syllabus"]
    };
    setSelectedSubject(virtualSubject);
    if (directGenerateMode) {
      triggerTestGeneration(virtualSubject, 15, testLanguage, selectedYear);
    } else {
      setNumQuestions(15);
      setIsConfiguringTest(true);
    }
  };

  // Centralized robust test generation function
  const triggerTestGeneration = async (
    subject: Subject,
    qCount: number,
    lang: string,
    yearStr: string
  ) => {
    setIsLoadingTest(true);
    setIsConfiguringTest(false);
    setSelectedAnswers({});
    setIsTestSubmitted(false);
    setCurrentQuestionIndex(0);
    setShowExplanation({});
    setWasLeaderboardSubmitted(false);
    setShowLeaderboardSubmit(false);

    try {
      const response = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          className: selectedClass,
          stream: selectedClass === "12th" ? selectedStreamId : undefined,
          subject: subject.name,
          language: lang,
          numQuestions: qCount,
          year: yearStr
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate test from server.");
      }

      const data = await response.json();
      if (data && data.questions && data.questions.length > 0) {
        setCurrentTest(data);
        setTestSource(`Google Grounding (${yearStr})`);
      } else {
        throw new Error("Incomplete questions structure returned.");
      }
    } catch (err) {
      console.warn("Using high-fidelity dynamic procedural generator fallback:", err);
      const todayStr = new Date().toDateString();
      const processedQuestions = generateDailyQuestions(
        subject.name,
        selectedClass,
        qCount,
        todayStr,
        selectedClass === "12th" ? selectedStreamId : undefined
      );

      setCurrentTest({
        subject: subject.name,
        className: selectedClass,
        stream: selectedClass === "12th" ? selectedStreamId : "General",
        questions: processedQuestions
      });
      setTestSource(`Local Generated PYQ (${yearStr})`);
    } finally {
      setIsLoadingTest(false);
    }
  };

  // Generate test using backend API with a fallback (modal submission)
  const handleStartTest = () => {
    if (!selectedSubject) return;
    triggerTestGeneration(selectedSubject, numQuestions, testLanguage, selectedYear);
  };

  // Generate Schedule using backend API
  const handleGenerateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingSchedule(true);
    setScheduleError(null);

    try {
      const response = await fetch("/api/generate-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          className: scheduleInput.className,
          stream: scheduleInput.className === "12th" ? scheduleInput.stream : "General Matric",
          availableHours: scheduleInput.availableHours,
          examDate: scheduleInput.examDate,
          weakSubjects: scheduleInput.weakSubjects,
          strongSubjects: scheduleInput.strongSubjects
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate custom study schedule.");
      }

      const data = await response.json();
      setGeneratedSchedule(data);
      setSavedTimetable(data);
      try {
        localStorage.setItem("bseb_saved_schedule", JSON.stringify(data));
      } catch (e) {
        console.warn("localStorage write denied for bseb_saved_schedule:", e);
      }
    } catch (err: any) {
      console.error(err);
      setScheduleError(err.message || "An error occurred while building the schedule.");
      
      // Fallback Static Beautiful Schedule
      const staticSchedule: StudySchedule = {
        title: `BSEB Class ${scheduleInput.className} Exam Warrior Routine`,
        overview: `Tailored study planner for Bihar Board with special focus on ${scheduleInput.weakSubjects}. Highly structured around 50% OMR (objective) and 50% descriptive format.`,
        dailyRoutine: [
          { timeSlot: "06:00 AM - 08:00 AM", activity: "High-Focus Core Learning", focusArea: `Study critical elements of ${scheduleInput.weakSubjects}.`, tip: "Morning study has peak brain retention capacity." },
          { timeSlot: "11:00 AM - 01:00 PM", activity: "Subjective Answer Writing & Formula Practice", focusArea: "Write responses on paper to simulate BSEB official answer booklet size.", tip: "Bihar Board requires neat cursive handwriting and clear step-marking." },
          { timeSlot: "03:00 PM - 04:30 PM", activity: "OMR Sheet Objective Mock Tests", focusArea: `Practice 50 MCQs daily in ${scheduleInput.strongSubjects}.`, tip: "Solve at least 50 MCQs daily to master the 50% objective weightage!" },
          { timeSlot: "08:00 PM - 09:30 PM", activity: "Revision & Next Day Planning", focusArea: "Revise formulas, historical dates, and chemical equations.", tip: "Use flashcards for rapid revision." }
        ],
        subjectWiseStrategy: [
          { subject: "Weak Subjects", strategy: "Dedicate first hours of the day. Draw diagrams and list major definitions.", priorityTopics: ["Formulas & Derivations", "High-Weightage PYQs"] },
          { subject: "Strong Subjects", strategy: "Revise via solving previous papers. Keep up the high score potential.", priorityTopics: ["Model Papers Practice", "Speed writing"] }
        ],
        weeklyChecklist: [
          "Complete at least 3 previous year mock tests on this portal.",
          "Solve 150 objective questions on OMR pattern.",
          "Revise formulas/theorems of weekly subjects twice.",
          "Write 2 long-form answers to master step-wise mark distribution."
        ],
        importantTips: [
          "Practice filling OMR circles with blue/black ball pen. Avoid overlapping.",
          "Keep high speed during the initial 1 hour to secure all objective questions.",
          "Bihar Board awards extra marks for neatness and mentioning correct section headers."
        ]
      };
      setGeneratedSchedule(staticSchedule);
      setSavedTimetable(staticSchedule);
      try {
        localStorage.setItem("bseb_saved_schedule", JSON.stringify(staticSchedule));
      } catch (e) {
        console.warn("localStorage write denied for bseb_saved_schedule:", e);
      }
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  // Submit test
  const handleSubmitTest = () => {
    setIsTestSubmitted(true);
    let correctCount = 0;
    currentTest?.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOption) {
        correctCount++;
      }
    });
    const percentage = Math.round((correctCount / (currentTest?.questions.length || 1)) * 100);
    saveStats(attemptedCount + 1, percentage);
  };

  // Submit to Daily Leaderboard/Rank List
  const handleLeaderboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderboardFormName.trim()) {
      return;
    }
    if (!currentTest) return;

    let correctCount = 0;
    currentTest.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOption) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / currentTest.questions.length) * 100);
    const uniqueId = `user-${Date.now()}`;

    const newEntry: LeaderboardEntry = {
      id: uniqueId,
      name: leaderboardFormName.trim(),
      rank: 1, // Recalculated below
      score: correctCount,
      totalQuestions: currentTest.questions.length,
      percentage: percentage,
      className: currentTest.className as "10th" | "12th",
      stream: currentTest.className === "12th" ? (currentTest.stream || selectedStreamId) : undefined,
      district: leaderboardFormDistrict,
      subjectName: currentTest.subject,
      isCurrentUser: true,
      timestamp: "Just now"
    };

    // Add to leaderboard
    const currentLeaderboard = Array.isArray(leaderboard) ? leaderboard : [];
    const updatedList = [...currentLeaderboard, newEntry];

    // Sort by percentage desc, then score desc
    updatedList.sort((a, b) => {
      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage;
      }
      return b.score - a.score;
    });

    // Assign correct ranks
    let currentRank = 1;
    const finalLeaderboard = updatedList.map((entry, index) => {
      if (index > 0 && entry.percentage < updatedList[index - 1].percentage) {
        currentRank = index + 1;
      }
      return {
        ...entry,
        rank: currentRank
      };
    });

    setLeaderboard(finalLeaderboard);
    try {
      localStorage.setItem("bseb_mock_leaderboard", JSON.stringify(finalLeaderboard));
    } catch (e) {
      console.warn("localStorage write denied for bseb_mock_leaderboard:", e);
    }
    setWasLeaderboardSubmitted(true);
    setLatestUserRankId(uniqueId);
    setShowLeaderboardSubmit(false);
  };

  // Filtered lists
  const current12thStream = STREAMS_12TH.find(s => s.id === selectedStreamId);
  const displayed12thSubjects = current12thStream
    ? current12thStream.subjects.filter(sub =>
        sub.name.toLowerCase().includes(subjectSearchQuery.toLowerCase()) ||
        sub.hindiName.includes(subjectSearchQuery)
      )
    : [];

  const displayed10thSubjects = SUBJECTS_10TH.filter(sub =>
    sub.name.toLowerCase().includes(subjectSearchQuery.toLowerCase()) ||
    sub.hindiName.includes(subjectSearchQuery)
  );

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans antialiased">
      {/* Top Notification Bar */}

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6" id="bseb-header">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white text-[11px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">BSEB 2026</span>
              <span className="text-slate-400 text-xs">• Bihar School Examination Board</span>
            </div>
            <h1 className="text-3xl font-extrabold text-indigo-950 tracking-tight mt-1 flex items-center gap-2">
              BSEB <span className="text-indigo-600">PYQ Mock Master</span>
              <Brain className="w-6 h-6 text-indigo-600" />
            </h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
              Interactive Arts, Science & Commerce Test Platform & Daily Study Planner • Run by Rocky Kumar
            </p>
          </div>

          {/* Controls / Active Students */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2 text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span>18,490+ Bihar Students Online</span>
            </div>
            
            {/* Nav Switchers */}
            <div className="bg-slate-200/80 p-1 rounded-xl flex gap-1">
              <button
                id="tab-tests"
                onClick={() => { setActiveTab("tests"); }}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "tests" ? "bg-white text-indigo-950 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                Mock Tests
              </button>
              <button
                id="tab-schedule"
                onClick={() => { setActiveTab("schedule"); }}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "schedule" ? "bg-white text-indigo-950 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
              >
                Daily Schedule
              </button>
              <button
                id="tab-chat"
                onClick={() => { setActiveTab("chat"); }}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "chat" ? "bg-white text-indigo-950 shadow-sm animate-pulse" : "text-slate-600 hover:text-slate-900"}`}
              >
                Free Chat Room 💬
              </button>
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* VIEW: MOCK TESTS & PYQS */}
        {/* ========================================================= */}
        {activeTab === "tests" && !currentTest && (
          <div className="space-y-6">
            
            {/* DAILY MOCK TEST HQ */}
            <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden" id="daily-challenge-hq">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/5 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8">
                
                {/* Left Column: Title & Calendar */}
                <div className="lg:max-w-xl space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />
                      Bihar Board Daily Mock Challenge
                    </span>
                    <span className="bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Combined & Separate Tests Included
                    </span>
                    <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-400" />
                      2026 PYQ Papers Active
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                      दैनिक मॉक परीक्षा केंद्र <span className="text-indigo-400 font-sans">Class 10 & 12</span>
                    </h2>
                    <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
                      Practice with our daily board curriculum schedule. You can solve a <strong>separate subject-specific test</strong> or take a <strong>unified combined test (all subjects)</strong> of your choice.
                    </p>
                  </div>

                  {/* Week calendar */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> BSEB Weekly Challenge Planner (विषय अनुसूची)
                    </h3>
                    <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold">
                      {[
                        { label: "Mon", sub10: "Sci", sub12: "Phy/Acc/Hist" },
                        { label: "Tue", sub10: "Math", sub12: "Chem/BST/Pol" },
                        { label: "Wed", sub10: "Soc", sub12: "Math/Eco/Geo" },
                        { label: "Thu", sub10: "Hin", sub12: "Bio/Ent/Soc" },
                        { label: "Fri", sub10: "San", sub12: "English" },
                        { label: "Sat", sub10: "Eng", sub12: "Hindi" },
                        { label: "Sun", sub10: "Combined", sub12: "Combined", isSpecial: true }
                      ].map((dayItem, index) => {
                        const isToday = new Date().getDay() === (index === 6 ? 0 : index + 1);
                        return (
                          <div 
                            key={index} 
                            className={`p-2 rounded-xl border flex flex-col justify-between transition-all ${
                              isToday 
                                ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20 scale-105" 
                                : "bg-white/5 border-white/5 text-slate-300"
                            }`}
                          >
                            <span className={`uppercase text-[8px] opacity-75 ${isToday ? "text-indigo-200" : "text-slate-400"}`}>
                              {dayItem.label}
                            </span>
                            <span className="block text-[10px] font-extrabold truncate mt-1">
                              {selectedClass === "10th" ? dayItem.sub10 : dayItem.sub12.split("/")[0]}
                            </span>
                            {isToday && (
                              <span className="text-[7px] bg-white text-indigo-950 px-1 py-0.5 rounded uppercase font-bold mt-1 tracking-wider animate-pulse">
                                Today
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Launcher Panel */}
                <div className="lg:w-96 flex flex-col justify-between bg-white/5 border border-white/10 p-5 rounded-2xl relative">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-sm text-indigo-300 uppercase tracking-wider">
                        Launch Daily Test
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-300">Class:</span>
                        <div className="bg-indigo-950 p-0.5 rounded-lg flex border border-white/10">
                          <button
                            id="daily-toggle-12"
                            onClick={() => setSelectedClass("12th")}
                            className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold transition-all ${selectedClass === "12th" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-300 hover:text-white"}`}
                          >
                            12th
                          </button>
                          <button
                            id="daily-toggle-10"
                            onClick={() => setSelectedClass("10th")}
                            className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold transition-all ${selectedClass === "10th" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-300 hover:text-white"}`}
                          >
                            10th
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Direct Generate Mode Toggle Switch */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4.5 flex items-center justify-between shadow-inner">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${directGenerateMode ? "bg-yellow-500/20 text-yellow-400" : "bg-slate-800 text-slate-500"}`}>
                          <Zap className={`w-3.5 h-3.5 ${directGenerateMode ? "fill-yellow-400 animate-pulse" : ""}`} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-white flex items-center gap-1">
                            Direct Generate Mode
                          </p>
                          <p className="text-[9px] text-slate-300">Bypass setup & start test in 1-click</p>
                        </div>
                      </div>
                      <button
                        id="direct-generate-toggle"
                        onClick={() => setDirectGenerateMode(!directGenerateMode)}
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                          directGenerateMode ? "bg-emerald-500 justify-end" : "bg-slate-700 justify-start"
                        }`}
                      >
                        <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      
                      {/* ACTION 1: ALL SUBJECTS COMBINED TEST */}
                      <div className="p-3 bg-indigo-950/50 rounded-xl border border-indigo-800/80 hover:border-indigo-600 transition-all">
                        <div className="flex justify-between items-start mb-1.5">
                          <div>
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase">
                              ALL SUBJECTS COMBINED
                            </span>
                            <h4 className="font-bold text-xs text-white mt-1">Class {selectedClass} Unified Combined Mock</h4>
                          </div>
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed mb-2.5">
                          A full-syllabus combined exam covering questions from all major core subjects of Class {selectedClass}.
                        </p>
                        <button
                          id="start-combined-mock-btn"
                          onClick={handleStartCombinedTest}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Start Combined Mock Test</span>
                        </button>
                      </div>

                      {/* ACTION 2: SEPARATE SUBJECT TEST */}
                      <div className="p-3 bg-indigo-950/50 rounded-xl border border-indigo-800/80 hover:border-indigo-600 transition-all">
                        <div className="flex justify-between items-start mb-1.5">
                          <div>
                            <span className="text-[9px] bg-indigo-500/40 text-indigo-200 border border-indigo-400/30 px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase">
                              SEPARATE SUBJECT
                            </span>
                            {(() => {
                              const featSubject = getFeaturedSubjectForDay(selectedClass, selectedStreamId);
                              return (
                                <h4 className="font-bold text-xs text-white mt-1">
                                  Today: {featSubject.name} ({featSubject.hindiName})
                                </h4>
                              );
                            })()}
                          </div>
                          <BookOpen className="w-4 h-4 text-indigo-300" />
                        </div>
                        <p className="text-[10px] text-slate-300 leading-relaxed mb-2.5">
                          Master individual sub-chapters for today's selected subject with focus topic analysis.
                        </p>
                        <button
                          id="start-featured-separate-btn"
                          onClick={() => {
                            const featSubject = getFeaturedSubjectForDay(selectedClass, selectedStreamId);
                            handleSubjectSelect(featSubject);
                          }}
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Start Separate subject test</span>
                        </button>
                      </div>

                    </div>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-400">
                    <span>Preparation Streak: <strong className="text-yellow-400 font-bold">5 Days 🔥</strong></span>
                    <span>2026 Board Guidelines</span>
                  </div>
                </div>

              </div>
            </div>

            {/* MAIN BENTO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Card 1: Main Control / Quick Schedule (Left, large) */}
              <div className="md:col-span-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between" id="today-mock-schedule">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Today's Practice Schedule</h2>
                      <p className="text-xs text-slate-500">Most attempted tests today in Bihar</p>
                    </div>
                    <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-wider">
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {quickScheduleTests.map((t) => {
                      const matchedSubject = (t.id === "physics") 
                        ? STREAMS_12TH[0].subjects[0] 
                        : (t.id === "accountancy")
                        ? STREAMS_12TH[1].subjects[0]
                        : SUBJECTS_10TH[0];
                        
                      return (
                        <div key={t.id} className="flex items-center gap-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all">
                          <div className={`text-white w-12 h-12 rounded-xl flex flex-col items-center justify-center font-semibold shrink-0 ${
                            t.color === "indigo" ? "bg-indigo-600" : t.color === "orange" ? "bg-orange-500" : "bg-emerald-500"
                          }`}>
                            <span className="text-[11px] leading-tight">{t.timeSlot.split(" ")[0]}</span>
                            <span className="text-[9px] opacity-95 leading-tight">{t.timeSlot.split(" ")[1]}</span>
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-bold text-sm text-slate-800">{t.title}</h3>
                            <p className="text-xs text-slate-500">{t.stream} • {t.marks} Marks • {t.time}</p>
                          </div>
                          <button
                            id={`quick-start-${t.id}`}
                            onClick={() => {
                              setSelectedClass(t.id.startsWith("matric") ? "10th" : "12th");
                              if (t.id === "physics") setSelectedStreamId("science");
                              if (t.id === "accountancy") setSelectedStreamId("commerce");
                              handleSubjectSelect(matchedSubject);
                            }}
                            className="bg-white text-indigo-600 hover:bg-indigo-50 border border-slate-200 px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1 shrink-0"
                          >
                            <span>Solve</span>
                            <Play className="w-3 h-3 fill-indigo-600" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-dashed border-slate-200 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    * Interactive AI questions generated by analyzing trends from past 10 years (2015-2025).
                  </p>
                  <button
                    id="generate-custom-schedule-btn"
                    onClick={() => setActiveTab("schedule")}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>Create Custom Routine</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card 2: 12th Science Category Card */}
              <div className="md:col-span-3 bg-indigo-50/75 rounded-3xl p-5 border border-indigo-100 flex flex-col justify-between hover:shadow-md transition-all" id="science-bento-card">
                <div>
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white mb-3.5 shadow-md shadow-indigo-100">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-lg text-indigo-950">12th Science</h3>
                  <p className="text-xs text-indigo-700/80 mb-3">विज्ञान संकाय - Physics, Chem, Math, Bio</p>
                  <ul className="space-y-2 text-xs">
                    <li className="flex justify-between font-medium text-slate-700 border-b border-indigo-100/50 pb-1.5">
                      <span>Physics (भौतिकी)</span>
                      <span className="text-indigo-600 font-bold bg-indigo-100 px-1.5 py-0.5 rounded">BSEB 12th</span>
                    </li>
                    <li className="flex justify-between font-medium text-slate-700 border-b border-indigo-100/50 pb-1.5">
                      <span>Chemistry (रसायन)</span>
                      <span className="text-indigo-600 font-bold bg-indigo-100 px-1.5 py-0.5 rounded">BSEB 12th</span>
                    </li>
                    <li className="flex justify-between font-medium text-slate-700 border-b border-indigo-100/50 pb-1.5">
                      <span>Mathematics (गणित)</span>
                      <span className="text-indigo-600 font-bold bg-indigo-100 px-1.5 py-0.5 rounded">BSEB 12th</span>
                    </li>
                    <li className="flex justify-between font-medium text-slate-700 pb-1">
                      <span>Biology (जीव विज्ञान)</span>
                      <span className="text-indigo-600 font-bold bg-indigo-100 px-1.5 py-0.5 rounded">BSEB 12th</span>
                    </li>
                  </ul>
                </div>
                <button
                  id="go-science-stream"
                  onClick={() => {
                    setSelectedClass("12th");
                    setSelectedStreamId("science");
                    const el = document.getElementById("subject-explorer-grid");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="mt-4 w-full bg-white text-indigo-900 border border-indigo-100 hover:bg-indigo-600 hover:text-white py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>Select Science Subjects</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 3: 12th Commerce Category Card */}
              <div className="md:col-span-3 bg-rose-50/75 rounded-3xl p-5 border border-rose-100 flex flex-col justify-between hover:shadow-md transition-all" id="commerce-bento-card">
                <div>
                  <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white mb-3.5 shadow-md shadow-rose-100">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-lg text-rose-950">12th Commerce</h3>
                  <p className="text-xs text-rose-700/80 mb-3">वाणिज्य संकाय - Accountancy, BST, Eco</p>
                  <ul className="space-y-2 text-xs">
                    <li className="flex justify-between font-medium text-slate-700 border-b border-rose-100/50 pb-1.5">
                      <span>Accountancy (लेखाशास्त्र)</span>
                      <span className="text-rose-600 font-bold bg-rose-100 px-1.5 py-0.5 rounded">BSEB 12th</span>
                    </li>
                    <li className="flex justify-between font-medium text-slate-700 border-b border-rose-100/50 pb-1.5">
                      <span>Business Studies</span>
                      <span className="text-rose-600 font-bold bg-rose-100 px-1.5 py-0.5 rounded">BSEB 12th</span>
                    </li>
                    <li className="flex justify-between font-medium text-slate-700 border-b border-rose-100/50 pb-1.5">
                      <span>Economics (अर्थशास्त्र)</span>
                      <span className="text-rose-600 font-bold bg-rose-100 px-1.5 py-0.5 rounded">BSEB 12th</span>
                    </li>
                    <li className="flex justify-between font-medium text-slate-700 pb-1">
                      <span>Entrepreneurship</span>
                      <span className="text-rose-600 font-bold bg-rose-100 px-1.5 py-0.5 rounded">BSEB 12th</span>
                    </li>
                  </ul>
                </div>
                <button
                  id="go-commerce-stream"
                  onClick={() => {
                    setSelectedClass("12th");
                    setSelectedStreamId("commerce");
                    const el = document.getElementById("subject-explorer-grid");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="mt-4 w-full bg-white text-rose-900 border border-rose-100 hover:bg-rose-500 hover:text-white py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>Select Commerce Subjects</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 4: 12th Arts Category Card */}
              <div className="md:col-span-3 bg-amber-50/75 rounded-3xl p-5 border border-amber-100 flex flex-col justify-between hover:shadow-md transition-all" id="arts-bento-card">
                <div>
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white mb-3.5 shadow-md shadow-amber-100">
                    <Scroll className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-lg text-amber-950">12th Arts</h3>
                  <p className="text-xs text-amber-700/80 mb-3">कला संकाय - History, Pol Sci, Geography</p>
                  <ul className="space-y-2 text-xs">
                    <li className="flex justify-between font-medium text-slate-700 border-b border-amber-100/50 pb-1.5">
                      <span>History (इतिहास)</span>
                      <span className="text-amber-600 font-bold bg-amber-100 px-1.5 py-0.5 rounded">BSEB 12th</span>
                    </li>
                    <li className="flex justify-between font-medium text-slate-700 border-b border-amber-100/50 pb-1.5">
                      <span>Political Science</span>
                      <span className="text-amber-600 font-bold bg-amber-100 px-1.5 py-0.5 rounded">BSEB 12th</span>
                    </li>
                    <li className="flex justify-between font-medium text-slate-700 border-b border-amber-100/50 pb-1.5">
                      <span>Geography (भूगोल)</span>
                      <span className="text-amber-600 font-bold bg-amber-100 px-1.5 py-0.5 rounded">BSEB 12th</span>
                    </li>
                    <li className="flex justify-between font-medium text-slate-700 pb-1">
                      <span>Sociology (समाजशास्त्र)</span>
                      <span className="text-amber-600 font-bold bg-amber-100 px-1.5 py-0.5 rounded">BSEB 12th</span>
                    </li>
                  </ul>
                </div>
                <button
                  id="go-arts-stream"
                  onClick={() => {
                    setSelectedClass("12th");
                    setSelectedStreamId("arts");
                    const el = document.getElementById("subject-explorer-grid");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="mt-4 w-full bg-white text-amber-900 border border-amber-100 hover:bg-amber-500 hover:text-white py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>Select Arts Subjects</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 5: 10th Matric Quick Access */}
              <div className="md:col-span-3 bg-emerald-50/75 rounded-3xl p-5 border border-emerald-100 flex flex-col justify-between hover:shadow-md transition-all" id="matric-bento-card">
                <div>
                  <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white mb-3.5 shadow-md shadow-emerald-100">
                    <Book className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-lg text-emerald-950">10th Matric</h3>
                  <p className="text-xs text-emerald-700/80 mb-3">मैट्रिक - Science, Maths, Social Sci</p>
                  <p className="text-xs text-slate-500 mb-4">
                    Solve previous year board questions from 2011 to 2025. Standard and high-weightage topics included.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setSelectedClass("10th"); handleSubjectSelect(SUBJECTS_10TH[0]); }}
                      className="bg-white py-2 text-[10px] font-bold rounded-lg border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-all text-center"
                    >
                      SCIENCE
                    </button>
                    <button
                      onClick={() => { setSelectedClass("10th"); handleSubjectSelect(SUBJECTS_10TH[1]); }}
                      className="bg-white py-2 text-[10px] font-bold rounded-lg border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-all text-center"
                    >
                      MATHS
                    </button>
                    <button
                      onClick={() => { setSelectedClass("10th"); handleSubjectSelect(SUBJECTS_10TH[2]); }}
                      className="bg-white py-2 text-[10px] font-bold rounded-lg border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-all text-center"
                    >
                      S. SCIENCE
                    </button>
                    <button
                      onClick={() => { setSelectedClass("10th"); handleSubjectSelect(SUBJECTS_10TH[3]); }}
                      className="bg-white py-2 text-[10px] font-bold rounded-lg border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-all text-center"
                    >
                      HINDI
                    </button>
                  </div>
                </div>
                <button
                  id="go-matric-subjects"
                  onClick={() => {
                    setSelectedClass("10th");
                    const el = document.getElementById("subject-explorer-grid");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="mt-4 w-full bg-white text-emerald-900 border border-emerald-100 hover:bg-emerald-600 hover:text-white py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>Explore Matric Board</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Card 6: Quick Stats (Bottom, banner width) */}
              <div className="md:col-span-6 bg-slate-900 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-around gap-6" id="quick-stats-card">
                <div className="text-center md:text-left">
                  <div className="text-3xl font-extrabold text-indigo-400">450K+</div>
                  <div className="text-[10px] uppercase text-slate-400 tracking-widest font-bold">Total Bihar Board PYQs</div>
                </div>
                <div className="hidden md:block h-12 w-[1px] bg-slate-700"></div>
                <div className="text-center md:text-left">
                  <div className="text-3xl font-extrabold text-rose-400">{attemptedCount}</div>
                  <div className="text-[10px] uppercase text-slate-400 tracking-widest font-bold">Your Attempted Tests</div>
                </div>
                <div className="hidden md:block h-12 w-[1px] bg-slate-700"></div>
                <div className="text-center md:text-left">
                  <div className="text-3xl font-extrabold text-emerald-400">{averageScore}%</div>
                  <div className="text-[10px] uppercase text-slate-400 tracking-widest font-bold">Average Mock Score</div>
                </div>
                <div className="hidden md:block h-12 w-[1px] bg-slate-700"></div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 justify-center md:justify-start">
                    <Check className="w-3 h-3" /> Google Trends Sync Active
                  </span>
                  <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 justify-center md:justify-start">
                    <Cpu className="w-3 h-3" /> 2026 Model Pattern Ready
                  </span>
                </div>
              </div>

            </div>

            {/* DAILY TOPPERS LEADERBOARD / DAILY RANK LIST */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200" id="daily-toppers-leaderboard">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500 animate-bounce" />
                    <h2 className="text-xl font-bold text-slate-900">Bihar Board Daily Toppers List</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">बिहार बोर्ड दैनिक रैंक सूची - Top performing students in mock tests today</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-bold">
                    {(["All", "10th", "12th"] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setLeaderboardClassFilter(lvl)}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          leaderboardClassFilter === lvl 
                            ? "bg-indigo-600 text-white shadow-sm" 
                            : "text-slate-600 hover:text-slate-800"
                        }`}
                      >
                        {lvl === "All" ? "All Classes" : lvl === "10th" ? "Class 10th" : "Class 12th"}
                      </button>
                    ))}
                  </div>

                  {/* Search Leaderboard Toppers */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search by topper name/district..."
                      value={leaderboardSearchQuery}
                      onChange={(e) => setLeaderboardSearchQuery(e.target.value)}
                      className="bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs pl-8 pr-4 py-1.5 rounded-xl border border-slate-200 outline-none w-full md:w-48 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Leaderboard Table/List */}
              {(() => {
                const filtered = leaderboard.filter((entry) => {
                  const matchesClass = leaderboardClassFilter === "All" || entry.className === leaderboardClassFilter;
                  const matchesSearch = 
                    entry.name.toLowerCase().includes(leaderboardSearchQuery.toLowerCase()) ||
                    entry.district.toLowerCase().includes(leaderboardSearchQuery.toLowerCase());
                  return matchesClass && matchesSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-10 space-y-2">
                      <Users className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-medium text-slate-500">No topper records found for your search filters.</p>
                      <p className="text-[10px] text-slate-400">Be the first to submit today! Solve a test above to add your score.</p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                          <th className="py-3 px-4 text-center">Rank</th>
                          <th className="py-3 px-4">Topper Student</th>
                          <th className="py-3 px-4">District (जिला)</th>
                          <th className="py-3 px-4">Test Subject</th>
                          <th className="py-3 px-4 text-center">Score</th>
                          <th className="py-3 px-4 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((entry, idx) => {
                          const isNewUser = entry.id === latestUserRankId;
                          return (
                            <tr
                              key={entry.id}
                              className={`border-b border-slate-100 hover:bg-slate-50/50 transition-all ${
                                isNewUser 
                                  ? "bg-amber-50/80 hover:bg-amber-100/60 ring-2 ring-amber-500/20 animate-pulse" 
                                  : ""
                              }`}
                            >
                              {/* Rank column */}
                              <td className="py-3.5 px-4 text-center font-bold">
                                {entry.rank === 1 ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full text-xs">🥇</span>
                                ) : entry.rank === 2 ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-100 text-slate-700 rounded-full text-xs">🥈</span>
                                ) : entry.rank === 3 ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-700 rounded-full text-xs">🥉</span>
                                ) : (
                                  <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-50 text-slate-500 rounded-full text-xs font-bold">{entry.rank}</span>
                                )}
                              </td>

                              {/* Student name and Class tag */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2">
                                  <div>
                                    <div className="font-extrabold text-slate-900 flex items-center gap-1">
                                      {entry.name}
                                      {isNewUser && (
                                        <span className="bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider animate-pulse">
                                          Your Rank
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="bg-indigo-100 text-indigo-700 font-bold text-[9px] px-1.5 py-0.5 rounded">
                                        Class {entry.className}
                                      </span>
                                      {entry.stream && (
                                        <span className="bg-slate-100 text-slate-600 font-bold text-[9px] px-1.5 py-0.5 rounded uppercase">
                                          {entry.stream}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* District */}
                              <td className="py-3.5 px-4 font-medium text-slate-700">
                                {entry.district}
                              </td>

                              {/* Subject */}
                              <td className="py-3.5 px-4">
                                <span className="bg-slate-100 text-slate-700 font-bold text-[9px] px-2 py-0.5 rounded-full border border-slate-200">
                                  {entry.subjectName}
                                </span>
                              </td>

                              {/* Score and Percentage */}
                              <td className="py-3.5 px-4 text-center">
                                <div className="font-extrabold text-slate-900">{entry.percentage}%</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">({entry.score} / {entry.totalQuestions} Right)</div>
                              </td>

                              {/* Time */}
                              <td className="py-3.5 px-4 text-right text-slate-400 text-[10px]">
                                {entry.timestamp}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                <span>⚡ Ranks are dynamically calculated and updated instantly on successful sub-paper submission.</span>
                <span className="font-bold text-indigo-600">State Toppers Matrix 2026</span>
              </div>
            </div>

            {/* SUBJECT EXPLORER & SEARCH */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200" id="subject-explorer-grid">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Explore Subjects & Mock Papers</h2>
                  <p className="text-xs text-slate-500">Pick any Bihar Board subject to automatically pull previous year questions</p>
                </div>

                {/* Sub Class Toggles */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Direct Generate Toggle Option */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-xs">
                    <Zap className={`w-3.5 h-3.5 transition-colors ${directGenerateMode ? "text-yellow-500 fill-yellow-500" : "text-slate-400"}`} />
                    <span className="text-[10px] font-bold text-slate-700">Instant Direct Play</span>
                    <button
                      id="direct-generate-subject-toggle"
                      onClick={() => setDirectGenerateMode(!directGenerateMode)}
                      className={`w-8 h-4.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                        directGenerateMode ? "bg-emerald-500 justify-end" : "bg-slate-300 justify-start"
                      }`}
                    >
                      <div className="bg-white w-3.5 h-3.5 rounded-full shadow-xs" />
                    </button>
                  </div>

                  <div className="bg-slate-100 p-1 rounded-xl flex">
                    <button
                      id="select-class-12"
                      onClick={() => { setSelectedClass("12th"); }}
                      className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all ${selectedClass === "12th" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
                    >
                      Class 12th (Intermediate)
                    </button>
                    <button
                      id="select-class-10"
                      onClick={() => { setSelectedClass("10th"); }}
                      className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all ${selectedClass === "10th" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-800"}`}
                    >
                      Class 10th (Matric)
                    </button>
                  </div>

                  {/* Search bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search subject (e.g. Physics)..."
                      value={subjectSearchQuery}
                      onChange={(e) => setSubjectSearchQuery(e.target.value)}
                      className="bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 outline-none w-full md:w-56 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* If 12th is selected: Show stream selection tabs */}
              {selectedClass === "12th" && (
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Streams:</span>
                  {STREAMS_12TH.map((stream) => (
                    <button
                      key={stream.id}
                      id={`stream-tab-${stream.id}`}
                      onClick={() => setSelectedStreamId(stream.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                        selectedStreamId === stream.id
                          ? stream.id === "science"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : stream.id === "commerce"
                            ? "bg-rose-500 text-white shadow-sm"
                            : "bg-amber-500 text-white shadow-sm"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span>{stream.name} ({stream.hindiName})</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Subjects Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(selectedClass === "12th" ? displayed12thSubjects : displayed10thSubjects).map((subj) => (
                  <div
                    key={subj.id}
                    id={`subject-card-${subj.id}`}
                    onClick={() => handleSubjectSelect(subj)}
                    className="group bg-slate-50/50 hover:bg-white rounded-2xl p-5 border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 bg-slate-100 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all text-slate-700">
                          <IconRenderer name={subj.icon} className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded uppercase">
                          {selectedClass}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-all">
                        {subj.name} / {subj.hindiName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {subj.description}
                      </p>
                      <p className="text-xs text-slate-400 italic mt-1.5 line-clamp-2">
                        {subj.hindiDescription}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs text-indigo-600 font-bold">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {subj.topics.length} Chapters • Objective Pattern
                      </span>
                      <span className="flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        Start Mock <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* No results indicator */}
              {(selectedClass === "12th" ? displayed12thSubjects : displayed10thSubjects).length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <AlertTriangle className="w-10 h-10 mx-auto text-amber-500 mb-3" />
                  <p className="font-bold text-slate-700">No matching subjects found</p>
                  <p className="text-xs mt-1">Try searching for other Bihar Board intermediate or matric subjects.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL / OVERLAY: CONFIGURE MOCK TEST */}
        {/* ========================================================= */}
        {isConfiguringTest && selectedSubject && (
          <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <IconRenderer name={selectedSubject.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">BSEB Class {selectedClass}</span>
                    <h3 className="font-extrabold text-lg text-slate-900">{selectedSubject.name} / {selectedSubject.hindiName}</h3>
                  </div>
                </div>
                <button
                  id="close-config-modal"
                  onClick={() => setIsConfiguringTest(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  The AI search generator will search actual exam boards, previous papers, and reference materials for Bihar Board to craft this custom practice test.
                </p>

                {/* Paper Year Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                    Select Exam Year / Board Series (परीक्षा वर्ष):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["2026 (New PYQ)", "2025", "2024", "2023", "2022", "All Years Combined"].map((yr) => (
                      <button
                        key={yr}
                        onClick={() => setSelectedYear(yr)}
                        className={`py-2 rounded-xl text-[11px] font-bold transition-all border ${
                          selectedYear === yr
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Count Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Number of Questions (प्रश्नों की संख्या):</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[10, 30, 50, 100, 200].map((num) => (
                      <button
                        key={num}
                        onClick={() => setNumQuestions(num)}
                        className={`py-2 rounded-xl text-[11px] font-bold transition-all border ${
                          numQuestions === num
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                        }`}
                      >
                        {num} Qs
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Paper Language (प्रश्न पत्र भाषा):</label>
                  <div className="space-y-2">
                    {[
                      "Bilingual (Hindi & English)",
                      "Pure Hindi (शुद्ध हिंदी)",
                      "English Medium (अंग्रेजी)"
                    ].map((lang) => (
                      <label
                        key={lang}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          testLanguage === lang
                            ? "border-indigo-600 bg-indigo-50/50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xs font-semibold text-slate-800">{lang}</span>
                        <input
                          type="radio"
                          name="test-lang"
                          checked={testLanguage === lang}
                          onChange={() => setTestLanguage(lang)}
                          className="text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Live Trends details */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-start gap-2 text-slate-500">
                  <Sparkles className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-relaxed">
                    By default, the engine executes real-time Google search queries for <strong>"Bihar Board Class {selectedClass} {selectedSubject.name} PYQ"</strong> to ensure precise topic weightage matching Bihar's 50-mark objective OMR pattern.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setIsConfiguringTest(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  id="submit-generate-test"
                  onClick={handleStartTest}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Generate Paper</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* LOADER: LOADING TEST FROM GOOGLE / API */}
        {/* ========================================================= */}
        {isLoadingTest && (
          <div className="min-h-[450px] bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
              <Sparkles className="w-6 h-6 text-yellow-500 absolute top-5 left-5 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Sourcing & Generating Board Questions...</h3>
            <p className="text-xs text-indigo-600 font-semibold mt-1">Connecting to Gemini & Google Search Grounding engine</p>
            
            <div className="max-w-md bg-indigo-50 rounded-2xl p-4 mt-6 text-left border border-indigo-100 text-indigo-950 text-xs space-y-2.5">
              <p className="font-bold flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" /> Google queries executed:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                <li>"Bihar board {selectedClass} {selectedSubject?.name} {selectedYear} paper questions"</li>
                <li>"BSEB Class {selectedClass} objective MCQs with answers {selectedYear}"</li>
                <li>Analyzing Bihar School Examination Board patterns (including year {selectedYear})</li>
              </ul>
              <div className="pt-2 border-t border-indigo-100 text-[10px] text-indigo-500 text-center italic">
                Please hold tight. Sourcing real educational curriculum takes 10-15 seconds.
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW: MOCK TEST PLAYER */}
        {/* ========================================================= */}
        {currentTest && !isLoadingTest && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-200">
            {/* Player Header */}
            <div className="bg-indigo-950 text-white p-5 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-900">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <IconRenderer name={selectedSubject?.icon || "BookOpen"} className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wide uppercase">
                      BSEB Class {currentTest.className}
                    </span>
                    <span className="text-indigo-300 text-xs">• {currentTest.stream || "General"}</span>
                  </div>
                  <h2 className="text-lg font-bold mt-0.5">{currentTest.subject} Official Model Mock</h2>
                </div>
              </div>

              {/* Source & Exit */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-xl flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Source: {testSource}
                </span>
                <button
                  id="quit-test-btn"
                  onClick={() => {
                    setCurrentTest(null);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-xl font-bold transition-all"
                >
                  Quit Test
                </button>
              </div>
            </div>

            {/* Main Player Screen */}
            <div className="grid grid-cols-1 lg:grid-cols-12">
              
              {/* Left Panel: Question Board */}
              <div className="lg:col-span-8 p-6 md:p-8 border-r border-slate-100">
                {/* Progress Indicators */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold text-slate-500">
                    Question {currentQuestionIndex + 1} of {currentTest.questions.length}
                  </span>
                  
                  {/* Progress bar */}
                  <div className="flex-grow mx-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / currentTest.questions.length) * 100}%` }}
                    ></div>
                  </div>

                  <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" /> {numQuestions * 1.5} Mins Remaining
                  </span>
                </div>

                {/* Question Box */}
                {currentTest.questions[currentQuestionIndex] && (
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-2.5">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          currentTest.questions[currentQuestionIndex].difficulty === "Easy"
                            ? "bg-green-100 text-green-700"
                            : currentTest.questions[currentQuestionIndex].difficulty === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {currentTest.questions[currentQuestionIndex].difficulty} Difficulty
                        </span>
                        <span className="text-[10px] text-slate-400">• Bihar Board Objective MCQ</span>
                      </div>
                      <p className="text-base font-bold text-slate-900 leading-relaxed whitespace-pre-line">
                        {currentTest.questions[currentQuestionIndex].questionText}
                      </p>
                    </div>

                    {/* Options Grid */}
                    <div className="space-y-3">
                      {currentTest.questions[currentQuestionIndex].options.map((option, oIdx) => {
                        const optionLetter = ["A", "B", "C", "D"][oIdx];
                        const isSelected = selectedAnswers[currentQuestionIndex] === optionLetter;
                        const isCorrect = currentTest.questions[currentQuestionIndex].correctOption === optionLetter;
                        
                        return (
                          <button
                            key={oIdx}
                            id={`option-${optionLetter}`}
                            disabled={isTestSubmitted}
                            onClick={() => {
                              setSelectedAnswers({
                                ...selectedAnswers,
                                [currentQuestionIndex]: optionLetter
                              });
                            }}
                            className={`w-full p-4 rounded-xl text-left border font-medium text-xs transition-all flex items-center justify-between ${
                              isTestSubmitted
                                ? isCorrect
                                  ? "bg-green-50 border-green-500 text-green-900"
                                  : isSelected
                                  ? "bg-red-50 border-red-500 text-red-900"
                                  : "bg-white border-slate-200 text-slate-500"
                                : isSelected
                                ? "bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-600/10"
                                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                                isTestSubmitted
                                  ? isCorrect
                                    ? "bg-green-500 text-white"
                                    : isSelected
                                    ? "bg-red-500 text-white"
                                    : "bg-slate-200 text-slate-600"
                                  : isSelected
                                  ? "bg-indigo-600 text-white"
                                  : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                              }`}>
                                {optionLetter}
                              </span>
                              <span>{option}</span>
                            </span>

                            {/* Icons after submit */}
                            {isTestSubmitted && (
                              <span>
                                {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                                {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Single question Explanation details (Visible when submitted or if user wants hint/answer after submit) */}
                    {(isTestSubmitted || showExplanation[currentQuestionIndex]) && (
                      <div className="bg-slate-50 border-l-4 border-indigo-500 p-4 rounded-r-xl mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Solution / Explanation:</h4>
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded">
                            Ans: {currentTest.questions[currentQuestionIndex].correctOption}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {currentTest.questions[currentQuestionIndex].explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Test Action Controls */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex gap-2">
                    <button
                      id="prev-question-btn"
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-bold rounded-xl transition-all"
                    >
                      Previous
                    </button>
                    <button
                      id="next-question-btn"
                      disabled={currentQuestionIndex === currentTest.questions.length - 1}
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-bold rounded-xl transition-all"
                    >
                      Next
                    </button>
                  </div>

                  {!isTestSubmitted ? (
                    <button
                      id="submit-test-btn"
                      onClick={handleSubmitTest}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-100"
                    >
                      Submit Exam Paper
                    </button>
                  ) : (
                    <button
                      id="test-retry-btn"
                      onClick={() => {
                        setSelectedAnswers({});
                        setIsTestSubmitted(false);
                        setCurrentQuestionIndex(0);
                        setShowExplanation({});
                      }}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-attempt Paper</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Panel: OMR Sheet Indicator & Scorecard */}
              <div className="lg:col-span-4 p-6 bg-slate-50/50">
                {/* Score Summary if submitted */}
                {isTestSubmitted && (
                  <div className="bg-indigo-900 text-white p-5 rounded-2xl mb-6 text-center space-y-3 shadow-md" id="test-scorecard">
                    <Trophy className="w-10 h-10 mx-auto text-yellow-400 animate-bounce" />
                    <div>
                      <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-extrabold">Your Score</p>
                      <h3 className="text-3xl font-extrabold text-white">
                        {(() => {
                          let correct = 0;
                          currentTest.questions.forEach((q, idx) => {
                            if (selectedAnswers[idx] === q.correctOption) correct++;
                          });
                          return `${correct} / ${currentTest.questions.length}`;
                        })()}
                      </h3>
                      <p className="text-[11px] text-indigo-300 mt-0.5">
                        {(() => {
                          let correct = 0;
                          currentTest.questions.forEach((q, idx) => {
                            if (selectedAnswers[idx] === q.correctOption) correct++;
                          });
                          const pct = Math.round((correct / currentTest.questions.length) * 100);
                          if (pct >= 80) return "Excellent! First Division Standard 🥇";
                          if (pct >= 60) return "Great job! Second Division Standard 🥈";
                          return "Requires more practice. Keep studying! 📚";
                        })()}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-indigo-800 flex justify-between items-center text-xs">
                      <span className="text-indigo-200">Accuracy Rate:</span>
                      <span className="font-bold">
                        {(() => {
                          let correct = 0;
                          currentTest.questions.forEach((q, idx) => {
                            if (selectedAnswers[idx] === q.correctOption) correct++;
                          });
                          return `${Math.round((correct / currentTest.questions.length) * 100)}%`;
                        })()}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-indigo-800 flex justify-between items-center text-xs text-amber-300 font-bold">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        {wasLeaderboardSubmitted ? "Your State Rank:" : "Projected State Topper Rank:"}
                      </span>
                      <span>
                        {(() => {
                          let correct = 0;
                          currentTest.questions.forEach((q, idx) => {
                            if (selectedAnswers[idx] === q.correctOption) correct++;
                          });
                          const pct = Math.round((correct / currentTest.questions.length) * 100);
                          
                          if (wasLeaderboardSubmitted && latestUserRankId) {
                            const userEntry = leaderboard.find(e => e.id === latestUserRankId);
                            if (userEntry) return `#${userEntry.rank} in Bihar`;
                          }
                          
                          // Projected rank
                          const betterCount = leaderboard.filter(e => e.percentage > pct).length;
                          return `#${betterCount + 1} in Bihar`;
                        })()}
                      </span>
                    </div>
                  </div>
                )}

                {isTestSubmitted && !wasLeaderboardSubmitted && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-2xl mb-6 space-y-3 shadow-sm" id="leaderboard-submit-box">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                      <h4 className="font-bold text-sm text-amber-900">Add to Daily Toppers List</h4>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      You scored <strong>{(() => {
                        let correct = 0;
                        currentTest.questions.forEach((q, idx) => {
                          if (selectedAnswers[idx] === q.correctOption) correct++;
                        });
                        return `${Math.round((correct / currentTest.questions.length) * 100)}%`;
                      })()}</strong>! Submit your details to the live daily mock leaderboard.
                    </p>

                    {!showLeaderboardSubmit ? (
                      <button
                        onClick={() => {
                          setShowLeaderboardSubmit(true);
                          setLeaderboardFormName("");
                        }}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Enter Name & District</span>
                      </button>
                    ) : (
                      <form onSubmit={handleLeaderboardSubmit} className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Topper Name (आपका नाम)</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Priyanshu Raj"
                            value={leaderboardFormName}
                            onChange={(e) => setLeaderboardFormName(e.target.value)}
                            className="w-full bg-white text-xs px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">District (जिला)</label>
                          <select
                            value={leaderboardFormDistrict}
                            onChange={(e) => setLeaderboardFormDistrict(e.target.value)}
                            className="w-full bg-white text-xs px-2 py-2 rounded-lg border border-slate-200 outline-none"
                          >
                            {["Patna (पटना)", "Gaya (गया)", "Muzaffarpur (मुजफ्फरपुर)", "Bhagalpur (भागलपुर)", "Nalanda (नालंदा)", "Darbhanga (दरभंगा)", "Arrah (आरा)", "Saran (सारण)", "Purnia (पूर्णिया)", "Rohtas (रोहतास)"].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setShowLeaderboardSubmit(false)}
                            className="w-1/2 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="w-1/2 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-orange-500/10"
                          >
                            Submit Rank 🚀
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {isTestSubmitted && wasLeaderboardSubmitted && (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-6 text-center space-y-1.5 animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <h4 className="font-bold text-xs text-emerald-950">Successfully Rank Submitted!</h4>
                    <p className="text-[10px] text-emerald-700">Your mock score is successfully uploaded on the state leaderboard.</p>
                  </div>
                )}

                {/* Bihar Board Style OMR Bubble Board */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" /> Bihar Board OMR Sheet
                    </h3>
                    <span className="text-[10px] text-slate-400">Objective Sheet</span>
                  </div>

                  <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">
                    Click any bubble number below to jump directly to that objective question. Black color bubbles represent answered questions.
                  </p>

                  <div className="grid grid-cols-4 gap-3">
                    {currentTest.questions.map((_, idx) => {
                      const isAnswered = selectedAnswers[idx] !== undefined;
                      const isSelectedCurrent = currentQuestionIndex === idx;
                      let statusClass = "bg-slate-100 hover:bg-slate-200 text-slate-700";

                      if (isSelectedCurrent) {
                        statusClass = "bg-indigo-600 text-white ring-2 ring-indigo-400";
                      } else if (isTestSubmitted) {
                        const isCorrect = currentTest.questions[idx].correctOption === selectedAnswers[idx];
                        statusClass = isCorrect 
                          ? "bg-green-100 hover:bg-green-200 text-green-800 border-green-200 border" 
                          : "bg-red-100 hover:bg-red-200 text-red-800 border-red-200 border";
                      } else if (isAnswered) {
                        statusClass = "bg-slate-800 text-white";
                      }

                      return (
                        <button
                          key={idx}
                          id={`omr-bubble-${idx + 1}`}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-all flex flex-col items-center justify-center ${statusClass}`}
                        >
                          <span>{idx + 1}</span>
                          <span className="text-[8px] font-medium opacity-80 uppercase mt-0.5">
                            {selectedAnswers[idx] || "—"}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Return Button */}
                  <div className="mt-6">
                    <button
                      id="return-to-list-btn"
                      onClick={() => setCurrentTest(null)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
                    >
                      Return to Subject List
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW: DAILY PLANNER / SCHEDULE GENERATOR */}
        {/* ========================================================= */}
        {activeTab === "schedule" && (
          <div className="space-y-6">
            
            {/* Bento Grid Header */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Custom Daily Study Timetable</h2>
                  <p className="text-xs text-slate-500">
                    Generate an organized weekly routine and hourly daily study guide custom fit to Bihar Board Intermediate & Matric
                  </p>
                </div>
                <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Bihar Board Exam Prep
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Panel: Generator Form */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-fit" id="schedule-creator-form">
                <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" /> Enter Preparation Profile
                </h3>

                <form onSubmit={handleGenerateSchedule} className="space-y-4">
                  
                  {/* Select Class */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Target Class:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["12th", "10th"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setScheduleInput({ ...scheduleInput, className: c })}
                          className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                            scheduleInput.className === c
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                          }`}
                        >
                          Class {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Stream (Only if 12th) */}
                  {scheduleInput.className === "12th" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Stream (संकाय):</label>
                      <select
                        value={scheduleInput.stream}
                        onChange={(e) => setScheduleInput({ ...scheduleInput, stream: e.target.value })}
                        className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="Science">Science (विज्ञान)</option>
                        <option value="Commerce">Commerce (वाणिज्य)</option>
                        <option value="Arts">Arts / Humanities (कला)</option>
                      </select>
                    </div>
                  )}

                  {/* Available Hours */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Available Daily Study Hours:</label>
                    <select
                      value={scheduleInput.availableHours}
                      onChange={(e) => setScheduleInput({ ...scheduleInput, availableHours: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {[2, 4, 6, 8, 10].map((hr) => (
                        <option key={hr} value={hr}>{hr} Hours / Day</option>
                      ))}
                    </select>
                  </div>

                  {/* Weak Subjects Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Your Weak Subjects (कठिन विषय):</label>
                    <input
                      type="text"
                      placeholder="e.g., Physics, Maths, Accounts"
                      value={scheduleInput.weakSubjects}
                      onChange={(e) => setScheduleInput({ ...scheduleInput, weakSubjects: e.target.value })}
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  {/* Strong Subjects Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Your Strong Subjects (सरल विषय):</label>
                    <input
                      type="text"
                      placeholder="e.g., Chemistry, Hindi, English"
                      value={scheduleInput.strongSubjects}
                      onChange={(e) => setScheduleInput({ ...scheduleInput, strongSubjects: e.target.value })}
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  {/* Exam Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Exam Target Period:</label>
                    <input
                      type="text"
                      value={scheduleInput.examDate}
                      onChange={(e) => setScheduleInput({ ...scheduleInput, examDate: e.target.value })}
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    id="generate-timetable-submit"
                    disabled={isLoadingSchedule}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5"
                  >
                    {isLoadingSchedule ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Routine...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        <span>Build My Custom Timetable</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Panel: Displaying Timetable */}
              <div className="lg:col-span-8 space-y-6">
                
                {isLoadingSchedule && (
                  <div className="min-h-[400px] bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">Formulating custom Bihar Board exam study patterns...</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      We are setting priorities for weak chapters, timing the OMR answer sheets revision, and arranging your weekly targets.
                    </p>
                  </div>
                )}

                {/* Display Timetable (Either generated or saved) */}
                {(generatedSchedule || savedTimetable) && !isLoadingSchedule && (
                  <div className="space-y-6 animate-in fade-in duration-200" id="schedule-results-panel">
                    {/* Schedule Overview */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                      <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
                        <div>
                          <h2 className="text-xl font-extrabold text-indigo-950">
                            {(generatedSchedule || savedTimetable)?.title}
                          </h2>
                          <p className="text-xs text-slate-600 mt-1">
                            {(generatedSchedule || savedTimetable)?.overview}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            try {
                              window.print();
                            } catch (e) {
                              console.error("Printing not supported in this iframe:", e);
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print Routine
                        </button>
                      </div>
                    </div>

                    {/* Hourly Timetable Bento Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                      <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-indigo-600" /> Hourly Daily Timetable (दैनिक दिनचर्या)
                      </h3>

                      <div className="space-y-3">
                        {((generatedSchedule || savedTimetable)?.dailyRoutine || []).map((item, idx) => (
                          <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="bg-indigo-600 text-white font-bold text-[11px] px-3 py-1 rounded-full whitespace-nowrap shrink-0">
                              {item.timeSlot}
                            </span>
                            <div className="flex-grow">
                              <h4 className="font-bold text-sm text-slate-800">{item.activity}</h4>
                              <p className="text-xs text-slate-500">{item.focusArea}</p>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-lg italic">
                              💡 {item.tip}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Priority Topics and Tips Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Subject wise tactics */}
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                          <Brain className="w-4 h-4 text-rose-500" /> Subject-wise Priorities
                        </h3>
                        <div className="space-y-4">
                          {((generatedSchedule || savedTimetable)?.subjectWiseStrategy || []).map((item, idx) => (
                            <div key={idx} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                              <h4 className="font-bold text-xs text-slate-800">{item.subject}</h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">{item.strategy}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.priorityTopics.map((topic, tIdx) => (
                                  <span key={tIdx} className="bg-slate-100 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bihar Board Specific Exam Secrets */}
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                        <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-500" /> BSEB Board Exam Secrets
                        </h3>
                        <ul className="space-y-2.5">
                          {((generatedSchedule || savedTimetable)?.importantTips || []).map((tip, idx) => (
                            <li key={idx} className="flex gap-2 text-xs text-slate-600 items-start">
                              <span className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 text-[10px] font-bold mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    {/* Weekly Prep Targets */}
                    <div className="bg-indigo-900 text-white rounded-3xl p-6 shadow-md">
                      <h3 className="font-extrabold text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Weekly Warrior Targets Checklist
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {((generatedSchedule || savedTimetable)?.weeklyChecklist || []).map((task, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 p-3 bg-white/10 rounded-xl border border-white/10">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-indigo-600 border-white/20 rounded focus:ring-indigo-500 mt-0.5"
                            />
                            <span className="text-xs text-indigo-100">{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* Empty State schedule screen if nothing generated yet */}
                {!generatedSchedule && !savedTimetable && (
                  <div className="min-h-[400px] bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                    <Calendar className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">Build Your Preparation Plan</h3>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Fill out the form on the left specifying your Class 10th or 12th subjects, weak streams, and daily hours.
                    </p>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW: FREE COMMUNITY CHAT ROOM */}
        {/* ========================================================= */}
        {activeTab === "chat" && (
          <div className="space-y-6">
            {/* Chat Room Banner */}
            <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
              <div className="relative z-10 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    Live Bihar Board Student Community
                  </span>
                  <span className="bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Free Study Discussion Group
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                    बिहार बोर्ड टॉपर चौपाल <span className="text-teal-400 font-sans">BSEB Chat Room</span>
                  </h2>
                  <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                    Chat with students from Patna, Gaya, Muzaffarpur, Bhagalpur, and all across Bihar. Share objective questions, math tricks, physics formula sheets, and study together!
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Set Profile */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-fit" id="chat-profile-section">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" /> Set Student Profile
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Choose Nickname (आपका नाम):</label>
                    <input
                      type="text"
                      placeholder="e.g. Priyanshu Kumar"
                      value={chatNickname}
                      onChange={(e) => setChatNickname(e.target.value)}
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Select District (आपका जिला):</label>
                    <select
                      value={chatDistrict}
                      onChange={(e) => setChatDistrict(e.target.value)}
                      className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      {["Patna (पटना)", "Gaya (गया)", "Muzaffarpur (मुजफ्फरपुर)", "Bhagalpur (भागलपुर)", "Nalanda (नालंदा)", "Darbhanga (दरभंगा)", "Arrah (आरा)", "Saran (सारण)", "Purnia (पूर्णिया)", "Rohtas (रोहतास)"].map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Your Class tag:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["All", "10th", "12th"] as const).map((cls) => (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => setChatClass(cls)}
                          className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                            chatClass === cls
                              ? "bg-teal-600 text-white border-teal-600"
                              : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                          }`}
                        >
                          {cls === "All" ? "General" : `Class ${cls}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 italic leading-relaxed pt-2 border-t border-slate-50">
                    Your profile details are broadcasted next to your messages. Please maintain decorum and share only useful syllabus content.
                  </p>
                </div>
              </div>

              {/* Right Column: Live Chat Pane */}
              <div className="lg:col-span-8 flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] h-[600px]" id="chat-messages-container">
                {/* Chat header & filter */}
                <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-teal-600" />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800">Live Study Room Discussion</h4>
                      <p className="text-[10px] text-slate-500">Real-time collaboration across Bihar districts</p>
                    </div>
                  </div>

                  {/* Filter switches */}
                  <div className="flex gap-1 bg-slate-200/60 p-1 rounded-xl">
                    {(["All", "10th", "12th"] as const).map((filterVal) => (
                      <button
                        key={filterVal}
                        onClick={() => setChatFilter(filterVal)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          chatFilter === filterVal
                            ? "bg-white text-slate-800 shadow-xs"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {filterVal === "All" ? "All Posts" : `${filterVal} only`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message display area */}
                <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-slate-50/30 flex flex-col">
                  {chatError && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center gap-2 mb-2 animate-fade-in">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{chatError}</span>
                    </div>
                  )}

                  {(() => {
                    const filtered = chatMessages.filter(
                      (msg) => chatFilter === "All" || msg.className === chatFilter
                    );

                    if (filtered.length === 0) {
                      return (
                        <div className="my-auto text-center space-y-2">
                          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                          <h5 className="font-bold text-slate-700 text-xs">No Messages Yet</h5>
                          <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                            Be the first to post a study tip, formula sheet query, or say hello to fellow toppers!
                          </p>
                        </div>
                      );
                    }

                    return (
                      <>
                        {filtered.map((msg) => {
                          // Correctly identify Me using unique senderId, fallback to senderName comparison
                          const isMe = msg.senderId 
                            ? msg.senderId === chatUserId 
                            : msg.senderName === (chatNickname.trim() || "Anonym Topper");
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col max-w-[85%] ${
                                isMe ? "ml-auto items-end" : "mr-auto items-start"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-500 font-semibold">
                                <span className="font-bold text-slate-800">{msg.senderName}</span>
                                <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                  📍 {msg.district}
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded text-white font-bold ${
                                    msg.className === "10th"
                                      ? "bg-emerald-600"
                                      : msg.className === "12th"
                                      ? "bg-indigo-600"
                                      : "bg-slate-600"
                                  }`}
                                >
                                  Class {msg.className}
                                </span>
                                <span className="text-[9px] font-normal opacity-85">{msg.timestamp}</span>
                              </div>
                              
                              <div
                                className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                                  isMe
                                    ? "bg-teal-600 text-white rounded-tr-none"
                                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                                }`}
                              >
                                {msg.message}
                              </div>
                            </div>
                          );
                        })}
                        {/* Auto scroll anchor */}
                        <div ref={chatBottomRef} />
                      </>
                    );
                  })()}
                </div>

                {/* Input action bar */}
                <form onSubmit={handleSendChatMessage} className="p-4 bg-white border-t border-slate-200 flex gap-2 shrink-0">
                  <input
                    type="text"
                    required
                    placeholder={
                      chatNickname.trim()
                        ? `Share question or solution as ${chatNickname}...`
                        : "Type your study question or say hi to other Bihar board students..."
                    }
                    value={chatNewMessage}
                    onChange={(e) => setChatNewMessage(e.target.value)}
                    className="flex-grow bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={isSendingChat || !chatNewMessage.trim()}
                    className="px-5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-teal-600/10 flex items-center justify-center gap-1.5"
                  >
                    {isSendingChat ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Send</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-xs">
          <div>
            <p className="font-extrabold text-slate-800">Bihar Board (BSEB) PYQ Master Portal • Run by Rocky Kumar</p>
            <p className="mt-1">© 2026 BSEB Mock Test Hub — Run by Rocky Kumar. All previous year question analysis belongs to BSEB.</p>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-indigo-600 cursor-pointer">Grounding Search Info</span>
            <span className="hover:text-indigo-600 cursor-pointer font-bold text-indigo-600 flex items-center gap-0.5">
              <Sparkles className="w-3 h-3" /> Live Google Sync
            </span>
          </div>
        </div>
      </footer>

      {/* FLOATING ACTION BUTTON: 24x7 SUPPORT */}
      <button
        id="floating-support-btn"
        onClick={() => setShowSupportModal(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600 text-white font-bold text-xs px-4 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 animate-bounce hover:animate-none border border-white/20 group cursor-pointer"
        style={{ animationDuration: "3s" }}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-400"></span>
        </span>
        <Headphones className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        <span>24x7 Support & Telegram Help</span>
      </button>

      {/* SUPPORT DIALOG BOX MODAL */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" id="support-dialog-overlay">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl border border-slate-100 transform scale-100 transition-all">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-900 to-indigo-950 text-white p-6 relative">
              <button
                id="close-support-dialog-btn"
                onClick={() => setShowSupportModal(false)}
                className="absolute top-4 right-4 bg-white/15 hover:bg-white/25 text-white p-1.5 rounded-full transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="space-y-1">
                <span className="bg-teal-500/25 text-teal-300 border border-teal-500/30 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
                  <Headphones className="w-3 h-3" />
                  24x7 Active Help desk
                </span>
                <h3 className="text-xl font-extrabold tracking-tight">Bihar Board Exam Topper Support</h3>
                <p className="text-slate-300 text-xs">Live Guidance, PYQs & Board Exam updates by Rocky Kumar</p>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-start gap-3">
                <div className="bg-indigo-100 text-indigo-700 p-2.5 rounded-xl shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Join Telegram Live Forum</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Instantly connect with other class 10th & 12th toppers. Clear doubts, share physics/math solutions, download free PDFs, and prepare confidently for the 2028 exams.
                  </p>
                </div>
              </div>

              {/* Channel Box */}
              <div className="bg-gradient-to-br from-indigo-50 to-teal-50/50 border border-indigo-100 rounded-2xl p-5 text-center space-y-4">
                <div className="space-y-1">
                  <h5 className="font-extrabold text-indigo-950 text-sm">Official Telegram Channel & Discussion</h5>
                  <p className="text-teal-700 font-bold text-xs tracking-wide">@biharboardExam2028</p>
                </div>

                <a
                  href="https://t.me/biharboardExam2028"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Join Telegram Group (24x7 Help)</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <p className="text-[10px] text-slate-400">
                  Secure platform moderated by BSEB experts to safeguard student privacy.
                </p>
              </div>

              {/* Extra Features */}
              <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600 font-medium">
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Doubt Solving 24x7</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Syllabus PYQ PDFs</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Daily Mock Alerts</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Topper Study Groups</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                id="support-modal-close-footer"
                onClick={() => setShowSupportModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
