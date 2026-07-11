import { Stream, Question, Subject } from "./types";

export const STREAMS_12TH: Stream[] = [
  {
    id: "science",
    name: "Science",
    hindiName: "विज्ञान",
    subjects: [
      {
        id: "physics",
        name: "Physics",
        hindiName: "भौतिकी",
        icon: "Zap",
        description: "Electrostatics, Optics, Magnetism, Semiconductor devices, and Modern Physics.",
        hindiDescription: "स्थिरवैद्युतिकी, प्रकाशिकी, चुंबकत्व, अर्धचालक उपकरण और आधुनिक भौतिकी।",
        topics: ["Electrostatics", "Current Electricity", "Optics", "Modern Physics", "Semiconductors", "Magnetic Effect of Current"]
      },
      {
        id: "chemistry",
        name: "Chemistry",
        hindiName: "रसायन शास्त्र",
        icon: "FlaskConical",
        description: "Physical, Organic, and Inorganic Chemistry with emphasis on equations and chemical processes.",
        hindiDescription: "भौतिक, कार्बनिक और अकार्बनिक रसायन शास्त्र, समीकरणों और रासायनिक प्रक्रियाओं पर जोर।",
        topics: ["Solid State", "Solutions", "Electrochemistry", "p-Block Elements", "Coordination Compounds", "Organic Conversions"]
      },
      {
        id: "mathematics_12",
        name: "Mathematics",
        hindiName: "गणित",
        icon: "Binary",
        description: "Calculus (Integration & Derivatives), Vectors, 3D Geometry, Linear Programming, and Probability.",
        hindiDescription: "कलन (समाकलन और अवकलन), सदिश, 3D ज्यामिति, रैखिक प्रोग्रामन और प्रायिकता।",
        topics: ["Calculus", "Vectors & 3D Geometry", "Matrices & Determinants", "Probability", "Relations & Functions"]
      },
      {
        id: "biology",
        name: "Biology",
        hindiName: "जीव विज्ञान",
        icon: "Dna",
        description: "Genetics, Human Welfare, Biotechnology, Ecology, and Plant/Animal Physiology.",
        hindiDescription: "अनुवांशिकी, मानव कल्याण, जैव प्रौद्योगिकी, पारिस्थितिकी, और पादप/जंतु शरीर विज्ञान।",
        topics: ["Reproduction", "Genetics & Evolution", "Biotechnology", "Biology in Human Welfare", "Ecology"]
      },
      {
        id: "english_12",
        name: "English",
        hindiName: "अंग्रेजी",
        icon: "BookOpen",
        description: "Rainbow Part II Reader, grammar rules, letter writing, essays, and comprehension.",
        hindiDescription: "रेनबो पार्ट II रीडर, व्याकरण के नियम, पत्र लेखन, निबंध और गद्यांश।",
        topics: ["Prose & Poetry", "Tense & Voice", "Synonyms & Antonyms", "Prepositions", "Direct & Indirect Speech"]
      },
      {
        id: "hindi_12",
        name: "Hindi",
        hindiName: "हिंदी",
        icon: "Languages",
        description: "Digant Part II Reader, Hindi grammar, idioms, essay writing, and summaries.",
        hindiDescription: "दिगंत भाग II रीडर, हिंदी व्याकरण, मुहावरे, निबंध लेखन और सारांश।",
        topics: ["गद्य और काव्य खंड", "संधि और समास", "पर्यायवाची और विलोम", "कारक और लिंग", "निबंध और पत्र लेखन"]
      }
    ]
  },
  {
    id: "commerce",
    name: "Commerce",
    hindiName: "वाणिज्य",
    subjects: [
      {
        id: "accountancy",
        name: "Accountancy",
        hindiName: "लेखाशास्त्र",
        icon: "Calculator",
        description: "Partnership Accounts, Non-Profit Organizations, Shares and Debentures, Financial Analysis.",
        hindiDescription: "साझेदारी खाते, गैर-लाभकारी संगठन, शेयर और डिबेंचर, वित्तीय विश्लेषण।",
        topics: ["Partnership Accounts", "Non-Profit Organizations (NPO)", "Issue of Shares & Debentures", "Cash Flow Statement", "Ratio Analysis"]
      },
      {
        id: "business_studies",
        name: "Business Studies",
        hindiName: "व्यवसाय अध्ययन",
        icon: "Briefcase",
        description: "Principles of Management, Business Environment, Financial Management, and Marketing.",
        hindiDescription: "प्रबंधन के सिद्धांत, व्यावसायिक वातावरण, वित्तीय प्रबंधन और विपणन।",
        topics: ["Principles of Management", "Planning & Organizing", "Financial Markets", "Consumer Protection", "Staffing & Directing"]
      },
      {
        id: "economics_12",
        name: "Economics",
        hindiName: "अर्थशास्त्र",
        icon: "TrendingUp",
        description: "Microeconomics and Macroeconomics covering national income, demand, and budget patterns.",
        hindiDescription: "व्यष्टि और समष्टि अर्थशास्त्र - राष्ट्रीय आय, मांग और बजट पैटर्न का विवरण।",
        topics: ["Consumer Behaviour & Demand", "National Income Accounting", "Money & Banking", "Government Budget", "Market Forms"]
      },
      {
        id: "entrepreneurship",
        name: "Entrepreneurship",
        hindiName: "उद्यमशीलता",
        icon: "Lightbulb",
        description: "Project formulation, resource mobilization, enterprise planning, and growth strategies.",
        hindiDescription: "परियोजना निर्माण, संसाधन जुटाना, उद्यम योजना और विकास रणनीतियाँ।",
        topics: ["Sensing Business Opportunities", "Project Formulation", "Resource Mobilization", "Financial Planning", "Enterprise Growth"]
      }
    ]
  },
  {
    id: "arts",
    name: "Arts / Humanities",
    hindiName: "कला",
    subjects: [
      {
        id: "history",
        name: "History",
        hindiName: "इतिहास",
        icon: "Scroll",
        description: "Ancient Indian History (Harappan Civilization), Medieval Era (Mughals, Bhakti movement), Modern Freedom Struggle.",
        hindiDescription: "प्राचीन भारतीय इतिहास (हड़प्पा सभ्यता), मध्यकालीन युग (मुगल, भक्ति आंदोलन), आधुनिक स्वतंत्रता संग्राम।",
        topics: ["Harappan Civilization", "Mauryan & Gupta Empire", "Mughal Court", "Bhakti-Sufi Traditions", "1857 Revolt & Mahatma Gandhi"]
      },
      {
        id: "political_science",
        name: "Political Science",
        hindiName: "राजनीति विज्ञान",
        icon: "Globe",
        description: "Cold War Era, Indian Politics since Independence, Democratic Upsurge, and International Relations.",
        hindiDescription: "शीत युद्ध का दौर, स्वतंत्रता के बाद भारतीय राजनीति, लोकतांत्रिक उत्थान और अंतर्राष्ट्रीय संबंध।",
        topics: ["Cold War Era & Disintegration", "One-Party Dominance", "Crisis of Democratic Order", "Recent Developments in Indian Politics", "UN & Global Organizations"]
      },
      {
        id: "geography",
        name: "Geography",
        hindiName: "भूगोल",
        icon: "Map",
        description: "Human Geography fundamentals, Indian resources, agricultural maps, mineral transport, and demographics.",
        hindiDescription: "मानव भूगोल के सिद्धांत, भारतीय संसाधन, कृषि मानचित्र, खनिज परिवहन और जनसांख्यिकी।",
        topics: ["Human Geography Fundamentals", "India: People & Economy", "Resources & Agriculture", "Transport, Communication & Trade"]
      },
      {
        id: "sociology",
        name: "Sociology",
        hindiName: "समाजशास्त्र",
        icon: "Users",
        description: "Structure of Indian Society, social institutions, cultural change, and social challenges in Bihar and India.",
        hindiDescription: "भारतीय समाज की संरचना, सामाजिक संस्थाएं, सांस्कृतिक परिवर्तन और बिहार एवं भारत में सामाजिक चुनौतियाँ।",
        topics: ["Demographic Structure", "Social Institutions", "Change & Development", "Social Movements", "Challenges of Cultural Diversity"]
      }
    ]
  }
];

export const SUBJECTS_10TH: Subject[] = [
  {
    id: "matric_science",
    name: "Science",
    hindiName: "विज्ञान",
    icon: "FlaskConical",
    description: "Physics, Chemistry, and Biology combined with simple concepts, experiments, and daily science application.",
    hindiDescription: "भौतिक विज्ञान, रसायन विज्ञान और जीव विज्ञान का संयुक्त अध्ययन - दैनिक विज्ञान के सिद्धांतों पर आधारित।",
    topics: ["Light - Reflection & Refraction", "Chemical Reactions & Equations", "Life Processes (जैव प्रक्रम)", "Electricity & Magnetism", "Carbon & its Compounds", "Control & Coordination"]
  },
  {
    id: "matric_math",
    name: "Mathematics",
    hindiName: "गणित",
    icon: "Percent",
    description: "Arithmetic Progression, Quadratic Equations, Trigonometry, Coordinate Geometry, and Theorems.",
    hindiDescription: "समानांतर श्रेणी (AP), द्विघात समीकरण, त्रिकोणमिति, निर्देशांक ज्यामिति और प्रमेय।",
    topics: ["Real Numbers", "Polynomials & Quadratic Equations", "Trigonometry (त्रिकोणमिति)", "Arithmetic Progressions", "Triangles & Circles Theorems", "Statistics & Probability"]
  },
  {
    id: "matric_social",
    name: "Social Science",
    hindiName: "सामाजिक विज्ञान",
    icon: "Compass",
    description: "History of Nationalism, Democratic Politics, Geography resources, Bihar disaster management, and Economics.",
    hindiDescription: "राष्ट्रवाद का इतिहास, लोकतांत्रिक राजनीति, भूगोल के संसाधन, बिहार आपदा प्रबंधन और बुनियादी अर्थशास्त्र।",
    topics: ["Nationalism in Europe & India", "Resources & Development", "Democratic Politics", "Bihar: Geography & Agriculture", "Disaster Management (आपदा प्रबंधन)"]
  },
  {
    id: "matric_hindi",
    name: "Hindi",
    hindiName: "हिंदी",
    icon: "Languages",
    description: "Godhuli Part II prose/poetry, Hindi varnamala, sandhi, samas, sangya, and spelling check.",
    hindiDescription: "गोधूलि भाग II गद्य/काव्य, हिंदी वर्णमाला, संधि, समास, संज्ञा और व्याकरण।",
    topics: ["गोधूलि गद्य और कविता", "वर्ण, संज्ञा, सर्वनाम", "संधि, समास और कारक", "पर्यायवाची, मुहावरे", "निबंध और पत्र लेखन"]
  },
  {
    id: "matric_sanskrit",
    name: "Sanskrit",
    hindiName: "संस्कृत",
    icon: "BookOpen",
    description: "Piyusham Part II, Sanskrit grammar translation, shlokas, sandhi, and dynamic shabda roop.",
    hindiDescription: "पीयूषम् भाग II, संस्कृत व्याकरण अनुवाद, श्लोक व्याख्या, संधि और शब्द रूप।",
    topics: ["पीयूषम् गद्य एवं श्लोक", "स्वर और व्यंजन संधि", "समास एवं प्रत्यय", "धातु रूप एवं शब्द रूप", "संसकृत अनुवाद और पत्र"]
  },
  {
    id: "matric_english",
    name: "English",
    hindiName: "अंग्रेजी",
    icon: "Book",
    description: "Panorama Part II, simple active/passive voice, narration, spelling corrections, and reading comprehensions.",
    hindiDescription: "पैनोरमा भाग II, सामान्य व्याकरण नियम, एक्टिव/पैसिव वॉइस, निबंध और लघु लेखन।",
    topics: ["Prose & Poetry", "Active/Passive Voice", "Direct/Indirect Speech", "Spelling Tests", "Grammar Fillers"]
  }
];

// Pre-baked BSEB questions for immediate high-speed testing without requiring API Keys
export const PRE_BAKED_QUESTIONS: Record<string, Question[]> = {
  "matric_science": [
    {
      id: 1,
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
      id: 2,
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
      id: 3,
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
    },
    {
      id: 4,
      questionText: "The SI unit of electric potential is:\nविद्युत विभवांतर (Electric potential difference) का S.I. मात्रक क्या होता है?",
      options: [
        "Joule (जूल)",
        "Volt (वोल्ट)",
        "Ampere (एम्पियर)",
        "Ohm (ओम)"
      ],
      correctOption: "B",
      explanation: "The SI unit of electric potential and potential difference is Volt (V). Ampere is for current, Ohm is for resistance, and Joule is for work/energy. (BSEB Matric PYQ)",
      difficulty: "Easy"
    },
    {
      id: 5,
      questionText: "Which gas is released during photosynthesis?\nप्रकाश संश्लेषण क्रिया में कौन-सी गैस बाहर निकलती है?",
      options: [
        "Carbon dioxide (CO2)",
        "Oxygen (O2)",
        "Nitrogen (N2)",
        "Sulphur dioxide (SO2)"
      ],
      correctOption: "B",
      explanation: "During photosynthesis, green plants absorb carbon dioxide and release oxygen (O2) into the atmosphere as a byproduct. (BSEB Matric Board General Science)",
      difficulty: "Easy"
    }
  ],
  "matric_math": [
    {
      id: 1,
      questionText: "The value of sin 30° is:\nsin 30° का मान क्या होता है?",
      options: [
        "1",
        "1/2",
        "√3/2",
        "1/√2"
      ],
      correctOption: "B",
      explanation: "From trigonometric ratios, sin 30° = 1/2. (BSEB 2024 Matric Mathematics)",
      difficulty: "Easy"
    },
    {
      id: 2,
      questionText: "If the roots of a quadratic equation ax² + bx + c = 0 are real and equal, then the value of discriminant (D) is:\nयदि द्विघात समीकरण ax² + bx + c = 0 के मूल वास्तविक और समान हों, तो विविक्तकर (D) का मान होगा:",
      options: [
        "D > 0",
        "D < 0",
        "D = 0",
        "None of these (इनमें से कोई नहीं)"
      ],
      correctOption: "C",
      explanation: "When roots are real and equal, the discriminant D = b² - 4ac is exactly equal to 0. (BSEB 2022 Matric Paper)",
      difficulty: "Medium"
    },
    {
      id: 3,
      questionText: "The distance of point P(3, 4) from the origin is:\nबिंदु P(3, 4) की मूल बिंदु से दूरी क्या होगी?",
      options: [
        "3",
        "4",
        "5",
        "7"
      ],
      correctOption: "C",
      explanation: "Distance from origin (0,0) is given by √(x² + y²) = √(3² + 4²) = √(9 + 16) = √25 = 5 units. (BSEB recurring model objective question)",
      difficulty: "Easy"
    },
    {
      id: 4,
      questionText: "What is the common difference of the AP: 4, 10, 16, 22, ...?\nसमान्तर श्रेणी: 4, 10, 16, 22, ... का सार्व अंतर (common difference) क्या होगा?",
      options: [
        "4",
        "6",
        "10",
        "2"
      ],
      correctOption: "B",
      explanation: "Common difference (d) = second term - first term = 10 - 4 = 6. (BSEB Matric Objective paper)",
      difficulty: "Easy"
    },
    {
      id: 5,
      questionText: "The maximum value of probability is:\nकिसी प्रायिकता का अधिकतम मान कितना होता है?",
      options: [
        "0",
        "0.5",
        "1",
        "Infinite (अनंत)"
      ],
      correctOption: "C",
      explanation: "The probability of any event E satisfies 0 ≤ P(E) ≤ 1. Thus, the maximum value is 1 (for a sure event). (BSEB 10th Board)",
      difficulty: "Easy"
    }
  ],
  "physics": [
    {
      id: 1,
      questionText: "What is the unit of Electric Flux?\nविद्युत फ्लक्स का मात्रक क्या है?",
      options: [
        "Weber (वेबर)",
        "Farad (फैराड)",
        "Volt-meter (वोल्ट-मीटर)",
        "Tesla (टेस्ला)"
      ],
      correctOption: "C",
      explanation: "Electric flux is given by Φ = E·A. The unit of E is Volt/meter, and area A is meter². Therefore, unit = (Volt/meter) * meter² = Volt-meter. (पूछा गया BSEB 12th Intermediate 2023)",
      difficulty: "Medium"
    },
    {
      id: 2,
      questionText: "The relationship between root mean square (I_rms) and peak value (I_o) of alternating current is:\nप्रत्यावर्ती धारा के वर्ग माध्य मूल मान (I_rms) और शिखर मान (I_o) के बीच का संबंध होता है:",
      options: [
        "I_rms = 0.507 I_o",
        "I_rms = 0.707 I_o",
        "I_rms = 0.606 I_o",
        "I_rms = 1.414 I_o"
      ],
      correctOption: "B",
      explanation: "I_rms = I_o / √2 ≈ 0.707 I_o. This is a very high frequency formula asked in BSEB Physics paper. (BSEB 2024 Intermediate)",
      difficulty: "Medium"
    },
    {
      id: 3,
      questionText: "For which of the following is refractive index maximum?\nनिम्नलिखित में से किसका अपवर्तनांक सबसे अधिक होता है?",
      options: [
        "Glass (काँच)",
        "Water (जल)",
        "Iron (लोहा)",
        "Diamond (हीरा)"
      ],
      correctOption: "D",
      explanation: "Refractive index of diamond is highest among common substances, which is approximately 2.42. (BSEB 2021 Inter Exam)",
      difficulty: "Easy"
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
    }
  ],
  "history": [
    {
      id: 1,
      questionText: "Who is the author of the ancient book 'Indica'?\nप्राचीन पुस्तक 'इण्डिका' के लेखक कौन हैं?",
      options: [
        "Kautilya (कौटिल्य)",
        "Megasthenes (मेगास्थनीज)",
        "Al-Biruni (अल-बिरूनी)",
        "Fa-Hien (फाह्यान)"
      ],
      correctOption: "B",
      explanation: "Megasthenes, the Greek ambassador to the court of Chandragupta Maurya, wrote 'Indica' which describes Maurya society and administration. (पूछा गया BSEB 12th Arts History 2022)",
      difficulty: "Easy"
    },
    {
      id: 2,
      questionText: "In which year was the first battle of Panipat fought?\nपानीपत का प्रथम युद्ध किस वर्ष लड़ा गया था?",
      options: [
        "1509 AD",
        "1526 AD",
        "1556 AD",
        "1761 AD"
      ],
      correctOption: "B",
      explanation: "The first battle of Panipat was fought in 1526 AD between Babur and Ibrahim Lodi, marking the establishment of the Mughal Empire in India. (BSEB Intermediate History Paper)",
      difficulty: "Easy"
    },
    {
      id: 3,
      questionText: "Where is the great bath of Indus Valley Civilization located?\nहड़प्पा सभ्यता/सिंधु घाटी सभ्यता में 'विशाल स्नानागार' के अवशेष कहाँ से प्राप्त हुए हैं?",
      options: [
        "Harappa (हड़प्पा)",
        "Mohenjo-daro (मोहनजोदड़ो)",
        "Kalibangan (कालीबंगा)",
        "Lothal (लोथल)"
      ],
      correctOption: "B",
      explanation: "The Great Bath is one of the best-known structures among the ruins of the ancient Indus Valley Civilization at Mohenjo-daro in present-day Sindh, Pakistan. (BSEB 2024 Intermediate Exam)",
      difficulty: "Medium"
    }
  ],
  "accountancy": [
    {
      id: 1,
      questionText: "The interest on partner's drawing is credited to:\nसाझेदारों के आहरण पर ब्याज क्रेडिट किया जाता है:",
      options: [
        "Profit & Loss Appropriation Account (लाभ-हानि नियोजन खाता)",
        "Partner's Capital Account (साझेदार का पूंजी खाता)",
        "Profit & Loss Account (लाभ-हानि खाता)",
        "None of these (इनमें से कोई नहीं)"
      ],
      correctOption: "A",
      explanation: "Interest on drawings is an income for the firm, so it is credited to the Profit and Loss Appropriation Account and debited to the partners' capital/current accounts. (BSEB 12th Commerce Accountancy)",
      difficulty: "Medium"
    },
    {
      id: 2,
      questionText: "In the absence of a partnership deed, the rate of interest on partners' loan to the firm is:\nसाझेदारी संलेख के अभाव में, साझेदारों द्वारा फर्म को दिए गए ऋण पर ब्याज की दर होती है:",
      options: [
        "5% per annum",
        "6% per annum",
        "8% per annum",
        "No interest is allowed (कोई ब्याज नहीं दिया जाता)"
      ],
      correctOption: "B",
      explanation: "According to the Indian Partnership Act, 1932, in the absence of an agreement, partners are entitled to interest on loans/advances made to the firm at 6% p.a. (BSEB Inter Commerce PYQ)",
      difficulty: "Easy"
    }
  ]
};
