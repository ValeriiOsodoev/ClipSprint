export type Lang = "ru" | "en";

export const DEFAULT_LANG: Lang = "ru";
export const LANG_STORAGE_KEY = "ysk_lang";

// Helper to get text by language (for simple {en, ru} objects)
export function t<T>(obj: { en: T; ru: T }, lang: Lang): T {
  return obj[lang];
}

// ============================================
// Translated content getters
// ============================================

export function getNavTexts(lang: Lang) {
  return lang === "en" 
    ? {
        home: "Home",
        scriptKit: "Script Generator",
        retentionDoctor: "Retention Fixer",
        clipFactory: "Clip Finder",
        silenceCutter: "Silence Remover",
        brandTagline: "AI Tools for Creators",
        signIn: "Sign in",
        signOut: "Sign out",
      }
    : {
        home: "Главная",
        scriptKit: "Генератор скриптов",
        retentionDoctor: "Исправление удержания",
        clipFactory: "Поиск клипов",
        silenceCutter: "Удаление пауз",
        brandTagline: "Инструменты для ютуберов",
        signIn: "Войти",
        signOut: "Выйти",
      };
}

export function getHeroTexts(lang: Lang) {
  return lang === "en"
    ? {
        badge: "🚀 Free tools for YouTube creators",
        headline1: "Scripts, clips, silence removal —",
        headline2: "all in one place.",
        subheadline:
          "Four AI tools: generate scripts, fix retention, find clips, or auto-remove silence from videos.",
        ctaPrimary: "Generate Script",
        ctaSecondary: "Remove Silence",
        bullets: [
          { icon: "🎯", text: "15 titles labeled by intent (SEO/click/balanced)" },
          { icon: "✂️", text: "10 clip candidates from any transcript" },
          { icon: "🔇", text: "Auto-remove silence, keep natural pacing" },
        ],
      }
    : {
        badge: "🚀 Бесплатные инструменты для ютуберов",
        headline1: "Скрипты, клипы, удаление пауз —",
        headline2: "всё в одном месте.",
        subheadline:
          "Четыре AI-инструмента: генерируй скрипты, исправляй удержание, находи клипы или удаляй паузы из видео.",
        ctaPrimary: "Создать скрипт",
        ctaSecondary: "Удалить паузы",
        bullets: [
          { icon: "🎯", text: "15 заголовков с метками (SEO/кликбейт/баланс)" },
          { icon: "✂️", text: "10 клипов из любого транскрипта" },
          { icon: "🔇", text: "Авто-удаление пауз с естественным темпом" },
        ],
      };
}

export function getSocialProofTexts(lang: Lang) {
  return lang === "en"
    ? {
        heading: "Why builders use it",
        items: [
          {
            icon: "⏱️",
            title: "Save hours per video",
            description: "Stop spending 2 hours on titles and hooks. Get 15 options in under a minute.",
          },
          {
            icon: "📈",
            title: "Fix retention, not symptoms",
            description: "Identify exactly where viewers drop off and get rewritten sections, not vague tips.",
          },
          {
            icon: "🎯",
            title: "Structure, not fluff",
            description: "Timestamped outlines that fit your video length. Pattern interrupts with exact lines to say.",
          },
        ],
      }
    : {
        heading: "Почему это работает",
        items: [
          {
            icon: "⏱️",
            title: "Экономь часы на каждом видео",
            description: "Не трать 2 часа на заголовки и хуки. Получи 15 вариантов меньше чем за минуту.",
          },
          {
            icon: "📈",
            title: "Чини удержание, а не симптомы",
            description: "Найди точные места, где зрители уходят, и получи готовые переписанные абзацы.",
          },
          {
            icon: "🎯",
            title: "Структура, а не вода",
            description: "Таймкоды под твою длину видео. Паттерн-интерапты с точными фразами.",
          },
        ],
      };
}

export function getToolsTexts(lang: Lang) {
  return lang === "en"
    ? {
        heading: "Four tools. Zero fluff.",
        subheading:
          "Generate scripts, fix retention, find clips, or remove silence. Each tool produces ready-to-use output — not generic advice.",
        whatYouGet: "What you get",
        howItWorks: "How it works",
        exampleOutput: "Example output",
        badgeGenerate: "Generate",
        badgeAnalyze: "Analyze",
        badgeClips: "Clips",
        badgeCut: "Cut",
      }
    : {
        heading: "Четыре инструмента. Ноль воды.",
        subheading:
          "Генерируй скрипты, исправляй удержание, находи клипы или удаляй паузы. Каждый инструмент выдаёт готовый результат — не советы.",
        whatYouGet: "Что получишь",
        howItWorks: "Как это работает",
        exampleOutput: "Пример результата",
        badgeGenerate: "Генерация",
        badgeAnalyze: "Анализ",
        badgeClips: "Клипы",
        badgeCut: "Обрезка",
      };
}

export function getToolConfigsTexts(lang: Lang) {
  return lang === "en"
    ? {
        scriptKit: {
          name: "Script Generator",
          tagline: "From topic to ready-to-record script in 60 seconds",
          ctaText: "Generate Script",
          features: [
            "15 titles labeled SEO / click / balanced",
            "10 hook openings (5–15 sec each)",
            "Timestamped outline for 2/5/10/20 min videos",
            "Intro + CTA tailored to your goal (views/subs/sales)",
            "Output in Russian or English",
          ],
          steps: [
            { title: "Enter your niche & topic", description: "e.g., 'Programming' + 'How to learn Python in 2024'" },
            { title: "Pick duration, style & goal", description: "2–20 min, calm or energetic, optimize for views/subs/sales" },
            { title: "Copy & record", description: "Get titles, hooks, outline, intro, and CTA — ready to use" },
          ],
          exampleOutput: [
            '→ Title (SEO): "How to Learn Python in 2024 — Complete Roadmap"',
            '→ Hook: "If you start learning Python today without a plan..."',
            "→ Outline: 0:00 Hook → 0:45 Why Python → 2:30 Roadmap → ...",
          ],
        },
        retentionDoctor: {
          name: "Retention Fixer",
          tagline: "Find and fix the moments where viewers leave",
          ctaText: "Fix My Script",
          features: [
            "Drop-off map: weak sections flagged with reasons",
            "Tight script: same message, no filler",
            "Pattern interrupts every N seconds (you choose)",
            "B-roll & visual insert suggestions with timestamps",
            "Copy-paste ready rewrites for each weak section",
          ],
          steps: [
            { title: "Paste your script", description: "Any length — works best with 2–20 min scripts" },
            { title: "Set video length & interrupt frequency", description: "Choose how often you want attention resets (20–60 sec)" },
            { title: "Review & apply fixes", description: "Copy rewrites, add interrupts, plan your B-roll" },
          ],
          exampleOutput: [
            "⚠️ 2:15–2:45: Low energy section. Rewrite: ...",
            '🔄 3:00: "Let me show you something unexpected..."',
            "🎬 4:30: B-roll idea: screen recording of the error",
          ],
        },
        clipFactory: {
          name: "Clip Finder",
          tagline: "Turn long transcripts into 10 short-form clips with timestamps",
          ctaText: "Find Clips",
          features: [
            "10 high-quality clip candidates with timestamps",
            "Cold open line + subtitles for each clip",
            "Export EDL for Premiere/DaVinci import",
            "Works with YouTube Shorts, Reels, TikTok",
            "Profanity detection and filtering",
          ],
          steps: [
            { title: "Paste timestamped transcript", description: "From podcasts, streams, interviews, tutorials" },
            { title: "Set duration and style", description: "Choose 15-60 sec clips, calm or energetic" },
            { title: "Export & edit", description: "Copy subtitles, download EDL, import into your editor" },
          ],
          exampleOutput: [
            '→ Clip #1: 12:34-13:15 "The moment everything changed"',
            '→ Cold open: "Nobody expected this to happen..."',
            "→ Subtitles: 6 lines, mobile-friendly",
          ],
        },
        silenceCutter: {
          name: "Silence Remover",
          tagline: "Remove silence from videos automatically, keep natural pacing",
          ctaText: "Remove Silence",
          features: [
            "Auto-detect speech vs silence using transcription",
            "AI-powered cut parameter tuning for natural results",
            "Export trimmed MP4 directly in browser",
            "Download EDL for Premiere/DaVinci import",
            "Works locally — your video never leaves your device",
          ],
          steps: [
            { title: "Upload your video", description: "MP4, MOV, WebM — any talking-head, tutorial, podcast" },
            { title: "Choose cut style", description: "Gentle, normal, or aggressive — adjust naturalness slider" },
            { title: "Export trimmed video", description: "Download MP4 or EDL for your editor" },
          ],
          exampleOutput: [
            "→ Original: 10:32 → Trimmed: 8:15 (21% removed)",
            "→ 23 cuts detected, natural pacing preserved",
            "→ Export: MP4 / JSON / EDL",
          ],
        },
      }
    : {
        scriptKit: {
          name: "Генератор скриптов",
          tagline: "От темы до готового скрипта за 60 секунд",
          ctaText: "Создать скрипт",
          features: [
            "15 заголовков с метками SEO / кликбейт / баланс",
            "10 вариантов хуков (5–15 сек каждый)",
            "Структура с таймкодами для видео 2/5/10/20 мин",
            "Интро + призыв к действию под твою цель (просмотры/подписки/продажи)",
            "Вывод на русском или английском",
          ],
          steps: [
            { title: "Укажи нишу и тему", description: "напр., 'Программирование' + 'Как выучить Python в 2024'" },
            { title: "Выбери длину, стиль и цель", description: "2–20 мин, спокойный или энергичный, под просмотры/подписки/продажи" },
            { title: "Копируй и записывай", description: "Получи заголовки, хуки, структуру, интро и CTA — готово к записи" },
          ],
          exampleOutput: [
            '→ Заголовок (SEO): "Как выучить Python в 2024 — Полный план"',
            '→ Хук: "Если ты начнёшь учить Python сегодня без плана..."',
            "→ Структура: 0:00 Хук → 0:45 Почему Python → 2:30 Роадмап → ...",
          ],
        },
        retentionDoctor: {
          name: "Исправление удержания",
          tagline: "Найди и исправь моменты, где зрители уходят",
          ctaText: "Проверить скрипт",
          features: [
            "Карта оттока: слабые места с объяснением причин",
            "Сжатый скрипт: тот же смысл, без воды",
            "Паттерн-интерапты каждые N секунд (ты выбираешь)",
            "Идеи для B-roll и визуальных вставок с таймкодами",
            "Готовые переписанные версии слабых мест",
          ],
          steps: [
            { title: "Вставь свой скрипт", description: "Любая длина — лучше всего работает с 2–20 мин" },
            { title: "Укажи длину видео и частоту интерраптов", description: "Как часто сбрасывать внимание зрителя (20–60 сек)" },
            { title: "Применяй исправления", description: "Копируй переписанные части, добавляй интерапты, планируй B-roll" },
          ],
          exampleOutput: [
            "⚠️ 2:15–2:45: Низкая энергия. Переписано: ...",
            '🔄 3:00: "Дай покажу кое-что неожиданное..."',
            "🎬 4:30: B-roll идея: запись экрана с ошибкой",
          ],
        },
        clipFactory: {
          name: "Поиск клипов",
          tagline: "Превращает длинный транскрипт в 10 коротких клипов с таймкодами",
          ctaText: "Найти клипы",
          features: [
            "10 качественных клипов с таймкодами",
            "Первая фраза + субтитры для каждого клипа",
            "Экспорт EDL для Premiere/DaVinci",
            "Для YouTube Shorts, Reels, TikTok",
            "Определение и фильтрация мата",
          ],
          steps: [
            { title: "Вставь транскрипт с таймкодами", description: "Из подкастов, стримов, интервью, туториалов" },
            { title: "Укажи длительность и стиль", description: "Клипы 15-60 сек, спокойный или энергичный" },
            { title: "Экспортируй и монтируй", description: "Копируй субтитры, скачай EDL, импортируй в редактор" },
          ],
          exampleOutput: [
            '→ Клип #1: 12:34-13:15 "Момент, когда всё изменилось"',
            '→ Первая фраза: "Никто не ожидал, что это случится..."',
            "→ Субтитры: 6 строк, удобно для мобильных",
          ],
        },
        silenceCutter: {
          name: "Удаление пауз",
          tagline: "Автоматическое удаление тишины из видео с сохранением темпа",
          ctaText: "Удалить паузы",
          features: [
            "Автоматическое определение речи и пауз по транскрипции",
            "AI-подбор параметров для естественного результата",
            "Экспорт обрезанного MP4 прямо в браузере",
            "Скачивание EDL для Premiere/DaVinci",
            "Работает локально — видео не покидает устройство",
          ],
          steps: [
            { title: "Загрузите видео", description: "MP4, MOV, WebM — разговорное, туториал, подкаст" },
            { title: "Выберите стиль обрезки", description: "Мягкий, обычный или агрессивный — настройте естественность" },
            { title: "Экспортируйте результат", description: "Скачайте MP4 или EDL для вашего редактора" },
          ],
          exampleOutput: [
            "→ Исходное: 10:32 → Обрезанное: 8:15 (удалено 21%)",
            "→ 23 разреза, естественный темп сохранён",
            "→ Экспорт: MP4 / JSON / EDL",
          ],
        },
      };
}

export function getHowToUseTexts(lang: Lang) {
  return lang === "en"
    ? {
        heading: "From idea to script in 3 steps",
        steps: [
          { step: "1", title: "Pick your tool", description: "Script Kit for new videos, Retention Doctor for existing scripts.", color: "blue" },
          { step: "2", title: "Enter your content", description: "Paste your topic idea or full script. Set duration and style.", color: "purple" },
          { step: "3", title: "Copy & record", description: "Get structured output. Copy what you need. Start filming.", color: "green" },
        ],
        historyNote: "Your history is saved locally. Past generations are stored in your browser — no account needed, nothing sent to our servers.",
      }
    : {
        heading: "От идеи до скрипта за 3 шага",
        steps: [
          { step: "1", title: "Выбери инструмент", description: "Script Kit для новых видео, Retention Doctor для готовых скриптов.", color: "blue" },
          { step: "2", title: "Введи контент", description: "Вставь тему или готовый скрипт. Укажи длину и стиль.", color: "purple" },
          { step: "3", title: "Копируй и записывай", description: "Получи структурированный результат. Копируй. Снимай.", color: "green" },
        ],
        historyNote: "История сохраняется локально. Прошлые генерации хранятся в браузере — без аккаунта, ничего не уходит на сервер.",
      };
}

export function getWhyNotGenericTexts(lang: Lang) {
  return lang === "en"
    ? {
        heading: "This isn't generic AI writing",
        subheading: "ChatGPT gives you paragraphs. We give you structured, labeled, timestamped output built for YouTube.",
        items: [
          { icon: "🏷️", title: "Titles labeled by intent", description: "Every title is marked SEO, click, or balanced — so you know what you're optimizing for." },
          { icon: "⏰", title: "Outlines fit your duration", description: "Pick 2, 5, 10, or 20 minutes. Timestamps are calculated to match, not guessed." },
          { icon: "🔄", title: "Pattern interrupts with timing", description: "Get exact lines to say at specific timestamps — not 'add some variety'." },
          { icon: "🎬", title: "B-roll suggestions you can use", description: "Concrete visual ideas with on-screen text, not 'show relevant footage'." },
        ],
      }
    : {
        heading: "Это не обычный AI-текст",
        subheading: "ChatGPT даёт абзацы текста. Мы даём структуру, метки и таймкоды — всё под YouTube.",
        items: [
          { icon: "🏷️", title: "Заголовки с метками цели", description: "Каждый заголовок помечен как SEO, кликбейт или баланс — ты знаешь, под что оптимизируешь." },
          { icon: "⏰", title: "Структура под твою длину", description: "Выбери 2, 5, 10 или 20 минут. Таймкоды рассчитаны точно, а не наугад." },
          { icon: "🔄", title: "Паттерн-интерапты с таймингом", description: "Точные фразы в конкретные моменты — а не 'добавь разнообразие'." },
          { icon: "🎬", title: "B-roll идеи, которые можно снять", description: "Конкретные визуальные идеи с текстом на экране, а не 'покажи что-то по теме'." },
        ],
      };
}

export function getFaqTexts(lang: Lang) {
  return lang === "en"
    ? {
        heading: "Frequently asked questions",
        items: [
          { question: "Does it write in Russian and English?", answer: "Yes. Both tools support Russian (default) and English output. The UI is in English, but all generated content — titles, hooks, outlines, rewrites — will be in your chosen language." },
          { question: "Does it store my scripts on the server?", answer: "No. Your scripts are sent to the AI for processing but are never stored on our servers. Generation history is saved locally in your browser (localStorage) and never leaves your device." },
          { question: "Is this a full video editor?", answer: "No. This is a writing tool. It generates the text and structure for your videos — you still record and edit in your preferred software (Premiere, DaVinci, CapCut, etc.)." },
          { question: "How fast is it?", answer: "Script Kit generates in 5–15 seconds. Retention Doctor takes 10–20 seconds depending on script length. Both tools stream results as they're generated." },
          { question: "What should I paste in?", answer: "For Script Kit: just your topic idea (1–2 sentences). For Retention Doctor: your full script text — the more complete, the better the analysis." },
          { question: "Will it work for my niche?", answer: "It works for any YouTube niche — tech, lifestyle, education, gaming, business, fitness. The output adapts to the topic and style you provide." },
          { question: "What if the output isn't good?", answer: "Regenerate with a more specific topic or different settings. The AI output varies — treat it as a strong first draft, not a final script. Your generations are saved locally so you can compare." },
        ],
      }
    : {
        heading: "Частые вопросы",
        items: [
          { question: "Работает на русском и английском?", answer: "Да. Все инструменты поддерживают русский (по умолчанию) и английский. Весь контент — заголовки, хуки, структура, переписанные части — будет на выбранном языке." },
          { question: "Скрипты сохраняются на сервере?", answer: "Нет. Скрипты отправляются в AI для обработки, но не хранятся на наших серверах. История генераций сохраняется локально в браузере (localStorage) и не покидает твоё устройство." },
          { question: "Это видеоредактор?", answer: "Нет. Это инструмент для текста и подготовки. Он генерирует скрипты и находит клипы — снимать и монтировать ты всё ещё будешь в своей программе (Premiere, DaVinci, CapCut и т.д.)." },
          { question: "Как быстро это работает?", answer: "Генератор скриптов работает за 5–15 секунд. Исправление удержания — за 10–20 секунд в зависимости от длины скрипта. Результат появляется по мере генерации." },
          { question: "Что вставлять?", answer: "Для Генератора скриптов: идею темы (1–2 предложения). Для Исправления удержания: полный текст скрипта — чем полнее, тем лучше анализ." },
          { question: "Подойдёт для моей ниши?", answer: "Работает для любой ниши — tech, лайфстайл, образование, гейминг, бизнес, фитнес. Результат адаптируется под твою тему и стиль." },
          { question: "Что если результат не понравится?", answer: "Сгенерируй заново с более конкретной темой или другими настройками. Относись к результату как к сильному черновику. Все генерации сохраняются локально — можно сравнить." },
        ],
      };
}

export function getFinalCtaTexts(lang: Lang) {
  return lang === "en"
    ? {
        heading: "Ready to stop overthinking your scripts?",
        subheading: "Pick a tool and generate your first script in under 60 seconds.",
        primaryCta: "Generate Script",
        secondaryCta: "Fix My Script",
        privacyNote: "Your scripts are never stored on our servers. Everything stays in your browser.",
      }
    : {
        heading: "Хватит ломать голову над скриптами!",
        subheading: "Выбери инструмент и получи готовый скрипт меньше чем за минуту.",
        primaryCta: "Создать скрипт",
        secondaryCta: "Проверить скрипт",
        privacyNote: "Твои скрипты не сохраняются на сервере. Всё остаётся в твоём браузере.",
      };
}

export function getFooterTexts(lang: Lang) {
  return lang === "en"
    ? {
        scriptKit: "Script Generator",
        retentionDoctor: "Retention Fixer",
        clipFactory: "Clip Finder",
        silenceCutter: "Silence Remover",
        tagline: "Built for creators. No data stored.",
      }
    : {
        scriptKit: "Генератор скриптов",
        retentionDoctor: "Исправление удержания",
        clipFactory: "Поиск клипов",
        silenceCutter: "Удаление пауз",
        tagline: "Создано для ютуберов. Данные не хранятся.",
      };
}
