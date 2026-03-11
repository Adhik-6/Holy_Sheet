
# Exccelerate
- Sheet Mind / ZyTable / Excel-orcist / Row-Bot / Holy Sheet

## Features
1. Query the Excel sheet via NLP to get results in Excel-like table format (display & downloadable result) (MVP)
2. Create a data visualization as asked (more like a B2B dashboard generator) (MVP)
3. An offline mode that uses SLM to answer simple queries (MVP)
4. Graceful degradation (MVP)
5. Generate a new Excel sheet (from single/multiple excel files/sheets) (MVP/Post MVP)
6. The AI must be able to answer follow-up questions (MVP / Post MVP)
7. Add an LLM Evaluation feature (show reasonings, confidence meter) (Post MVP)
8. Model capability (Post MVP)
9. prompt versioning (now or maybe for the future)
10. Undo / version History (now or maybe for the future)

An SaaS application that lets the user query the Excel sheet via NLP to get results in Excel-like table format (display & downloadable result), create a data visualization as asked, An offline mode that uses SLM to answer simple queries, and with LLM Evaluation feature (show reasonings, confidence meter).

## TODO
- [x] Use shadcn components for landing & other pages
- [ ] When doing PWA:
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
- [ ] Version your service worker cache to deal with updates properly.
- [ ] Modify the `history` in `/chat/page.tsx` to send only the summary instead of the whole data set.
- [ ] Add some other packages necessary for data analysis in pyodide loading phase.
- [ ] Add a loader for page reloads.
- [ ] Check if the functions are only imported from barrel files (`index.ts`). Add barrel files if needed.
- [ ] Fine tune the LLM to give only the python code It must not give answer for anything other than the data analysis field.
- [ ] Modify the system prompt such that LLM gives the summary in markdown format also make sure it uses safe characters.
- [x] Download table as excel files, fix the font color on pdf download.
- [x] Add a marigin to html tag on mobile view.
- [ ] Address the security issues related to `.env` varible exposure in frontend.
- [ ] Change logo and name.
- [ ] Modify next.config.ts according to building APK (also for capacitor.config.json)
- [ ] Update the filename and download URL for the SLM model in `models/page.tsx` (also make sure it matches the filename in the C++ code for loading the model), also in `lib/constants.ts`.
- [ ] Remove unnecessary lines from capacitor.config.ts for production build.
- [ ] Give a "Coming Soon" toast to unimplemented features when user tries to access them (like unimplemeted links).
- [ ] Changing metadata `android/app/src/main/res/values/strings.xml`.
- [ ] update model info in model manager page.
- [ ] Implemet PII Scrubber if possible.
- [ ] Tool-first prompting with hybrid approach:
    - total / average / top → tools
    - complex analysis → code 
- [ ] change SYSTEM_PROMPT & SLM_SYSTEM_PROMPT according to the `\client\app\(app)\chat\types.ts`
- [ ] The jey store creds are present in `D:\holy_sheet\client\android\app\build.gradle` - remove it.
- [ ] Settings must have mmap & gpu toggle for SLM.
- [ ] Different stop tokens for different SLMs.
- [ ] slm feedback to users so users don't think the app is frozen when SLM is doing its work.

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

The frontend expects the AI to return a JSON object matching this `AIResponse` type:
```typescript
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

## Syncing build with android
```bash
npm run build
npx cap sync
```

## To get Pyodide offline later
1. The solution is self hosting it. Unless you're using PWA.
2. Download the pyodide once:
```bash
mkdir public/pyodide
cd public/pyodide

curl -LO https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js
curl -LO https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.asm.wasm
curl -LO https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide_py.tar
curl -LO https://cdn.jsdelivr.net/pyodide/v0.25.0/full/repodata.json
```
3. The `public/pyodide` folder should now have all the necessary files.
4. In `.env.local`, set:
```
NEXT_PUBLIC_PYODIDE_INDEX=local
```
5. In `next.config.ts`, modify the webpack config if needed.
```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false, // Pyodide uses a virtual file system, not Node's fs
    };
    return config;
  },
};
export default nextConfig;
```

## Queries:
1. Generate Charts
- Bar Chart: "Show me total sales by Category."
- Pie Chart: "What is the distribution of sales across different Regions?"
- Line Chart: "Show me the monthly sales trend over the last year."

2. Generate KPIs
- "What is the total revenue and total profit?"
- "What is the average transaction value?"
- "What is the total number of units sold?"

3. Output as Tables
- "List the top 5 transactions with the highest Sales Amount."
- "Show me a table of all 'Electronics' sales in the 'North' region."

4. Summary (Markdown)
- "Summarize the performance of the 'Clothing' category." (The AI should write a text summary calculating total sales and average profit for clothing).

## Testing app on mobile
```bash
adb devices # outputs the connected device
npx cap sync
adb reverse tcp:3000 tcp:3000  # outputs: 3000 at last
npx cap open android # opens android studio
# Run the app from android studio
```
- To inscpect the logs go to: `chrome://inspect/#devices`

## Resetting the android Studio:
1. "Sync Project with Gradle Files" (Elephant icon in the header)
2. "Clean Project" (In the "Build" menu)
3. Click on the "Play" button to run the app again.

## Building APK
```bash
pnpm build
npx cap sync
npx cap open android
```
- In Android Studio, go to Build > Generate Signed Bundle / APK > APK.
- Follow the prompts to create a new keystore (or use an existing one) and set the key alias and passwords. DON'T click on "Next" button to finish.
- Click on "Build Variant" and select "release" to ensure you're building the release version of the APK.
### For updating the APK:
1. Run till `npx cap open android`.
2. Increment version number in `android/app/build.gradle` - `versionCode` and `versionName`. Then sync the gradle files.
3. Go to Build > Generate Signed Bundle / APK > APK and click next.
4. In that, select existing keystore and provide the path, alias and passwords. Then click on "Next" and select "release".
  - Get **Keystore password**, **Key alias**, and **Key password** from the `.env.local`.

### Updating APK after changing web code:
1. Bundle the Frontend
Run this in your terminal to compile your new prompt and copy it over to the Android folder:
```Bash
pnpm build
npx cap sync
```

2. Bump the Version (Crucial for the 2GB Model)
To ensure your phone treats this as an update and doesn't wipe your downloaded SLM, you must increment the version.
Open `android/app/build.gradle`.
Find versionCode and bump it up by 1 (e.g., from 3 to 4).
Click Sync Now.

3. Generate the APK
In Android Studio, go to Build > Generate Signed Bundle / APK... > APK.
Your keystore path, alias, and passwords should already be saved from last time. Just click Next, select release, and hit Create.

4. Install Safely
Once it finishes, open your terminal and push the update directly to your phone (which is still plugged in) using the replace flag:
```Bash
adb install -r ./app/release/app-release.apk
```

## Setting App icon:
1. Create your app icon (preferably a 1024x1024 PNG).
2. In Android Studio, locate the `res` directory under `android/app/src/main/res` and right-click, new > Image Asset.
3. Keep the Icon Type as "Launcher Icons (Adaptive and Legacy)", select "Image" as the Asset Type, and select the icon you created. 
4. use the "Scaling" slider right below the path to make sure your icon fits nicely inside the "Safe Zone" circle.
5. Optionally set background color to transparent or any color you want in the "Background Layer" tab.
6. Click Next. Android Studio will show you a preview of all the files it is about to overwrite. Click Finish.

## Summary of the Strategy
1. Dev Mode (pnpm dev):
- Action: Comment out output: 'export' in next.config.mjs.
- Action: Keep the async headers() block in next.config.mjs.
- Result: The Next.js dev server sends the correct headers. window.crossOriginIsolated will be true. You don't need the service worker here, but it won't hurt.

2. APK Mode (The Build):
- Action: Un-comment output: 'export'.
- Action: The coi-serviceworker.js will kick in. Since static files don't have headers, the Service Worker will reload the page once and inject them.
- Result: window.crossOriginIsolated becomes true (after a quick page reload on first launch).

## clean up
You can tell the Chrome/WebView engine on your phone to ignore the security requirement for your specific dev URL.
1. Open Chrome on your Android Phone.
2. Type chrome://flags in the address bar.
3. Search for "Experimental JavaScript SharedArrayBuffer".
4. Set it to Enabled.
5. Search for "Insecure origins treated as secure".
6. Enter your dev URL: http://localhost:3000 (or your IP if not using adb reverse).
7. Relaunch Chrome.
*Note:* Since Capacitor uses the "System WebView," this flag in Chrome sometimes carries over. If it doesn't, you may need to enable "Developer Options" in the WebView itself (this varies by Android version).
8. Remove `import android.webkit.WebView;` & `WebView.setWebContentsDebuggingEnabled(true);` from `android/app/src/main/java/com/chiggazz/holy_sheets/MainActivity.java` after this.
9. Fixing `C:\Users\adhik\bin` 
  - Let Android Studio successfully compile the Vulkan C++ shaders using the official Microsoft build tools.
  - Rename it back to bin immediately after the APK finishes generating. By renaming it back, whatever old application relied on that GCC compiler will continue working exactly as it did before. You just need it out of the way for this one specific compilation step.

## APK is found in
- You can find it here: `[Your Project Folder]/android/app/release/app-release.apk` _/
- (Or sometimes:) `[Your Project Folder]/android/app/build/outputs/apk/release/app-release.apk`

## Next Steps:
1. Folllow up with gemini's latest response on how to control the intelligence & speed. check if the follow up questions are working properly with SLM.
2. Depending on the previous step's result, Switch to qwen-coder-3b-q4 and test it again.
3. Once SLM is working properly, start building other pages. Also Authentication.

## Speed & Performance attributes:
1. Model Parameters - 1.5B/3B
2. Quantization Type - q4_k_m
3. Temperature - 0.1-0.5 for more deterministic, 0.5-1.0 for more creative.
4. nPredict - 512 (Recommended)
5. nThreads - 4 (Recommended for mobile considering the big.LITTLE architecture of ARM CPUs)
6. nCTX - 2048 (Recommended. Higher context windows can cause OOM crashes, while lower context windows limit the AI's ability to understand complex queries).
7. nBatch - 256 (Recommended for mobile. Higher batch sizes can cause OOM crashes, while lower batch sizes underutilize the GPU).
8. Hardware acceleration  - CPU/GPU (Vulkan). Default is CPU. GPU is recommended for high-end mobiles.
9. Flash Attention - Currently 'auto' (llama.cpp will decide based on hardware). No use if GPU is enabled, as flash attention is only for CPU. 
10. Sampling Parameters (top_k and top_p) - Only relevant for LLM.
11. KV Cache Quantization - Currently 'auto' (llama.cpp will decide based on hardware). 
12. Stop flags - Currently set to EOG token. Stops the model when it predicts the end of generation token. 
13. Mmap - currently true. This allows the model to load directly into RAM without fully decompressing, which saves time and storage space. However, it can cause issues on some devices, so we may need to add a toggle for this in the future.

Search if any other exists.

### gemini's response on flash attention and nBatch:
**Do this in future**
1. The Missing nBatch and flashAttn
You caught me keeping the training wheels on! I intentionally left them out of the nativeLlama.ts and the JNI bridge for two very specific reasons regarding your C++ code:

Why I left out nBatch:
If you look closely at the llama-jni.cpp code you provided earlier, your generation loop has this line hardcoded into it:
int n_batch = 128;
Your C++ for loop is explicitly doing its math based on chunks of 128 tokens. If I added nBatch to the TypeScript interface and passed 512 down to C++, we would have had to rewrite your C++ chunking logic. I wanted to guarantee your app compiled and didn't crash before we started messing with the C++ memory loop!

Why I left out flashAttn:
In recent versions of llama.cpp, Flash Attention is enabled by setting a boolean inside the context parameters (ctx_params.flash_attn = true;). However, depending on the exact week your llama.cpp repository was cloned, this parameter might not exist in the struct, which would cause a fatal C++ compile error. I prioritized getting your GPU and mmap working first, as those provide the biggest speed boosts.

If you want to wire them up now that you understand the flow, you absolutely can! Just add them to nativeLlama.ts, grab them in LlamaPlugin.java, and update your C++ struct and loop.

## How to correctly rebuild the C++ Plugin
Because you changed CMakeLists.txt, a standard JavaScript refresh (npx cap sync) will not compile the new C++ rules. You must force Android Studio to wipe its native cache and recompile the Vulkan libraries.

1. Open your terminal at the root of your project:
```Bash
pnpm build
npx cap sync
```

2. Open Android Studio.
3. In the top menu bar, click `Build > Clean Project`. Wait for the process at the bottom to finish.
4. In the top menu bar, click `Build > Rebuild Project`. (This step will take longer than usual because it is compiling the C++ Vulkan dependencies from scratch).
5. Generate your Signed APK and install it on your device.
   
## Compiling C++ code
1. Search "x64 Native Tools Command Prompt" in the start menu and open it.
2. Wait for the command prompt to initialize and the run `"C:\Program Files\Android\Android Studio\bin\studio64.exe"`
3. Delete the `.cxx` folder in `D:\holy_sheet\client\llama-capacitor\android` to clear the C++ cache.
4. In Android Studio, go to `build > clean project`, then rebuild project. This will force the C++ code to recompile with the new changes.

## Logcat keywords
1. LlamaJNI: Filters for every single custom log we wrote in the C++ bridge.
2. system info: Shows exactly what hardware flags llama.cpp successfully compiled and detected.
3. llama_kv_cache: Shows exactly how much RAM the context window is eating (Crucial for debugging Out of Memory crashes).
4. graph splits: The holy grail metric for Vulkan. If this says anything other than 1, the memory is bottlenecking.
5. llama_decode failed: The primary error thrown when the engine encounters corrupt text or runs out of processing bounds.
6. EOG token reached: Confirms the AI successfully decided to stop talking on its own, rather than being forcefully cut off.
7. llama.cpp

## ⚠️ Architecture Note: The "DotProd" Compilation Dilemma

### The Problem:
Modern ARM CPUs (Snapdragon, Dimensity) support dotprod instructions, which drastically accelerate llama.cpp inference. However, if we globally force the -march=armv8.2-a+dotprod flag in CMakeLists.txt, the Android NDK (Clang) weaves these instructions into the entire .so binary. If an older Android phone (ARMv8.0) attempts to load this binary, the OS detects "Illegal Instructions" and hard-crashes instantly.

### Why llama.cpp's Auto-Detection Fails on Android:
- llama.cpp has a built-in multi-target system intended to compile specific math files with dotprod attributes while keeping the rest of the binary safe. At runtime, it checks OS hardware capabilities and routes math accordingly.
- However, the Android NDK Clang cross-compiler strictly enforces the global baseline flag (-march=armv8-a). It actively strips out the dynamic dotprod function attributes during compilation. Because the fast instructions are physically deleted from the compiled .so file, the runtime detector falls back to standard NEON on all devices.

### Our Current Solution (Universal/Safe Baseline):
We have opted for a Universal build. We use -march=armv8-a globally in CMake.
- **Pros:** 100% crash-proof across all 64-bit Android devices. No graph-splitting bugs.
- **Cons:** Leaves ~25% CPU performance on the table for modern phones.

### Future Fix (For Scaling):
1. Do not attempt to fix this inside CMake. The correct Android engineering solution is to use Gradle Product Flavors.
2. The future developer should configure build.gradle to generate two distinct APKs:
  - app-universal (Built with standard flags).
  - app-fast (Built with forced dotprod flags).
3. By uploading both to the Google Play Store via an App Bundle, Google's servers will dynamically deliver the dotprod binary only to modern devices, giving us maximum speed without the crash risk.

### Build/Refresh Options:
1. Deleting `.cxx`: The Nuclear Option. CMake heavily caches its C++ build paths to save time. Deleting this folder forces Android Studio to forget everything and rebuild all 470+ llama.cpp files from absolute scratch. Only do this when you change CMakeLists.txt.
2. `Build > Clean Project`: The Standard Wipe. This deletes your compiled Java/Kotlin files (.class) and old APKs, but it usually leaves the C++ .cxx cache alone. Do this when your Android Java/Capacitor code is acting glitchy.
3. Sync Project with Gradle Files: The Librarian. This does not compile any code. It simply tells Android Studio to re-read your build.gradle files, download any missing dependencies, and link everything together in the IDE so you don't get red squiggly error lines.
4. Generate Signed APK: The Packager. This takes whatever is currently compiled, zips it up with your security keys, and creates the final .apk file that Android OS can actually install.
5. `pnpm build:mobile` (Next.js): The Web Compiler. This takes your Next.js code and compiles it into static HTML, CSS, and JavaScript, dumping it into an out/ folder.
6. `npx cap sync`: The Bridge. This copies your newly built Next.js out/ folder into Android Studio's assets/public folder, and updates any native iOS/Android plugins you installed.
7. `File > Invalidate Caches / Restart`: The Refresh Button. This is a catch-all for weird IDE bugs. It clears Android Studio's internal caches and restarts the whole program. Use this if your IDE is showing weird errors that don't make sense, or if the "Sync Project with Gradle Files" isn't fixing your red squiggly lines.
8. `npx cap copy`: The Manual Copier. This is a more manual version of `npx cap sync` that only copies web assets without touching native plugins. Use this if you only changed frontend code and want to skip the plugin syncing step or haven't installed any new npm pacakages.

## Benchmarking:

Prompt: `What is the total mark of the student named "Alice"?`
Data: `D:\holy_sheet\client\not-git\sample_data.xlsx` (6 columns, 193 rows)
Settings: 
1. Model Parameters - 3B
2. Quantization Type - q4_k_m
3. Temperature - 0.1
4. nPredict - 512
5. nThreads - 4
6. nCTX - 2048
7. nBatch - 256
8. Mmap - true

### CPU Vs GPU:

1. Prompt Evaluation (Reading the Prompt)
This is the "Prefill" phase where the engine reads your 578-token prompt (the System Prompt + the Excel Schema + your question) and converts it into mathematical context (the KV Cache).

| Metric | Pure CPU | Vulkan GPU | Winner |
|--------|----------|------------|--------|
| Start Time | 13:05:15.899 | 13:09:22.479 | - |
| End Time | 13:06:35.486 | 13:10:42.030 | - |
| Total Time Taken | 79.58 seconds | 79.55 seconds | Exact Tie |
| Speed | 7.26 tokens/sec | 7.26 tokens/sec | - |

2. Time to First Token
- CPU Gap: 13:06:35.486 ➡️ 13:06:35.489 (3 milliseconds)
- GPU Gap: 13:10:42.030 ➡️ 13:11:00.627 (18.6 SECONDS)
When running on pure CPU, the CPU reads the prompt and instantly starts writing the answer. When the GPU is engaged, the CPU acts as the "manager," reads the prompt, and then has to transfer all that state data over the internal UMA bridge to the GPU buffers. It took the phone nearly 19 seconds just to hand the baton to the GPU before it could even start typing.

3. Code Generation (Decoding)
This is the phase where the AI actually types out the Python script, one token at a time. Both runs generated approximately 162 tokens (based on the stop token hitting right after Token 160).
| Metric | Pure CPU | Vulkan GPU | Winner |
|--------|----------|------------|--------|
| Start (Token 0) | 13:06:35.489 | 13:11:00.627 | - |
| End (Stop Token) | 13:07:23.436 | 13:12:01.883 | - |
| Total Time Taken | 47.94 seconds | 61.25 seconds | CPU (27% Faster) |
| Generation Speed | ~3.38 tokens/sec | ~2.64 tokens/sec | CPU |

## last