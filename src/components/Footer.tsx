import Link from "next/link";

type FooterProps = {
  labels?: {
    scriptKit: string;
    retentionDoctor: string;
    clipFactory?: string;
    silenceCutter?: string;
    tagline: string;
  };
};

export default function Footer({ labels }: FooterProps) {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <span className="text-xl">⚡</span>
            <span className="font-medium">ClipSprint</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <Link
              href="/tools/script-kit"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {labels?.scriptKit ?? "Script Generator"}
            </Link>
            <Link
              href="/tools/retention-doctor"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {labels?.retentionDoctor ?? "Retention Fixer"}
            </Link>
            <Link
              href="/tools/clip-factory"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {labels?.clipFactory ?? "Clip Finder"}
            </Link>
            <Link
              href="/tools/silence-cutter"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {labels?.silenceCutter ?? "Silence Remover"}
            </Link>
          </div>

          <p className="text-sm text-gray-400 dark:text-gray-500">
            {labels?.tagline ?? "Built for creators. No data stored."}
          </p>
        </div>
      </div>
    </footer>
  );
}
