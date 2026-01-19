"use client";

import { useState } from "react";

type FAQItem = {
  question: string;
  answer: string;
};

type FAQAccordionProps = {
  items: FAQItem[];
};

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {items.map((item, index) => (
        <div key={index} className="py-4">
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between text-left"
            aria-expanded={openIndex === index}
          >
            <span className="font-medium text-gray-900 dark:text-white pr-4">
              {item.question}
            </span>
            <svg
              className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                openIndex === index ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {openIndex === index && (
            <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {item.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
