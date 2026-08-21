export type PortfolioProject = {
  id: string;
  name: string;
  status: "Live" | "In Progress";
  role?: string;
  tagline: string;
  problem: string;
  solution: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  highlights: string[];
};

export const profile = {
  fullName: "Harshit Kumar",
  location: "East India",
  primaryEmail: "harshitzmishraa@gmail.com",
  secondaryEmail: "mantisdarling@proton.me",
  headline: "Founder @ MANTIS | CS Student @ IIT Madras | Google GEAR & NVIDIA Developer Program Member | Open Source Advocate",
  positioning: "I am an AI systems builder who ships real products.",
  linkedInHeadline: "IIT Madras CS'30 | Open Source Advocate, Deep Learning & Research | From neural nets to operating systems",
  xBio: "Founder of MANTIS (AI-native infrastructure for expert intelligence) | Pursuing CS @ IIT Madras | Building systems where human expertise and AI work as one.",
  oneLineBio: "CS student at IIT Madras building AI systems that ship, from OS kernels to full-stack mentorship platforms.",
  shortBio: "CS student at IIT Madras. I build AI systems that ship, from neural network process schedulers inside OS kernels to full-stack mentorship platforms. Founder of MANTIS. Google GEAR official member. NVIDIA Developer. Open source advocate.",
  microBio: "IIT Madras CS student. Founder of MANTIS. AI systems builder. Ships real products.",
  fullBio: [
    "I am Harshit Kumar, a Computer Science student at IIT Madras with a deep focus on Artificial Intelligence, Machine Learning, and software systems. I build real products, not side projects that never ship. From a freestanding x86 operating system kernel with an embedded neural network scheduler, to a full-stack AI-native mentorship marketplace, to an interactive developer roadmap platform powered by Llama 3.1, I care about shipping things that work at production quality.",
    "I am the Founder of MANTIS, an AI-native mentorship marketplace that connects serious learners with vetted industry veterans and PhD researchers for live 1-on-1 guidance. MANTIS is built with enterprise-grade infrastructure: NestJS, FastAPI, PostgreSQL, Redis, Socket.io, Stripe escrow, and an AI-powered recommender system. It is designed to solve real learning problems at scale.",
    "My interests span the full depth of computing, from low-level systems (operating system kernels, assembly, FPU configuration, bare-metal C) to high-level AI applications (transformer fine-tuning, multi-model ensembles, agentic workflows, LLM API integration). I believe the best engineers understand their stack from the ground up, and I build accordingly.",
    "I am an officially selected member of Google's GEAR (Gemini Enterprise Agent Ready) program, an NVIDIA Developer Program member, a Project Admin at Social Summer of Code Season 5, and a member of Google Developer Groups across six global campuses. I write about AI ethics and geopolitics, learn Russian, and play chess competitively.",
  ],
  links: [
    { label: "GitHub", url: "https://github.com/mantisdarling" },
    { label: "LinkedIn", url: "https://linkedin.com/in/mantisdarling" },
    { label: "Twitter / X", url: "https://x.com/mantisxdarling" },
    { label: "GitHub Org", url: "https://github.com/XY-COMBINATOR" },
    { label: "Google Dev Profile", url: "https://g.dev/mantisdarling" },
    { label: "NVIDIA Dev Forums", url: "https://forums.developer.nvidia.com" },
  ],
} as const;

export const education = [
  {
    degree: "BS in Data Science and Programming",
    institution: "Indian Institute of Technology Madras (IIT Madras)",
    dates: "May 2026 to 2030 (Expected)",
    status: "Pursuing",
    focusAreas: "Artificial Intelligence, Machine Learning, Systems Programming, Software Development",
    note: "IIT Madras CS Class of 2030",
  },
  {
    degree: "BA in Industrial Relations and Personnel Management",
    institution: "T.M. Bhagalpur University (Marwari College, Bhagalpur)",
    dates: "2025",
    status: "Dropper, did not complete",
    focusAreas: "",
    note: "Gained foundational experience in governance frameworks, industrial relations, and personnel management systems before transferring focus to IIT Madras CS program.",
  },
] as const;

export const technologyGroups = [
  { category: "Languages", items: ["Python", "C", "C++", "JavaScript", "TypeScript", "Bash"] },
  { category: "Frameworks", items: ["React 19", "Next.js 15", "Astro 5", "NestJS 11", "FastAPI", "Express", "Vite"] },
  { category: "ML and AI Libraries", items: ["PyTorch", "TensorFlow", "HuggingFace Transformers", "spaCy", "scikit-learn", "LangChain", "ONNX"] },
  { category: "Databases and Cache", items: ["PostgreSQL", "Redis", "SQLite", "Drizzle ORM", "Prisma 7"] },
  { category: "DevOps and Infrastructure", items: ["Docker", "Nginx", "GitHub Actions", "Turborepo", "Vercel", "AWS S3", "GKE", "Celery", "OpenTelemetry", "Prometheus"] },
  { category: "AI Tools and Platforms", items: ["Claude", "Cursor", "Manus AI", "Google ADK", "NVIDIA NIM", "NemoClaw", "OpenShell", "Groq", "OpenAI", "Vertex AI"] },
  { category: "Other Tools", items: ["Git", "Linux", "Socket.io", "Stripe", "Zod", "JWT", "Redis Adapter", "Sentry", "Framer Motion", "Tailwind CSS"] },
] as const;

export const projects: PortfolioProject[] = [
  {
    id: "cosmic",
    name: "Cosmic",
    status: "Live",
    tagline: "Interactive developer roadmap platform with AI Tutor",
    problem: "Developers struggle to find clear, structured learning paths across dozens of specializations.",
    solution: "A platform with 50+ interactive career roadmaps, an AI Tutor powered by Llama 3.1, and persistent progress tracking, all in one place.",
    description: "Cosmic is an interactive developer roadmap platform featuring 50+ comprehensive career paths covering Frontend, Backend, Full Stack, DevOps, AI/ML Engineering, Systems Programming, Databases, Cloud, Cybersecurity, Mobile, and more. Powered by an interactive graph canvas with automated left-to-right node hierarchy using React Flow and dagre. Features an AI Tutor delivering instant, jargon-free topic explanations powered by Llama 3.1 via Groq serverless proxy, with automated follow-up topic recommendations. Includes persistent progress tracking with celebratory completion badges, one-click shareable achievement cards, real-time client-side search across all 50+ roadmaps, and a Cyberpunk Obsidian design system with deep obsidian background, electric cyan and amber accents, dynamic wallpaper support, and high-contrast accessibility.",
    technologies: ["Astro 5", "React 19", "TypeScript", "React Flow", "dagre", "Groq API", "Llama 3.1", "Tailwind CSS v4", "Zod", "Vercel"],
    liveUrl: "https://cosmic-nu-ebon.vercel.app",
    githubUrl: "https://github.com/mantisdarling/Cosmic",
    highlights: ["50+ career paths across all major tech specializations", "AI Tutor powered by Llama 3.1 (Groq serverless)", "Interactive graph canvas with automated node hierarchy", "Offline-first PWA support", "Cyberpunk Obsidian design system"],
  },
  {
    id: "neurosched",
    name: "NeuroSched",
    status: "Live",
    tagline: "x86 OS kernel with embedded neural network process scheduler",
    problem: "Traditional OS schedulers use static heuristics that yield suboptimal wait times for mixed workloads.",
    solution: "A freestanding x86 kernel with an embedded 2-layer MLP inference engine that dynamically scores processes based on runtime metrics, achieving 16.8% faster scheduling than Round-Robin.",
    description: "NeuroSched is a freestanding 32-bit x86 operating system kernel that replaces traditional static process scheduling heuristics with a trained embedded 2-layer Multi-Layer Perceptron inference engine written in zero-dependency freestanding C. The neural model dynamically scores candidate processes based on 5 observed runtime state metrics. All weight matrices are statically compiled into .rodata and stack memory with no malloc or dynamic heap allocations. Assembly boot stubs configure the x87 FPU via CR0 flags (CR0.EM=0, CR0.MP=1) to execute floating-point matrix operations at hardware speed. Includes a confidence fallback safeguard (NN CONF THRESH 0.65f) that defers to Round-Robin on out-of-distribution inputs, guaranteeing kernel stability. Empirical QEMU benchmarks via real-time COM1 serial UART telemetry demonstrate a 16.8% reduction in average wait time and a 14.2% reduction in turnaround time versus Round-Robin baseline. Ships with an interactive web-based simulation for dual-track scheduler timeline visualization, 5x8 weight matrix heatmap inspection, and in-browser COM1 serial UART command testing.",
    technologies: ["Freestanding C", "x86 Assembly", "QEMU", "2-layer MLP", "x87 FPU", "COM1 UART", "Web Simulation", "Vercel"],
    liveUrl: "https://neurosched.vercel.app",
    githubUrl: "https://github.com/mantisdarling/NeuroSched",
    highlights: ["16.8% reduction in average process wait time vs Round-Robin", "14.2% reduction in turnaround time vs Round-Robin", "Zero-dependency freestanding C, no stdlib, no malloc", "Hardware FPU via x87 CR0 flag configuration in assembly", "Confidence fallback safeguard for kernel stability", "Interactive web simulation with weight matrix heatmap"],
  },
  {
    id: "xy-team-portfolio",
    name: "XY: Team Portfolio",
    status: "Live",
    tagline: "Production-grade team portfolio for XY-COMBINATOR, built for 5,000+ users",
    problem: "The XY-COMBINATOR team needed a professional, scalable portfolio to showcase members, projects, and achievements.",
    solution: "A production-grade full-stack portfolio built for 5,000+ concurrent users with enterprise-level security and top-notch frontend/backend architecture.",
    description: "Production-grade team portfolio website for the XY-COMBINATOR organization, showcasing team members, projects, and achievements. Engineered to handle 5,000+ concurrent users without performance degradation, with enterprise-level security architecture, optimized frontend performance, and a robust backend. Built as a pnpm monorepo with automated CI/CD deployment via Vercel. Features 34+ commits and active pull request reviews reflecting a real collaborative engineering workflow with multiple contributors.",
    technologies: ["TypeScript", "Drizzle ORM", "Vite", "Vitest", "pnpm Monorepo", "Vercel", "CI/CD", "GitHub Actions"],
    liveUrl: "https://xy-combinator.vercel.app",
    githubUrl: "https://github.com/XY-COMBINATOR/XY",
    highlights: ["Supports 5,000+ concurrent users without degradation", "Enterprise-level security architecture", "pnpm monorepo with full CI/CD pipeline", "34+ commits, collaborative engineering workflow"],
  },
  {
    id: "russian-in-india",
    name: "Russian in India Resource Guide",
    status: "Live",
    tagline: "Interactive research website for original article on Russian language in India",
    problem: "Academic research on niche linguistic topics is typically buried in static PDFs with no interactivity.",
    solution: "A fully custom research website with historical timeline, archive visuals, learner pathways, and smart search, making the research actually engaging to explore.",
    description: "Custom-built interactive research website accompanying original article \"Russian in India: A Language That Travels Through Many Rooms.\" Maps how the Russian language traveled and evolved across India over decades. Features a clickable historical timeline, custom archive-themed visuals, structured learner pathways for different proficiency levels, an editorial research-atlas with geographical visualizations, and a smart search shelf to filter through verified sources. Fully optimized for desktop and mobile with complete SEO implementation and fast load performance.",
    technologies: ["HTML5", "CSS3", "JavaScript", "Mobile-first Responsive Design", "SEO Optimization"],
    highlights: ["Clickable historical timeline of Russian language in India", "Archive-themed custom visuals", "Smart search shelf for verified sources", "Fully responsive, SEO-optimized"],
  },
  {
    id: "ultraviolette-clone",
    name: "Ultraviolette Website Clone",
    status: "Live",
    tagline: "High-fidelity responsive clone of Ultraviolette Automotive website",
    problem: "Practice project: mastering responsive design, smooth animations, and pixel-accurate UI recreation.",
    solution: "A complete, deployed frontend clone of ultraviolette.com with full responsiveness and animations.",
    description: "High-fidelity responsive frontend clone of the Ultraviolette Automotive website, featuring modern UI design, smooth scroll animations, and pixel-accurate layout recreation. Built as a focused exercise in responsive design, UI structuring, and modern web development fundamentals. Demonstrates strong command of CSS layout systems, animation techniques, and cross-device responsiveness. Deployed live on Vercel.",
    technologies: ["HTML5", "CSS3", "Responsive Design", "CSS Animations", "Vercel"],
    highlights: ["Pixel-accurate recreation of Ultraviolette Automotive UI", "Smooth scroll animations", "Fully responsive across all devices"],
  },
  {
    id: "mantis-marketplace",
    name: "MANTIS: Mentorship Marketplace",
    status: "In Progress",
    role: "Founder",
    tagline: "AI-native mentorship marketplace. Stop guessing, start talking.",
    problem: "Learners waste time guessing solutions alone when a 15-minute conversation with the right expert could unblock them instantly.",
    solution: "An AI-powered marketplace connecting learners with vetted industry veterans and PhD researchers for instant live 1-on-1 mentorship sessions, with smart matching, secure payments, and real-time messaging.",
    description: "MANTIS is an AI-native mentorship marketplace built for serious learners and seasoned professionals. Connect instantly with vetted industry veterans and PhD researchers for live 1-on-1 mentorship sessions. Features an AI-powered recommender system (FastAPI + scikit-learn) that matches learners with the most relevant experts. Payment processing via Stripe with escrow using manual capture for session security. Real-time messaging powered by Socket.io with Redis adapter. Authentication via JWT + Google OAuth + 2FA TOTP. Full PWA support via Serwist. Observability: OpenTelemetry + Prometheus. Internationalization via next-intl. File storage on AWS S3. Built as a Turborepo monorepo with three apps: web (Next.js 15 + React 19), api (NestJS 11 + Express 5 + Prisma 7 + PostgreSQL 15), and recommender (FastAPI + scikit-learn, Python 3.12).",
    technologies: ["Next.js 15", "React 19", "NestJS 11", "Express 5", "FastAPI", "Prisma 7", "PostgreSQL 15", "Redis", "Socket.io", "OpenAI", "LangChain", "AWS S3", "Stripe", "Docker Compose", "Turborepo", "Serwist", "OpenTelemetry", "Prometheus"],
    githubUrl: "https://github.com/mantisdarling/Mantis",
    highlights: ["AI-powered recommender matching learners to optimal experts", "Stripe escrow payments with manual capture for session security", "Real-time Socket.io messaging with Redis adapter", "JWT + Google OAuth + 2FA TOTP authentication", "Full PWA support, internationalization, observability stack", "Turborepo monorepo: web + api + recommender"],
  },
  {
    id: "buzz",
    name: "Buzz: AI Misinformation Detector",
    status: "In Progress",
    tagline: "Multi-model AI ensemble for detecting fake news and misinformation",
    problem: "Misinformation spreads faster than fact-checkers can respond. Existing tools are opaque black boxes with no explainability.",
    solution: "A multi-model AI ensemble combining DistilBERT, spaCy stylometry, and TF-IDF with word-level explainability, showing exactly WHY a claim is flagged.",
    description: "Buzz is a multi-model AI ensemble platform designed to detect misinformation, fake news, and manipulated text in digital media. Combines fine-tuned DistilBERT NLP transformer embeddings, spaCy stylometric linguistic pattern analysis, and N-Gram TF-IDF statistical baseline models for high-precision claim verification. Delivers word-level highlighted reasoning showing exactly which words influenced the truthfulness score. Accepts direct article URLs scraped asynchronously via Trafilatura and Celery, or raw text snippets. Backend: FastAPI with JWT authentication, Redis caching, SlowAPI rate limiting, Sentry SDK error tracking, and an admin analytics dashboard. Full production Docker Compose setup with Nginx reverse proxy, PostgreSQL, Redis, and Celery workers. Frontend: Next.js 15 App Router dashboard styled with Tailwind CSS, Recharts visual signals, and Framer Motion micro-animations.",
    technologies: ["Next.js 15", "FastAPI", "PyTorch", "HuggingFace Transformers", "DistilBERT", "spaCy", "scikit-learn", "ONNX Runtime", "Celery", "Redis", "PostgreSQL", "Docker Compose", "Nginx", "Trafilatura", "JWT", "Sentry", "Recharts", "Framer Motion"],
    liveUrl: "https://buzz-rose-rho.vercel.app",
    githubUrl: "https://github.com/mantisdarling/Buzz",
    highlights: ["Multi-model ensemble: DistilBERT + spaCy stylometry + TF-IDF", "Word-level explainability, highlights exactly which words flag misinformation", "Async URL scraping via Trafilatura and Celery", "Full production Docker Compose: Nginx + PostgreSQL + Redis + Celery", "Admin analytics dashboard with Recharts visualizations"],
  },
];

export const openSource = [
  { name: "SSoC S5: Social Summer of Code Season 5", role: "Project Admin", description: "Project Admin at India's largest open source program. Responsible for mentoring contributors, reviewing pull requests, and managing project direction for real-world open source repositories. Part of an initiative to strengthen India's open source ecosystem." },
  { name: "OSCI 26: Open Source Connect India 2026", role: "Registered Participant", description: "India's premier open source conference bringing together 10,000+ developers, maintainers, startup founders, technology companies, and open source communities to learn, collaborate, and build together. Focus on connecting contribution with career opportunity." },
  { name: "Odysseus: Self-hosted AI Workspace", role: "Contributor", description: "Free, open-source, self-hosted AI workspace. Applied personal modifications and feature additions to extend default capabilities with custom tooling optimized for individual AI research and development workflows.", url: "https://github.com/odysseus-dev/odysseus" },
  { name: "Athena OS: Cybersecurity Linux Distribution", role: "Contributor", description: "Cybersecurity-focused Arch Linux-based distribution. Implemented custom configurations, tooling adjustments, and system-level modifications tailored for AI and security research workflows." },
] as const;

export const credentials = [
  { name: "Google GEAR: Gemini Enterprise Agent Ready", issuer: "Google", status: "Active Member", description: "Officially selected program member for Google's Gemini Enterprise Agent Ready (GEAR) skilling initiative. Actively leveraging cloud-hosted sandboxes and monthly developer allocations to transition from theoretical ML models to production-ready enterprise AI architectures. Core skills: Agent Engineering with Google ADK, Orchestration with Vertex AI reasoning loops, Integration of LLMs with external APIs securely.", skills: "Artificial Intelligence, Generative AI, Python, Google Cloud Platform, Vertex AI", url: "https://g.dev/mantisdarling" },
  { name: "Advanced Diploma in Engineering Thermodynamics", issuer: "Alison / IIT Kanpur Courseware", status: "Completed", description: "Advanced thermodynamics curriculum completed through an intensive technical program featuring official open-courseware content developed by IIT Kanpur professors. Covered fundamental laws of thermodynamics, system analysis, entropy, and advanced power cycles.", skills: "Engineering Thermodynamics", url: "https://alison.com/verify/7ce0c80398", credentialId: "2245-50994808" },
  { name: "SEO with Squarespace", issuer: "Coursera / United Latino Students Association", status: "Completed", date: "August 2025", description: "Project-based certification applied to a live Squarespace website. Covered keyword research and integration, on-page SEO including meta tags, headings, and content structure, performance analysis, and SEO strategy implementation.", skills: "Search Engine Optimization, On-page SEO, Keyword Research, Web Analytics", url: "https://coursera.org/account/accomplishments/records/CITWE1F1HW88", credentialId: "CITWE1F1HW88" },
] as const;

export const courses = [
  { name: "Securing Agents with NemoClaw and OpenShell", provider: "NVIDIA", status: "Enrolled and In Progress", subject: "Generative AI / LLM", description: "Covers building agent loops from scratch and identifying core components, reliable tool use and function calling within agent systems, designing and coordinating multi-agent systems using structured routing patterns, utilizing OpenShell to configure agent identities and ensure safe sandboxed operations, and deploying and managing autonomous agents while building persistent skill libraries. Uses NVIDIA NemoClaw as reference stack and OpenShell as secure sandbox environment." },
  { name: "Deploy Faster Generative AI Models with NVIDIA NIM on GKE", provider: "Google Cloud + NVIDIA", status: "Enrolled and In Progress", subject: "Cloud AI / MLOps", description: "Hands-on experience with Google Kubernetes Engine (GKE) and NVIDIA NIM for AI inference tasks. Covers streamlining AI model deployment, optimizing inference performance on NVIDIA GPUs, and managing scalable AI workloads on Kubernetes." },
  { name: "Accelerated Machine Learning with Google Cloud and NVIDIA", provider: "Google Cloud + NVIDIA", status: "Enrolled and In Progress", subject: "Machine Learning / GPU Acceleration", description: "Learn to use NVIDIA cuDF and cuML within a Google Cloud Colab Enterprise environment to dramatically accelerate end-to-end machine learning workflows with zero code changes. Covers GPU-accelerated DataFrame operations and ML model training." },
  { name: "Beyond Sigma", provider: "Not Your College", status: "Enrolled and In Progress", subject: "AI Systems / Applied AI", description: "Structural framework covering the modern AI ecosystem from memory footprints to model training. Provides clear curriculum covering everything from model architecture to agentic engineering. Applied immediately by building custom AI from scratch combining NVIDIA NIM inference endpoints with pre-built agentic skills to engineer enterprise-scale solutions.", url: "https://notyourcollege.com/courses/beyondsigma" },
  { name: "Build My First Agent with Agent Development Kit (ADK)", provider: "Google", status: "Completed", subject: "AI Agent Engineering", description: "Hands-on training on Google Skills covering cloud technology and agent development using Google's Agent Development Kit (ADK). Covers building AI agents that can reason, plan, and take actions using Google Cloud infrastructure." },
] as const;

export const hackathons = [
  { name: "All Things Agentic Hackathon", status: "Registered", description: "Build next-generation agents that run in the background, handle the heavy lifting of massive datasets, and automate complex workflows asynchronously. Focused on agentic AI architectures designed for real-world production deployment." },
  { name: "Build with AI: Code for Communities: Second Edition", status: "Registered", organizer: "Google Cloud", description: "Google Cloud hackathon bringing together developers from across India to build AI-powered solutions for challenges shared across BRICS nations including healthcare supply chains, climate resilience, food security, and digital public infrastructure. Mission: mobilise India's developer ecosystem to build scalable, AI-driven solutions that address real socioeconomic, environmental, and governance challenges across BRICS nations." },
  { name: "Google Solution Challenge", status: "Preparing", organizer: "Google", description: "Global annual competition run by Google for university students. Mission: build a working software prototype that solves one or more of the United Nations 17 Sustainable Development Goals (SDGs) using Google technology including Gemini and Google Cloud." },
] as const;

export const memberships = [
  { organization: "NVIDIA Developer Program", role: "Member", description: "Active contributor on NVIDIA Developer Forums, networking with GPU experts, engaging in technical discussions, and contributing to the community. Active user of NVIDIA NGC enterprise portal for end-to-end AI and digital twin workflows.", url: "https://forums.developer.nvidia.com" },
  { organization: "Google Cloud and NVIDIA Community", role: "Member", description: "Active member of the joint Google Cloud and NVIDIA developer community, engaging with cloud-native AI tooling, GPU-accelerated computing resources, and collaborative developer events." },
  { organization: "Google GEAR Program", role: "Official Selected Member", description: "Officially selected for Google's Gemini Enterprise Agent Ready program. Building production-ready enterprise AI systems using Vertex AI and Agent Development Kit.", url: "https://g.dev/mantisdarling" },
  { organization: "GDG Atlanta: Google Developer Group", role: "Member", description: "Attended Google DevFest Atlanta 2026: Empowering Developers and Builders in the Agentic Era." },
  { organization: "GDG on Campus: Singapore Institute of Technology", role: "Member", location: "Singapore" },
  { organization: "GDG on Campus: Technical University of Munich", role: "Member", location: "Munich, Germany" },
  { organization: "GDG on Campus: ETH Zurich", role: "Member", location: "Zurich, Switzerland" },
  { organization: "GDG on Campus: Hult International Business School", role: "Member", location: "Cambridge, United States" },
  { organization: "GDG on Campus: Chennai Institute of Technology", role: "Member", location: "Chennai, India" },
] as const;

export const writing = {
  title: "Ethical Implications and Human Agency in the Age of Artificial Intelligence",
  platform: "LinkedIn Pulse",
  url: "https://www.linkedin.com/pulse/ethical-implications-human-agency-age-artificial-intelligence--joo2f/",
  description: "Published article exploring the ethical dimensions of AI development, human agency in automated decision-making systems, and the responsibilities of AI practitioners in shaping the future of technology and society. Covers topics including algorithmic bias, transparency, accountability, and the evolving relationship between human judgment and AI systems.",
} as const;

export const languages = ["Hindi: Native", "English: Proficient", "Russian: Learning"] as const;

export const interests = ["Chess: Plays competitively", "Checkers: Recreational", "Sudoku: Recreational", "AI Agents: Experiments with and builds AI agent systems", "Open Source: Active contributor and project admin", "Football: Plays recreationally", "Geopolitics: Strong interest in global affairs, diplomacy, and national security"] as const;

export const vision = {
  core: "I want to be known as an AI systems builder who ships real products.",
  shortTerm: ["Ship MANTIS to production and onboard first 100 mentors and learners", "Complete Google GEAR program and earn enterprise AI agent certification", "Participate in and complete All Things Agentic and Google Cloud BRICS hackathons", "Contribute meaningfully to open source through SSoC S5 and OSCI 26", "Build and launch personal portfolio website showcasing all projects"],
  longTerm: ["Build systems where human expertise and AI work as one, starting with MANTIS", "Design and implement a custom programming language", "Build a custom operating system from scratch", "Become a leading voice in AI systems engineering from India", "Scale MANTIS into the go-to platform for expert-led learning globally"],
  landingMessage: "I am not a tutorial follower. I build real systems that solve real problems. From an OS kernel with a neural network scheduler to a full-stack AI mentorship platform. I ship at every layer of the stack. I am a 1st year CS student at IIT Madras and I am already building production-grade software. Come build with me.",
} as const;
