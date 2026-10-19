// Preset Avatars for SkillSync with built-in SVG vector artwork

export interface PresetAvatar {
  id: string;
  name: string;
  role: string;
  accent: string;
  dataUrl: string;
}

const encodeSvg = (svg: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
};

export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: "alex-dev",
    name: "Alex",
    role: "Full-Stack Dev",
    accent: "#10B981",
    dataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="bg-alex" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#059669" />
            <stop offset="100%" stop-color="#064E3B" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="60" fill="url(#bg-alex)" />
        <path d="M26 120 C26 92 42 80 60 80 C78 80 94 92 94 120 Z" fill="#047857" />
        <path d="M42 88 C46 98 54 104 60 104 C66 104 74 98 78 88 Z" fill="#065F46" />
        <path d="M50 104 L48 116 M70 104 L72 116" stroke="#A7F3D0" stroke-width="2.5" stroke-linecap="round" />
        <rect x="52" y="70" width="16" height="15" rx="4" fill="#FBBF24" />
        <ellipse cx="60" cy="54" rx="22" ry="25" fill="#FCD34D" />
        <path d="M37 50 C36 32 46 22 60 22 C74 22 84 32 83 50 C80 37 72 32 60 32 C48 32 40 37 37 50 Z" fill="#1F2937" />
        <ellipse cx="51" cy="54" rx="2.5" ry="3.5" fill="#1F2937" />
        <ellipse cx="69" cy="54" rx="2.5" ry="3.5" fill="#1F2937" />
        <circle cx="52" cy="53" r="1" fill="#FFFFFF" />
        <circle cx="70" cy="53" r="1" fill="#FFFFFF" />
        <path d="M47 48 C49 46 54 46 56 48" stroke="#1F2937" stroke-width="2" stroke-linecap="round" fill="none" />
        <path d="M64 48 C66 46 71 46 73 48" stroke="#1F2937" stroke-width="2" stroke-linecap="round" fill="none" />
        <path d="M53 64 C56 68 64 68 67 64" stroke="#B45309" stroke-width="2.5" stroke-linecap="round" fill="none" />
        <rect x="36" y="52" width="3" height="7" rx="1.5" fill="#FFFFFF" />
        <rect x="81" y="52" width="3" height="7" rx="1.5" fill="#FFFFFF" />
      </svg>
    `),
  },
  {
    id: "maya-ai",
    name: "Maya",
    role: "AI Researcher",
    accent: "#8B5CF6",
    dataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="bg-maya" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#7C3AED" />
            <stop offset="100%" stop-color="#4C1D95" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="60" fill="url(#bg-maya)" />
        <path d="M26 120 C26 94 42 82 60 82 C78 82 94 94 94 120 Z" fill="#5B21B6" />
        <path d="M48 82 L60 96 L72 82 Z" fill="#DDD6FE" />
        <rect x="53" y="70" width="14" height="14" rx="3" fill="#D97706" />
        <ellipse cx="60" cy="54" rx="21" ry="24" fill="#F59E0B" />
        <!-- Sleek Bob Hair -->
        <path d="M36 58 C35 32 46 20 60 20 C74 20 85 32 84 58 C84 66 82 72 79 72 C77 66 76 50 76 42 C72 36 62 36 44 42 C44 50 43 66 41 72 C38 72 36 66 36 58 Z" fill="#18181B" />
        <!-- Glasses -->
        <rect x="44" y="49" width="13" height="11" rx="4" fill="none" stroke="#A78BFA" stroke-width="2" />
        <rect x="63" y="49" width="13" height="11" rx="4" fill="none" stroke="#A78BFA" stroke-width="2" />
        <line x1="57" y1="54" x2="63" y2="54" stroke="#A78BFA" stroke-width="2" />
        <!-- Eyes -->
        <circle cx="50.5" cy="54.5" r="2" fill="#18181B" />
        <circle cx="69.5" cy="54.5" r="2" fill="#18181B" />
        <circle cx="51.5" cy="53.5" r="0.8" fill="#FFFFFF" />
        <circle cx="70.5" cy="53.5" r="0.8" fill="#FFFFFF" />
        <!-- Smile -->
        <path d="M54 66 C56 69 64 69 66 66" stroke="#92400E" stroke-width="2" stroke-linecap="round" fill="none" />
        <!-- Neural Hairpin Sparkle -->
        <circle cx="75" cy="36" r="3" fill="#38BDF8" />
        <circle cx="75" cy="36" r="5" fill="#38BDF8" opacity="0.3" />
      </svg>
    `),
  },
  {
    id: "jordan-lead",
    name: "Jordan",
    role: "Tech Lead",
    accent: "#3B82F6",
    dataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="bg-jordan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2563EB" />
            <stop offset="100%" stop-color="#1E3A8A" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="60" fill="url(#bg-jordan)" />
        <path d="M24 120 C24 92 40 80 60 80 C80 80 96 92 96 120 Z" fill="#1E293B" />
        <path d="M48 80 L60 98 L72 80 Z" fill="#38BDF8" />
        <rect x="53" y="68" width="14" height="15" rx="3" fill="#E0A96D" />
        <ellipse cx="60" cy="52" rx="22" ry="24" fill="#F2C299" />
        <!-- Hair Short Modern -->
        <path d="M37 46 C37 26 47 18 60 18 C73 18 83 26 83 46 C80 34 70 30 60 30 C50 30 40 34 37 46 Z" fill="#292524" />
        <!-- Sleek rectangular glasses -->
        <rect x="43" y="47" width="14" height="9" rx="2" fill="none" stroke="#64748B" stroke-width="2" />
        <rect x="63" y="47" width="14" height="9" rx="2" fill="none" stroke="#64748B" stroke-width="2" />
        <line x1="57" y1="51" x2="63" y2="51" stroke="#64748B" stroke-width="2" />
        <circle cx="50" cy="51.5" r="2" fill="#1C1917" />
        <circle cx="70" cy="51.5" r="2" fill="#1C1917" />
        <path d="M44 44 L56 43" stroke="#292524" stroke-width="2.2" stroke-linecap="round" />
        <path d="M64 43 L76 44" stroke="#292524" stroke-width="2.2" stroke-linecap="round" />
        <path d="M53 63 C56 66 64 66 67 63" stroke="#A16207" stroke-width="2.2" stroke-linecap="round" fill="none" />
      </svg>
    `),
  },
  {
    id: "elena-pm",
    name: "Elena",
    role: "Product Lead",
    accent: "#F59E0B",
    dataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="bg-elena" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F59E0B" />
            <stop offset="100%" stop-color="#B45309" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="60" fill="url(#bg-elena)" />
        <path d="M26 120 C26 94 42 82 60 82 C78 82 94 94 94 120 Z" fill="#78350F" />
        <path d="M46 82 L60 102 L74 82 Z" fill="#FDE68A" />
        <rect x="53" y="70" width="14" height="14" rx="3" fill="#D97706" />
        <!-- Top Bun -->
        <circle cx="60" cy="22" r="13" fill="#451A03" />
        <ellipse cx="60" cy="54" rx="21" ry="24" fill="#FBBF24" />
        <!-- Hair strands -->
        <path d="M37 54 C37 32 46 26 60 26 C74 26 83 32 83 54 C78 40 70 34 60 34 C50 34 42 40 37 54 Z" fill="#451A03" />
        <!-- Eyes & Lashes -->
        <ellipse cx="50" cy="54" rx="2.5" ry="3" fill="#451A03" />
        <ellipse cx="70" cy="54" rx="2.5" ry="3" fill="#451A03" />
        <circle cx="51" cy="53" r="0.9" fill="#FFFFFF" />
        <circle cx="71" cy="53" r="0.9" fill="#FFFFFF" />
        <path d="M45 50 C48 48 53 48 55 51" stroke="#451A03" stroke-width="2" stroke-linecap="round" fill="none" />
        <path d="M65 51 C67 48 72 48 75 50" stroke="#451A03" stroke-width="2" stroke-linecap="round" fill="none" />
        <!-- Smile -->
        <path d="M52 65 C55 70 65 70 68 65" stroke="#92400E" stroke-width="2.5" stroke-linecap="round" fill="none" />
        <!-- Golden Hoop Earrings -->
        <circle cx="37" cy="58" r="4.5" fill="none" stroke="#FDE047" stroke-width="2" />
        <circle cx="83" cy="58" r="4.5" fill="none" stroke="#FDE047" stroke-width="2" />
      </svg>
    `),
  },
  {
    id: "kai-security",
    name: "Kai",
    role: "Cyber Security",
    accent: "#06B6D4",
    dataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="bg-kai" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0F172A" />
            <stop offset="100%" stop-color="#083344" />
          </linearGradient>
          <linearGradient id="visor-kai" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#06B6D4" />
            <stop offset="50%" stop-color="#22D3EE" />
            <stop offset="100%" stop-color="#38BDF8" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="60" fill="url(#bg-kai)" />
        <circle cx="60" cy="60" r="59" fill="none" stroke="#06B6D4" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.4" />
        <path d="M26 120 C26 92 42 80 60 80 C78 80 94 92 94 120 Z" fill="#0F172A" stroke="#06B6D4" stroke-width="1" />
        <rect x="53" y="68" width="14" height="15" rx="3" fill="#D4D4D8" />
        <ellipse cx="60" cy="52" rx="22" ry="24" fill="#E4E4E7" />
        <!-- Cyber Visor -->
        <rect x="36" y="45" width="48" height="15" rx="7" fill="url(#visor-kai)" />
        <line x1="42" y1="48" x2="78" y2="48" stroke="#FFFFFF" stroke-width="1.5" opacity="0.6" stroke-linecap="round" />
        <!-- Spiky Hair -->
        <path d="M36 45 C35 28 45 16 60 16 C75 16 85 28 84 45 C80 34 72 26 60 26 C48 26 40 34 36 45 Z" fill="#0284C7" />
        <path d="M50 16 L56 26 L62 14 L68 26" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" fill="none" />
        <!-- Smile -->
        <path d="M54 65 C56 68 64 68 66 65" stroke="#71717A" stroke-width="2" stroke-linecap="round" fill="none" />
      </svg>
    `),
  },
  {
    id: "priya-data",
    name: "Priya",
    role: "Data Scientist",
    accent: "#EC4899",
    dataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="bg-priya" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#DB2777" />
            <stop offset="100%" stop-color="#831843" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="60" fill="url(#bg-priya)" />
        <path d="M26 120 C26 94 42 82 60 82 C78 82 94 94 94 120 Z" fill="#9D174D" />
        <path d="M48 82 L60 98 L72 82 Z" fill="#FCE7F3" />
        <rect x="53" y="70" width="14" height="14" rx="3" fill="#B45309" />
        <ellipse cx="60" cy="54" rx="21" ry="24" fill="#D97706" />
        <!-- Long Wavy Hair -->
        <path d="M35 56 C34 32 46 22 60 22 C74 22 86 32 85 56 C85 76 78 88 76 88 C74 80 77 64 76 48 C70 38 60 36 44 48 C43 64 46 80 44 88 C42 88 35 76 35 56 Z" fill="#1C1917" />
        <!-- Modern wireframe glasses -->
        <circle cx="49" cy="54" r="7" fill="none" stroke="#F472B6" stroke-width="1.8" />
        <circle cx="71" cy="54" r="7" fill="none" stroke="#F472B6" stroke-width="1.8" />
        <line x1="56" y1="54" x2="64" y2="54" stroke="#F472B6" stroke-width="1.8" />
        <circle cx="49" cy="54" r="2" fill="#1C1917" />
        <circle cx="71" cy="54" r="2" fill="#1C1917" />
        <!-- Smile -->
        <path d="M53 66 C56 69 64 69 67 66" stroke="#78350F" stroke-width="2.2" stroke-linecap="round" fill="none" />
      </svg>
    `),
  },
  {
    id: "lucas-cloud",
    name: "Lucas",
    role: "Cloud Architect",
    accent: "#0EA5E9",
    dataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="bg-lucas" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0284C7" />
            <stop offset="100%" stop-color="#0369A1" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="60" fill="url(#bg-lucas)" />
        <path d="M26 120 C26 92 42 80 60 80 C78 80 94 92 94 120 Z" fill="#1E293B" />
        <path d="M46 80 C50 88 56 94 60 94 C64 94 70 88 74 80 Z" fill="#38BDF8" />
        <rect x="52" y="70" width="16" height="14" rx="4" fill="#FBBF24" />
        <ellipse cx="60" cy="54" rx="22" ry="25" fill="#FCD34D" />
        <!-- Pompadour / Modern fade -->
        <path d="M38 48 C37 30 45 20 58 20 C72 20 83 26 83 48 C80 34 72 28 60 28 C48 28 41 34 38 48 Z" fill="#451A03" />
        <ellipse cx="51" cy="54" rx="2.5" ry="3.5" fill="#1F2937" />
        <ellipse cx="69" cy="54" rx="2.5" ry="3.5" fill="#1F2937" />
        <circle cx="52" cy="53" r="1" fill="#FFFFFF" />
        <circle cx="70" cy="53" r="1" fill="#FFFFFF" />
        <path d="M47 48 C49 46 54 46 56 48" stroke="#451A03" stroke-width="2" stroke-linecap="round" fill="none" />
        <path d="M64 48 C66 46 71 46 73 48" stroke="#451A03" stroke-width="2" stroke-linecap="round" fill="none" />
        <path d="M52 64 C55 68 65 68 68 64" stroke="#B45309" stroke-width="2.5" stroke-linecap="round" fill="none" />
      </svg>
    `),
  },
  {
    id: "spark-bot",
    name: "Spark AI",
    role: "Synthetic Agent",
    accent: "#14B8A6",
    dataUrl: encodeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="bg-spark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0F172A" />
            <stop offset="100%" stop-color="#134E4A" />
          </linearGradient>
          <linearGradient id="face-spark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1E293B" />
            <stop offset="100%" stop-color="#0F172A" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="60" fill="url(#bg-spark)" />
        <circle cx="60" cy="60" r="58" fill="none" stroke="#2DD4BF" stroke-width="1.5" opacity="0.3" stroke-dasharray="3 5" />
        <!-- Bot Body -->
        <path d="M32 120 C32 96 44 86 60 86 C76 86 88 96 88 120 Z" fill="#334155" />
        <rect x="52" y="76" width="16" height="12" rx="3" fill="#64748B" />
        <!-- Antenna -->
        <line x1="60" y1="20" x2="60" y2="34" stroke="#2DD4BF" stroke-width="3" stroke-linecap="round" />
        <circle cx="60" cy="18" r="5" fill="#2DD4BF" />
        <circle cx="60" cy="18" r="8" fill="#2DD4BF" opacity="0.3" />
        <!-- Head -->
        <rect x="34" y="32" width="52" height="46" rx="14" fill="url(#face-spark)" stroke="#2DD4BF" stroke-width="2.5" />
        <!-- Glowing Visor / Eyes -->
        <rect x="42" y="44" width="36" height="16" rx="6" fill="#042F2E" />
        <circle cx="50" cy="52" r="3.5" fill="#2DD4BF" />
        <circle cx="70" cy="52" r="3.5" fill="#2DD4BF" />
        <circle cx="51" cy="51" r="1.2" fill="#FFFFFF" />
        <circle cx="71" cy="51" r="1.2" fill="#FFFFFF" />
        <!-- Smile LED -->
        <path d="M52 66 Q60 70 68 66" stroke="#2DD4BF" stroke-width="2" stroke-linecap="round" fill="none" />
      </svg>
    `),
  },
];
