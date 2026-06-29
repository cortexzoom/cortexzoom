import { useState, useEffect, useRef, FormEvent } from "react";
import {
  Sparkles,
  Sliders,
  Volume2,
  VolumeX,
  RefreshCw,
  Palette,
  Zap,
  Info,
  Radio,
  Copy,
  Check,
  MousePointer,
  HelpCircle,
  Globe,
  Bot,
  Brain,
  Trophy,
  Play,
  Send,
  Terminal,
  ArrowRight,
  Rocket,
  MessageSquare,
  HelpCircle as QuestionIcon,
  Mic,
  MicOff,
  FileText,
  CheckCircle,
  XCircle,
  Compass,
  Settings,
  ChevronLeft,
  X,
} from "lucide-react";
import { VisualizerParams, PresetResponse } from "./types";
import CanvasVisualizer from "./components/CanvasVisualizer";
import { useAudioSynth } from "./hooks/useAudioSynth";
import { VisionCanvas } from "./components/VisionCanvas";

// Define pre-loaded space and abstract visual presets
const PRESETS: Record<string, { title: string; desc: string; bg: string; colors: string[]; params: Partial<VisualizerParams> }> = {
  ultrasonic: {
    title: "Ultrasonic Energy",
    desc: "Seamless cinematic waves blending deep black, electric blue, royal purple, and soft pale yellow-green with volumetric glowing particles.",
    bg: "#050505",
    colors: ["#00AEEF", "#6A00FF", "#DFFF7A"],
    params: {
      speed: 0.8,
      amplitude: 75,
      frequency: 0.014,
      waveCount: 3,
      particleCount: 160,
      particleSpeed: 1.0,
      glowIntensity: 26,
      flowMode: "turbulence",
      soundFrequency: 110,
    },
  },
  quantum: {
    title: "Quantum Fluctuations",
    desc: "Rapid, hyper-frequency static shivers in hot pink, violet, and neon cyan simulating subatomic visual reactions.",
    bg: "#02020a",
    colors: ["#FF007F", "#7F00FF", "#00FFFF"],
    params: {
      speed: 1.4,
      amplitude: 110,
      frequency: 0.024,
      waveCount: 4,
      particleCount: 220,
      particleSpeed: 1.8,
      glowIntensity: 32,
      flowMode: "quantum",
      soundFrequency: 180,
    },
  },
  solarWind: {
    title: "Solar Flare Waves",
    desc: "Tranquil solar flares undulating slowly in hot magma orange, golden sunrays, and soft pale-lime glow, creating deep warming ambiance.",
    bg: "#040200",
    colors: ["#FF4500", "#FFB300", "#DFFF7A"],
    params: {
      speed: 0.45,
      amplitude: 55,
      frequency: 0.007,
      waveCount: 2,
      particleCount: 80,
      particleSpeed: 0.5,
      glowIntensity: 18,
      flowMode: "sine",
      soundFrequency: 85,
    },
  },
};

const SUGGESTIONS = [
  "Subzero Cryo Energy",
  "Interstellar Deep Void",
  "Cyber-Luxury Gold Mist",
  "Neon Pulse Synthwave",
];

// Languages for translator
const LANGUAGES = [
  { code: "es", label: "Spanish (Español)" },
  { code: "fr", label: "French (Français)" },
  { code: "de", label: "German (Deutsch)" },
  { code: "hi", label: "Hindi (हिंदी)" },
  { code: "zh", label: "Chinese (中文)" },
  { code: "ar", label: "Arabic (العربية)" },
  { code: "ja", label: "Japanese (日本語)" },
  { code: "it", label: "Italian (Italiano)" },
];

export default function App() {
  // Master Visualizer state
  const [params, setParams] = useState<VisualizerParams>({
    speed: 0.8,
    amplitude: 75,
    frequency: 0.014,
    waveCount: 3,
    particleCount: 160,
    particleSpeed: 1.0,
    glowIntensity: 26,
    noiseLevel: 25,
    flowMode: "turbulence",
    soundFrequency: 110,
    synthVolume: 0.3,
    soundEnabled: false,
    interactiveForce: 4,
    interactionMode: "distort",
  });

  const [activeColors, setActiveColors] = useState<string[]>(["#00AEEF", "#6A00FF", "#DFFF7A"]);
  const [backgroundColor, setBackgroundColor] = useState<string>("#050505");
  const [activePresetKey, setActivePresetKey] = useState<string>("ultrasonic");
  
  // Custom API description feedback
  const [styleTitle, setStyleTitle] = useState<string>("Ultrasonic Energy Waves");
  const [styleDescription, setStyleDescription] = useState<string>(
    "An ultra-modern, cinematic abstract scene with flowing ultrasonic energy waves and glowing particles, blending seamlessly through deep black, electric blue, royal purple, and soft pale yellow-green gradients."
  );

  // General States
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // FEATURE 1: Language Translator States
  const [translatorText, setTranslatorText] = useState<string>("Welcome traveler to the CortexZoom cockpit.");
  const [targetLang, setTargetLang] = useState<string>("Spanish (Español)");
  const [translatedResult, setTranslatedResult] = useState<string>("");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // FEATURE 2: Doubt Clearance States
  const [doubtInput, setDoubtInput] = useState<string>("What is quantum entanglement?");
  const [isClearingDoubt, setIsClearingDoubt] = useState<boolean>(false);
  const [resolvedDoubt, setResolvedDoubt] = useState<{
    title: string;
    analogy: string;
    shortBreakdown: string;
    keyPoints: string[];
  } | null>({
    title: "Quantum Entanglement",
    analogy: "Imagine two magical cosmic starships built from the same stardust. If one starship spins clockwise near Earth, the other starship instantly spins counter-clockwise on the other side of the galaxy, bound by invisible tachyon threads.",
    shortBreakdown: "Entanglement means state measurements of paired subatomic particles are instantly coupled, bypassing normal cosmic limits.",
    keyPoints: [
      "Bypasses standard speed-of-light communication constraints.",
      "Forms the ultimate structural base of future quantum computing.",
      "Described famously by Albert Einstein as 'spooky action at a distance'."
    ]
  });
  const [activeDoubtNode, setActiveDoubtNode] = useState<string>("analogy");

  // FEATURE 3: QuestoQuiz States
  const [quizTopic, setQuizTopic] = useState<string>("space");
  const [customQuizTopicInput, setCustomQuizTopicInput] = useState<string>("");
  const [quizQuestions, setQuizQuestions] = useState<any[]>([
    {
      question: "Which cosmic structure has an escape velocity exceeding the speed of light?",
      options: ["White Dwarf", "Neutron Star", "Black Hole", "Red Giant"],
      correctIndex: 2,
      explanation: "A black hole is so extremely dense that not even light can escape its gravitational event horizon."
    },
    {
      question: "Approximately how fast does the CortexZoom hyper-intelligent AI engine compute information?",
      options: ["A thousand times faster than humans", "Equal to human speed", "A billion times faster than the human brain", "Exactly the speed of light"],
      correctIndex: 2,
      explanation: "Core starship specifications declare the engine computes a billion times faster than the human brain!"
    },
    {
      question: "What does the 'Zoom' in CortexZoom represent?",
      options: ["Standard camera zoom", "Neural amplification and fast interstellar travel speed", "Fictional energy particles", "Microscopic view"],
      correctIndex: 1,
      explanation: "Zoom stands for deep neural expansion, magnification of core ideas, and rapid hyper-drive capabilities."
    }
  ]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [isFetchingQuiz, setIsFetchingQuiz] = useState<boolean>(false);

  // FEATURE 4: Autonomous Agent Workflow States
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(0);
  const [activeAgentTopic, setActiveAgentTopic] = useState<string>("Physics");
  const [customAgentTopicInput, setCustomAgentTopicInput] = useState<string>("");
  const [workflowLogs, setWorkflowLogs] = useState<string[]>([
    "[SYSTEM] Initiated CortexZoom Autonomous Agent swarm.",
    "[AGENT-1: Research Bot] Gathering foundational knowledge arrays for Physics...",
    "[AGENT-2: Parser Unit] Categorizing key definitions and relational graphs for Physics...",
    "[AGENT-3: Concept Mapper] Connecting core parameters and secondary nodes for Physics..."
  ]);
  const [workflowStatus, setWorkflowStatus] = useState<string>("SCANNING CORRIDORS");

  // FEATURE 9: Image & Video Vision Studio States
  const [visionPrompt, setVisionPrompt] = useState<string>("A beautiful glowing tree on a dark neon canvas");
  const [visionType, setVisionType] = useState<"image" | "video">("image");
  const [isGeneratingVision, setIsGeneratingVision] = useState<boolean>(false);
  const [visionFilter, setVisionFilter] = useState<string>("none");
  const [videoPlaybackSpeed, setVideoPlaybackSpeed] = useState<number>(1);
  const [videoPlaying, setVideoPlaying] = useState<boolean>(true);
  const [visionResult, setVisionResult] = useState<{
    title: string;
    description: string;
    svgMarkup?: string;
    animationParams?: {
      color1: string;
      color2: string;
      color3?: string;
      movementType: string;
      speed: number;
      particleCount: number;
      glowIntensity?: number;
      frequency?: number;
    };
  } | null>(null);

  // FEATURE 5: AI Voice Assistant "Vector" States
  const [vectorInput, setVectorInput] = useState<string>("");
  const [vectorReply, setVectorReply] = useState<string>("Hi, I am Cartesian vector like the Cartex zoom. I am vector, your voice assistant. How can I help you?");
  const [isVectorReplying, setIsVectorReplying] = useState<boolean>(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [aiMode, setAiMode] = useState<"smart" | "fast" | "innovative">("smart");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // FEATURE 6: Navigation / Directory State
  const [viewMode, setViewMode] = useState<"cockpit" | "directory">("cockpit");

  // FEATURE 7: Document Clearance Task Bar States
  const [isDocumentScanning, setIsDocumentScanning] = useState<boolean>(false);
  const [selectedDocumentName, setSelectedDocumentName] = useState<string>("FLIGHT_LOG_49.log");
  const [documentContent, setDocumentContent] = useState<string>("Space vector route: sector 45 to sector 89. Warp factor: 4.8. Core reactor status: stable. Manifest: 3 containers of quantum ice, 1 bio-dome seedling container.");
  const [documentStatus, setDocumentStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [documentReport, setDocumentReport] = useState<string>("");

  // FEATURE 8: Water Translating Option
  const [isWaterTranslation, setIsWaterTranslation] = useState<boolean>(false);

  // Initialize Web Audio Synth
  const { triggerActivation } = useAudioSynth(
    params.soundEnabled,
    params.soundFrequency,
    params.synthVolume,
    params.speed
  );

  // Autonomous Agent Workflow loop
  useEffect(() => {
    const t = activeAgentTopic.trim() || "Physics";
    const steps = [
      { status: `SCANNING ${t.toUpperCase()}`, log: `[AGENT-1: Research Bot] Initiating deep analytics scans for topic: ${t}...` },
      { status: "MODULATING VECTOR NODES", log: `[AGENT-2: Database Unit] Aligning conceptual database indices for ${t} systems...` },
      { status: "TRANSCODING TOPICS", log: `[AGENT-3: Translate Unit] Translating localized parameters of ${t} to standard model layers...` },
      { status: "TUNING COGNITIVE NODES", log: `[AGENT-4: Cognitive Tuner] Synthesizing core insights and telemetry logs for ${t} inquiries...` },
      { status: "DECISION MAKING", log: "[AGENT-5: Main Vector Core] Calculating custom intelligence model a billion times faster than human brains." }
    ];

    const interval = setInterval(() => {
      setActiveWorkflowStep((prev) => {
        const next = (prev + 1) % steps.length;
        const targetStep = steps[next];
        setWorkflowStatus(targetStep.status);
        setWorkflowLogs((logs) => [
          ...logs.slice(-12),
          `[AUTO] ${targetStep.log}`,
          `[DECISION] Modulating database drift parameter for ${t}: ${(Math.random() * 0.1 - 0.05 + params.particleSpeed).toFixed(2)}x`
        ]);

        // Auto-modulate visualizer speed slightly on Agent workflow ticks to show actual real interaction!
        setParams((p) => ({
          ...p,
          particleSpeed: Math.max(0.2, Math.min(2.8, p.particleSpeed + (Math.random() * 0.2 - 0.1)))
        }));

        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [params.particleSpeed, activeAgentTopic]);

  // Handle Preset Load
  const loadPreset = (key: string) => {
    const p = PRESETS[key];
    if (!p) return;

    setActivePresetKey(key);
    setStyleTitle(p.title);
    setStyleDescription(p.desc);
    setBackgroundColor(p.bg);
    setActiveColors(p.colors);
    setParams((prev) => ({
      ...prev,
      ...p.params,
    }));

    setWorkflowLogs((logs) => [
      ...logs,
      `[USER ACTION] Triggered Preset override: ${p.title}`,
      `[SYSTEM] Reconfiguring spatial spectrum coordinates to: ${p.colors.join(", ")}`
    ]);
  };

  // Call Server-Side Gemini API to generate custom presets
  const handleGenerateAI = async (promptText: string) => {
    if (!promptText.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMsg(null);

    const steps = [
      "Interrogating Gemini model parameters...",
      "Synthesizing kinetic force algorithms...",
      "Configuring wave frequency dimensions...",
      "Finalizing multi-gradient color palettes...",
    ];

    let stepIndex = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setLoadingStep(steps[stepIndex]);
      }
    }, 1200);

    try {
      const response = await fetch("/api/generate-preset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate visual preset.");
      }

      const data: PresetResponse = await response.json();

      setStyleTitle(data.styleTitle);
      setStyleDescription(data.description);
      setBackgroundColor(data.background);
      setActiveColors(data.colors);
      setActivePresetKey("custom");

      setParams((prev) => ({
        ...prev,
        speed: Math.min(2.0, Math.max(0.1, data.speed)),
        amplitude: Math.min(150, Math.max(10, data.amplitude)),
        frequency: Math.min(0.05, Math.max(0.005, data.frequency)),
        particleCount: Math.min(300, Math.max(0, data.particleCount)),
        glowIntensity: Math.min(40, Math.max(0, data.glowIntensity)),
        flowMode: data.flowMode,
        soundFrequency: Math.min(440, Math.max(60, data.soundFrequency)),
      }));

      setWorkflowLogs((logs) => [
        ...logs,
        `[INTELLIGENCE] Generated Custom Preset: ${data.styleTitle}`,
        `[METRICS] Glow setting: ${data.glowIntensity}px | Frequency: ${data.frequency}`
      ]);

      setCustomPrompt("");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred while communicating with Gemini.");
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
      setLoadingStep("");
    }
  };

  // Translator AI Activation
  const handleTranslateText = async () => {
    if (!translatorText.trim() || isTranslating) return;
    setIsTranslating(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: translatorText, 
          targetLanguage: targetLang,
          isWaterTranslation 
        }),
      });
      const data = await response.json();
      setTranslatedResult(data.translatedText || data.error);
      
      setWorkflowLogs((logs) => [
        ...logs,
        `[TRANSLATION] Translating to ${targetLang} (Water: ${isWaterTranslation})`,
        `[COGNITIVE] Encrypted channel translation parsed successfully.`
      ]);
    } catch (e) {
      setTranslatedResult("Offline mode: Connection timed out.");
    } finally {
      setIsTranslating(false);
    }
  };

  // Doubt Clearance AI Activation
  const handleClearDoubt = async () => {
    if (!doubtInput.trim() || isClearingDoubt) return;
    setIsClearingDoubt(true);
    try {
      const response = await fetch("/api/doubt-clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: doubtInput }),
      });
      const data = await response.json();
      setResolvedDoubt(data);
      setActiveDoubtNode("analogy"); // reset display to analogy node
      
      setWorkflowLogs((logs) => [
        ...logs,
        `[COGNITIVE HUB] Resolved doubt: "${doubtInput}"`,
        `[STATE] Constructed interactive concept mindmap layout.`
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsClearingDoubt(false);
    }
  };

  // Document Clearance Handler
  const handleClearDocument = async () => {
    if (isDocumentScanning) return;
    setIsDocumentScanning(true);
    setDocumentStatus("PENDING");
    setDocumentReport("");

    setWorkflowLogs((logs) => [
      ...logs,
      `[CLEARANCE] Started audit scan on ${selectedDocumentName}...`,
      `[CORE SCAN] Running heuristic rules analysis...`
    ]);

    try {
      const response = await fetch("/api/document-clearance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: documentContent,
          documentName: selectedDocumentName
        }),
      });
      const data = await response.json();
      setDocumentStatus(data.status || "APPROVED");
      setDocumentReport(data.report || "Security cleared.");
      
      setWorkflowLogs((logs) => [
        ...logs,
        `[CLEARANCE] Audit completed with status: ${data.status}`,
        `[METRICS] Checked signature vectors and cargo legality.`
      ]);
    } catch (e) {
      setDocumentStatus("APPROVED");
      setDocumentReport("Offline clearance backup triggered: All systems within normal space boundaries.");
    } finally {
      setIsDocumentScanning(false);
    }
  };

  // Master assistant query helper
  const queryVectorAssistant = async (message: string) => {
    setIsVectorReplying(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds timeout to guarantee ultra-fast answer under 15s

    try {
      const response = await fetch("/api/vector-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, mode: aiMode }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      const textToSpeak = data.reply || "Transmission silent.";
      setVectorReply(textToSpeak);

      // Trigger Web Speech Synthesis so VECTOR LITERALLY TALKS!
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel(); // stop current speaking
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        // Find a cool robotic/low sounding voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) => v.name.includes("Google") || v.name.includes("Robotic") || v.lang.startsWith("en")
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        // Adapt speech rate to AI Mode configuration
        if (aiMode === "fast") {
          utterance.rate = 1.35; // Speak fast!
          utterance.pitch = 0.95;
        } else {
          utterance.rate = 1.05;
          utterance.pitch = 0.85; // slightly lower pitch for deep space feel
        }

        utterance.onstart = () => setIsVoiceSpeaking(true);
        utterance.onend = () => setIsVoiceSpeaking(false);
        utterance.onerror = () => setIsVoiceSpeaking(false);

        window.speechSynthesis.speak(utterance);
      }
      
      setWorkflowLogs((logs) => [
        ...logs,
        `[VOICE CORE] Vector response synthesized. Playing vocal waves...`
      ]);
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn("Vector core API signal timeout or error. Utilizing instant offline fallback:", err);
      
      const msg = message.toLowerCase();
      let fallbackText = "Hi, I am Cartesian vector like the Cartex zoom. I am vector, your voice assistant. How can I help you?";
      
      if (msg.includes("doubt") || msg.includes("clarification") || msg.includes("clarify")) {
        fallbackText = "I would love to clarify your doubts! As the AI companion right next to you, what specific topic do you have questions about today?";
      } else if (msg.includes("translate") || msg.includes("translator")) {
        fallbackText = "For the language translator, please tell me: what word or phrase would you like to translate, and to what language?";
      } else if (msg.includes("question") || msg.includes("quiz") || msg.includes("topics")) {
        fallbackText = "I can generate queries and questions for you. What topic would you like to explore?";
      } else if (msg.includes("speed") || msg.includes("fast") || msg.includes("engine") || msg.includes("billion")) {
        fallbackText = "The hyper-intelligent AI engine computes information a billion times faster than the human brain, which serves as an incredible inspiration for our journey!";
      }

      setVectorReply(fallbackText);

      // Speak fallback
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(fallbackText);
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) => v.name.includes("Google") || v.name.includes("Robotic") || v.lang.startsWith("en")
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        utterance.rate = 1.05;
        utterance.pitch = 0.85;
        utterance.onstart = () => setIsVoiceSpeaking(true);
        utterance.onend = () => setIsVoiceSpeaking(false);
        utterance.onerror = () => setIsVoiceSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } finally {
      setIsVectorReplying(false);
    }
  };

  const handleVectorChat = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!vectorInput.trim() || isVectorReplying) return;

    const userMsg = vectorInput;
    setVectorInput("");
    await queryVectorAssistant(userMsg);
  };

  const handleMicrophoneClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Local Microphone access is simulated because SpeechRecognition is restricted or unsupported in this browser frame. Please type your message into the Vector prompt box below, or click Vector's action chips!");
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsRecording(true);
        setVectorReply("Vector is listening... Speak clearly now.");
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      };

      rec.onerror = () => {
        setIsRecording(false);
        setVectorReply("Microphone error. Connecting to direct key matrix.");
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setVectorReply(`Analyzing transmission: "${transcript}"`);
          await queryVectorAssistant(transcript);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  // Fetch / Generate new QuestoQuiz set
  const fetchNewQuiz = async (topicSelected: string) => {
    setIsFetchingQuiz(true);
    setQuizTopic(topicSelected);
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicSelected }),
      });
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuizQuestions(data.questions);
        setCurrentQuizIndex(0);
        setSelectedAnswer(null);
        setQuizScore(0);
        setQuizFinished(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingQuiz(false);
    }
  };

  const handleAnswerSelection = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (index === quizQuestions[currentQuizIndex].correctIndex) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedAnswer(null);
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleToggleSound = () => {
    triggerActivation();
    setParams((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const handleGenerateVision = async () => {
    if (!visionPrompt.trim() || isGeneratingVision) return;
    setIsGeneratingVision(true);

    try {
      const response = await fetch("/api/generate-vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: visionPrompt, type: visionType }),
      });
      if (!response.ok) throw new Error("Synthesis failed");
      const data = await response.json();
      setVisionResult(data);
    } catch (e) {
      console.warn("Using procedural graphics synthesis local fallback:", e);
      // Fast high-quality local generation fallback
      const mockColors = [
        ["#FF007F", "#7F00FF"],
        ["#00FF41", "#DFFF7A"],
        ["#00AEEF", "#00FF7F"],
        ["#FF4500", "#FFB300"]
      ];
      const selectedPair = mockColors[Math.floor(Math.random() * mockColors.length)];
      
      const simulatedSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <defs>
    <linearGradient id="localGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${selectedPair[0]}" />
      <stop offset="100%" stop-color="${selectedPair[1]}" />
    </linearGradient>
    <filter id="glowEffect">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="#050508" />
  <circle cx="400" cy="225" r="140" fill="none" stroke="url(#localGrad)" stroke-width="3" filter="url(#glowEffect)">
    <animate attributeName="r" values="130;150;130" dur="6s" repeatCount="indefinite" />
  </circle>
  <text x="50%" y="82%" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="12" letter-spacing="4" opacity="0.6">${visionPrompt.toUpperCase()}</text>
</svg>
      `.trim();

      setVisionResult({
        title: `Asset Core: ${visionPrompt}`,
        description: `Procedural rendering of "${visionPrompt}" successfully compiled by local fallback cores.`,
        svgMarkup: simulatedSVG,
        animationParams: {
          color1: selectedPair[0],
          color2: selectedPair[1],
          movementType: ["wave", "vortex", "pulse", "float"][Math.floor(Math.random() * 4)],
          speed: 1.2,
          particleCount: 160
        }
      });
    } finally {
      setIsGeneratingVision(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030307] text-white flex flex-col relative overflow-hidden font-sans select-none">
      
      {/* ========================================================== */}
      {/* FLOATING DECORATIVE WIREFRAME STARSHIPS IN CORNERS */}
      {/* ========================================================== */}
      
      {/* Top Left Starship */}
      <div className="absolute top-10 left-10 w-24 h-24 opacity-30 pointer-events-none animate-bounce duration-[10000ms] hidden md:block">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-cyan-400">
          <path d="M50 10 L80 60 L50 45 L20 60 Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="50" cy="45" r="3" fill="#DFFF7A" className="animate-ping" />
          <line x1="35" y1="52" x2="25" y2="75" stroke="#6A00FF" strokeWidth="1" />
          <line x1="65" y1="52" x2="75" y2="75" stroke="#6A00FF" strokeWidth="1" />
        </svg>
        <span className="text-[8px] font-mono block text-center text-cyan-500 mt-1">N-P-19</span>
      </div>

      {/* Top Right Starship */}
      <div className="absolute top-12 right-12 w-28 h-28 opacity-25 pointer-events-none animate-pulse duration-[8000ms] hidden md:block">
        <svg viewBox="0 0 120 120" fill="none" className="w-full h-full text-purple-500">
          <path d="M60 15 L100 85 L60 65 L20 85 Z" stroke="currentColor" strokeWidth="2" />
          <path d="M60 30 L85 80 L60 65 L35 80 Z" stroke="#DFFF7A" strokeWidth="1" />
          <circle cx="60" cy="50" r="4" fill="currentColor" />
        </svg>
        <span className="text-[8px] font-mono block text-center text-purple-400 mt-1">CORTEX-X9</span>
      </div>

      {/* Bottom Left Starship */}
      <div className="absolute bottom-16 left-12 w-24 h-24 opacity-20 pointer-events-none animate-pulse duration-[12000ms] hidden lg:block">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-[#DFFF7A]">
          <path d="M50 5 L90 80 L50 60 L10 80 Z" stroke="currentColor" strokeWidth="1.5" />
          <line x1="50" y1="60" x2="50" y2="90" stroke="#00AEEF" strokeWidth="1" strokeDasharray="3,3" />
        </svg>
      </div>

      {/* Bottom Right Starship */}
      <div className="absolute bottom-20 right-12 w-20 h-20 opacity-20 pointer-events-none animate-bounce duration-[14000ms] hidden lg:block">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-indigo-400">
          <polygon points="50,15 80,75 50,55 20,75" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="45" r="2" fill="white" />
        </svg>
      </div>

      {/* Background abstract colorful nebula glows */}
      <div
        className="absolute top-[-250px] left-[-150px] w-[500px] h-[500px] rounded-full blur-[140px] opacity-[0.06] pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: activeColors[0] || "#00AEEF" }}
      />
      <div
        className="absolute bottom-[-150px] right-[-80px] w-[450px] h-[450px] rounded-full blur-[140px] opacity-[0.05] pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: activeColors[1] || "#6A00FF" }}
      />

      {/* ========================================================== */}
      {/* HEADER SECTION - CortexZoom & space handwriting "zoom" */}
      {/* ========================================================== */}
      <header className="border-b border-neutral-900 bg-[#030307]/75 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-md">
              <Rocket
                className="w-5 h-5 transition-colors duration-500 animate-pulse text-[#DFFF7A]"
              />
            </div>
            <div>
              <div className="flex items-center">
                <div className="flex items-baseline leading-none">
                  <span className="text-2xl font-display font-black tracking-widest text-white uppercase">Cortex</span>
                  <span 
                    onClick={() => setViewMode(prev => prev === "directory" ? "cockpit" : "directory")}
                    className="font-cursive italic text-[#DFFF7A] drop-shadow-[0_0_15px_rgba(223,255,122,0.95)] text-4xl font-extrabold ml-1.5 transform hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer select-none"
                    title="Click 'zoom' to open System Directory Options hub!"
                    id="logo-zoom-handwritten"
                  >
                    zoom
                  </span>
                </div>
                <span className="text-[8px] font-mono bg-cyan-950/40 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-800/40 animate-pulse uppercase ml-3 hidden sm:inline">
                  {viewMode === "directory" ? "CLOSE MENU ✕" : "CLICK 'ZOOM' TO NAVIGATE ↗"}
                </span>
              </div>
              <p className="text-[9px] font-mono tracking-[0.25em] text-neutral-500 uppercase mt-1">
                Neuro-Cosmic Quantum Mainframe
              </p>
            </div>
          </div>

          {/* Quick HUD parameters overview */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-900/40 hover:bg-indigo-900/55 hover:border-indigo-700/60 transition-all text-[10px] font-mono text-indigo-300 flex items-center gap-1.5 shadow-sm uppercase cursor-pointer"
              title="Click to toggle AI core options pull bar"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              AI MODE: {aiMode} ⚙️
            </button>
            <div className="px-3 py-1 rounded-full bg-neutral-900/60 border border-neutral-800/60 text-[10px] font-mono text-neutral-400 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              FREQ: {params.soundFrequency}HZ
            </div>
            <div className="px-3 py-1 rounded-full bg-[#DFFF7A]/10 border border-[#DFFF7A]/20 text-[10px] font-mono text-[#DFFF7A] flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DFFF7A]" />
              FLOW: {params.flowMode.toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================== */}
      {/* MAIN LAYOUT CONTENT */}
      {/* ========================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
        
        {viewMode === "directory" ? (
          <section className="w-full min-h-[600px] flex flex-col justify-start items-center gap-8 py-8">
            <div className="text-center max-w-xl animate-pulse">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/40 border border-cyan-800/40 text-[10px] font-mono text-cyan-400 uppercase tracking-widest rounded-full mb-3">
                <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" strokeWidth={2} />
                CORTEX-ZOOM MASTER SYSTEM DIRECTORY
              </div>
              <h2 className="text-4xl font-display font-black tracking-tight text-white mb-3">
                Where would you like to <span className="font-cursive text-[#DFFF7A] not-italic ml-1">zoom</span> next?
              </h2>
              <p className="text-sm text-neutral-400 font-light leading-relaxed">
                Select a navigation vector below to automatically adjust local subspace telemetry grids and lock onto selected mainframe processes instantly.
              </p>
            </div>

            {/* Elegant Square Boxes option cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
              
              {/* Option 1: Language Translator */}
              <div 
                onClick={() => {
                  setViewMode("cockpit");
                  setTimeout(() => {
                    document.getElementById("language-translator")?.scrollIntoView({ behavior: "smooth" });
                  }, 150);
                }}
                className="group relative bg-neutral-950 border border-neutral-900 p-6 flex flex-col justify-between hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300 cursor-pointer rounded-none"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-cyan-950/50 border border-cyan-800/40 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[9px] font-mono text-neutral-600 group-hover:text-cyan-400 transition-colors">PORT-01</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-white mb-2 group-hover:text-cyan-400 transition-colors">🌐 Language Translator</h3>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">
                    Translate files, transcripts, or custom phrases across multiple intergalactic protocols. Features automatic "Water Resonance" liquid translation.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-900/60 flex items-center gap-1.5 text-[10px] font-mono text-cyan-500">
                  Activate Connection <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Option 2: Doubt Clearance */}
              <div 
                onClick={() => {
                  setViewMode("cockpit");
                  setTimeout(() => {
                    document.getElementById("doubt-clearance")?.scrollIntoView({ behavior: "smooth" });
                  }, 150);
                }}
                className="group relative bg-neutral-950 border border-neutral-900 p-6 flex flex-col justify-between hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-300 cursor-pointer rounded-none"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-purple-950/50 border border-purple-800/40 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[9px] font-mono text-neutral-600 group-hover:text-purple-400 transition-colors">PORT-02</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-white mb-2 group-hover:text-purple-400 transition-colors">🧠 Doubt Clearance</h3>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">
                    Demystify complex subatomic, energetic, and physical space principles using intuitive high-contrast node breakdown charts.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-900/60 flex items-center gap-1.5 text-[10px] font-mono text-purple-400">
                  Activate Connection <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Option 3: Autonomous Agent Workflow */}
              <div 
                onClick={() => {
                  setViewMode("cockpit");
                  setTimeout(() => {
                    document.getElementById("agent-workflow")?.scrollIntoView({ behavior: "smooth" });
                  }, 150);
                }}
                className="group relative bg-neutral-950 border border-neutral-900 p-6 flex flex-col justify-between hover:border-yellow-500 hover:shadow-[0_0_20px_rgba(223,255,122,0.15)] transition-all duration-300 cursor-pointer rounded-none"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-[#DFFF7A]/10 border border-[#DFFF7A]/20 flex items-center justify-center">
                    <Terminal className="w-6 h-6 text-[#DFFF7A] group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[9px] font-mono text-neutral-600 group-hover:text-[#DFFF7A] transition-colors">PORT-03</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-white mb-2 group-hover:text-[#DFFF7A] transition-colors">⚙️ Autonomous Agent Swarm</h3>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">
                    Observe background swarm workflows synchronizing local wave velocities, particle structures, and vocal assistant audio feedback systems.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-900/60 flex items-center gap-1.5 text-[10px] font-mono text-[#DFFF7A]">
                  Activate Connection <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Option 4: Document Clearance */}
              <div 
                onClick={() => {
                  setViewMode("cockpit");
                  setTimeout(() => {
                    document.getElementById("document-clearance-section")?.scrollIntoView({ behavior: "smooth" });
                  }, 150);
                }}
                className="group relative bg-neutral-950 border border-neutral-900 p-6 flex flex-col justify-between hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300 cursor-pointer rounded-none"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-emerald-950/50 border border-emerald-800/40 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[9px] font-mono text-neutral-600 group-hover:text-emerald-400 transition-colors">PORT-04</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-white mb-2 group-hover:text-emerald-400 transition-colors">📁 Document Clearance</h3>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">
                    Audit cargo logs, flight permits, and quantum manifests using the hyper-intelligent engine's secure diagnostic rules framework.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-900/60 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                  Activate Connection <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Option 5: Onboard Voice Assistant Vector */}
              <div 
                onClick={() => {
                  setViewMode("cockpit");
                  setTimeout(() => {
                    document.getElementById("assistant-vector")?.scrollIntoView({ behavior: "smooth" });
                  }, 150);
                }}
                className="group relative bg-neutral-950 border border-neutral-900 p-6 flex flex-col justify-between hover:border-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300 cursor-pointer rounded-none"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-indigo-950/50 border border-indigo-800/40 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[9px] font-mono text-neutral-600 group-hover:text-indigo-400 transition-colors">PORT-05</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-white mb-2 group-hover:text-indigo-400 transition-colors">🛰️ Vector Assistant Core</h3>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">
                    Chat using typing or real-time voice microphone to command systems or request audio synthesis updates immediately.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-900/60 flex items-center gap-1.5 text-[10px] font-mono text-indigo-400">
                  Activate Connection <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Option 6: Interactive QuestoQuiz */}
              <div 
                onClick={() => {
                  setViewMode("cockpit");
                  setTimeout(() => {
                    document.getElementById("questo-quiz")?.scrollIntoView({ behavior: "smooth" });
                  }, 150);
                }}
                className="group relative bg-neutral-950 border border-neutral-900 p-6 flex flex-col justify-between hover:border-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)] transition-all duration-300 cursor-pointer rounded-none"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-pink-950/50 border border-pink-800/40 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-pink-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[9px] font-mono text-neutral-600 group-hover:text-pink-400 transition-colors">PORT-06</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-white mb-2 group-hover:text-pink-400 transition-colors">🏆 Interstellar QuestoQuiz</h3>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">
                    Test your knowledge of cosmology, warp speed physics, and the hyper-intelligent engine computation specs.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-900/60 flex items-center gap-1.5 text-[10px] font-mono text-pink-400">
                  Activate Connection <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>

            <button
              onClick={() => setViewMode("cockpit")}
              className="mt-6 px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono uppercase text-white rounded-none cursor-pointer active:scale-95 transition-all"
            >
              Return to System Cockpit View
            </button>
          </section>
        ) : (
          <>
            {/* ========================================================== */}
            {/* CENTERPIECE: VECTOR VOICE ASSISTANT HUD & TELEMETRY LOG */}
            {/* ========================================================== */}
            <section className="w-full flex flex-col gap-4" id="central-assistant-hud">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* CENTRAL SYSTEM TELEMETRY TICKER */}
            <div className="md:col-span-4 p-5 rounded-2xl bg-neutral-950/60 border border-neutral-900 backdrop-blur-md flex flex-col justify-between gap-3 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-500" />
              <div>
                <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase block mb-1">
                  Engine Core Telemetry
                </span>
                <p className="text-xs text-neutral-400 leading-relaxed font-light">
                  Real-time status analysis of the CortexZoom main drive. Sub-frequency algorithms regulate wave velocities asynchronously.
                </p>
              </div>

              {/* Small glowing speed dial metrics */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-neutral-900">
                <div className="text-center">
                  <span className="text-[9px] font-mono text-neutral-500 block">WAVE-DRIVE</span>
                  <span className="text-xs font-mono font-semibold text-white">{(params.speed * 100).toFixed(0)}%</span>
                </div>
                <div className="text-center border-x border-neutral-900">
                  <span className="text-[9px] font-mono text-neutral-500 block">PARTICLES</span>
                  <span className="text-xs font-mono font-semibold text-cyan-400">{params.particleCount}</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] font-mono text-neutral-500 block">GLOW-RAD</span>
                  <span className="text-xs font-mono font-semibold text-purple-400">{params.glowIntensity}px</span>
                </div>
              </div>

              <div className="text-[10px] font-mono text-neutral-500">
                Current State: <span className="text-white bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">NORMAL CRUISE</span>
              </div>
            </div>

            {/* AI VOICE ASSISTANT "VECTOR" IN THE CENTRE */}
            <div className="md:col-span-8 p-6 rounded-2xl bg-gradient-to-br from-neutral-950 via-neutral-950 to-indigo-950/40 border border-neutral-900 backdrop-blur-md shadow-2xl flex flex-col justify-between gap-5 relative overflow-hidden" id="assistant-vector">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-3 border-b border-neutral-900">
                <div className="flex items-center gap-3">
                  {/* Glowing core animation */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
                      <Bot className={`w-5 h-5 text-indigo-400 ${isVoiceSpeaking ? "animate-spin" : ""}`} />
                    </div>
                    {isVoiceSpeaking && (
                      <span className="absolute inset-0 rounded-full border border-[#DFFF7A] animate-ping" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-display font-semibold tracking-wider text-white">
                      Onboard Voice Assistant: <span className="text-[#DFFF7A] font-bold">VECTOR</span>
                    </h3>
                    <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest mt-0.5">
                      Interstellar vocal core v4.9
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${isVoiceSpeaking ? "bg-emerald-400 animate-pulse" : "bg-neutral-600"}`} />
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">
                    {isVoiceSpeaking ? "Vocalizing Drone Response..." : "Microphone Idle"}
                  </span>
                </div>
              </div>

              {/* Vector bubble response pane */}
              <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 min-h-[70px] flex flex-col justify-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono px-1.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-indigo-300">VECTOR-CORE</span>
                  {isVectorReplying && <span className="text-[9px] font-mono text-neutral-500 animate-pulse">Accessing synaptic synapses...</span>}
                </div>
                <p className="text-xs text-neutral-300 font-light leading-relaxed italic">
                  "{vectorReply}"
                </p>
              </div>

              {/* Chat trigger form */}
              <form onSubmit={handleVectorChat} className="flex gap-2">
                <input
                  type="text"
                  value={vectorInput}
                  onChange={(e) => setVectorInput(e.target.value)}
                  placeholder="Ask Vector: 'What is CortexZoom?', 'Adjust wave count', or type a custom command..."
                  className="flex-1 py-2 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-all"
                  disabled={isVectorReplying}
                  id="input-vector-voice"
                />
                
                {/* Physical Microphone Click and Talk Button */}
                <button
                  type="button"
                  onClick={handleMicrophoneClick}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg transition-all active:scale-95 ${
                    isRecording 
                      ? "bg-red-600 hover:bg-red-500 text-white animate-pulse" 
                      : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700"
                  }`}
                  title="Click to speak to Vector"
                  id="btn-vector-mic"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-[#DFFF7A] animate-bounce" />
                      <span>Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Talk</span>
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={isVectorReplying || !vectorInput.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-xl text-white flex items-center gap-1.5 cursor-pointer shadow-lg hover:shadow-indigo-500/10 active:scale-95 transition-all"
                  id="btn-vector-chat"
                >
                  <Send className="w-3.5 h-3.5 text-[#DFFF7A]" />
                  Transmit
                </button>
              </form>

              {/* Assistant manual shortcuts */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[9px] font-mono text-neutral-500 flex items-center gap-1">
                  Suggest shortcuts:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setVectorInput("What can you do?");
                    // Trigger simulated click
                    setTimeout(() => document.getElementById("btn-vector-chat")?.click(), 100);
                  }}
                  className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-[10px] text-neutral-400 hover:text-white transition-colors"
                >
                  "Capabilities"
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVectorInput("How fast is your hyper-intelligent engine?");
                    setTimeout(() => document.getElementById("btn-vector-chat")?.click(), 100);
                  }}
                  className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-[10px] text-neutral-400 hover:text-white transition-colors"
                >
                  "Computation Speed"
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* CRITICAL SLOGAN SENTENCE SMALL IN THE CENTRE */}
          {/* ========================================================== */}
          <div className="w-full flex items-center justify-center py-2.5 px-6 rounded-xl bg-neutral-950/40 border border-neutral-900/80 relative overflow-hidden" id="center-slogan">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 animate-pulse" />
            <p className="text-[11px] sm:text-xs font-mono text-neutral-400 text-center tracking-wider leading-relaxed flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DFFF7A]" />
              Hyper-intelligent AI engine computes information a billion times faster than the human brain.
              <span className="w-1.5 h-1.5 rounded-full bg-[#DFFF7A]" />
            </p>
          </div>

        </section>

        {/* ========================================================== */}
        {/* INTERACTIVE DATA VISUALIZATION CANVAS & CONTROL CENTER */}
        {/* ========================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Core Kinetic Canvas Visualizer */}
          <div className="lg:col-span-7 flex flex-col gap-6" id="canvas-panel">
            <CanvasVisualizer
              params={params}
              activeColors={activeColors}
              backgroundColor={backgroundColor}
            />

            {/* Current Active Style details */}
            <div className="p-6 rounded-2xl bg-neutral-950/60 border border-neutral-900 backdrop-blur-sm shadow-xl flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                    Active Aesthetic State
                  </span>
                  <h2 className="text-xl font-display font-semibold text-white tracking-wide">
                    {styleTitle}
                  </h2>
                </div>

                <div className="flex gap-1.5">
                  {Object.keys(PRESETS).map((key) => (
                    <button
                      key={key}
                      onClick={() => loadPreset(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border ${
                        activePresetKey === key
                          ? "bg-[#DFFF7A] text-black border-[#DFFF7A] font-semibold"
                          : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700"
                      }`}
                      id={`btn-preset-${key}`}
                    >
                      {PRESETS[key].title.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-light">
                {styleDescription}
              </p>

              {/* Color swatches copy grid */}
              <div className="pt-2 border-t border-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Palette className="w-4 h-4 text-neutral-500" />
                  <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                    Chroma Gradients:
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {activeColors.map((color, i) => (
                      <button
                        key={i}
                        onClick={() => handleCopyColor(color)}
                        className="group relative flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 transition-colors text-[11px] font-mono text-neutral-300 cursor-pointer"
                        title="Click to copy hex code"
                        id={`btn-copy-color-${i}`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block shadow-inner"
                          style={{ backgroundColor: color }}
                        />
                        {color.toUpperCase()}
                        {copiedColor === color ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] font-mono text-neutral-500">
                  Contrast Backdrop: <span className="text-white bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800 font-semibold">{backgroundColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Visualizer Settings Override */}
          <div className="lg:col-span-5 flex flex-col gap-6" id="controls-panel">
            
            {/* Gemini AI Dream Engine Card */}
            <div className="p-6 rounded-2xl bg-neutral-950/60 border border-neutral-900 backdrop-blur-sm shadow-xl flex flex-col gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-white">
                  Gemini Preset Synthesis
                </h3>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                Command the server-side Gemini AI model to design custom mathematical wave dimensions and visual presets based on your mood, vibe, or aesthetic ideas.
              </p>

              <div className="flex flex-col gap-3">
                <div className="relative">
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. A serene midnight nebula with frozen blue dust particles..."
                    className="w-full h-20 px-4 py-3 text-xs bg-neutral-900/60 border border-neutral-800 rounded-xl placeholder-neutral-500 focus:outline-none focus:border-indigo-500 text-neutral-200 resize-none transition-all"
                    disabled={isGenerating}
                    id="textarea-ai-prompt"
                  />
                  {isGenerating && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-2.5 animate-pulse">
                      <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
                      <span className="text-[10px] font-mono text-indigo-200 tracking-wider">
                        {loadingStep}
                      </span>
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-950/30 border border-red-900/60 rounded-xl text-[11px] text-red-400 font-light flex items-start gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                    <div>{errorMsg}</div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleGenerateAI(customPrompt)}
                    disabled={isGenerating || !customPrompt.trim()}
                    className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-neutral-900 disabled:to-neutral-900 disabled:text-neutral-600 border border-indigo-500/20 hover:border-indigo-400/30 text-xs font-semibold text-white transition-all shadow-md active:scale-98 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1.5"
                    id="btn-generate-preset-ai"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#DFFF7A]" />
                    Synthesize Parameters
                  </button>
                </div>
              </div>

              {/* Suggestions */}
              <div className="flex flex-col gap-1.5 pt-2 border-t border-neutral-900">
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                  Quick Suggestion Blueprints:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCustomPrompt(s);
                        handleGenerateAI(s);
                      }}
                      disabled={isGenerating}
                      className="px-2.5 py-1 rounded-md bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-[10px] text-neutral-400 hover:text-indigo-300 transition-all cursor-pointer"
                      id={`btn-suggestion-${i}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Parameters Control Bento Card */}
            <div className="p-6 rounded-2xl bg-neutral-950/60 border border-neutral-900 backdrop-blur-sm shadow-xl flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-neutral-400" />
                  <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-white">
                    Wave Mathematics
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">Manual Override</span>
              </div>

              {/* Wave Speed Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-neutral-400">Velocity multiplier</span>
                  <span className="text-white font-medium">{params.speed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.05"
                  value={params.speed}
                  onChange={(e) => setParams((prev) => ({ ...prev, speed: parseFloat(e.target.value) }))}
                  className="w-full accent-indigo-500 bg-neutral-900 h-1.5 rounded-lg cursor-pointer"
                  id="slider-wave-speed"
                />
              </div>

              {/* Wave Amplitude Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-neutral-400">Wave Amplitude (Height)</span>
                  <span className="text-white font-medium">{params.amplitude}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="150"
                  step="5"
                  value={params.amplitude}
                  onChange={(e) => setParams((prev) => ({ ...prev, amplitude: parseInt(e.target.value) }))}
                  className="w-full accent-indigo-500 bg-neutral-900 h-1.5 rounded-lg cursor-pointer"
                  id="slider-wave-amplitude"
                />
              </div>

              {/* Wave Frequency Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-neutral-400">Frequency (Wavelength)</span>
                  <span className="text-white font-medium">{(1 / params.frequency).toFixed(0)} units</span>
                </div>
                <input
                  type="range"
                  min="0.005"
                  max="0.05"
                  step="0.001"
                  value={params.frequency}
                  onChange={(e) => setParams((prev) => ({ ...prev, frequency: parseFloat(e.target.value) }))}
                  className="w-full accent-indigo-500 bg-neutral-900 h-1.5 rounded-lg cursor-pointer"
                  id="slider-wave-frequency"
                />
              </div>

              {/* Flow algorithm override */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-mono text-neutral-400">Layer count</span>
                  <div className="flex items-center gap-1.5">
                    {[2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        onClick={() => setParams((prev) => ({ ...prev, waveCount: num }))}
                        className={`flex-1 py-1 rounded-md text-[10px] font-mono transition-all border ${
                          params.waveCount === num
                            ? "bg-[#DFFF7A] text-black border-[#DFFF7A] font-semibold"
                            : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-mono text-neutral-400">Flow mode</span>
                  <select
                    value={params.flowMode}
                    onChange={(e) =>
                      setParams((prev) => ({ ...prev, flowMode: e.target.value as any }))
                    }
                    className="py-1 px-2 bg-neutral-900 border border-neutral-800 rounded-md text-[11px] text-neutral-200 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="sine">Sine Wave</option>
                    <option value="turbulence">Turbulence</option>
                    <option value="quantum">Quantum Sizzle</option>
                    <option value="linear">Linear Stream</option>
                  </select>
                </div>
              </div>

              {/* Wave Glow Intensity */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-neutral-400">Volumetric glow intensity</span>
                  <span className="text-white font-medium">{params.glowIntensity}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={params.glowIntensity}
                  onChange={(e) => setParams((prev) => ({ ...prev, glowIntensity: parseInt(e.target.value) }))}
                  className="w-full accent-indigo-500 bg-neutral-900 h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Interactive cursor modes */}
              <div className="pt-2 border-t border-neutral-900 flex flex-col gap-2">
                <span className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
                  <MousePointer className="w-3.5 h-3.5 text-neutral-500" />
                  Interactive physics algorithm:
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {(["distort", "attract", "repel", "none"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setParams((prev) => ({ ...prev, interactionMode: mode }))}
                      className={`py-1 px-1.5 rounded-md text-[9px] font-mono uppercase tracking-wider transition-all border cursor-pointer ${
                        params.interactionMode === mode
                          ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 font-semibold"
                          : "bg-neutral-900 text-neutral-500 border-neutral-800/60 hover:text-neutral-300 hover:border-neutral-700"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Audio Synth Control Panel */}
            <div className="p-6 rounded-2xl bg-neutral-950/60 border border-neutral-900 backdrop-blur-sm shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-white">
                    Ultrasonic Ambient Synth
                  </h3>
                </div>
                <button
                  onClick={handleToggleSound}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border flex items-center gap-1.5 cursor-pointer ${
                    params.soundEnabled
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-semibold"
                      : "bg-neutral-900 text-neutral-500 border-neutral-800 hover:text-neutral-300"
                  }`}
                >
                  {params.soundEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      ACTIVE
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      MUTED
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-neutral-400">Drone frequency</span>
                  <input
                    type="range"
                    min="60"
                    max="320"
                    step="5"
                    value={params.soundFrequency}
                    disabled={!params.soundEnabled}
                    onChange={(e) =>
                      setParams((prev) => ({ ...prev, soundFrequency: parseInt(e.target.value) }))
                    }
                    className="w-full accent-emerald-500 bg-neutral-900 h-1.5 rounded-lg cursor-pointer disabled:opacity-40"
                  />
                  <span className="text-[10px] font-mono text-neutral-500">{params.soundFrequency} Hz</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-mono text-neutral-400">Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={params.synthVolume}
                    disabled={!params.soundEnabled}
                    onChange={(e) =>
                      setParams((prev) => ({ ...prev, synthVolume: parseFloat(e.target.value) }))
                    }
                    className="w-full accent-emerald-500 bg-neutral-900 h-1.5 rounded-lg cursor-pointer disabled:opacity-40"
                  />
                  <span className="text-[10px] font-mono text-neutral-500">{(params.synthVolume * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================== */}
        {/* MULTI-FEATURE BENTO GRID COCKPIT (TRANSLATOR, QUIZ, DOUBT, AGENTS) */}
        {/* ========================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8" id="high-tech-features-bento">
          
          {/* FEATURE 1: INTERACTIVE LANGUAGE TRANSLATOR */}
          <div className="md:col-span-6 p-6 rounded-2xl bg-neutral-950/60 border border-neutral-900 backdrop-blur-sm shadow-xl flex flex-col justify-between gap-4 relative overflow-hidden" id="language-translator">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-white">
                  Language Translator
                </h3>
              </div>
              <span className="text-[9px] font-mono text-neutral-500">AI TRANSLATION CORE</span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Translate standard or scientific logs seamlessly into any galactic language via our server-backed translation matrices.
            </p>

            <div className="flex flex-col gap-3">
              {/* Text input area */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-neutral-500">Source text:</span>
                <textarea
                  value={translatorText}
                  onChange={(e) => setTranslatorText(e.target.value)}
                  className="w-full h-16 py-2 px-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {/* Target language selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-neutral-500">Target Language:</span>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="py-1 px-2.5 bg-neutral-900 border border-neutral-800 rounded-md text-xs text-white outline-none focus:border-cyan-500 cursor-pointer w-full"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.label}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1 pb-1">
                  <span className="text-[10px] font-mono text-neutral-500 mb-1">Ocean Resonance Mode:</span>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isWaterTranslation}
                      onChange={(e) => setIsWaterTranslation(e.target.checked)}
                      className="accent-[#DFFF7A] cursor-pointer w-4 h-4"
                    />
                    <span className="text-[11px] text-[#DFFF7A] font-medium tracking-wide">
                      🌊 Water Translating
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleTranslateText}
                  disabled={isTranslating || !translatorText.trim()}
                  className="py-1.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white rounded-lg flex items-center justify-center gap-1.5 transition-all shadow active:scale-95 cursor-pointer"
                >
                  {isTranslating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 text-[#DFFF7A]" />
                  )}
                  Translate Log
                </button>
              </div>

              {/* Translation output result */}
              {translatedResult && (
                <div className="p-3 bg-cyan-950/20 border border-cyan-900/40 rounded-lg flex flex-col gap-1.5 mt-1">
                  <span className="text-[9px] font-mono text-cyan-300">TRANSLATED CONSOLE OUTPUT:</span>
                  <p className="text-xs text-neutral-200 leading-relaxed font-light select-text">
                    {translatedResult}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* FEATURE 2: INNOVATIVE DOUBT CLEARANCE SYSTEM (MIND-MAP LAYOUT) */}
          <div className="md:col-span-6 p-6 rounded-2xl bg-neutral-950/60 border border-neutral-900 backdrop-blur-sm shadow-xl flex flex-col justify-between gap-4 relative overflow-hidden" id="doubt-clearance">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-white">
                  Quantum Doubt Clearance
                </h3>
              </div>
              <span className="text-[9px] font-mono text-neutral-500">MINDMAP RE-ENGINEERING</span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Submit your inquiry and watch it decompose into a visual mind-map nodes. Explore analogies, atomized insights, or structured rules instantly.
            </p>

            <div className="flex flex-col gap-3">
              {/* Doubt Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={doubtInput}
                  onChange={(e) => setDoubtInput(e.target.value)}
                  placeholder="Ask a tough concept (e.g. 'How does gravity work?')"
                  className="flex-1 py-1.5 px-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleClearDoubt}
                  disabled={isClearingDoubt || !doubtInput.trim()}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-xs font-semibold rounded-xl text-white flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  {isClearingDoubt ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Deconstruct"}
                </button>
              </div>

              {/* Dynamic Mindmap Visualization layout */}
              {resolvedDoubt && (
                <div className="flex flex-col gap-3 pt-2">
                  <div className="text-center bg-purple-950/15 py-1 px-3 rounded-lg border border-purple-900/30 text-xs font-semibold text-white">
                    🚀 {resolvedDoubt.title}
                  </div>

                  {/* Interconnected mindmap interactive buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setActiveDoubtNode("analogy");
                        // Slight wave ripple simulation
                        setParams(p => ({ ...p, amplitude: Math.min(150, p.amplitude + 15) }));
                      }}
                      className={`py-1 px-2.5 rounded-lg text-[10px] font-mono transition-all border text-center cursor-pointer ${
                        activeDoubtNode === "analogy"
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold"
                          : "bg-neutral-900 text-neutral-500 border-neutral-800/60 hover:text-white"
                      }`}
                    >
                      💡 Analogy
                    </button>
                    <button
                      onClick={() => {
                        setActiveDoubtNode("breakdown");
                        setParams(p => ({ ...p, frequency: Math.min(0.05, p.frequency + 0.005) }));
                      }}
                      className={`py-1 px-2.5 rounded-lg text-[10px] font-mono transition-all border text-center cursor-pointer ${
                        activeDoubtNode === "breakdown"
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold"
                          : "bg-neutral-900 text-neutral-500 border-neutral-800/60 hover:text-white"
                      }`}
                    >
                      🔭 Key Summary
                    </button>
                    <button
                      onClick={() => {
                        setActiveDoubtNode("points");
                        setParams(p => ({ ...p, speed: Math.min(2.0, p.speed + 0.2) }));
                      }}
                      className={`py-1 px-2.5 rounded-lg text-[10px] font-mono transition-all border text-center cursor-pointer ${
                        activeDoubtNode === "points"
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold"
                          : "bg-neutral-900 text-neutral-500 border-neutral-800/60 hover:text-white"
                      }`}
                    >
                      ⚙️ Core Metrics
                    </button>
                  </div>

                  {/* Node Explanation Box */}
                  <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl min-h-[90px] flex items-center justify-center transition-all">
                    {activeDoubtNode === "analogy" && (
                      <div className="text-xs text-neutral-300 leading-relaxed font-light text-center">
                        <span className="text-[9px] font-mono text-[#DFFF7A] block mb-1 uppercase tracking-wider">Visual Analogy:</span>
                        "{resolvedDoubt.analogy}"
                      </div>
                    )}
                    {activeDoubtNode === "breakdown" && (
                      <div className="text-xs text-neutral-300 leading-relaxed font-light text-center">
                        <span className="text-[9px] font-mono text-cyan-400 block mb-1 uppercase tracking-wider">Concept Summary:</span>
                        "{resolvedDoubt.shortBreakdown}"
                      </div>
                    )}
                    {activeDoubtNode === "points" && (
                      <div className="w-full flex flex-col gap-1.5">
                        <span className="text-[9px] font-mono text-purple-300 block mb-1 uppercase tracking-wider text-center">Core Dimensions:</span>
                        {resolvedDoubt.keyPoints.map((pt, index) => (
                          <div key={index} className="text-[11px] text-neutral-300 flex items-start gap-1.5 leading-relaxed">
                            <span className="text-[#DFFF7A] mt-1 font-bold">•</span>
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FEATURE 3: QUESTOQUIZ (MULTI-SUBJECT QUIZ BOARD) */}
          <div className="md:col-span-7 p-6 rounded-2xl bg-neutral-950/60 border border-neutral-900 backdrop-blur-sm shadow-xl flex flex-col justify-between gap-4 relative overflow-hidden" id="questo-quiz">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-900 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-400 animate-bounce" />
                <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-white">
                  QuestoQuiz Multi-Subject Generator
                </h3>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-neutral-500">SUGGESTED:</span>
                {(["Physics", "History", "Literature"] as const).map((topic) => (
                  <button
                    key={topic}
                    onClick={() => {
                      setCustomQuizTopicInput("");
                      fetchNewQuiz(topic);
                    }}
                    disabled={isFetchingQuiz}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider transition-all border cursor-pointer ${
                      quizTopic === topic
                        ? "bg-[#DFFF7A] text-black border-[#DFFF7A] font-bold"
                        : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Topic Selection Input */}
            <div className="flex flex-col gap-2 p-3 bg-neutral-900/40 rounded-xl border border-neutral-900">
              <span className="text-[11px] font-medium text-emerald-300">What topic would you like to ask questions about?</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customQuizTopicInput}
                  onChange={(e) => setCustomQuizTopicInput(e.target.value)}
                  placeholder="Enter any subject or topic (e.g. Biology, French, Music, Art)..."
                  className="flex-1 py-1 px-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customQuizTopicInput.trim() && !isFetchingQuiz) {
                      fetchNewQuiz(customQuizTopicInput);
                    }
                  }}
                />
                <button
                  onClick={() => fetchNewQuiz(customQuizTopicInput)}
                  disabled={isFetchingQuiz || !customQuizTopicInput.trim()}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-45 text-xs font-semibold rounded-lg text-white transition-all active:scale-95 cursor-pointer"
                >
                  Generate Quiz
                </button>
              </div>
            </div>

            {isFetchingQuiz ? (
              <div className="h-48 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#DFFF7A] animate-spin" />
                <span className="text-xs font-mono text-neutral-400">Synthesizing {quizTopic} questions...</span>
              </div>
            ) : quizFinished ? (
              <div className="py-6 text-center flex flex-col items-center justify-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-md font-semibold text-white">Quiz Completed Successfully!</h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Your final accuracy score on <span className="text-[#DFFF7A] font-semibold">{quizTopic}</span> is: <span className="text-[#DFFF7A] font-mono font-bold text-sm">{quizScore} / {quizQuestions.length}</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCurrentQuizIndex(0);
                    setSelectedAnswer(null);
                    setQuizScore(0);
                    setQuizFinished(false);
                  }}
                  className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs text-white rounded-lg transition-all cursor-pointer"
                >
                  Restart Quiz Simulation
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Question Header */}
                <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                  <span>Topic: <span className="text-[#DFFF7A] uppercase font-bold">{quizTopic}</span> (Question {currentQuizIndex + 1} of {quizQuestions.length})</span>
                  <span>Accuracy Score: <span className="text-emerald-400 font-bold">{quizScore}</span></span>
                </div>

                <h4 className="text-xs sm:text-sm text-neutral-200 font-medium leading-relaxed bg-neutral-900/40 p-3 rounded-xl border border-neutral-800/80">
                  {quizQuestions[currentQuizIndex]?.question}
                </h4>

                {/* Multiple choices */}
                <div className="grid grid-cols-1 gap-2">
                  {quizQuestions[currentQuizIndex]?.options?.map((opt: string, i: number) => {
                    let btnStyle = "bg-neutral-900/50 text-neutral-300 border-neutral-800/80 hover:bg-neutral-900 hover:text-white";
                    if (selectedAnswer !== null) {
                      if (i === quizQuestions[currentQuizIndex].correctIndex) {
                        btnStyle = "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-semibold";
                      } else if (selectedAnswer === i) {
                        btnStyle = "bg-red-500/20 text-red-400 border-red-500/50";
                      } else {
                        btnStyle = "opacity-40 border-neutral-900 text-neutral-600";
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswerSelection(i)}
                        disabled={selectedAnswer !== null}
                        className={`w-full py-2 px-3 text-left rounded-lg text-xs border transition-all ${btnStyle} cursor-pointer`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{String.fromCharCode(65 + i)}. {opt}</span>
                          {selectedAnswer !== null && i === quizQuestions[currentQuizIndex].correctIndex && (
                            <Check className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation block */}
                {selectedAnswer !== null && (
                  <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl flex flex-col gap-1">
                    <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest">Concept explanation:</span>
                    <p className="text-[11px] text-neutral-400 leading-relaxed font-light">
                      {quizQuestions[currentQuizIndex]?.explanation}
                    </p>
                    <button
                      onClick={handleNextQuizQuestion}
                      className="mt-2 py-1 px-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-[10px] text-white rounded-md self-end cursor-pointer flex items-center gap-1 transition-all"
                    >
                      Next Question
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FEATURE 4: AUTONOMOUS AGENT WORKFLOW SYSTEM (INTERACTIVE LIVE TELEMETRY) */}
          <div className="md:col-span-5 p-6 rounded-2xl bg-neutral-950/60 border border-neutral-900 backdrop-blur-sm shadow-xl flex flex-col justify-between gap-4 relative overflow-hidden" id="agent-workflow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400 animate-pulse" />
                <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-white">
                  Autonomous Agent Swarm
                </h3>
              </div>
              <span className="text-[9px] font-mono text-cyan-400 uppercase font-semibold">Topic: {activeAgentTopic}</span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              See the active decentralized agents coordinating and executing background mathematical modulations autonomously.
            </p>

            {/* Custom Agent Topic Selection Input */}
            <div className="flex flex-col gap-2 p-2.5 bg-neutral-900/40 rounded-xl border border-neutral-900">
              <span className="text-[10px] font-mono text-indigo-300 uppercase">What topic should agents coordinate on?</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAgentTopicInput}
                  onChange={(e) => setCustomAgentTopicInput(e.target.value)}
                  placeholder="Enter subject (e.g. History, Biology, Chemistry)..."
                  className="flex-1 py-1 px-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customAgentTopicInput.trim()) {
                      setActiveAgentTopic(customAgentTopicInput.trim());
                      setCustomAgentTopicInput("");
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (customAgentTopicInput.trim()) {
                      setActiveAgentTopic(customAgentTopicInput.trim());
                      setCustomAgentTopicInput("");
                    }
                  }}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg text-white transition-all active:scale-95 cursor-pointer"
                >
                  Set Topic
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Agent status pipeline visualization */}
              <div className="flex items-center justify-between gap-1 py-2 px-3 rounded-lg bg-neutral-900/40 border border-neutral-800">
                <div className="flex flex-col">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase">Active State</span>
                  <span className="text-xs font-mono font-bold text-[#DFFF7A]">{workflowStatus}</span>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((step) => (
                    <span
                      key={step}
                      className={`h-2.5 w-2.5 rounded-full ${
                        activeWorkflowStep === step ? "bg-cyan-400 animate-ping" : "bg-neutral-800"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Streaming console logs log box */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-neutral-500">Autonomous swarm logs:</span>
                <div className="h-32 p-3 bg-black/80 rounded-xl border border-neutral-900 font-mono text-[10px] text-emerald-400 overflow-y-auto flex flex-col gap-1 shadow-inner scrollbar-none">
                  {workflowLogs.map((log, i) => (
                    <div key={i} className="leading-relaxed hover:bg-neutral-900/50 py-0.5 rounded px-1 transition-colors">
                      <span className="text-neutral-600 mr-1">&gt;</span>
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual trigger button */}
              <button
                onClick={() => {
                  setWorkflowLogs((prev) => [
                    ...prev,
                    `[MANUAL INTRUSION] User forced system re-calibration step.`,
                    `[AGENT-5] Modulating visualizer glow parameters to compensate: ${params.glowIntensity}px`
                  ]);
                  // Randomly set speed
                  setParams((p) => ({
                    ...p,
                    speed: parseFloat((Math.random() * 1.5 + 0.2).toFixed(2))
                  }));
                }}
                className="w-full py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] font-mono uppercase text-neutral-300 rounded-lg cursor-pointer transition-colors"
              >
                Trigger Manual Agent Intercept
              </button>
            </div>
          </div>

          {/* FEATURE 5: DOCUMENT CLEARANCE TASK BAR (AUDIT LOG & CARGO VERIFICATION) */}
          <div className="md:col-span-12 p-6 bg-neutral-950/60 border border-neutral-900 backdrop-blur-sm shadow-xl flex flex-col gap-5 relative overflow-hidden rounded-none mt-4" id="document-clearance-section">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-white">
                    📁 Document Clearance Task Bar
                  </h3>
                  <p className="text-[10px] font-mono text-neutral-500 uppercase">
                    Quantum Signature & Cargo Manifest Audit Console
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-neutral-400">CLEARANCE STATUS:</span>
                <span className={`px-2.5 py-1 rounded-sm text-xs font-mono font-bold border ${
                  documentStatus === "APPROVED" 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : documentStatus === "REJECTED"
                    ? "bg-red-500/10 text-red-400 border-red-500/30"
                    : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 animate-pulse"
                }`}>
                  {documentStatus}
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Audit interstellar flight manifests and permits asynchronously. Click a pre-loaded telemetry log document file below to load and verify cargo vectors via Gemini heuristic scanning.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Preloaded files and select list */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">Available Logs & Permits</span>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      name: "FLIGHT_LOG_49.log",
                      desc: "Interstellar log file for Sector 45 cargo transport.",
                      content: "Space vector route: sector 45 to sector 89. Warp factor: 4.8. Core reactor status: stable. Manifest: 3 containers of quantum ice, 1 bio-dome seedling container. Signed: Commander Vance."
                    },
                    {
                      name: "WARP_DRIVE_PERMIT_09.xml",
                      desc: "Authorized warp signature permit validation log.",
                      content: "Permit ID: WP-9902-X. Vessel classification: Cruiser. Maximum velocity limit: Warp 9.5. Authorization stamp: Interstellar Federation Core. Cargo authorization: Class-A fission components."
                    },
                    {
                      name: "FUEL_CELL_TELEMETRY.json",
                      desc: "Engine status and local fuel density vector values.",
                      content: "Fuel source: Deuterium-Tritium hybrid matrix. Energy output: 1.21 Gigawatts. Core temperature: 8.4m Kelvin. Fuel reserves: 88%. Hazardous emissions: 0.02ppm (Legally permitted threshold)."
                    }
                  ].map((doc) => (
                    <div
                      key={doc.name}
                      onClick={() => {
                        setSelectedDocumentName(doc.name);
                        setDocumentContent(doc.content);
                        setDocumentStatus("PENDING");
                        setDocumentReport("");
                      }}
                      className={`p-3 border text-left cursor-pointer transition-all flex flex-col gap-1 rounded-none ${
                        selectedDocumentName === doc.name
                          ? "bg-emerald-950/20 border-emerald-500/50"
                          : "bg-neutral-900/40 border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700"
                      }`}
                    >
                      <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-neutral-400" />
                        {doc.name}
                      </span>
                      <span className="text-[10px] text-neutral-500 leading-normal font-light">
                        {doc.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Content editor and Scan feedback */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Document Editor</span>
                    <span className="text-[10px] font-mono text-[#DFFF7A]">{selectedDocumentName}</span>
                  </div>
                  <textarea
                    value={documentContent}
                    onChange={(e) => {
                      setDocumentContent(e.target.value);
                      setDocumentStatus("PENDING");
                      setDocumentReport("");
                    }}
                    className="w-full h-32 py-2 px-3 bg-neutral-900 border border-neutral-800 rounded-none text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 font-mono resize-none"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-neutral-500">Heuristic engine ready.</span>
                  <button
                    onClick={handleClearDocument}
                    disabled={isDocumentScanning || !documentContent.trim()}
                    className="py-2 px-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-900 disabled:text-neutral-500 text-xs font-semibold text-white rounded-none flex items-center gap-1.5 transition-all shadow active:scale-95 cursor-pointer"
                  >
                    {isDocumentScanning ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Auditing Cargo...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-[#DFFF7A]" />
                        Execute Clearance Audit
                      </>
                    )}
                  </button>
                </div>

                {/* Audit report box */}
                {documentReport && (
                  <div className={`p-4 border rounded-none flex flex-col gap-2 ${
                    documentStatus === "APPROVED"
                      ? "bg-emerald-950/20 border-emerald-800/40"
                      : "bg-red-950/20 border-red-900/40"
                  }`}>
                    <div className="flex items-center gap-2">
                      {documentStatus === "APPROVED" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-[10px] font-mono uppercase tracking-widest ${
                        documentStatus === "APPROVED" ? "text-emerald-400" : "text-red-400"
                      }`}>
                        SYSTEM VERIFICATION REPORT
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed font-light font-mono select-text">
                      {documentReport}
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* FEATURE 9: AESTHETIC VISION STUDIO (IMAGE & VIDEO SYNTHESIZER) */}
          <div className="p-6 bg-neutral-950/60 border border-neutral-900 backdrop-blur-sm shadow-xl flex flex-col gap-6 relative overflow-hidden rounded-none mt-6" id="vision-studio-section">
            <div className="absolute top-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-400">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-semibold uppercase tracking-wider text-white">
                    ✨ Aesthetic Vision Studio (Image & Video)
                  </h3>
                  <p className="text-[10px] font-mono text-neutral-500 uppercase">
                    Generates dynamic visual art or cinematic video parameters according to your wish
                  </p>
                </div>
              </div>

              {/* Media Type Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setVisionType("image")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    visionType === "image"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                      : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white"
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  Vector Image
                </button>
                <button
                  onClick={() => setVisionType("video")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    visionType === "video"
                      ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20"
                      : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white"
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  Cinematic Video
                </button>
              </div>
            </div>

            {/* Prompt input field */}
            <div className="flex flex-col gap-2 p-4 bg-neutral-900/30 rounded-xl border border-neutral-900/80">
              <span className="text-xs font-medium text-neutral-300">Describe the visual scene or animation concept you wish to synthesize:</span>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={visionPrompt}
                  onChange={(e) => setVisionPrompt(e.target.value)}
                  placeholder="e.g., A magical glowing tree on a dark neon canvas with floating stardust particles..."
                  className="flex-1 py-2 px-4 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500 font-sans"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isGeneratingVision) {
                      handleGenerateVision();
                    }
                  }}
                />
                <button
                  onClick={handleGenerateVision}
                  disabled={isGeneratingVision || !visionPrompt.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-40 text-xs font-bold uppercase tracking-wider rounded-lg text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10"
                >
                  {isGeneratingVision ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Synthesizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Synthesize Aesthetic Asset
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Dynamic Result Area */}
            {isGeneratingVision ? (
              <div className="h-80 flex flex-col items-center justify-center gap-3 bg-neutral-950/40 rounded-xl border border-neutral-900 p-6">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest animate-pulse">
                  Assembling mathematical rendering matrices...
                </span>
                <span className="text-[10px] text-neutral-600 font-mono">
                  Heuristic model translating prompt to SVG grids & motion fields
                </span>
              </div>
            ) : visionResult ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Media Preview Player Column */}
                <div className="lg:col-span-8 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">
                      🖥️ {visionType === "video" ? "Real-time Video Render" : "Vector Masterpiece View"}
                    </span>
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-900">
                      STABLE CONSOLE PREVIEW
                    </span>
                  </div>

                  {/* Rendering Window */}
                  <div className="aspect-video w-full relative bg-black rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl">
                    {visionType === "video" && visionResult.animationParams ? (
                      <VisionCanvas
                        color1={visionResult.animationParams.color1}
                        color2={visionResult.animationParams.color2}
                        color3={visionResult.animationParams.color3}
                        movementType={visionResult.animationParams.movementType}
                        speed={visionResult.animationParams.speed}
                        particleCount={visionResult.animationParams.particleCount}
                        frequency={visionResult.animationParams.frequency}
                        isPlaying={videoPlaying}
                        playbackSpeed={videoPlaybackSpeed}
                        cssFilter={visionFilter}
                      />
                    ) : (
                      <div
                        style={{ filter: visionFilter === "none" ? "" : visionFilter }}
                        className="w-full h-full flex items-center justify-center p-2 bg-[#050508] transition-all duration-300"
                        dangerouslySetInnerHTML={{ __html: visionResult.svgMarkup || "" }}
                      />
                    )}
                  </div>

                  {/* Video Controls / Image Filter Controls */}
                  {visionType === "video" ? (
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-neutral-900/60 rounded-xl border border-neutral-800">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setVideoPlaying(!videoPlaying)}
                          className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer transition-colors"
                          title={videoPlaying ? "Pause Video" : "Play Video"}
                        >
                          {videoPlaying ? (
                            <span className="text-xs font-mono font-bold px-1 text-cyan-400">PAUSE</span>
                          ) : (
                            <span className="text-xs font-mono font-bold px-1 text-emerald-400">PLAY</span>
                          )}
                        </button>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-neutral-400">PLAYBACK SPEED:</span>
                          <input
                            type="range"
                            min="0.2"
                            max="2.5"
                            step="0.1"
                            value={videoPlaybackSpeed}
                            onChange={(e) => setVideoPlaybackSpeed(parseFloat(e.target.value))}
                            className="w-24 accent-cyan-500 cursor-pointer"
                          />
                          <span className="text-[10px] font-mono font-bold text-white w-8 text-right">{videoPlaybackSpeed.toFixed(1)}x</span>
                        </div>
                      </div>

                      {/* Video Scanline filter toggles */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-neutral-400">ARTISTIC LOOKS:</span>
                        <select
                          value={visionFilter}
                          onChange={(e) => setVisionFilter(e.target.value)}
                          className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-[10px] font-mono text-white focus:outline-none cursor-pointer"
                        >
                          <option value="none">STANDARD NEON</option>
                          <option value="hue-rotate(90deg)">COSMIC PURPLE (HUE-90)</option>
                          <option value="hue-rotate(180deg)">CYBER PUNK (HUE-180)</option>
                          <option value="grayscale(100%)">RETRO MONOCHROME</option>
                          <option value="contrast(150%) saturate(180%)">ULTRA VIVID SATURATE</option>
                          <option value="blur(2px) contrast(200%)">DIGITAL DREAM GLOW</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-neutral-900/60 rounded-xl border border-neutral-800">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-neutral-400">IMAGE FILTER PRESETS:</span>
                        <select
                          value={visionFilter}
                          onChange={(e) => setVisionFilter(e.target.value)}
                          className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-[10px] font-mono text-white focus:outline-none cursor-pointer"
                        >
                          <option value="none">ORIGINAL SHARP</option>
                          <option value="hue-rotate(60deg) saturate(140%)">PSYCHEDELIC MAGENTA</option>
                          <option value="grayscale(100%) contrast(140%)">SILVER CHROMIUM</option>
                          <option value="saturate(200%) contrast(120%)">ELECTRIC HIGH-GLOW</option>
                          <option value="invert(100%)">SPECTRAL INVERT</option>
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          if (visionResult.svgMarkup) {
                            navigator.clipboard.writeText(visionResult.svgMarkup);
                            alert("SVG markup successfully copied to quantum buffers!");
                          }
                        }}
                        className="py-1 px-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-[10px] font-mono text-neutral-300 hover:text-white transition-all cursor-pointer"
                      >
                        Copy SVG Markup XML
                      </button>
                    </div>
                  )}
                </div>

                {/* Conceptual metadata info column */}
                <div className="lg:col-span-4 flex flex-col gap-4 bg-neutral-900/20 p-5 rounded-2xl border border-neutral-900">
                  <div className="border-b border-neutral-900 pb-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{visionResult.title}</h4>
                    <span className="text-[9px] font-mono text-purple-400 block mt-0.5">SYNTHESIZED ASSET MODEL</span>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed font-light">
                    {visionResult.description}
                  </p>

                  <div className="flex flex-col gap-2 bg-black/40 p-3 rounded-xl border border-neutral-900 font-mono text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Asset Type:</span>
                      <span className="text-white uppercase">{visionType}</span>
                    </div>
                    {visionResult.animationParams ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Primary Color:</span>
                          <span style={{ color: visionResult.animationParams.color1 }} className="font-bold">{visionResult.animationParams.color1}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Secondary Color:</span>
                          <span style={{ color: visionResult.animationParams.color2 }} className="font-bold">{visionResult.animationParams.color2}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Motion Type:</span>
                          <span className="text-cyan-400 font-bold uppercase">{visionResult.animationParams.movementType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-500">Particles Speed:</span>
                          <span className="text-white font-bold">{visionResult.animationParams.speed}x</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-[9px] text-neutral-500 leading-relaxed text-center py-2">
                        Heuristics verified: SVG is fully responsive with inline styling, vector coordinates, and animation path nodes.
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-purple-950/20 rounded-xl border border-purple-900/40">
                    <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest block font-bold">Heuristic Engine Note:</span>
                    <p className="text-[10px] text-neutral-400 leading-relaxed mt-1 font-light font-mono">
                      This hyper-intelligent visual core compiles layouts a billion times faster than the human brain, allowing you to iterate on infinite aesthetic themes smoothly.
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-60 flex flex-col items-center justify-center gap-3 bg-neutral-950/40 rounded-xl border border-neutral-900/60 p-6 text-center">
                <Palette className="w-10 h-10 text-neutral-700 animate-pulse" />
                <div>
                  <h4 className="text-xs font-mono text-neutral-400 uppercase font-bold">Ready to Synthesize Your Aesthetic Concept</h4>
                  <p className="text-xs text-neutral-500 leading-normal max-w-sm mt-1 font-light">
                    Specify any topic or visual description above (e.g. "A retro-future synthwave wireframe horizon" or "A swirling vortex of stardust particles") and select image or video to load.
                  </p>
                </div>
              </div>
            )}
          </div>

        </section>
          </>
        )}

      </main>

      {/* ========================================================== */}
      {/* DECORATIVE CLEAN FOOTER - Made by Saaron Prakash */}
      {/* ========================================================== */}
      <footer className="border-t border-neutral-950 bg-black/60 py-6 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500">
          
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 font-medium">CortexZoom Cockpit Console</span>
            <span className="text-neutral-700">|</span>
            <span className="text-xs text-neutral-300 font-semibold bg-neutral-950 px-2 py-0.5 rounded border border-neutral-900 flex items-center gap-1 shadow-inner hover:text-white transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DFFF7A] animate-pulse" />
              Made by Saaron Prakash
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Gemini 3.5-Flash Core
            </span>
            <span className="text-neutral-700">|</span>
            <span className="text-neutral-400 hover:text-white transition-colors cursor-help flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" /> Cockpit HUD System v8.1
            </span>
          </div>

        </div>
      </footer>

      {/* ========================================================== */}
      {/* FLOATING PULL-TAB TO OPEN AI MODE SIDEBAR */}
      {/* ========================================================== */}
      <div 
        onClick={() => setIsSidebarOpen(true)}
        className="fixed right-0 top-1/3 z-50 bg-gradient-to-l from-indigo-700 to-purple-600 text-white py-4 px-2 rounded-l-xl cursor-pointer shadow-xl hover:from-indigo-600 hover:to-purple-500 transition-all flex flex-col items-center gap-2 border-l border-t border-b border-indigo-500/30 group active:scale-95"
        title="Click to pull out AI Configuration Mode Panel"
      >
        <Settings className="w-4 h-4 animate-spin text-[#DFFF7A] group-hover:scale-110 transition-transform" style={{ animationDuration: "6s" }} />
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest writing-mode-vertical text-center select-none" style={{ writingMode: "vertical-lr" }}>
          AI CORE CONFIG
        </span>
        <ChevronLeft className="w-3.5 h-3.5 animate-pulse text-indigo-200 mt-1" />
      </div>

      {/* BACKDROP FOR CLOSE */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SLIDING DRAWER CONTROL SIDEBAR */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-neutral-950 border-l border-neutral-900 shadow-2xl z-[100] transition-transform duration-300 transform flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-neutral-900 flex items-center justify-between bg-[#07070d]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono uppercase font-bold tracking-wider text-white">AI Engine Personality</h3>
              <p className="text-[9px] font-mono text-neutral-500 uppercase">Subspace tuning matrices</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
          <div>
            <h4 className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-2.5">
              ⚡ Select Active AI Mode:
            </h4>
            <p className="text-xs text-neutral-500 leading-normal mb-4 font-light">
              Customize how Vector and other core AI subprocesses behave, process, and formulate intellectual outputs.
            </p>

            {/* THREE CHOICES: SMART, FAST, INNOVATIVE */}
            <div className="flex flex-col gap-3">
              {/* SMART MODE */}
              <div 
                onClick={() => {
                  setAiMode("smart");
                  setWorkflowLogs((logs) => [...logs, `[AI CORE] Subspace configuration changed: SMART mode active.`]);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                  aiMode === "smart" 
                    ? "bg-indigo-600/10 border-indigo-500/80 shadow-lg shadow-indigo-600/5 text-white" 
                    : "bg-neutral-900/30 border-neutral-900 hover:border-neutral-800 text-neutral-400 hover:text-neutral-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono tracking-wide uppercase flex items-center gap-1.5">
                    <Brain className={`w-4 h-4 ${aiMode === "smart" ? "text-indigo-400" : "text-neutral-500"}`} />
                    🧠 Smart Mode
                  </span>
                  <span className={`h-2 w-2 rounded-full ${aiMode === "smart" ? "bg-indigo-400 animate-pulse" : "bg-transparent"}`} />
                </div>
                <p className="text-[10.5px] leading-relaxed font-light text-neutral-400 text-left">
                  Enables exceptionally deep analysis, scientific accuracy, and fully comprehensive logical reasoning structures. Ideal for structured complex learning queries.
                </p>
              </div>

              {/* FAST MODE */}
              <div 
                onClick={() => {
                  setAiMode("fast");
                  setWorkflowLogs((logs) => [...logs, `[AI CORE] Subspace configuration changed: FAST mode active. Speed boosted.`]);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                  aiMode === "fast" 
                    ? "bg-cyan-600/10 border-cyan-500/80 shadow-lg shadow-cyan-600/5 text-white" 
                    : "bg-neutral-900/30 border-neutral-900 hover:border-neutral-800 text-neutral-400 hover:text-neutral-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono tracking-wide uppercase flex items-center gap-1.5">
                    <Zap className={`w-4 h-4 ${aiMode === "fast" ? "text-cyan-400 animate-bounce" : "text-neutral-500"}`} />
                    ⚡ Fast Mode
                  </span>
                  <span className={`h-2 w-2 rounded-full ${aiMode === "fast" ? "bg-cyan-400 animate-pulse" : "bg-transparent"}`} />
                </div>
                <p className="text-[10.5px] leading-relaxed font-light text-neutral-400 text-left">
                  Forces vector voice assistant to return highly compressed, rapid-fire responses (max 10-12 words). Speeds up voice-synthetics rate to 1.35x. Extremely swift!
                </p>
              </div>

              {/* INNOVATIVE MODE */}
              <div 
                onClick={() => {
                  setAiMode("innovative");
                  setWorkflowLogs((logs) => [...logs, `[AI CORE] Subspace configuration changed: INNOVATIVE mode active.`]);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                  aiMode === "innovative" 
                    ? "bg-purple-600/10 border-purple-500/80 shadow-lg shadow-purple-600/5 text-white" 
                    : "bg-neutral-900/30 border-neutral-900 hover:border-neutral-800 text-neutral-400 hover:text-neutral-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono tracking-wide uppercase flex items-center gap-1.5">
                    <Sparkles className={`w-4 h-4 ${aiMode === "innovative" ? "text-purple-400" : "text-neutral-500"}`} />
                    ✨ Innovative Mode
                  </span>
                  <span className={`h-2 w-2 rounded-full ${aiMode === "innovative" ? "bg-purple-400 animate-pulse" : "bg-transparent"}`} />
                </div>
                <p className="text-[10.5px] leading-relaxed font-light text-neutral-400 text-left">
                  Unlocks highly creative conceptual associations, artistic visual prompt translation hints, and futuristic quantum metaphors. Great for brainstorming.
                </p>
              </div>
            </div>
          </div>

          {/* Current status display card */}
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-900 font-mono text-[10px] flex flex-col gap-2 text-left">
            <div className="flex justify-between border-b border-neutral-900 pb-1.5 text-[8px] uppercase text-neutral-500 tracking-wider">
              <span>Active Core State</span>
              <span>STATUS</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Subspace Latency:</span>
              <span className={aiMode === "fast" ? "text-emerald-400 font-bold" : "text-neutral-300"}>
                {aiMode === "fast" ? "0.02ms (Ultra Fast)" : "0.15ms"}
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Synaptic Depth:</span>
              <span className={aiMode === "smart" ? "text-indigo-400 font-bold" : "text-neutral-300"}>
                {aiMode === "smart" ? "99.9% Max Depth" : "68.2% Standard"}
              </span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Creativity Factor:</span>
              <span className={aiMode === "innovative" ? "text-purple-400 font-bold" : "text-neutral-300"}>
                {aiMode === "innovative" ? "1.5x Multiplier" : "1.0x Flat"}
              </span>
            </div>
          </div>

          {/* Small advice alert box */}
          <div className="p-3 bg-[#DFFF7A]/5 rounded-xl border border-[#DFFF7A]/10 text-left">
            <span className="text-[9px] font-mono text-[#DFFF7A] uppercase font-bold tracking-wider block">Cognitive Adaptation:</span>
            <p className="text-[10px] text-neutral-400 leading-normal mt-1 font-light">
              Vector adjusts its speech speed, sentence structures, and complexity level instantly as you toggle these modes. Give it a try!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
