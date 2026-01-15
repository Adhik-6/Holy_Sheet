
# Exccelerate
- Sheet Mind / ZyTable / Excel-orcist / Row-Bot / Holy Sheet

## Features
1. Query the Excel sheet via NLP to get results in Excel-like table format (display & downloadable result) (MVP)
2. Create a data visualization as asked (more like a B2B dashboard generator) (MVP)
3. An offline mode that uses SLM to answer simple queries (MVP)
4. Graceful degradation (MVP)
5. Generate a new Excel sheet (from single / multiple excel files / sheets) (MVP / Post MVP)
6. The AI must be able to answer follow-up questions (MVP / Post MVP)
7. Add an LLM Evaluation feature (show reasonings, confidence meter) (Post MVP)
8. Model capability (Post MVP)
9. prompt versioning (now or maybe for the future)
10. Undo / version History (now or maybe for the future)

An SaaS application that lets the user query the Excel sheet via NLP to get results in Excel-like table format (display & downloadable result), create a data visualization as asked, An offline mode that uses SLM to answer simple queries, and with LLM Evaluation feature (show reasonings, confidence meter).

## TODO
1. Use shadcn components for landing & other pages
2. When doing PWA:
```js
// next.config.mjs
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  // This tells the PWA to aggressively cache the pyodide folder
  runtimeCaching: [
    {
      urlPattern: /\/pyodide\/.*\.(js|wasm|zip|whl)$/,
      handler: "CacheFirst", // "If I have it, don't even check the internet"
      options: {
        cacheName: "offline-pyodide-cache",
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 365 } // Cache for 1 year
      },
    },
  ],
});
```

## Prompt
A futuristic, highly immersive SaaS website for an "AI Data Analyst Agent" PWA. It must have a landing page denoting the features it has. The design should feel "alive" and responsive, utilizing fluid motion to guide the user's attention without sacrificing performance.
Aesthetic Style:
"Cinematic Minimalism." Think linear-gradient borders, deep frosted glass layers (glassmorphism), and ambient lighting effects.

Theme: Deep midnight blue/charcoal background with neon purple and cyan accent glows that pulse gently to indicate AI activity.
Texture: Subtle noise textures on card backgrounds to add tactile depth.
Typography: Crisp, monospaced fonts for data (e.g., JetBrains Mono) paired with a modern sans-serif (e.g., Geist or Inter) for UI text.
Animation & Interaction Specs (Crucial):

Micro-interactions: Buttons should have subtle "squeeze" or glow effects on press. Hovering over table rows should trigger a smooth highlight reveal (spotlight effect).
Transitions: The interface should use "layout projection" (like Framer Motion) where elements morph smoothly between states rather than just popping in.
Efficiency: Animations must be buttery smooth (60fps) but short duration (under 300ms) to feel snappy, not sluggish.

It has the following features:
1. Query the Excel sheet via NLP to get results in Excel-like table format (display & downloadable result)
2. Create a data visualization as asked (more like a B2B dashboard generator)
3. An offline mode that uses SLM to answer simple queries
4. Graceful degradation
5. Generate a new Excel sheet (from single/multiple excel files/sheets)
6. The AI must be able to answer follow-up questions so it must look more like a chat interface.
7. Add an LLM Evaluation feature (show reasonings, confidence meter)

Only use the following stack: frontend framework: Next.js + Tanstack Query, designing library: Shadcn UI, data visualization library: Shadcn Charts

## Theme
```css
@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
}

:root {
  --radius: 0.625rem;

  /* Base (Light mode – still cinematic, not white-white) */
  --background: oklch(0.985 0.01 250);
  --foreground: oklch(0.18 0.02 270);

  --card: oklch(0.98 0.01 250);
  --card-foreground: oklch(0.18 0.02 270);

  --popover: oklch(0.97 0.015 250);
  --popover-foreground: oklch(0.18 0.02 270);

  /* AI Cyan */
  --primary: oklch(0.72 0.16 200);
  --primary-foreground: oklch(0.12 0.02 260);

  /* Soft neutral layer */
  --secondary: oklch(0.94 0.015 260);
  --secondary-foreground: oklch(0.22 0.02 270);

  --muted: oklch(0.94 0.015 260);
  --muted-foreground: oklch(0.55 0.04 260);

  /* Neon Purple Accent */
  --accent: oklch(0.68 0.18 300);
  --accent-foreground: oklch(0.98 0.01 260);

  --destructive: oklch(0.62 0.22 25);

  /* Glass borders & focus rings */
  --border: oklch(0.85 0.02 260 / 40%);
  --input: oklch(0.85 0.02 260 / 35%);
  --ring: oklch(0.72 0.16 200 / 70%);

  /* Charts – cyber-data friendly */
  --chart-1: oklch(0.72 0.16 200); /* cyan */
  --chart-2: oklch(0.68 0.18 300); /* purple */
  --chart-3: oklch(0.75 0.14 160); /* mint */
  --chart-4: oklch(0.78 0.18 80);  /* amber */
  --chart-5: oklch(0.65 0.22 20);  /* red */

  /* Sidebar */
  --sidebar: oklch(0.97 0.015 250);
  --sidebar-foreground: oklch(0.18 0.02 270);
  --sidebar-primary: oklch(0.72 0.16 200);
  --sidebar-primary-foreground: oklch(0.12 0.02 260);
  --sidebar-accent: oklch(0.68 0.18 300);
  --sidebar-accent-foreground: oklch(0.98 0.01 260);
  --sidebar-border: oklch(0.85 0.02 260 / 40%);
  --sidebar-ring: oklch(0.72 0.16 200 / 70%);
}

/* 🌌 DARK MODE — Main Character Energy */
.dark {
  /* Midnight / Charcoal base */
  --background: oklch(0.13 0.03 260);
  --foreground: oklch(0.97 0.01 260);

  /* Glassmorphic surfaces */
  --card: oklch(0.18 0.04 260 / 85%);
  --card-foreground: oklch(0.97 0.01 260);

  --popover: oklch(0.18 0.04 260 / 90%);
  --popover-foreground: oklch(0.97 0.01 260);

  /* Neon cyan = AI activity */
  --primary: oklch(0.75 0.18 200);
  --primary-foreground: oklch(0.12 0.02 260);

  /* Secondary glass layer */
  --secondary: oklch(0.24 0.04 260);
  --secondary-foreground: oklch(0.97 0.01 260);

  --muted: oklch(0.22 0.03 260);
  --muted-foreground: oklch(0.65 0.05 260);

  /* Neon purple glow */
  --accent: oklch(0.7 0.22 300);
  --accent-foreground: oklch(0.98 0.01 260);

  --destructive: oklch(0.68 0.22 25);

  /* Luminous borders & focus */
  --border: oklch(0.6 0.06 260 / 25%);
  --input: oklch(0.6 0.06 260 / 30%);
  --ring: oklch(0.75 0.18 200 / 80%);

  /* Charts — neon but readable */
  --chart-1: oklch(0.75 0.18 200);
  --chart-2: oklch(0.7 0.22 300);
  --chart-3: oklch(0.78 0.16 160);
  --chart-4: oklch(0.8 0.18 90);
  --chart-5: oklch(0.68 0.22 20);

  /* Sidebar */
  --sidebar: oklch(0.16 0.03 260);
  --sidebar-foreground: oklch(0.97 0.01 260);
  --sidebar-primary: oklch(0.75 0.18 200);
  --sidebar-primary-foreground: oklch(0.12 0.02 260);
  --sidebar-accent: oklch(0.7 0.22 300);
  --sidebar-accent-foreground: oklch(0.98 0.01 260);
  --sidebar-border: oklch(0.6 0.06 260 / 25%);
  --sidebar-ring: oklch(0.75 0.18 200 / 80%);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## Referesher prompt
I am building **ExcelGPT**, an AI Data Analyst Chatbot using **Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn UI, Framer Motion, and Recharts**.**Current Status:**

The Frontend UI is 60% complete with a "Cyberpunk/Neon" aesthetic.- **InputArea:** Auto-expanding text area with a "Staged File" preview (supports CSV/XLSX).- **ChatArea:** Displays an animated "ExcelGPT" glowing title when empty.- **ChatMessage:** Renders Markdown text OR specific UI Widgets based on the JSON response.- **Widgets:** I have `DataChart` (Recharts with neon palette), `DataTable` (Sticky headers, glowing borders), and `KPIGrid`.**The Data Structure (Important):**

The frontend expects the AI to return a JSON object matching this `AIResponse` type:```typescript

// types.ts

export type ChartPayload = {

  config: {

    type: 'bar' | 'line' | 'pie';

    title: string;

    xAxisKey: string;

    series: { dataKey: string; label: string; color?: string }[];

  };

  data: any[];

};



export type TableData = {

  headers: string[];

  rows: string[][];

};



export type KPI = {

  label: string;

  value: string;

  trend?: string;

  status?: 'positive' | 'negative' | 'neutral';

};



export type AIResponse = 

  | { type: 'markdown'; summary: string }

  | { type: 'chart'; summary: string; data: ChartPayload }

  | { type: 'table'; summary: string; data: TableData }

  | { type: 'kpi'; summary: string; data: KPI[] };



export interface Message {

  id: string;

  role: 'user' | 'assistant';

  content: string | AIResponse;

  timestamp: string;

  attachment?: { name: string; size: number; type: string };

}

```

My Goal:

Now I need to implement logic for AI layer. We're gonna be implementing RAG 2.0. The 2 types of AIs we're gonna use are LLM & SLM (for simple & offline queries). So frontend has a option that let's user to decide between which model to use as per their convinent. So The AI layer must be independent (changing the model (LLM/SLM) should not cause errors to the frontend).  I guess we'll most likely be using APIs to call the LLMs, so if the user opted for online model, we'll call the API, if user opts for SLM, we'll make sure the model is loaded in the frontend (user's browser) and install it (if not downloaded) then query it. Since its a offline feature, we'll keep this AI layer in the frontend. The LLM API call will be directly thrown to the LLM itself, it first reaches our servers (backend) then actual LLM API.

The frontend gives us the file (let's prototype only using xlsx for now). We definetely can't upload the entire excel sheet to the LLM/SLM (sounds very ineffecient) so we'll just upload the column names and a few rows for example. The problem is deciding on the structure of the response from the AI for different requriements (data visualization, only summary, excel table output, kpis). 

How will we implement RAG 2.0 (Agentic RAG) here? I've previously told that the LLM looks at its own response, verifies it, reasons through it, rectifies it iteratively. 

Also previously i've been told we will ask the LLM to give us a python script and run the given scripts via pyodide in the browser itself. The python is good at handling tasks related to data stuff.

We'll first start by discussing the approaches we're gonna take, don't jump into coding right off the bat.