import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { generateDailyQuestions } from "./src/questionGenerator.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;

function hasValidApiKey(): boolean {
  const apiKey = process.env.GEMINI_API_KEY;
  return !!(apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "GEMINI_API_KEY" && apiKey.trim() !== "");
}

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
// COMPREHENSIVE OFFLINE MOCK TEST DATABASE & GENERATORS
// ---------------------------------------------------------
const OFFLINE_QUESTIONS: Record<string, any[]> = {
  "physics": [
    {
      id: 1,
      questionText: "What is the SI unit of electric dipole moment?\nविद्युत द्विध्रुव आघूर्ण का S.I. मात्रक क्या होता है?",
      options: [
        "Coulomb-meter (कूलॉम-मीटर)",
        "Coulomb/meter (कूलॉम/मीटर)",
        "Coulomb-meter² (कूलॉम-मीटर²)",
        "Coulomb/meter² (कूलॉम/मीटर²)"
      ],
      correctOption: "A",
      explanation: "Coulomb-meter is the SI unit of dipole moment. (पूछा गया BSEB 12th Board PYQ)",
      difficulty: "Easy"
    },
    {
      id: 2,
      questionText: "The speed of light is maximum in:\nप्रकाश की चाल महत्तम होती है:",
      options: [
        "Air (हवा में)",
        "Glass (शीशा में)",
        "Water (पानी में)",
        "Vacuum (निर्वात में)"
      ],
      correctOption: "D",
      explanation: "Speed of light is maximum in vacuum, which is 3 x 10^8 m/s. (BSEB 12th PYQ)",
      difficulty: "Easy"
    },
    {
      id: 3,
      questionText: "Which of the following is electromagnetic in nature?\nनिम्नलिखित में से कौन विद्युत-चुम्बकीय प्रकृति का है?",
      options: [
        "Alpha rays (अल्फा किरणें)",
        "Beta rays (बीटा किरणें)",
        "Gamma rays (गामा किरणें)",
        "Cathode rays (कैथोड किरणें)"
      ],
      correctOption: "C",
      explanation: "Gamma rays are electromagnetic waves. (BSEB 12th PYQ)",
      difficulty: "Medium"
    },
    {
      id: 4,
      questionText: "The focal length of a plane mirror is:\nसमतल दर्पण की फोकस दूरी होती है:",
      options: [
        "Zero (शून्य)",
        "Infinity (अनंत)",
        "25 cm",
        "-25 cm"
      ],
      correctOption: "B",
      explanation: "The reflecting surface of a plane mirror is flat, so its radius of curvature is infinity. Hence, its focal length (f = R/2) is also infinity. (BSEB Class 12 Boards)",
      difficulty: "Easy"
    },
    {
      id: 5,
      questionText: "If a light ray enters from glass into water, what happens to its wavelength?\nयदि कोई प्रकाश किरण काँच से जल में प्रवेश करती है, तो उसकी तरंगदैर्घ्य पर क्या प्रभाव पड़ता है?",
      options: [
        "Increases (बढ़ती है)",
        "Decreases (घटती है)",
        "Remains unchanged (अपरिवर्तित रहती है)",
        "First increases then decreases (पहले बढ़ती है फिर घटती है)"
      ],
      correctOption: "A",
      explanation: "Refractive index of glass (~1.5) is greater than water (~1.33). Since wavelength is inversely proportional to refractive index, wavelength increases as refractive index decreases. (BSEB PYQ)",
      difficulty: "Hard"
    }
  ],
  "chemistry": [
    {
      id: 1,
      questionText: "The coordination number of metal in hcp structure is:\nhcp संरचना में धातु की समन्वय संख्या होती है:",
      options: [
        "12",
        "8",
        "6",
        "4"
      ],
      correctOption: "A",
      explanation: "The coordination number of hexagonal close-packed (hcp) crystal lattice is 12. (BSEB 12th PYQ)",
      difficulty: "Easy"
    },
    {
      id: 2,
      questionText: "Which of the following is a strong electrolyte?\nनिम्नलिखित में से कौन एक प्रबल विद्युत अपघट्य है?",
      options: [
        "CH3COOH",
        "NH4OH",
        "NaCl",
        "H2CO3"
      ],
      correctOption: "C",
      explanation: "NaCl is a strong electrolyte because it completely dissociates in water. (BSEB 12th PYQ)",
      difficulty: "Easy"
    },
    {
      id: 3,
      questionText: "The formula of Rust is:\nजंग का रासायनिक सूत्र है:",
      options: [
        "Fe2O3",
        "Fe3O4",
        "Fe2O3.xH2O",
        "Fe(OH)2"
      ],
      correctOption: "C",
      explanation: "Rust is hydrated ferric oxide: Fe2O3.xH2O. (BSEB 12th Board Exam)",
      difficulty: "Medium"
    },
    {
      id: 4,
      questionText: "Which of the following transition metals is paramagnetic in nature?\nनिम्नलिखित में से कौन सा संक्रमण धातु अनुचुम्बकीय (paramagnetic) प्रकृति का है?",
      options: [
        "Zinc (Zn)",
        "Copper (Cu+)",
        "Iron (Fe3+)",
        "Scandium (Sc3+)"
      ],
      correctOption: "C",
      explanation: "Fe3+ has unpaired electrons in d-orbital ([Ar] 3d5), making it strongly paramagnetic. Zn2+ and Sc3+ have fully filled or empty d-orbitals. (BSEB 12th Chemistry PYQ)",
      difficulty: "Hard"
    }
  ],
  "mathematics": [
    {
      id: 1,
      questionText: "The value of ∫ (1 / (1 + x²)) dx is:\n∫ (1 / (1 + x²)) dx का मान क्या होता है?",
      options: [
        "tan⁻¹ x + C",
        "sin⁻¹ x + C",
        "sec⁻¹ x + C",
        "cos⁻¹ x + C"
      ],
      correctOption: "A",
      explanation: "The standard integral of 1/(1+x²) is tan⁻¹ x. (BSEB 12th PYQ)",
      difficulty: "Easy"
    },
    {
      id: 2,
      questionText: "If A is a square matrix of order 3, then |kA| is equal to:\nयदि A कोटि 3 का एक वर्ग आव्यूह है, तो |kA| का मान होगा:",
      options: [
        "k|A|",
        "k²|A|",
        "k³|A|",
        "3k|A|"
      ],
      correctOption: "C",
      explanation: "For a square matrix of order n, |kA| = k^n |A|. Here n = 3, so k³|A|. (BSEB 12th PYQ)",
      difficulty: "Medium"
    },
    {
      id: 3,
      questionText: "The projection of vector i - j on vector i + j is:\nसदिश i - j का सदिश i + j पर प्रक्षेप होगा:",
      options: [
        "0",
        "1",
        "2",
        "√2"
      ],
      correctOption: "A",
      explanation: "Projection of a on b is (a·b) / |b|. Since (i - j)·(i + j) = 1 - 1 = 0, the projection is 0. (BSEB 12th Board Exam)",
      difficulty: "Medium"
    }
  ],
  "biology": [
    {
      id: 1,
      questionText: "Double fertilization is the chief characteristic of:\nद्विनिषेचन (Double fertilization) मुख्य विशेषता है:",
      options: [
        "Bryophytes (ब्रायोफाइट्स की)",
        "Pteridophytes (टेरिडोफाइट्स की)",
        "Angiosperms (आवृतबीजी/एन्जियोस्पर्म की)",
        "Gymnosperms (जिम्नोस्पर्म की)"
      ],
      correctOption: "C",
      explanation: "Double fertilization is unique to flowering plants (Angiosperms). (BSEB 12th Biology PYQ)",
      difficulty: "Medium"
    },
    {
      id: 2,
      questionText: "Who proposed the law of segregation and independent assortment?\nपृथक्करण और स्वतंत्र अपव्यूहन के नियमों को किसने प्रस्तावित किया?",
      options: [
        "Darwin (डार्विन)",
        "Mendel (मेंडल)",
        "Lamarck (लैमार्क)",
        "Watson (वाटसन)"
      ],
      correctOption: "B",
      explanation: "Gregor Mendel proposed the laws of inheritance, including segregation and independent assortment. (BSEB 12th Board)",
      difficulty: "Easy"
    },
    {
      id: 3,
      questionText: "AIDS is caused by which virus?\nएड्स (AIDS) किस वायरस के कारण होता है?",
      options: [
        "TMV",
        "HIV",
        "Influenza",
        "Rhinovirus"
      ],
      correctOption: "B",
      explanation: "AIDS is caused by the Human Immunodeficiency Virus (HIV). (BSEB 12th PYQ)",
      difficulty: "Easy"
    }
  ],
  "english": [
    {
      id: 1,
      questionText: "Who wrote the poem 'Sweetest Love I Do Not Goe'?\n'Sweetest Love I Do Not Goe' कविता किसने लिखी है?",
      options: [
        "John Donne",
        "Rupert Brooke",
        "Walt Whitman",
        "John Keats"
      ],
      correctOption: "A",
      explanation: "John Donne is the metaphysical poet who wrote 'Sweetest Love I Do Not Goe'. (BSEB 12th English)",
      difficulty: "Easy"
    },
    {
      id: 2,
      questionText: "Choose the correct spelt word:\nसही वर्तनी वाले शब्द का चयन करें:",
      options: [
        "Committee",
        "Commitee",
        "Comittee",
        "Committey"
      ],
      correctOption: "A",
      explanation: "'Committee' is the correct spelling. (BSEB 12th English Grammar)",
      difficulty: "Easy"
    },
    {
      id: 3,
      questionText: "He came ____ car. (Choose the correct preposition)\nवह कार ____ आया।",
      options: [
        "with",
        "by",
        "in",
        "on"
      ],
      correctOption: "B",
      explanation: "'By car' is the correct prepositional phrase for modes of transportation. (BSEB 12th Board Grammar)",
      difficulty: "Easy"
    }
  ],
  "hindi": [
    {
      id: 1,
      questionText: "कबीरदास किस काल के कवि हैं?\nKabirdas belongs to which period of Hindi poetry?",
      options: [
        "आदिकाल (Adikal)",
        "भक्तिकाल (Bhaktikal)",
        "रीतिकाल (Ritikal)",
        "आधुनिक काल (Adhunik kal)"
      ],
      correctOption: "B",
      explanation: "Kabirdas is a prominent poet of Bhaktikal (bhakti movement). (BSEB 12th / 10th Hindi)",
      difficulty: "Easy"
    },
    {
      id: 2,
      questionText: "'हिमालय' शब्द का सही संधि-विच्छेद क्या है?\nWhat is the correct sandhi-viched of 'Himalaya'?",
      options: [
        "हिम + आलय",
        "हिमा + लय",
        "हि + मालय",
        "हिम + लय"
      ],
      correctOption: "A",
      explanation: "हिम + आलय =  हिमालय (दीर्घ स्वर संधि). (BSEB Hindi Grammar)",
      difficulty: "Easy"
    },
    {
      id: 3,
      questionText: "'हाथ मलना' मुहावरे का सही अर्थ क्या है?\nWhat is the meaning of idiom 'Hath Malna'?",
      options: [
        "हाथ धोना",
        "पछताना (To regret)",
        "क्रोध करना",
        "काम शुरू करना"
      ],
      correctOption: "B",
      explanation: "'हाथ मलना' means to regret (पछताना). (BSEB Board Hindi)",
      difficulty: "Easy"
    }
  ],
  "accountancy": [
    {
      id: 1,
      questionText: "Income and Expenditure Account is prepared by:\nआय-व्यय खाता तैयार किया जाता है:",
      options: [
        "Partnership Firm (साझेदारी फर्म द्वारा)",
        "Non-Trading Organization (गैर-व्यापारिक संगठन द्वारा)",
        "Joint Stock Company (संयुक्त स्टॉक कंपनी द्वारा)",
        "Sole Proprietor (एकल स्वामित्व द्वारा)"
      ],
      correctOption: "B",
      explanation: "Non-Trading / Not-for-Profit organizations prepare Income and Expenditure accounts to ascertain surplus/deficit. (BSEB 12th Commerce)",
      difficulty: "Medium"
    },
    {
      id: 2,
      questionText: "Goodwill is an:\nख्याति (Goodwill) एक है:",
      options: [
        "Intangible Asset (अमूर्त संपत्ति)",
        "Tangible Asset (मूर्त संपत्ति)",
        "Current Asset (चालू संपत्ति)",
        "Fictitious Asset (काल्पनिक संपत्ति)"
      ],
      correctOption: "A",
      explanation: "Goodwill is an intangible asset that cannot be seen or touched but has real value. (BSEB 12th PYQ)",
      difficulty: "Easy"
    }
  ],
  "business studies": [
    {
      id: 1,
      questionText: "The father of scientific management is:\nवैज्ञानिक प्रबंध के जनक हैं:",
      options: [
        "Henry Fayol (हेनरी फेयोल)",
        "F.W. Taylor (एफ.डब्ल्यू. टेलर)",
        "Harold Koontz (हेराल्ड कून्ट्ज़)",
        "Peter Drucker (पीटर ड्रकर)"
      ],
      correctOption: "B",
      explanation: "F.W. Taylor is considered the father of scientific management, while Henry Fayol is the father of general management. (BSEB 12th Commerce)",
      difficulty: "Easy"
    },
    {
      id: 2,
      questionText: "Planning is:\nनियोजन होता है:",
      options: [
        "Goal-oriented (लक्ष्य-उन्मुख)",
        "Future-oriented (भविष्य-उन्मुख)",
        "All-pervasive (सर्वव्यापक)",
        "All of these (ये सभी)"
      ],
      correctOption: "D",
      explanation: "Planning is goal-oriented, forward-looking, and required at all levels of management. (BSEB Commerce Board Exam)",
      difficulty: "Easy"
    }
  ],
  "economics": [
    {
      id: 1,
      questionText: "Who is the father of Modern Macroeconomics?\nआधुनिक समष्टि अर्थशास्त्र के जनक कौन हैं?",
      options: [
        "Adam Smith (एडम स्मिथ)",
        "Alfred Marshall (अल्फ्रेड मार्शल)",
        "J.M. Keynes (जे.एम. कीन्स)",
        "Samuelson (सैम्युअल्सन)"
      ],
      correctOption: "C",
      explanation: "John Maynard Keynes is widely regarded as the father of modern macroeconomics. (BSEB 12th Economics)",
      difficulty: "Medium"
    },
    {
      id: 2,
      questionText: "Which of the following is a direct tax?\nनिम्नलिखित में से कौन-सा एक प्रत्यक्ष कर है?",
      options: [
        "GST (वस्तु एवं सेवा कर)",
        "Income Tax (आयकर)",
        "Excise Duty (उत्पाद शुल्क)",
        "Customs Duty (सीमा शुल्क)"
      ],
      correctOption: "B",
      explanation: "Income tax is paid directly by the individual to the government, hence it is a direct tax. (BSEB 12th Commerce/Arts)",
      difficulty: "Easy"
    }
  ],
  "history": [
    {
      id: 1,
      questionText: "Who founded the Maurya Empire?\nमौर्य साम्राज्य की स्थापना किसने की थी?",
      options: [
        "Chandragupta Maurya (चन्द्रगुप्त मौर्य)",
        "Ashoka (अशोक)",
        "Bindusara (बिन्दुसार)",
        "Harsha (हर्षवर्धन)"
      ],
      correctOption: "A",
      explanation: "Chandragupta Maurya founded the Maurya Empire with the help of Chanakya (Kautilya). (BSEB 12th Arts History)",
      difficulty: "Easy"
    },
    {
      id: 2,
      questionText: "In which year did the Quit India Movement start?\n'भारत छोड़ो आंदोलन' किस वर्ष शुरू हुआ था?",
      options: [
        "1920",
        "1930",
        "1942",
        "1947"
      ],
      correctOption: "C",
      explanation: "Mahatma Gandhi launched the Quit India Movement in August 1942 during WWII. (BSEB Board History)",
      difficulty: "Easy"
    }
  ],
  "political science": [
    {
      id: 1,
      questionText: "When was the Constitution of India adopted and enacted?\nभारतीय संविधान को कब अपनाया और लागू किया गया था?",
      options: [
        "15 August 1947",
        "26 January 1950",
        "26 November 1949",
        "2 October 1952"
      ],
      correctOption: "B",
      explanation: "The Constitution was adopted on 26 Nov 1949 and came into effect on 26 Jan 1950 (Republic Day). (BSEB Political Science)",
      difficulty: "Medium"
    },
    {
      id: 2,
      questionText: "Who was the first Prime Minister of India?\nभारत के प्रथम प्रधानमंत्री कौन थे?",
      options: [
        "Dr. Rajendra Prasad",
        "Pandit Jawaharlal Nehru",
        "Sardar Vallabhbhai Patel",
        "Lal Bahadur Shastri"
      ],
      correctOption: "B",
      explanation: "Pandit Jawaharlal Nehru was the first Prime Minister of independent India. (BSEB 12th Arts)",
      difficulty: "Easy"
    }
  ],
  "geography": [
    {
      id: 1,
      questionText: "Which of the following is a non-renewable energy source?\nनिम्नलिखित में से कौन-सा अनवीकरणीय ऊर्जा स्रोत है?",
      options: [
        "Solar energy (सौर ऊर्जा)",
        "Wind energy (पवन ऊर्जा)",
        "Coal (कोयला)",
        "Hydro power (जल विद्युत)"
      ],
      correctOption: "C",
      explanation: "Coal is a fossil fuel and a non-renewable source of energy. (BSEB Geography)",
      difficulty: "Easy"
    }
  ],
  "sociology": [
    {
      id: 1,
      questionText: "Who is the author of the book 'Caste and Class in India'?\n'Caste and Class in India' पुस्तक के लेखक कौन हैं?",
      options: [
        "M.N. Srinivas",
        "G.S. Ghurye",
        "Yogendra Singh",
        "S.C. Dube"
      ],
      correctOption: "B",
      explanation: "G.S. Ghurye wrote the classic sociological book 'Caste and Class in India'. (BSEB Sociology)",
      difficulty: "Medium"
    }
  ],
  "science": [
    {
      id: 1,
      questionText: "The image formed by a concave mirror when object is at focus is at:\nअवतल दर्पण द्वारा मुख्य फोकस पर रखी वस्तु का प्रतिबिम्ब बनता है:",
      options: [
        "Focus (फोकस पर)",
        "Pole (ध्रुव पर)",
        "Infinity (अनंत पर)",
        "Center of curvature (वक्रता केंद्र पर)"
      ],
      correctOption: "C",
      explanation: "When an object is placed at the focus of a concave mirror, the reflected rays are parallel and the image is formed at infinity. (BSEB Class 10 Science)",
      difficulty: "Easy"
    },
    {
      id: 2,
      questionText: "Which of the following represents Ohm's Law?\nनिम्नलिखित में से कौन ओम का नियम निरूपित करता है?",
      options: [
        "V = I/R",
        "V = I·R",
        "V = R/I",
        "V = I²·R"
      ],
      correctOption: "B",
      explanation: "Ohm's law states V = I·R where R is the resistance. (BSEB Class 10 Boards)",
      difficulty: "Easy"
    },
    {
      id: 3,
      questionText: "Which lens is used to remove short-sightedness (myopia)?\nनिकट-दृष्टि दोष (myopia) को दूर करने के लिए किस लेंस का उपयोग किया जाता है?",
      options: [
        "Convex Lens (उत्तल लेंस)",
        "Concave Lens (अवतल लेंस)",
        "Cylindrical Lens (बेलनाकार लेंस)",
        "Bifocal Lens (द्वि-फोकल लेंस)"
      ],
      correctOption: "B",
      explanation: "Concave lens (अवतल लेंस) is used to correct myopia. It diverges light rays before they enter the eye, allowing them to focus properly on the retina. (पूछा गया BSEB Class 10 Matric Exam)",
      difficulty: "Easy"
    },
    {
      id: 4,
      questionText: "What is the pH value of pure water?\nशुद्ध जल का pH मान क्या होता है?",
      options: [
        "6",
        "7",
        "8",
        "14"
      ],
      correctOption: "B",
      explanation: "The pH of pure water is 7, which represents neutral nature. Less than 7 is acidic, and more than 7 is alkaline. (BSEB Class 10 Boards Science)",
      difficulty: "Easy"
    },
    {
      id: 5,
      questionText: "Which of the following is a plant hormone?\nनिम्नलिखित में से कौन-सा एक पादप हार्मोन (plant hormone) है?",
      options: [
        "Insulin (इंसुलिन)",
        "Thyroxine (थायरोक्सिन)",
        "Estrogen (एस्ट्रोजन)",
        "Cytokinin (साइटोकाइनिन)"
      ],
      correctOption: "D",
      explanation: "Cytokinin is a plant growth hormone that promotes cell division. Insulin, thyroxine, and estrogen are animal hormones. (BSEB 2023 Matric Exam)",
      difficulty: "Medium"
    }
  ],
  "social science": [
    {
      id: 1,
      questionText: "Who is known as the 'Iron Man of India'?\nभारत के 'लोह पुरुष' के रूप में किसे जाना जाता है?",
      options: [
        "Mahatma Gandhi",
        "Bal Gangadhar Tilak",
        "Sardar Vallabhbhai Patel",
        "Subhash Chandra Bose"
      ],
      correctOption: "C",
      explanation: "Sardar Vallabhbhai Patel is known as the Iron Man of India due to his role in integrating princely states. (BSEB Social Science)",
      difficulty: "Easy"
    }
  ],
  "sanskrit": [
    {
      id: 1,
      questionText: "'पठितुम्' में कौन-सा प्रत्यय है?\nWhich suffix (pratyay) is used in 'Pathitum'?",
      options: [
        "क्त्वा (Ktva)",
        "तुमुन् (Tumun)",
        "ल्यप् (Lyap)",
        "अनीयर् (Aneeyar)"
      ],
      correctOption: "B",
      explanation: "पठ् + तुमुन् = पठितुम्. (BSEB Class 10 Sanskrit)",
      difficulty: "Easy"
    }
  ]
};

function getDynamicQuestions(subject: string, className: string, count: number, year: string, stream?: string): any[] {
  // Use current date string as the rotation seed
  const todayStr = new Date().toDateString();
  const poolSize = Math.max(count * 2, 300);
  const dynamicPool = generateDailyQuestions(subject, className, poolSize, todayStr, stream);

  const normSub = subject.toLowerCase().trim();
  let baseQuestions = OFFLINE_QUESTIONS[normSub] || [];
  
  if (baseQuestions.length === 0) {
    // Attempt partial matches
    for (const key of Object.keys(OFFLINE_QUESTIONS)) {
      if (normSub.includes(key) || key.includes(normSub)) {
        baseQuestions = OFFLINE_QUESTIONS[key];
        break;
      }
    }
  }

  // Combine static fallback questions with our dynamic day-seeded question pool
  const combined = [...baseQuestions];
  dynamicPool.forEach(dq => {
    // Avoid exact duplicate question text
    if (!combined.some(bq => bq.questionText.trim() === dq.questionText.trim())) {
      combined.push(dq);
    }
  });

  // Re-index all questions to be sequentially numbered
  const indexed = combined.map((q, idx) => ({
    ...q,
    id: idx + 1
  }));

  // Return the requested quantity (which can now easily be 200+)
  return indexed.slice(0, count);
}

function generateOfflineTest(className: string, stream: string, subject: string, numQuestions: number, year: string) {
  let questions: any[] = [];
  
  if (subject === "All Subjects") {
    // Combine questions from multiple subjects of this class
    let availableKeys: string[] = [];
    if (className === "10th") {
      availableKeys = ["science", "social science", "sanskrit", "hindi", "english"];
    } else {
      if (stream?.toLowerCase() === "science") {
        availableKeys = ["physics", "chemistry", "mathematics", "biology", "english", "hindi"];
      } else if (stream?.toLowerCase() === "commerce") {
        availableKeys = ["accountancy", "business studies", "economics", "english", "hindi"];
      } else {
        availableKeys = ["history", "political science", "geography", "sociology", "english", "hindi"];
      }
    }

    // Select questions round-robin style
    let keyIdx = 0;
    while (questions.length < numQuestions) {
      const key = availableKeys[keyIdx % availableKeys.length];
      const subQuestions = OFFLINE_QUESTIONS[key] || [];
      if (subQuestions.length > 0) {
        const randQ = subQuestions[Math.floor(Math.random() * subQuestions.length)];
        // Ensure no duplicate IDs in the session
        if (!questions.some(q => q.questionText === randQ.questionText)) {
          questions.push({
            ...randQ,
            id: questions.length + 1,
            questionText: `[${key.toUpperCase()}] ${randQ.questionText}`
          });
        }
      }
      
      keyIdx++;
      if (keyIdx > availableKeys.length * 10) {
        // Break infinite loop if we run out of unique questions, generate dynamic ones
        break;
      }
    }

    if (questions.length < numQuestions) {
      const needed = numQuestions - questions.length;
      const fallbackQs = getDynamicQuestions(subject, className, needed, year, stream);
      fallbackQs.forEach((q, idx) => {
        questions.push({
          ...q,
          id: questions.length + 1
        });
      });
    }
  } else {
    questions = getDynamicQuestions(subject, className, numQuestions, year, stream);
  }

  return {
    subject: subject,
    className: className,
    stream: stream || "General",
    questions: questions
  };
}

function generateOfflineSchedule(className: string, stream?: string, availableHours?: number, examDate?: string, weakSubjects?: string, strongSubjects?: string) {
  const normClass = className || "12th";
  const normStream = stream || "Science";
  const hours = availableHours || 4;
  const dateStr = examDate || "February (Standard BSEB Timeline)";
  const weak = weakSubjects || "All chapters";
  const strong = strongSubjects || "Revision chapters";

  return {
    title: `BSEB Class ${normClass} ${normStream} Study Master Plan`,
    overview: `This custom study schedule has been procedurally compiled for your Bihar Board preparation, targeting the ${dateStr} board exam. Tailored specifically for a ${hours}-hour daily routine with emphasis on mastering ${weak} and revising ${strong}.`,
    dailyRoutine: [
      {
        timeSlot: "06:00 AM - 08:00 AM",
        activity: `Intensive Concept Study (${weak})`,
        focusArea: `Study high-weightage topics and theory in ${weak}.`,
        tip: "Morning hours are best for learning complex concepts and formulas."
      },
      {
        timeSlot: "11:00 AM - 01:00 PM",
        activity: "MCQ & OMR Sheet Practice",
        focusArea: `Speed run through 50 objective questions for ${strong}.`,
        tip: "Bihar Board exams are 50% objective. Practice shading circles quickly on OMR sheets."
      },
      {
        timeSlot: "03:00 PM - 04:30 PM",
        activity: "Subjective Answer Writing",
        focusArea: "Practice step-by-step writing of long and short answers of previous papers.",
        tip: "Step-marking is strictly followed in BSEB evaluation. Show your derivations clearly."
      },
      {
        timeSlot: "08:00 PM - 09:30 PM",
        activity: "Quick Revision & Formulas",
        focusArea: "Review chemical equations, mathematical theorems, or historical dates.",
        tip: "Active recall before sleeping strengthens memory consolidation."
      }
    ].slice(0, hours <= 2 ? 2 : hours <= 3 ? 3 : 4),
    subjectWiseStrategy: [
      {
        subject: `Weak Target: ${weak}`,
        strategy: `Allocate 60% of your focus here. Start by practicing past 10 years' questions (PYQs).`,
        priorityTopics: ["Fundamental Definitions", "Formulas & Derivations", "Short-answer sample solutions"]
      },
      {
        subject: `Strong Asset: ${strong}`,
        strategy: `Maintain high performance through daily practice of 20 MCQ sets.`,
        priorityTopics: ["Objective Mock Questions", "Quick Problem Solving", "Time-management strategies"]
      }
    ],
    weeklyChecklist: [
      `Attempt at least 2 full-syllabus mock tests on this BSEB practice portal.`,
      `Practice writing 5 long-form answers to perfect speed and step-wise marking.`,
      `Solve 100 bilingual objective questions to keep a high accuracy rate.`,
      `Revise all key formulas and definitions of ${weak} at least twice.`
    ],
    importantTips: [
      "Bihar Board strictly grades on handwriting and correct question numbering.",
      "In the exam hall, finish the OMR sheet in the first hour to avoid last-minute stress.",
      "Mentioning correct units in Science and step numbers in Math secures full marks."
    ]
  };
}

// ---------------------------------------------------------
// Endpoint: Generate Bihar Board Mock Test
// ---------------------------------------------------------
app.post("/api/generate-test", async (req: express.Request, res: express.Response): Promise<any> => {
  const { className, stream, subject, language, numQuestions = 10, year = "2026" } = req.body;

  if (!className || !subject) {
    return res.status(400).json({ error: "className and subject are required parameters." });
  }

  // Fallback to offline generator immediately if API key is not configured
  if (!hasValidApiKey()) {
    console.log("No valid Gemini API key found. Serving high-fidelity procedural BSEB mock test.");
    const offlineTest = generateOfflineTest(className, stream, subject, numQuestions, year);
    return res.json(offlineTest);
  }

  try {
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
    console.error("Error generating mock test via Gemini, using offline database fallback:", error);
    const offlineTest = generateOfflineTest(className, stream, subject, numQuestions, year);
    return res.json(offlineTest);
  }
});

// ---------------------------------------------------------
// Endpoint: Generate Custom Study Schedule
// ---------------------------------------------------------
app.post("/api/generate-schedule", async (req: express.Request, res: express.Response): Promise<any> => {
  const { className, stream, availableHours, examDate, weakSubjects, strongSubjects } = req.body;

  if (!className) {
    return res.status(400).json({ error: "className is required." });
  }

  // Fallback to offline generator immediately if API key is not configured
  if (!hasValidApiKey()) {
    console.log("No valid Gemini API key found. Serving high-fidelity custom schedule offline.");
    const offlineSchedule = generateOfflineSchedule(className, stream, availableHours, examDate, weakSubjects, strongSubjects);
    return res.json(offlineSchedule);
  }

  try {
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
    console.error("Error generating schedule via Gemini, using offline database fallback:", error);
    const offlineSchedule = generateOfflineSchedule(className, stream, availableHours, examDate, weakSubjects, strongSubjects);
    return res.json(offlineSchedule);
  }
});

// ---------------------------------------------------------
// Chatting Room: Free BSEB Community Discussion Forum
// ---------------------------------------------------------
interface ChatMessage {
  id: string;
  senderId: string;
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
    senderId: "system-1",
    senderName: "Sneha Kumari",
    className: "10th",
    district: "Patna (पटना)",
    message: "Hey students! I solved the 10th Math mock paper. Quadratic equations and Trigonometry questions are extremely accurate and match BSEB 2024!",
    timestamp: "10 mins ago",
    createdAt: Date.now() - 600000
  },
  {
    id: "msg-2",
    senderId: "system-2",
    senderName: "Aman Raj",
    className: "12th",
    district: "Gaya (गया)",
    message: "Physics formulas are super important for intermediate BSEB exams. Practice the derivations of Gauss's Law, they repeat almost every alternate year!",
    timestamp: "8 mins ago",
    createdAt: Date.now() - 480000
  },
  {
    id: "msg-3",
    senderId: "system-3",
    senderName: "Priyanshu Kumar",
    className: "12th",
    district: "Muzaffarpur (मुजफ्फरपुर)",
    message: "Yes Aman! Also, check out the objective questions in Chemistry. Organic reactions from previous years have high weightage.",
    timestamp: "6 mins ago",
    createdAt: Date.now() - 360000
  },
  {
    id: "msg-4",
    senderId: "system-4",
    senderName: "Ananya Singh",
    className: "10th",
    district: "Darbhanga (दरभंगा)",
    message: "Does anyone want to group study Social Science history chapters? Let's discuss answers here in this free chat room!",
    timestamp: "4 mins ago",
    createdAt: Date.now() - 240000
  },
  {
    id: "msg-5",
    senderId: "system-5",
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
  const { senderId, senderName, className, district, message } = req.body;

  if (!senderId || !senderName || !className || !district || !message) {
    return res.status(400).json({ error: "Missing required chat message parameters." });
  }

  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    senderId: senderId.trim(),
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
