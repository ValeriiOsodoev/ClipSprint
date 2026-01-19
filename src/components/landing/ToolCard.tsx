import Link from "next/link";

type ToolCardData = {
  id: string;
  name: string;
  tagline: string;
  href: string;
  ctaText: string;
  features: string[];
  steps: { title: string; description: string }[];
  exampleOutput: string[];
  color: "blue" | "purple" | "green" | "orange";
};

type ToolCardProps = {
  tool: ToolCardData;
  labels: {
    whatYouGet: string;
    howItWorks: string;
    exampleOutput: string;
    badgeGenerate: string;
    badgeAnalyze: string;
    badgeClips?: string;
    badgeCut?: string;
  };
};

export default function ToolCard({ tool, labels }: ToolCardProps) {
  const colorClasses = {
    blue: {
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      button:
        "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25",
      border: "hover:border-blue-300 dark:hover:border-blue-700",
      step: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },
    purple: {
      badge:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      button:
        "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/25",
      border: "hover:border-purple-300 dark:hover:border-purple-700",
      step: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    },
    green: {
      badge:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      button:
        "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25",
      border: "hover:border-green-300 dark:hover:border-green-700",
      step: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    },
    orange: {
      badge:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      button:
        "bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25",
      border: "hover:border-orange-300 dark:hover:border-orange-700",
      step: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    },
  };

  const colors = colorClasses[tool.color];
  
  const getBadgeText = () => {
    if (tool.color === "blue") return labels.badgeGenerate;
    if (tool.color === "purple") return labels.badgeAnalyze;
    if (tool.color === "orange") return labels.badgeCut || "Cut";
    return labels.badgeClips || "Clips";
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 transition-colors ${colors.border}`}
    >
      {/* Header */}
      <div className="mb-6">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors.badge} mb-3`}
        >
          {getBadgeText()}
        </span>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {tool.name}
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{tool.tagline}</p>
      </div>

      {/* Features */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          {labels.whatYouGet}
        </h4>
        <ul className="space-y-2">
          {tool.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <svg
                className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* How it works */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          {labels.howItWorks}
        </h4>
        <ol className="space-y-3">
          {tool.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className={`flex-shrink-0 w-6 h-6 rounded-full ${colors.step} flex items-center justify-center text-xs font-bold`}
              >
                {i + 1}
              </span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Example output */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          {labels.exampleOutput}
        </h4>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 space-y-2">
          {tool.exampleOutput.map((line, i) => (
            <p
              key={i}
              className="text-xs font-mono text-gray-600 dark:text-gray-400"
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Link
        href={tool.href}
        className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition-colors ${colors.button}`}
      >
        {tool.ctaText} →
      </Link>
    </div>
  );
}
