import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Please add it under Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ---------------------------------------------------------
// Endpoint: Generate Bihar Board Mock Test
// ---------------------------------------------------------
app.post("/api/generate-test", async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const { className, stream, subject, language, numQuestions = 10, year = "2026" } = req.body;

    if (!className || !subject) {
      return res.status(400).json({ error: "className and subject are required parameters." });
    }

    const ai = getGeminiClient();

    let searchContextPrompt = "";
    if (subject === "All Subjects") {
      const subjectList = className === "10th"
        ? "Science (विज्ञान), Mathematics (गणित), Social Science (सामाजिक विज्ञान), Hindi (हिंदी), and English (अंग्रेजी)"
        : stream?.toLowerCase() === "science"
        ? "Physics (भौतिकी), Chemistry (रसायन शास्त्र), Mathematics (गणित), Biology (जीव विज्ञान), English, and Hindi"
        : stream?.toLowerCase() === "commerce"
        ? "Accountancy (लेखाशास्त्र), Business Studies (व्यवसाय अध्ययन), Economics (अर्थशास्त्र), and Entrepreneurship (उद्यमशीलता)"
        : "History (इतिहास), Political Science (राजनीति विज्ञान), Geography (भूगोल), and Sociology (समाजशास्त्र)";

      searchContextPrompt = `You are an expert exam compiler for the Bihar School Examination Board (BSEB) Class ${className} (${stream || "General"}).
Generate a highly realistic mock test containing exactly ${numQuestions} multiple-choice questions (MCQs) spanning ALL CORE SUBJECTS of Class ${className} (${stream || "General"}).
The questions must be evenly distributed across these core subjects: ${subjectList}.
Ensure that each question has the subject name prefixed in brackets so the student knows which subject that question belongs to (e.g., "[Physics / भौतिकी] ... " or "[Maths / गणित] ...").
The test must be generated in ${language || "Bilingual (Hindi & English)"} language.

Search Google or use your knowledge for actual past year question papers (PYQs) or official model sets of BSEB (Bihar Board) for Class ${className} specifically for the year ${year}.
Ensure the questions represent actual recurring topics, formulas, or facts asked in Bihar Board matric (10th) or intermediate (12th) exams specifically from the year ${year}.

Requirements for each question:
1. The question text should match the Bihar Board pattern. If Bilingual is selected, provide the question and options in both English and Hindi.
2. Provide exactly 4 options labeled A, B, C, D.
3. Identify the correctOption ("A", "B", "C", or "D").
4. Provide a detailed explanation citing the correct answer, the specific concept, and if possible, which past exam year it was asked or similar to (e.g., " पूछा गया BSEB ${year} exam" or "Similar to BSEB ${year} Intermediate exam").
5. Assign a difficulty level ("Easy", "Medium", "Hard").
`;
    } else {
      searchContextPrompt = `You are an expert exam compiler for the Bihar School Examination Board (BSEB) Class ${className} (${stream || "General"}).
Generate a highly realistic mock test containing exactly ${numQuestions} multiple-choice questions (MCQs) for the subject "${subject}" in ${language || "Bilingual (Hindi & English)"} language.

Search Google or use your knowledge for actual past year question papers (PYQs) or official model sets of BSEB (Bihar Board) for Class ${className} ${subject} specifically for the year ${year}.
Ensure the questions represent actual recurring topics, formulas, or facts asked in Bihar Board matric (10th) or intermediate (12th) exams specifically from the year ${year}.

Requirements for each question:
1. The question text should match the Bihar Board pattern. If Bilingual is selected, provide the question and options in both English and Hindi.
2. Provide exactly 4 options labeled A, B, C, D.
3. Identify the correctOption ("A", "B", "C", or "D").
4. Provide a detailed explanation citing the correct answer, the specific concept, and if possible, which past exam year it was asked or similar to (e.g., " पूछा गया BSEB ${year} exam" or "Similar to BSEB ${year} Intermediate exam").
5. Assign a difficulty level ("Easy", "Medium", "Hard").
`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: searchContextPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["subject", "className", "stream", "questions"],
          properties: {
            subject: { type: Type.STRING },
            className: { type: Type.STRING },
            stream: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              description: "List of BSEB mock test questions",
              items: {
                type: Type.OBJECT,
                required: ["id", "questionText", "options", "correctOption", "explanation", "difficulty"],
                properties: {
                  id: { type: Type.INTEGER },
                  questionText: { type: Type.STRING, description: "Question in Hindi and English if bilingual, or selected language" },
                  options: {
                    type: Type.ARRAY,
                    description: "Exactly 4 options representing A, B, C, D. If bilingual, include translation for each option.",
                    items: { type: Type.STRING }
                  },
                  correctOption: { type: Type.STRING, description: "Must be 'A', 'B', 'C', or 'D'" },
                  explanation: { type: Type.STRING, description: "Detailed explanation in student-friendly tone, mentioning BSEB context/year if applicable" },
                  difficulty: { type: Type.STRING, description: "Easy, Medium, or Hard" }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Failed to receive structured content from Gemini API.");
    }

    const testData = JSON.parse(text);
    return res.json(testData);
  } catch (error: any) {
    console.error("Error generating mock test:", error);
    return res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});

// ---------------------------------------------------------
// Endpoint: Generate Custom Study Schedule
// ---------------------------------------------------------
app.post("/api/generate-schedule", async (req: express.Request, res: express.Response): Promise<any> => {
  try {
    const { className, stream, availableHours, examDate, weakSubjects, strongSubjects } = req.body;

    if (!className) {
      return res.status(400).json({ error: "className is required." });
    }

    const ai = getGeminiClient();

    const schedulePrompt = `Create a highly structured and realistic daily study timetable and weekly checklist for a student preparing for the Bihar Board (BSEB) Class ${className} ${stream ? `(${stream} stream)` : ""} examination.
Target Exam Date / Period: ${examDate || "February (Standard BSEB timeline)"}
Daily Study Time Available: ${availableHours || 4} hours.
Student's Weak Subjects: ${weakSubjects || "Not specified"}
Student's Strong Subjects: ${strongSubjects || "Not specified"}

Provide a detailed daily routine breakdown, hourly suggestions, preparation strategies tailored to Bihar Board (which emphasizes high MCQ weightage - 50% objective sheets and 50% subjective), and key focus topics.

Format the output as a clean, highly structured JSON object. Use Hindi or English (student-friendly).
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: schedulePrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "overview", "dailyRoutine", "subjectWiseStrategy", "weeklyChecklist", "importantTips"],
          properties: {
            title: { type: Type.STRING },
            overview: { type: Type.STRING },
            dailyRoutine: {
              type: Type.ARRAY,
              description: "Hourly blocks of the recommended daily routine",
              items: {
                type: Type.OBJECT,
                required: ["timeSlot", "activity", "focusArea", "tip"],
                properties: {
                  timeSlot: { type: Type.STRING, description: "e.g., 06:00 AM - 08:00 AM" },
                  activity: { type: Type.STRING, description: "Subject study, MCQ revision, writing practice, etc." },
                  focusArea: { type: Type.STRING, description: "Specific details on what to study" },
                  tip: { type: Type.STRING, description: "Practical study tip for this slot" }
                }
              }
            },
            subjectWiseStrategy: {
              type: Type.ARRAY,
              description: "Key strategy tips for core subjects",
              items: {
                type: Type.OBJECT,
                required: ["subject", "strategy", "priorityTopics"],
                properties: {
                  subject: { type: Type.STRING },
                  strategy: { type: Type.STRING },
                  priorityTopics: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            weeklyChecklist: {
              type: Type.ARRAY,
              description: "A weekly target checklist for exam readiness",
              items: { type: Type.STRING }
            },
            importantTips: {
              type: Type.ARRAY,
              description: "Specific Bihar Board exam strategy tips (OMR sheet practice, writing speed, revision)",
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Failed to generate schedule from Gemini API.");
    }

    const scheduleData = JSON.parse(text);
    return res.json(scheduleData);
  } catch (error: any) {
    console.error("Error generating schedule:", error);
    return res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});

// ---------------------------------------------------------
// Chatting Room: Free BSEB Community Discussion Forum
// ---------------------------------------------------------
interface ChatMessage {
  id: string;
  senderName: string;
  className: "10th" | "12th" | "All";
  district: string;
  message: string;
  timestamp: string;
  createdAt: number;
}

let chatMessages: ChatMessage[] = [
  {
    id: "msg-1",
    senderName: "Sneha Kumari",
    className: "10th",
    district: "Patna (पटना)",
    message: "Hey students! I solved the 10th Math mock paper. Quadratic equations and Trigonometry questions are extremely accurate and match BSEB 2024!",
    timestamp: "10 mins ago",
    createdAt: Date.now() - 600000
  },
  {
    id: "msg-2",
    senderName: "Aman Raj",
    className: "12th",
    district: "Gaya (गया)",
    message: "Physics formulas are super important for intermediate BSEB exams. Practice the derivations of Gauss's Law, they repeat almost every alternate year!",
    timestamp: "8 mins ago",
    createdAt: Date.now() - 480000
  },
  {
    id: "msg-3",
    senderName: "Priyanshu Kumar",
    className: "12th",
    district: "Muzaffarpur (मुजफ्फरपुर)",
    message: "Yes Aman! Also, check out the objective questions in Chemistry. Organic reactions from previous years have high weightage.",
    timestamp: "6 mins ago",
    createdAt: Date.now() - 360000
  },
  {
    id: "msg-4",
    senderName: "Ananya Singh",
    className: "10th",
    district: "Darbhanga (दरभंगा)",
    message: "Does anyone want to group study Social Science history chapters? Let's discuss answers here in this free chat room!",
    timestamp: "4 mins ago",
    createdAt: Date.now() - 240000
  },
  {
    id: "msg-5",
    senderName: "Vikash Kumar",
    className: "12th",
    district: "Bhagalpur (भागलपुर)",
    message: "Highly recommend using the Daily Planner tool. It gave me a perfect schedule balancing weak and strong subjects according to available hours.",
    timestamp: "2 mins ago",
    createdAt: Date.now() - 120000
  }
];

// GET: Retrieve recent community chat messages
app.get("/api/chat/messages", (req: express.Request, res: express.Response) => {
  res.json(chatMessages);
});

// POST: Add a new message to the chat
app.post("/api/chat/messages", (req: express.Request, res: express.Response): any => {
  const { senderName, className, district, message } = req.body;

  if (!senderName || !className || !district || !message) {
    return res.status(400).json({ error: "Missing required chat message parameters." });
  }

  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    senderName: senderName.trim(),
    className: className,
    district: district,
    message: message.trim(),
    timestamp: "Just now",
    createdAt: Date.now()
  };

  chatMessages.push(newMessage);

  // Keep max 200 messages
  if (chatMessages.length > 200) {
    chatMessages.shift();
  }

  res.status(201).json(newMessage);
});

// ---------------------------------------------------------
// Vite Integration and App Startup
// ---------------------------------------------------------
async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
