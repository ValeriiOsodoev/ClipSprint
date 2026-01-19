import Link from "next/link";

type HeroProps = {
  texts: {
    badge: string;
    headline1: string;
    headline2: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
    bullets: { icon: string; text: string }[];
  };
};

export default function Hero({ texts }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <span>{texts.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight">
            {texts.headline1}
            <span className="block mt-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {texts.headline2}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {texts.subheadline}
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tools/script-kit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-lg shadow-blue-600/25"
            >
              <span>✨</span>
              {texts.ctaPrimary}
            </Link>
            <Link
              href="/tools/silence-cutter"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold border border-gray-200 dark:border-gray-700 transition-colors"
            >
              <span>🔇</span>
              {texts.ctaSecondary}
            </Link>
          </div>

          {/* What you get bullets */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
            {texts.bullets.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
