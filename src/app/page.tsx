"use client";

import Link from "next/link";
import NavHeader from "@/components/NavHeader";
import Footer from "@/components/Footer";
import Hero from "@/components/landing/Hero";
import ToolCard from "@/components/landing/ToolCard";
import FAQAccordion from "@/components/landing/FAQAccordion";
import { useLang } from "@/lib/useLang";
import {
  getNavTexts,
  getHeroTexts,
  getSocialProofTexts,
  getToolsTexts,
  getToolConfigsTexts,
  getHowToUseTexts,
  getWhyNotGenericTexts,
  getFaqTexts,
  getFinalCtaTexts,
  getFooterTexts,
} from "@/lib/i18n";

export default function LandingPage() {
  const { lang, setLang, isLoaded } = useLang();

  // Translated content
  const nav = getNavTexts(lang);
  const hero = getHeroTexts(lang);
  const socialProof = getSocialProofTexts(lang);
  const tools = getToolsTexts(lang);
  const toolConfigs = getToolConfigsTexts(lang);
  const howToUse = getHowToUseTexts(lang);
  const whyNotGeneric = getWhyNotGenericTexts(lang);
  const faq = getFaqTexts(lang);
  const finalCta = getFinalCtaTexts(lang);
  const footer = getFooterTexts(lang);

  // Tool card labels
  const toolCardLabels = {
    whatYouGet: tools.whatYouGet,
    howItWorks: tools.howItWorks,
    exampleOutput: tools.exampleOutput,
    badgeGenerate: tools.badgeGenerate,
    badgeAnalyze: tools.badgeAnalyze,
    badgeClips: tools.badgeClips,
    badgeCut: tools.badgeCut,
  };

  // Build tool data from translated configs
  const translatedTools = [
    {
      id: "script-kit",
      name: toolConfigs.scriptKit.name,
      tagline: toolConfigs.scriptKit.tagline,
      href: "/tools/script-kit",
      ctaText: toolConfigs.scriptKit.ctaText,
      features: toolConfigs.scriptKit.features,
      steps: toolConfigs.scriptKit.steps,
      exampleOutput: toolConfigs.scriptKit.exampleOutput,
      color: "blue" as const,
    },
    {
      id: "retention-doctor",
      name: toolConfigs.retentionDoctor.name,
      tagline: toolConfigs.retentionDoctor.tagline,
      href: "/tools/retention-doctor",
      ctaText: toolConfigs.retentionDoctor.ctaText,
      features: toolConfigs.retentionDoctor.features,
      steps: toolConfigs.retentionDoctor.steps,
      exampleOutput: toolConfigs.retentionDoctor.exampleOutput,
      color: "purple" as const,
    },
    {
      id: "clip-factory",
      name: toolConfigs.clipFactory.name,
      tagline: toolConfigs.clipFactory.tagline,
      href: "/tools/clip-factory",
      ctaText: toolConfigs.clipFactory.ctaText,
      features: toolConfigs.clipFactory.features,
      steps: toolConfigs.clipFactory.steps,
      exampleOutput: toolConfigs.clipFactory.exampleOutput,
      color: "green" as const,
    },
    {
      id: "silence-cutter",
      name: toolConfigs.silenceCutter.name,
      tagline: toolConfigs.silenceCutter.tagline,
      href: "/tools/silence-cutter",
      ctaText: toolConfigs.silenceCutter.ctaText,
      features: toolConfigs.silenceCutter.features,
      steps: toolConfigs.silenceCutter.steps,
      exampleOutput: toolConfigs.silenceCutter.exampleOutput,
      color: "orange" as const,
    },
  ];

  return (
    <div className={isLoaded ? "opacity-100" : "opacity-0"} style={{ transition: "opacity 0.15s ease-in" }}>
      <NavHeader
        lang={lang}
        onChangeLang={setLang}
        labels={{ 
          scriptKit: nav.scriptKit, 
          retentionDoctor: nav.retentionDoctor, 
          clipFactory: nav.clipFactory, 
          silenceCutter: nav.silenceCutter,
          signIn: nav.signIn,
          signOut: nav.signOut
        }}
      />

      <main>
        {/* Hero Section */}
        <Hero texts={hero} />

        {/* Social Proof Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-8">
              {socialProof.heading}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {socialProof.items.map((item, i) => (
                <div
                  key={i}
                  className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800"
                >
                  <span className="text-3xl">{item.icon}</span>
                  <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tools Grid Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {tools.heading}
              </h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                {tools.subheading}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {translatedTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} labels={toolCardLabels} />
              ))}
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {howToUse.heading}
              </h2>
            </div>

            <div className="relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 dark:from-blue-800 dark:via-purple-800 dark:to-green-800" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {howToUse.steps.map((item) => (
                  <div key={item.step} className="text-center">
                    <div
                      className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl font-bold ${
                        item.color === "blue"
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                          : item.color === "purple"
                            ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                            : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      {item.step}
                    </div>
                    <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              💾 <strong>{howToUse.historyNote}</strong>
            </p>
          </div>
        </section>

        {/* Why Not Generic AI Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {whyNotGeneric.heading}
              </h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                {whyNotGeneric.subheading}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {whyNotGeneric.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
              {faq.heading}
            </h2>
            <FAQAccordion items={faq.items} />
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              {finalCta.heading}
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              {finalCta.subheading}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/tools/script-kit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-white hover:bg-gray-100 text-gray-900 font-semibold transition-colors"
              >
                <span>✨</span>
                {finalCta.primaryCta}
              </Link>
              <Link
                href="/tools/retention-doctor"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/25 transition-colors"
              >
                <span>🔧</span>
                {finalCta.secondaryCta}
              </Link>
            </div>

            <p className="mt-8 text-sm text-blue-200">
              🔒 {finalCta.privacyNote}
            </p>
          </div>
        </section>
      </main>

      <Footer labels={footer} />
    </div>
  );
}
