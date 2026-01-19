"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import LanguageToggle from "./LanguageToggle";
import SignInButton from "./auth/SignInButton";
import UserMenu from "./auth/UserMenu";
import type { Lang } from "@/lib/i18n";

type NavHeaderProps = {
  lang?: Lang;
  onChangeLang?: (lang: Lang) => void;
  labels?: {
    scriptKit: string;
    retentionDoctor: string;
    clipFactory?: string;
    silenceCutter?: string;
    signIn?: string;
    signOut?: string;
  };
};

export default function NavHeader({ lang, onChangeLang, labels }: NavHeaderProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const NAV_ITEMS = [
    { href: "/tools/script-kit", label: labels?.scriptKit ?? "Script Generator" },
    { href: "/tools/retention-doctor", label: labels?.retentionDoctor ?? "Retention Fixer" },
    { href: "/tools/clip-factory", label: labels?.clipFactory ?? "Clip Finder" },
    { href: "/tools/silence-cutter", label: labels?.silenceCutter ?? "Silence Remover" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-gray-900 dark:text-white"
          >
            <span className="text-xl">⚡</span>
            <span className="hidden sm:inline">ClipSprint</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            
            {lang && onChangeLang && (
              <LanguageToggle lang={lang} onChangeLang={onChangeLang} />
            )}

            {/* Auth UI */}
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : session ? (
              <UserMenu session={session} signOutText={labels?.signOut || "Sign out"} />
            ) : (
              <SignInButton text={labels?.signIn || "Sign in"} />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
